# -*- coding: utf-8 -*-
"""
ThuysTalk Local Web Server & Private AI Knowledge Bridge
Chạy tại: http://localhost:8099
Hỗ trợ:
  - Phục vụ toàn bộ giao diện Website ThuysTalk (index.html, elearning.html, videos.html, bai-viet.html, tra-cuu.html, admin.html)
  - Endpoint GET  /api/notebook-status : Kiểm tra trạng thái kết nối ngầm
  - Endpoint POST /api/notebook-query  : Kết nối ngầm tới kho dữ liệu chuyên sâu (ẩn hoàn toàn tên NotebookLM ở phía người dùng)
  - Endpoint POST /api/parse-excel     : Đọc file Excel (.xlsx) bộ câu hỏi Mini Test tải lên từ trang Quản trị
"""

import base64
import csv
import datetime
import hashlib
import hmac
import html
import http.server
import io
import json
import os
import re
import secrets
import shutil
import smtplib
import subprocess
import sys
import threading
import time
import urllib.parse
import webbrowser
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from google.auth.transport import requests as google_auth_requests
from google.oauth2 import id_token as google_id_token

PORT = 8099
WEB_DIR = Path(__file__).resolve().parent
STATIC_DIR = WEB_DIR / "public"

FIREBASE_PROJECT_ID = "thuystalk"
FIREBASE_ISSUER = f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}"
ADMIN_EMAILS = {
    "thuystalk.official@gmail.com",
    "thuyn.bic@gmail.com",
}
ALLOWED_ORIGINS = {
    "https://thuystalk.web.app",
    "https://thuystalk.firebaseapp.com",
    "http://localhost:8099",
    "http://127.0.0.1:8099",
}
MAX_POST_BODY_BYTES = 5 * 1024 * 1024  # 5 MB
GOOGLE_AUTH_REQUEST = google_auth_requests.Request()
DEVICE_CODE_TTL_SECONDS = 600
DEVICE_CODE_MAX_ATTEMPTS = 5
DEVICE_ID_RE = re.compile(r"^[A-Za-z0-9_-]{8,128}$")
DEVICE_SECRET_FILE = WEB_DIR / ".device_code_secret"

_DEVICE_LOCK = threading.Lock()
_DEVICE_CHALLENGES = {}
_DEVICE_USER_SENDS = {}
_DEVICE_GLOBAL_SENDS = []


def _load_dotenv(dotenv_path: Path):
    """Nạp biến môi trường từ file .env cục bộ (không ghi đè biến đã có)."""
    if not dotenv_path.exists():
        return
    try:
        lines = dotenv_path.read_text(encoding="utf-8").splitlines()
    except Exception as exc:
        print(f"[ENV] Khong the doc file .env: {exc}", flush=True)
        return
    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip()
        if len(val) >= 2 and ((val[0] == '"' and val[-1] == '"') or (val[0] == "'" and val[-1] == "'")):
            val = val[1:-1]
        if key and not os.environ.get(key):
            os.environ[key] = val


_load_dotenv(WEB_DIR / ".env")


def _get_smtp_config() -> dict:
    """Trả về cấu hình SMTP tập trung duy nhất đọc từ biến môi trường / .env."""
    port_raw = os.environ.get("THUYSTALK_SMTP_PORT", "465").strip()
    try:
        port = int(port_raw) if port_raw else 465
    except ValueError:
        port = 465
    return {
        "host": os.environ.get("THUYSTALK_SMTP_HOST", "smtp.gmail.com").strip() or "smtp.gmail.com",
        "port": port,
        "sender": os.environ.get("THUYSTALK_SMTP_SENDER", "thuystalk.official@gmail.com").strip() or "thuystalk.official@gmail.com",
        "app_password": os.environ.get("THUYSTALK_SMTP_APP_PASSWORD", "").strip(),
    }


def _open_smtp_connection(timeout: int = 12):
    """Mở kết nối SMTP_SSL từ cấu hình .env; ném RuntimeError rõ ràng nếu chưa cấu hình."""
    cfg = _get_smtp_config()
    if not cfg["app_password"]:
        raise RuntimeError(
            "Tính năng gửi email đang tắt (chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env)."
        )
    server = smtplib.SMTP_SSL(cfg["host"], cfg["port"], timeout=timeout)
    server.login(cfg["sender"], cfg["app_password"])
    return server, cfg["sender"]


def _get_positive_int_env(name: str, default: int) -> int:
    """Đọc số nguyên dương từ biến môi trường, fallback về default nếu thiếu hoặc sai định dạng."""
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        val = int(raw)
        return val if val > 0 else default
    except ValueError:
        return default


def _get_device_code_secret() -> bytes:
    """Trả về khóa HMAC dùng cho mã xác nhận thiết bị; tự tạo và lưu cục bộ (gitignored) nếu chưa cấu hình."""
    env_secret = os.environ.get("THUYSTALK_DEVICE_CODE_SECRET", "").strip()
    if env_secret:
        return env_secret.encode("utf-8")
    with _DEVICE_LOCK:
        if DEVICE_SECRET_FILE.exists():
            try:
                saved = DEVICE_SECRET_FILE.read_text(encoding="utf-8").strip()
                if saved:
                    return saved.encode("utf-8")
            except OSError:
                pass
        generated = secrets.token_hex(32)
        try:
            DEVICE_SECRET_FILE.write_text(generated, encoding="utf-8")
        except OSError:
            pass
        return generated.encode("utf-8")


def _compute_device_hmac(secret: bytes, message: str) -> str:
    """Tính chữ ký HMAC-SHA256 dạng hex cho challenge/trust thiết bị."""
    return hmac.new(secret, message.encode("utf-8"), hashlib.sha256).hexdigest()


def _prune_device_state(now: float):
    """Dọn mốc thời gian gửi mã quá 1 giờ và challenge hết hạn (yêu cầu đang giữ _DEVICE_LOCK)."""
    cutoff = now - 3600.0
    _DEVICE_GLOBAL_SENDS[:] = [ts for ts in _DEVICE_GLOBAL_SENDS if ts >= cutoff]
    for uid_key in list(_DEVICE_USER_SENDS.keys()):
        recent = [ts for ts in _DEVICE_USER_SENDS[uid_key] if ts >= cutoff]
        if recent:
            _DEVICE_USER_SENDS[uid_key] = recent
        else:
            del _DEVICE_USER_SENDS[uid_key]
    expired_keys = [k for k, v in _DEVICE_CHALLENGES.items() if now > float(v.get("expires_at", 0))]
    for k in expired_keys:
        del _DEVICE_CHALLENGES[k]


ALLOWED_NOTEBOOK_IDS = {
    "c3b76775-2095-4866-b634-139c71e0df40": "Chuyên đề A · Phân loại & Tra cứu Mã HS Code",
    "e6f63d82-c00f-4876-9e45-1673a45408b1": "Chuyên đề B · Chính sách Kiểm soát Xuất khẩu Trung Quốc",
    "430a7e0e-6c27-4384-a86e-9486f9bfba37": "Chuyên đề C · Thủ tục Hồ sơ Kiểm tra Chuyên ngành",
    "b3954c5b-d6c1-46b6-9192-2c2c30d72419": "Chuyên đề D · Quản trị Hàng rủi ro & Thủ tục Cửa khẩu",
}


def parse_minitest_rows(rows):
    """Chuyển danh sách dòng (từ Excel hoặc CSV) thành cấu trúc câu hỏi Mini Test."""
    questions = []
    for row in rows:
        if not row or all(str(c or "").strip() == "" for c in row):
            continue
        first_cell = str(row[0] or "").strip().lower()
        second_cell = str(row[1] if len(row) > 1 else "").strip().lower()
        # Bỏ qua dòng tiêu đề (Header)
        if first_cell in ("stt", "no", "#", "câu hỏi", "cau hoi", "question") or "câu hỏi" in second_cell or "question" in second_cell:
            continue

        # Hỗ trợ cả bảng 6 cột (Không có cột STT) hoặc 7 cột (Có cột STT ở đầu)
        if len(row) >= 6 and (first_cell.isdigit() or len(first_cell) <= 3):
            q_text = str(row[1] or "").strip()
            opt_a = str(row[2] or "").strip()
            opt_b = str(row[3] or "").strip()
            opt_c = str(row[4] or "").strip()
            correct_raw = str(row[5] or "A").strip().upper()
            explanation = str(row[6] if len(row) > 6 else "").strip()
        elif len(row) >= 5:
            q_text = str(row[0] or "").strip()
            opt_a = str(row[1] or "").strip()
            opt_b = str(row[2] or "").strip()
            opt_c = str(row[3] or "").strip()
            correct_raw = str(row[4] or "A").strip().upper()
            explanation = str(row[5] if len(row) > 5 else "").strip()
        else:
            continue

        if not q_text:
            continue

        if not opt_a.upper().startswith("A."):
            opt_a = f"A. {opt_a}"
        if not opt_b.upper().startswith("B."):
            opt_b = f"B. {opt_b}"
        if not opt_c.upper().startswith("C."):
            opt_c = f"C. {opt_c}"

        correct_idx = 0
        if "B" in correct_raw or correct_raw == "1" or correct_raw == "2":
            if "B" in correct_raw:
                correct_idx = 1
            elif "C" in correct_raw:
                correct_idx = 2
        if "C" in correct_raw or correct_raw == "3":
            correct_idx = 2

        if not explanation:
            explanation = "Căn cứ theo nội dung bài giảng và quy định pháp lý hải quan hiện hành."

        questions.append(
            {
                "q": {"vi": q_text, "en": q_text},
                "options": {
                    "vi": [opt_a, opt_b, opt_c],
                    "en": [opt_a, opt_b, opt_c],
                },
                "correctIndex": correct_idx,
                "explanation": {"vi": explanation, "en": explanation},
            }
        )
    return questions


class ThuysTalkRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def list_directory(self, path):
        self.send_error(404, "Not Found")
        return None

    def end_headers(self):
        origin = (self.headers.get("Origin") or "").strip()
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def _is_origin_allowed(self) -> bool:
        origin = (self.headers.get("Origin") or "").strip()
        if origin:
            return origin in ALLOWED_ORIGINS
        referer = (self.headers.get("Referer") or "").strip()
        if referer:
            parsed_ref = urllib.parse.urlparse(referer)
            ref_origin = f"{parsed_ref.scheme}://{parsed_ref.netloc}" if parsed_ref.scheme and parsed_ref.netloc else ""
            return ref_origin in ALLOWED_ORIGINS
        return True

    def _verify_firebase_id_token(self):
        """Xác minh Firebase ID Token chung: kiểm tra Bearer, audience, issuer và email_verified."""
        auth_header = (self.headers.get("Authorization") or "").strip()
        if not auth_header.startswith("Bearer "):
            return False, 401, None, "Thiếu token xác thực."
        token = auth_header[7:].strip()
        if not token:
            return False, 401, None, "Token xác thực không được để trống."
        try:
            claims = google_id_token.verify_firebase_token(
                token,
                GOOGLE_AUTH_REQUEST,
                audience=FIREBASE_PROJECT_ID,
            )
        except Exception:
            return False, 401, None, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        if not isinstance(claims, dict):
            return False, 401, None, "Token xác thực không hợp lệ."
        if claims.get("iss") != FIREBASE_ISSUER:
            return False, 401, None, "Token xác thực không hợp lệ."
        if claims.get("email_verified") is not True:
            return False, 403, None, "Tài khoản chưa xác thực email."
        uid = str(claims.get("user_id") or claims.get("sub") or "").strip()
        email = str(claims.get("email") or "").strip().lower()
        if not uid or not email:
            return False, 401, None, "Thông tin xác thực không đầy đủ."
        return True, 200, {"uid": uid, "email": email}, ""

    def _verify_admin_token(self):
        ok, status_code, identity, err_msg = self._verify_firebase_id_token()
        if not ok:
            return False, status_code, err_msg
        if identity["email"] not in ADMIN_EMAILS:
            return False, 403, "Tài khoản không có quyền Quản trị viên."
        return True, 200, identity["email"]

    def _verify_learner_token(self):
        ok, status_code, identity, err_msg = self._verify_firebase_id_token()
        if not ok:
            return False, status_code, err_msg
        return True, 200, identity

    def _read_json_body(self, content_length: int):
        if content_length <= 0:
            return {}
        raw_body = self.rfile.read(content_length).decode("utf-8")
        if not raw_body.strip():
            return {}
        payload = json.loads(raw_body)
        if not isinstance(payload, dict):
            raise ValueError("JSON body phải là một object.")
        return payload

    def do_OPTIONS(self):
        origin = (self.headers.get("Origin") or "").strip()
        if origin and origin not in ALLOWED_ORIGINS:
            self.close_connection = True
            self._send_json(403, {"ok": False, "error": "Origin không được phép."})
            return
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/notebook-status":
            nlm_path = shutil.which("nlm")
            self._send_json(
                200,
                {
                    "ok": True,
                    "service": "ThuysTalk Knowledge Engine API",
                    "nlm_cli_installed": bool(nlm_path),
                    "notebooks": ALLOWED_NOTEBOOK_IDS,
                },
            )
            return

        raw_path = urllib.parse.unquote(parsed.path)
        if "\x00" in raw_path or "\\" in raw_path:
            self.send_error(404, "Not Found")
            return
        parts = [p for p in raw_path.split("/") if p]
        if any(p.startswith(".") or p in ("..", "_headers") for p in parts):
            self.send_error(404, "Not Found")
            return
        static_root = STATIC_DIR.resolve()
        target = (static_root / "/".join(parts)).resolve() if parts else (static_root / "index.html")
        try:
            target.relative_to(static_root)
        except ValueError:
            self.send_error(404, "Not Found")
            return
        if target.is_dir() or not target.is_file():
            self.send_error(404, "Not Found")
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        allowed_post_routes = {
            "/api/notebook-query",
            "/api/parse-excel",
            "/api/send-bulk-email",
            "/api/device/send-code",
            "/api/device/verify",
        }
        if parsed.path not in allowed_post_routes:
            self.close_connection = True
            self._send_json(404, {"ok": False, "error": "Endpoint Not Found"})
            return

        if not self._is_origin_allowed():
            self.close_connection = True
            self._send_json(403, {"ok": False, "error": "Origin không được phép."})
            return

        content_type = (self.headers.get("Content-Type") or "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            self.close_connection = True
            self._send_json(415, {"ok": False, "error": "Chỉ chấp nhận Content-Type: application/json."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0") or "0")
        except ValueError:
            self.close_connection = True
            self._send_json(400, {"ok": False, "error": "Header Content-Length không hợp lệ."})
            return

        if content_length < 0 or content_length > MAX_POST_BODY_BYTES:
            self.close_connection = True
            self._send_json(413, {"ok": False, "error": "Dữ liệu gửi lên vượt quá giới hạn 5 MB."})
            return

        learner_identity = None
        if parsed.path in ("/api/parse-excel", "/api/send-bulk-email"):
            auth_ok, status_code, auth_msg = self._verify_admin_token()
            if not auth_ok:
                self.close_connection = True
                self._send_json(status_code, {"ok": False, "error": auth_msg})
                return
        elif parsed.path in ("/api/device/send-code", "/api/device/verify"):
            auth_ok, status_code, auth_res = self._verify_learner_token()
            if not auth_ok:
                self.close_connection = True
                self._send_json(status_code, {"ok": False, "error": auth_res})
                return
            learner_identity = auth_res

        try:
            payload = self._read_json_body(content_length)
        except Exception as exc:
            self._send_json(400, {"ok": False, "error": f"JSON body không hợp lệ: {exc}"})
            return

        if parsed.path == "/api/notebook-query":
            self.handle_notebook_query(payload)
        elif parsed.path == "/api/parse-excel":
            self.handle_parse_excel(payload)
        elif parsed.path == "/api/send-bulk-email":
            self.handle_send_bulk_email(payload)
        elif parsed.path == "/api/device/send-code":
            self.handle_device_send_code(payload, learner_identity)
        elif parsed.path == "/api/device/verify":
            self.handle_device_verify(payload, learner_identity)

    def handle_send_bulk_email(self, payload: dict):
        try:
            doc_title = str(payload.get("docTitle", "")).replace("\r", " ").replace("\n", " ").strip()
            doc_type = str(payload.get("docType", "Bài viết chuyên sâu")).strip()
            content_preview = str(payload.get("content", "")).strip()
            recipients = payload.get("recipients", [])

            if not doc_title:
                doc_title = "Tài liệu chuyên môn ThuysTalk"

            if not recipients or not isinstance(recipients, list):
                self._send_json(400, {"ok": False, "error": "Danh sách người nhận không hợp lệ hoặc đang trống."})
                return

            smtp_cfg = _get_smtp_config()
            if not smtp_cfg["app_password"]:
                print("[SMTP TAT] Bo qua gui email hang loat vi chua cau hinh THUYSTALK_SMTP_APP_PASSWORD trong .env.", flush=True)
                self._send_json(503, {
                    "ok": False,
                    "emailDisabled": True,
                    "error": "Tính năng gửi email hàng loạt đang tắt (chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env)."
                })
                return

            sent_count = 0
            failed_emails = []

            # Prepare text attachment
            doc_text = f"THUYSTALK - BÀI VIẾT & TÀI LIỆU CHUYÊN MÔN XUẤT NHẬP KHẨU\n"
            doc_text += f"Tài liệu: {doc_title}\n"
            doc_text += f"Chuyên mục: {doc_type}\n"
            doc_text += f"Thời gian gửi: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
            doc_text += f"--------------------------------------------------\n\n"
            doc_text += f"Tiêu đề: {doc_title}\n"
            doc_text += f"Chuyên mục: {doc_type}\n\n"
            if content_preview:
                doc_text += f"Nội dung chi tiết:\n{content_preview}\n\n"
            doc_text += f"Chia sẻ bởi: Nguyễn Thị Ngọc Thúy (Sáng lập ThuysTalk / Giám đốc Eureka Logistics)\n"
            doc_text += f"Hotline tư vấn chuyên sâu / Zalo: 0767.648.862\n"

            safe_fname = "ThuysTalk_" + "".join(c for c in doc_title if c.isalnum() or c in (" ", "_", "-")).rstrip()[:40].replace(" ", "_") + ".txt"
            clean_preview = content_preview[:1200] + ("..." if len(content_preview) > 1200 else "")

            safe_doc_title = html.escape(doc_title, quote=True)
            safe_doc_type = html.escape(doc_type, quote=True)
            safe_fname_html = html.escape(safe_fname, quote=True)
            safe_preview_html = html.escape(clean_preview, quote=True).replace("\n", "<br>")

            # Open single SSL connection to Gmail SMTP for efficiency
            server, sender_email = _open_smtp_connection(timeout=25)

            for rec in recipients:
                if not isinstance(rec, dict):
                    continue
                rec_email = str(rec.get("email", "")).strip().lower()
                rec_name = str(rec.get("name", "")).strip() or "Học viên / Đối tác"

                if not rec_email or "@" not in rec_email or "\r" in rec_email or "\n" in rec_email:
                    continue

                safe_rec_name = html.escape(rec_name, quote=True)

                try:
                    msg = MIMEMultipart("alternative")
                    msg["From"] = f"ThuysTalk Official <{sender_email}>"
                    msg["To"] = rec_email
                    msg["Subject"] = f"[ThuysTalk] Tài Liệu Mới: {doc_title}"

                    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1E293B; background: #F8FAFC; margin: 0; padding: 20px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
    .header {{ background: linear-gradient(135deg, #065F46 0%, #047857 100%); color: #FFFFFF; padding: 28px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF; }}
    .header p {{ margin: 6px 0 0; font-size: 14px; opacity: 0.95; color: #E6F4EA; }}
    .body-wrap {{ padding: 28px 24px; }}
    .doc-card {{ background: #F0FDF4; border-left: 4px solid #059669; padding: 16px; border-radius: 6px; margin: 20px 0; }}
    .doc-title {{ font-size: 16px; font-weight: 800; color: #065F46; margin: 0 0 6px; }}
    .doc-type {{ font-size: 12px; font-weight: 700; color: #D97706; text-transform: uppercase; margin: 0; }}
    .footer {{ background: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; }}
    .btn {{ display: inline-block; background: #047857; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-top: 14px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ThuysTalk | Pháp Lý & Xuất Nhập Khẩu Thực Tế</h1>
      <p>Chia sẻ từ Nguyễn Thị Ngọc Thúy · Sáng lập ThuysTalk & Giám đốc Eureka Logistics</p>
    </div>
    <div class="body-wrap">
      <p>Kính gửi <strong>{safe_rec_name}</strong>,</p>
      <p>ThuysTalk xin gửi tới Anh/Chị toàn văn tài liệu / bài viết chuyên sâu mới nhất được cập nhật trên nền tảng <strong>ThuysTalk</strong>:</p>
      
      <div class="doc-card">
        <p class="doc-type">{safe_doc_type}</p>
        <h3 class="doc-title">{safe_doc_title}</h3>
        <p style="margin: 8px 0 0; font-size: 13px; color: #334155;">Toàn bộ biểu mẫu và công văn trích dẫn đã được đính kèm ở tệp <strong>{safe_fname_html}</strong> bên dưới.</p>
      </div>

      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:16px; font-size:13px; color:#334155; margin:16px 0; line-height:1.6;">
        <strong style="color:#065F46; display:block; margin-bottom:6px;">Tóm lược nội dung chính:</strong>
        {safe_preview_html}
      </div>

      <p style="margin-top: 24px;">Nếu Anh/Chị có bất kỳ vướng mắc nghiệp vụ hải quan hoặc cần tư vấn trực tiếp cho lô hàng của doanh nghiệp mình, hãy kết nối cùng Thúy qua Zalo:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://zalo.me/84767648862" class="btn" target="_blank" style="background:#047857; color:#FFFFFF; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">Nhắn Zalo Với Thúy (0767.648.862)</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;"><strong>ThuysTalk</strong> · Nền tảng Đào tạo E-Learning & Tra cứu Pháp lý XNK</p>
      <p style="margin: 0;">Hotline / Zalo: 0767.648.862 · Website: ThuysTalk</p>
    </div>
  </div>
</body>
</html>"""
                    msg.attach(MIMEText(html_content, "html", "utf-8"))

                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(doc_text.encode("utf-8"))
                    encoders.encode_base64(part)
                    part.add_header("Content-Disposition", f'attachment; filename="{safe_fname}"')
                    msg.attach(part)

                    server.send_message(msg)
                    sent_count += 1
                    print(f"[BULK SMTP] Đã gửi tới {rec_email} ({sent_count}/{len(recipients)})")
                except Exception as send_err:
                    print(f"[BULK SMTP ERROR] Thất bại khi gửi tới {rec_email}: {send_err}")
                    failed_emails.append(rec_email)

            try:
                server.quit()
            except Exception:
                pass

            self._send_json(200, {
                "ok": True,
                "sentCount": sent_count,
                "total": len(recipients),
                "failed": failed_emails,
                "message": f"Đã gửi thành công {sent_count}/{len(recipients)} email."
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi xử lý gửi email hàng loạt: {exc}"})

    def handle_parse_excel(self, payload: dict):
        try:
            filename = str(payload.get("filename", "")).lower()
            b64_data = str(payload.get("data_base64", ""))
            file_bytes = base64.b64decode(b64_data)

            rows = []
            if filename.endswith(".csv") or filename.endswith(".txt"):
                text = file_bytes.decode("utf-8-sig", errors="replace")
                reader = csv.reader(io.StringIO(text))
                rows = list(reader)
            else:
                import openpyxl
                wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
                ws = wb.active
                for r in ws.iter_rows(values_only=True):
                    rows.append(["" if cell is None else str(cell) for cell in r])

            questions = parse_minitest_rows(rows)
            self._send_json(200, {"ok": True, "count": len(questions), "questions": questions})
        except Exception as exc:
            self._send_json(400, {"ok": False, "error": f"Lỗi đọc file Excel/CSV: {exc}"})

    def handle_notebook_query(self, payload: dict):
        try:
            notebook_id = str(payload.get("notebook_id", "")).strip()
            query = str(payload.get("query", "")).strip()

            if notebook_id not in ALLOWED_NOTEBOOK_IDS:
                notebook_id = "c3b76775-2095-4866-b634-139c71e0df40"

            if not query or len(query) > 600:
                self._send_json(400, {"error": "Câu hỏi không hợp lệ hoặc quá dài."})
                return

            env = os.environ.copy()
            env["PYTHONIOENCODING"] = "utf-8"

            proc = subprocess.run(
                ["nlm", "query", "notebook", "--json", notebook_id, query],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                env=env,
                timeout=90,
            )

            stdout_str = (proc.stdout or "").strip()
            answer_text = ""

            if stdout_str:
                try:
                    parsed_json = json.loads(stdout_str)
                    if isinstance(parsed_json, dict):
                        val = parsed_json.get("value") or parsed_json
                        answer_text = (
                            val.get("answer")
                            or val.get("response")
                            or val.get("text")
                            or stdout_str
                        )
                    else:
                        answer_text = stdout_str
                except Exception:
                    answer_text = stdout_str

            if not answer_text:
                stderr_str = (proc.stderr or "").strip()
                self._send_json(
                    502,
                    {
                        "error": "Hệ thống tra cứu chuyên sâu đang bận, vui lòng thử lại sau giây lát.",
                        "details": stderr_str[:300],
                    },
                )
                return

            self._send_json(
                200,
                {
                    "ok": True,
                    "branch_name": ALLOWED_NOTEBOOK_IDS.get(notebook_id, "Kho Tri Thức Pháp Lý ThuysTalk"),
                    "query": query,
                    "answer": answer_text,
                },
            )
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def handle_device_send_code(self, payload: dict, identity: dict):
        uid = identity["uid"]
        email = identity["email"]
        device_id = str(payload.get("deviceId") or "").strip()
        if not DEVICE_ID_RE.match(device_id):
            self._send_json(400, {"ok": False, "error": "Mã thiết bị không hợp lệ."})
            return

        smtp_cfg = _get_smtp_config()
        if not smtp_cfg["app_password"]:
            self._send_json(
                503,
                {
                    "ok": False,
                    "emailDisabled": True,
                    "error": "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.",
                },
            )
            return

        now = time.time()
        per_user_limit = _get_positive_int_env("THUYSTALK_DEVICE_CODES_PER_USER_HOURLY", 3)
        global_limit = _get_positive_int_env("THUYSTALK_DEVICE_CODES_GLOBAL_HOURLY", 30)

        with _DEVICE_LOCK:
            _prune_device_state(now)
            user_recent = _DEVICE_USER_SENDS.get(uid, [])
            if len(_DEVICE_GLOBAL_SENDS) >= global_limit or len(user_recent) >= per_user_limit:
                self._send_json(
                    429,
                    {
                        "ok": False,
                        "rateLimited": True,
                        "error": "Bạn đã yêu cầu gửi mã quá số lần quy định trong 1 giờ. Vui lòng chờ rồi thử lại sau.",
                    },
                )
                return

        code = f"{secrets.randbelow(1000000):06d}"
        secret = _get_device_code_secret()
        challenge_digest = _compute_device_hmac(secret, f"{uid}:{device_id}:{code}")
        body_text = (
            f"Mã xác nhận đăng nhập ThuysTalk: {code}. "
            "Mã hết hạn sau 10 phút. Nếu không phải bạn, hãy đổi mật khẩu."
        )

        try:
            server, sender_email = _open_smtp_connection(timeout=15)
            msg = MIMEMultipart("alternative")
            msg["From"] = f"ThuysTalk <{sender_email}>"
            msg["To"] = email
            msg["Subject"] = "[ThuysTalk] Mã xác nhận đăng nhập thiết bị mới"
            msg.attach(MIMEText(body_text, "plain", "utf-8"))
            html_body = (
                "<div style=\"font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;"
                "border:1px solid #e2e8f0;border-radius:12px;color:#0f172a;\">"
                "<h2 style=\"color:#065f46;margin:0 0 12px;\">ThuysTalk — Xác nhận thiết bị mới</h2>"
                f"<p style=\"font-size:15px;line-height:1.6;\">{html.escape(body_text)}</p>"
                "</div>"
            )
            msg.attach(MIMEText(html_body, "html", "utf-8"))
            server.send_message(msg)
            try:
                server.quit()
            except Exception:
                pass
        except Exception as exc:
            print(f"[DEVICE CODE ERROR] Khong the gui email ma xac nhan ({type(exc).__name__})", flush=True)
            self._send_json(
                503,
                {
                    "ok": False,
                    "error": "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.",
                },
            )
            return

        sent_at = time.time()
        with _DEVICE_LOCK:
            _prune_device_state(sent_at)
            user_recent = _DEVICE_USER_SENDS.setdefault(uid, [])
            if len(_DEVICE_GLOBAL_SENDS) >= global_limit or len(user_recent) >= per_user_limit:
                self._send_json(
                    429,
                    {
                        "ok": False,
                        "rateLimited": True,
                        "error": "Bạn đã yêu cầu gửi mã quá số lần quy định trong 1 giờ. Vui lòng chờ rồi thử lại sau.",
                    },
                )
                return
            _DEVICE_GLOBAL_SENDS.append(sent_at)
            user_recent.append(sent_at)
            _DEVICE_CHALLENGES[(uid, device_id)] = {
                "digest": challenge_digest,
                "expires_at": sent_at + DEVICE_CODE_TTL_SECONDS,
                "attempts": 0,
            }

        print(f"[DEVICE CODE] Sent challenge for uid_prefix={uid[:8]}", flush=True)
        self._send_json(200, {"ok": True, "expiresInSeconds": DEVICE_CODE_TTL_SECONDS})

    def handle_device_verify(self, payload: dict, identity: dict):
        uid = identity["uid"]
        device_id = str(payload.get("deviceId") or "").strip()
        code = str(payload.get("code") or "").strip()
        if not DEVICE_ID_RE.match(device_id) or not code or len(code) > 16:
            self._send_json(400, {"ok": False, "error": "Thông tin xác nhận thiết bị không hợp lệ."})
            return

        now = time.time()
        secret = _get_device_code_secret()
        candidate_digest = _compute_device_hmac(secret, f"{uid}:{device_id}:{code}")

        with _DEVICE_LOCK:
            entry = _DEVICE_CHALLENGES.get((uid, device_id))
            if not entry or now > float(entry.get("expires_at", 0)):
                _DEVICE_CHALLENGES.pop((uid, device_id), None)
                self._send_json(
                    400,
                    {
                        "ok": False,
                        "requireNewCode": True,
                        "error": "Mã xác nhận không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.",
                    },
                )
                return

            entry["attempts"] = int(entry.get("attempts", 0)) + 1
            if hmac.compare_digest(candidate_digest, str(entry.get("digest", ""))):
                _DEVICE_CHALLENGES.pop((uid, device_id), None)
                issued_at = str(int(now))
                trust = _compute_device_hmac(secret, f"{uid}:{device_id}:{issued_at}")
                self._send_json(200, {"ok": True, "trust": trust, "issuedAt": issued_at})
                return

            attempts = entry["attempts"]
            if attempts >= DEVICE_CODE_MAX_ATTEMPTS:
                _DEVICE_CHALLENGES.pop((uid, device_id), None)
                self._send_json(
                    429,
                    {
                        "ok": False,
                        "requireNewCode": True,
                        "error": "Bạn đã nhập sai 5 lần. Mã đã bị vô hiệu hóa, vui lòng xin mã mới.",
                    },
                )
                return

            remaining = DEVICE_CODE_MAX_ATTEMPTS - attempts
            self._send_json(
                400,
                {
                    "ok": False,
                    "attemptsRemaining": remaining,
                    "error": f"Mã xác nhận chưa chính xác. Bạn còn {remaining} lần thử.",
                },
            )

    def _send_json(self, status_code: int, data: dict):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    os.chdir(WEB_DIR)
    url = f"http://localhost:{PORT}"
    smtp_cfg = _get_smtp_config()
    smtp_status_line = (
        f"  - Trang thai Email  : BAT (sender: {smtp_cfg['sender']})"
        if smtp_cfg["app_password"]
        else "  - Trang thai Email  : TAT (chua cau hinh THUYSTALK_SMTP_APP_PASSWORD trong .env)"
    )
    print("=" * 72, flush=True)
    print(f"THUYSTALK WEB & KNOWLEDGE API DANG CHAY TAI: {url}", flush=True)
    print(smtp_status_line, flush=True)
    print(f"  - Trang chu         : {url}/index.html", flush=True)
    print(f"  - Trang E-Learning  : {url}/elearning.html", flush=True)
    print(f"  - Trang Video       : {url}/videos.html", flush=True)
    print(f"  - Trang Bai viet    : {url}/bai-viet.html", flush=True)
    print(f"  - Trang Tra cuu AI  : {url}/tra-cuu.html", flush=True)
    print(f"  - Trang Quan tri CMS: {url}/admin.html", flush=True)
    print("Nhan Ctrl+C de dung server.", flush=True)
    print("=" * 72, flush=True)
    if "--no-browser" not in sys.argv:
        try:
            webbrowser.open(url)
        except Exception:
            pass
    with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), ThuysTalkRequestHandler) as httpd:
        httpd.serve_forever()
