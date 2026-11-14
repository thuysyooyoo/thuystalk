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
import http.server
import io
import json
import os
import secrets
import shutil
import smtplib
import subprocess
import sys
import time
import urllib.parse
import webbrowser
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

PORT = 8099
WEB_DIR = Path(__file__).resolve().parent
PASSWORD_STORE_FILE = WEB_DIR / "backend" / "password_resets.json"


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


def generate_random_password(length=10):
    """Sinh mật khẩu ngẫu nhiên an toàn bằng secrets, tránh ký tự dễ nhầm lẫn (0/O, 1/l/I)."""
    upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
    lower = "abcdefghijkmnopqrstuvwxyz"
    digits = "23456789"
    special = "@#$%&*"
    all_chars = upper + lower + digits + special
    chars = [
        secrets.choice(upper),
        secrets.choice(lower),
        secrets.choice(digits),
        secrets.choice(special),
    ]
    chars.extend(secrets.choice(all_chars) for _ in range(max(4, length - 4)))
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


def _hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.sha256((salt + password).encode("utf-8")).hexdigest()
    return salt, digest


def _load_password_store():
    if not PASSWORD_STORE_FILE.exists():
        return {}
    try:
        return json.loads(PASSWORD_STORE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save_password_store(store):
    PASSWORD_STORE_FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = PASSWORD_STORE_FILE.with_suffix(".tmp.json")
    tmp_path.write_text(json.dumps(store, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp_path, PASSWORD_STORE_FILE)

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
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Bridge-Token")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def do_OPTIONS(self):
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
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/notebook-query":
            self.handle_notebook_query()
        elif parsed.path == "/api/parse-excel":
            self.handle_parse_excel()
        elif parsed.path == "/api/send-email":
            self.handle_send_email()
        elif parsed.path == "/api/send-bulk-email":
            self.handle_send_bulk_email()
        elif parsed.path == "/api/reset-password":
            self.handle_reset_password()
        elif parsed.path == "/api/verify-temp-password":
            self.handle_verify_temp_password()
        elif parsed.path == "/api/update-local-password":
            self.handle_update_local_password()
        else:
            self._send_json(404, {"error": "Endpoint Not Found"})

    def handle_send_email(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

            name = str(payload.get("name", "")).strip()
            email = str(payload.get("email", "")).strip()
            phone = str(payload.get("phone", "")).strip()
            doc_title = str(payload.get("docTitle", "")).strip()
            doc_type = str(payload.get("docType", "")).strip()
            content_preview = str(payload.get("content", "")).strip()

            if not email or "@" not in email:
                self._send_json(400, {"ok": False, "error": "Địa chỉ Email không hợp lệ."})
                return

            # REAL SMTP TRANSMISSION VIA GMAIL
            smtp_success = False
            smtp_notice = ""
            try:
                smtp_cfg = _get_smtp_config()
                if not smtp_cfg["app_password"]:
                    raise RuntimeError(
                        "Tính năng gửi email đang tắt (chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env)."
                    )
                sender_email = smtp_cfg["sender"]

                msg = MIMEMultipart("alternative")
                msg["From"] = f"ThuysTalk Official <{sender_email}>"
                msg["To"] = email
                msg["Subject"] = f"[ThuysTalk] Tài Liệu Bạn Yêu Cầu: {doc_title}"

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
      <p>Kính gửi <strong>{name or 'Anh/Chị'}</strong>,</p>
      <p>ThuysTalk đã nhận được yêu cầu tài liệu của Anh/Chị từ website <strong>ThuysTalk</strong>. Em xin gửi toàn văn tài liệu chuyên môn theo yêu cầu của Anh/Chị:</p>
      
      <div class="doc-card">
        <p class="doc-type">{doc_type or 'Tài Liệu Chuyên Môn'}</p>
        <h3 class="doc-title">{doc_title}</h3>
        <p style="margin: 8px 0 0; font-size: 13px; color: #334155;">Đã được đóng gói đầy đủ để Anh/Chị có thể tham khảo và áp dụng ngay vào nghiệp vụ thực tế.</p>
      </div>

      <p style="margin-top: 24px;">Nếu Anh/Chị có bất kỳ câu hỏi hoặc cần giải đáp chuyên sâu về thủ tục hải quan, kiểm tra C/O, mã HS hoặc chính sách xuất nhập khẩu mới nhất, hãy kết nối trực tiếp với Thúy qua Zalo:</p>
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

                # Text attachment
                doc_text = f"THUYSTALK - TÀI LIỆU CHUYÊN MÔN XUẤT NHẬP KHẨU\n"
                doc_text += f"Người nhận: {name or 'Học viên / Khách hàng'}\n"
                doc_text += f"Email: {email}\n"
                doc_text += f"Tài liệu: {doc_title}\n"
                doc_text += f"Thời gian gửi: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
                doc_text += f"--------------------------------------------------\n\n"
                doc_text += f"Nội dung tài liệu: {doc_title}\n"
                doc_text += f"Chuyên mục: {doc_type}\n"
                if content_preview:
                    doc_text += f"\nChi tiết nội dung:\n{content_preview}\n"
                doc_text += f"\nChia sẻ bởi: Nguyễn Thị Ngọc Thúy (Sáng lập ThuysTalk / Giám đốc Eureka Logistics)\n"
                doc_text += f"Hotline tư vấn chuyên sâu / Zalo: 0767.648.862\n"

                part = MIMEBase("application", "octet-stream")
                part.set_payload(doc_text.encode("utf-8"))
                encoders.encode_base64(part)
                safe_fname = "ThuysTalk_" + "".join(c for c in doc_title if c.isalnum() or c in (" ", "_", "-")).rstrip()[:40].replace(" ", "_") + ".txt"
                part.add_header("Content-Disposition", f'attachment; filename="{safe_fname}"')
                msg.attach(part)

                server, _ = _open_smtp_connection(timeout=12)
                server.send_message(msg)
                server.quit()
                smtp_success = True
                smtp_notice = "Đã gửi email thành công qua Gmail SMTP"
                print(f"[SMTP THÀNH CÔNG] Đã gửi email tới {email} cho tài liệu: {doc_title}")
            except Exception as smtp_err:
                smtp_success = False
                smtp_notice = str(smtp_err)
                print(f"[SMTP LỖI] Gửi email thất bại: {smtp_err}")

            # Archive local log record
            sent_dir = WEB_DIR / "sent_emails"
            sent_dir.mkdir(parents=True, exist_ok=True)
            now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            email_log_file = sent_dir / f"EMAIL_{now_str}_{email.replace('@', '_at_')}.json"

            email_record = {
                "timestamp": datetime.datetime.now().isoformat(),
                "recipient_name": name,
                "recipient_email": email,
                "recipient_phone": phone,
                "doc_title": doc_title,
                "doc_type": doc_type,
                "smtp_delivered": smtp_success,
                "smtp_notice": smtp_notice,
                "status": "DELIVERED" if smtp_success else "ARCHIVED",
                "message": f"Hồ sơ tài liệu '{doc_title}' đã được gửi tới {email}."
            }

            with open(email_log_file, "w", encoding="utf-8") as f:
                json.dump(email_record, f, ensure_ascii=False, indent=2)

            self._send_json(200, {
                "ok": True,
                "delivered": smtp_success,
                "message": f"Tài liệu '{doc_title}' đã được gửi thành công trực tiếp vào hộp thư {email}!" if smtp_success else f"Đã ghi nhận yêu cầu tài liệu '{doc_title}' cho {email}.",
                "recipient": email,
                "docTitle": doc_title
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi xử lý gửi email: {exc}"})

    def handle_send_bulk_email(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

            doc_title = str(payload.get("docTitle", "")).strip()
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

            # Open single SSL connection to Gmail SMTP for efficiency
            server, sender_email = _open_smtp_connection(timeout=25)

            for rec in recipients:
                rec_email = str(rec.get("email", "")).strip().lower()
                rec_name = str(rec.get("name", "")).strip() or "Học viên / Đối tác"

                if not rec_email or "@" not in rec_email:
                    continue

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
      <p>Kính gửi <strong>{rec_name}</strong>,</p>
      <p>ThuysTalk xin gửi tới Anh/Chị toàn văn tài liệu / bài viết chuyên sâu mới nhất được cập nhật trên nền tảng <strong>ThuysTalk</strong>:</p>
      
      <div class="doc-card">
        <p class="doc-type">{doc_type}</p>
        <h3 class="doc-title">{doc_title}</h3>
        <p style="margin: 8px 0 0; font-size: 13px; color: #334155;">Toàn bộ biểu mẫu và công văn trích dẫn đã được đính kèm ở tệp <strong>{safe_fname}</strong> bên dưới.</p>
      </div>

      <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:16px; font-size:13px; color:#334155; margin:16px 0; line-height:1.6;">
        <strong style="color:#065F46; display:block; margin-bottom:6px;">Tóm lược nội dung chính:</strong>
        {clean_preview}
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

    def handle_reset_password(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

            email = str(payload.get("email", "")).strip()
            if not email or "@" not in email:
                self._send_json(400, {"ok": False, "error": "Địa chỉ Email không hợp lệ."})
                return

            # Sinh mật khẩu ngẫu nhiên hoàn toàn mới cho mỗi yêu cầu (không dùng mật khẩu cố định)
            temp_pwd = generate_random_password(10)
            salt, pwd_hash = _hash_password(temp_pwd)

            store = _load_password_store()
            store[email.lower()] = {
                "salt": salt,
                "hash": pwd_hash,
                "is_temp": True,
                "expires_at": time.time() + 86400,  # Có hiệu lực 24 giờ
                "updated_at": datetime.datetime.now().isoformat()
            }
            _save_password_store(store)

            smtp_success = False
            smtp_notice = ""

            try:
                smtp_cfg = _get_smtp_config()
                if not smtp_cfg["app_password"]:
                    raise RuntimeError(
                        "Tính năng gửi email đang tắt (chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env)."
                    )
                sender_email = smtp_cfg["sender"]

                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"[ThuysTalk] Mật Khẩu Mới Khôi Phục Tài Khoản ({email})"
                msg["From"] = f"ThuysTalk Official <{sender_email}>"
                msg["To"] = email

                html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0F172A; background-color: #F8FAFC; margin: 0; padding: 20px; }}
    .card {{ max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }}
    .head {{ background: #064E3B; padding: 24px; color: #FFFFFF; text-align: center; }}
    .body {{ padding: 28px 24px; }}
    .pwd-box {{ background: #F0FDF4; border: 2px dashed #059669; border-radius: 10px; padding: 16px; text-align: center; margin: 20px 0; }}
    .pwd-code {{ font-size: 1.4rem; font-weight: 800; color: #064E3B; letter-spacing: 1px; font-family: monospace; }}
    .btn {{ display: inline-block; background: #EA580C; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 15px; }}
    .footer {{ background: #F1F5F9; padding: 16px; font-size: 0.8rem; color: #64748B; text-align: center; border-top: 1px solid #E2E8F0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h2 style="margin:0; font-size: 1.3rem;">THUYSTALK - KHÔI PHỤC MẬT KHẨU TÀI KHOẢN</h2>
      <p style="margin: 4px 0 0; opacity: 0.85; font-size: 0.88rem;">Hệ thống Tài Liệu, Mini Test &amp; Tra Cứu Pháp Lý Hải Quan</p>
    </div>
    <div class="body">
      <p>Kính chào <strong>{email}</strong>,</p>
      <p>Hệ thống ThuysTalk đã tiếp nhận yêu cầu khôi phục mật khẩu đăng nhập.</p>

      <p>Dưới đây là <strong>mật khẩu tạm thời</strong> được tạo ngẫu nhiên (có hiệu lực trong 24 giờ):</p>
      <div class="pwd-box">
        <div style="font-size: 0.8rem; color: #047857; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Mật Khẩu Tạm Thời:</div>
        <div class="pwd-code">{temp_pwd}</div>
      </div>

      <p style="font-size: 0.88rem; color: #475569;">
        <strong>Hướng dẫn đăng nhập:</strong><br />
        1. Dùng email này kèm mật khẩu <code>{temp_pwd}</code> để đăng nhập lại vào website.<br />
        2. Sau khi đăng nhập thành công, vui lòng nhấp vào tên tài khoản trên thanh menu để vào mục <strong>Hồ Sơ Cá Nhân &rarr; Đổi Mật Khẩu</strong> và thiết lập mật khẩu riêng.<br />
        3. Không chia sẻ mật khẩu này cho người khác.
      </p>

      <div style="text-align: center; margin-top: 25px;">
        <a href="http://localhost:8099/index.html" class="btn" style="color:#ffffff;">Đăng Nhập Vào ThuysTalk Ngay</a>
      </div>
    </div>
    <div class="footer">
      <div>Người sáng lập &amp; Điều hành: <strong>Nguyễn Thị Ngọc Thúy</strong> (Giám đốc Eureka Logistics)</div>
      <div>Hotline hỗ trợ kỹ thuật / Zalo: <strong>0767.648.862</strong> · Email: thuystalk.official@gmail.com</div>
      <div style="margin-top: 6px;">Bảo mật theo tiêu chuẩn Nghị định 13/2023/NĐ-CP của Chính phủ.</div>
    </div>
  </div>
</body>
</html>"""
                msg.attach(MIMEText(html_content, "html", "utf-8"))

                server, _ = _open_smtp_connection(timeout=12)
                server.send_message(msg)
                server.quit()
                smtp_success = True
                smtp_notice = "Đã gửi email mật khẩu ngẫu nhiên thành công qua Gmail SMTP"
                print(f"[SMTP THÀNH CÔNG] Đã gửi mật khẩu tạm thời tới {email}")
            except Exception as smtp_err:
                smtp_success = False
                smtp_notice = str(smtp_err)
                print(f"[SMTP LỖI] Gửi mật khẩu tạm thời thất bại: {smtp_err}")

            # TUYỆT ĐỐI KHÔNG trả mật khẩu về JSON response để tránh lộ trên trình duyệt/network
            self._send_json(200, {
                "ok": True,
                "delivered": smtp_success,
                "message": f"Hệ thống đã gửi mật khẩu mới về hộp thư {email}." if smtp_success else f"Chưa thể gửi email tự động: {smtp_notice}",
                "recipient": email
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi xử lý khôi phục mật khẩu: {exc}"})

    def handle_verify_temp_password(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

            email = str(payload.get("email", "")).strip().lower()
            password = str(payload.get("password", ""))
            if not email or not password:
                self._send_json(200, {"ok": True, "valid": False})
                return

            store = _load_password_store()
            entry = store.get(email)
            if not entry:
                self._send_json(200, {"ok": True, "valid": False})
                return

            expires_at = entry.get("expires_at")
            if expires_at is not None and time.time() > float(expires_at):
                self._send_json(200, {"ok": True, "valid": False, "expired": True})
                return

            _, actual_hash = _hash_password(password, entry.get("salt", ""))
            is_valid = hmac.compare_digest(str(entry.get("hash", "")), actual_hash)
            self._send_json(200, {
                "ok": True,
                "valid": bool(is_valid),
                "isTemp": bool(entry.get("is_temp", True)) if is_valid else False
            })
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi kiểm tra mật khẩu: {exc}"})

    def handle_update_local_password(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

            email = str(payload.get("email", "")).strip().lower()
            new_password = str(payload.get("newPassword", ""))
            if not email or "@" not in email or len(new_password) < 6:
                self._send_json(400, {"ok": False, "error": "Thông tin cập nhật mật khẩu không hợp lệ."})
                return

            salt, pwd_hash = _hash_password(new_password)
            store = _load_password_store()
            store[email] = {
                "salt": salt,
                "hash": pwd_hash,
                "is_temp": False,
                "expires_at": None,
                "updated_at": datetime.datetime.now().isoformat()
            }
            _save_password_store(store)
            self._send_json(200, {"ok": True})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi cập nhật mật khẩu: {exc}"})

    def handle_parse_excel(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}
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

    def handle_notebook_query(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(raw_body) if raw_body else {}

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
