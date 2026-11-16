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
import math
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
import uuid
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

AI_JOB_TTL_SECONDS = 1800
AI_MAX_JOBS = 100
AI_CACHE_TTL_SECONDS = 86400
AI_MAX_CACHE_ENTRIES = 200
AI_QUERY_TIMEOUT_SECONDS = 300
VN_TZ = datetime.timezone(datetime.timedelta(hours=7))
AI_QUOTA_ERROR_PATTERNS = (
    re.compile(r"\busage\s+limit\b", re.IGNORECASE),
    re.compile(r"\blimit\s+reached\b", re.IGNORECASE),
    re.compile(r"\bquota\b", re.IGNORECASE),
    re.compile(r"\brate\s*limit\b", re.IGNORECASE),
    re.compile(r"\bresource\s+exhausted\b", re.IGNORECASE),
    re.compile(r"\bresource_exhausted\b", re.IGNORECASE),
    re.compile(r"\bquery_resource_exhausted\b", re.IGNORECASE),
    re.compile(r"\berror\s+code\s*8\b", re.IGNORECASE),
    re.compile(r"\bcode\s*8\s*:", re.IGNORECASE),
    re.compile(r"\b429\b"),
)
AI_ANSWER_QUOTA_REJECTION_PATTERNS = (
    re.compile(r"temporarily\s+rejected\s+the\s+query", re.IGNORECASE),
    re.compile(r"\busage\s+limit\s+(?:was\s+|has\s+been\s+)?reached\b", re.IGNORECASE),
    re.compile(r"\bquery_resource_exhausted\b", re.IGNORECASE),
    re.compile(r"\brate\s+limit\s+exceeded\b", re.IGNORECASE),
)

_AI_LOCK = threading.Lock()
_AI_SEMAPHORE = threading.Semaphore(2)
_AI_JOBS = {}
_AI_RESPONSE_CACHE = {}
_AI_USER_SENDS = {}
_AI_IP_SENDS = {}
_AI_GLOBAL_HOURLY_SENDS = []
_AI_GLOBAL_DAILY_SENDS = []
_AI_PAUSED_UNTIL = 0.0


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


def _normalize_ai_query(query: str) -> str:
    """Chuẩn hóa câu hỏi làm khóa cache tra cứu AI."""
    collapsed = re.sub(r"\s+", " ", str(query or "").strip().lower())
    return collapsed.strip(" ?!.,;:")


def _format_vn_hh_mm(epoch_ts: float) -> str:
    """Định dạng mốc giờ HH:MM theo múi giờ Việt Nam (UTC+7)."""
    dt = datetime.datetime.fromtimestamp(float(epoch_ts), tz=VN_TZ)
    return dt.strftime("%H:%M")


def _format_wait_duration_vi(seconds: int) -> str:
    """Chuyển số giây chờ thành chuỗi Tiếng Việt dễ hiểu."""
    sec = max(1, int(seconds))
    if sec < 60:
        return f"{sec} giây"
    mins = math.ceil(sec / 60.0)
    if mins < 60:
        return f"{mins} phút"
    hours = mins // 60
    rem_mins = mins % 60
    if rem_mins == 0:
        return f"{hours} giờ"
    return f"{hours} giờ {rem_mins} phút"


def _prune_ai_state(now: float):
    """Dọn lịch sử quota AI, cache quá hạn và giới hạn tối đa 100 job / 30 phút (yêu cầu đang giữ _AI_LOCK)."""
    global _AI_PAUSED_UNTIL
    if _AI_PAUSED_UNTIL and now >= _AI_PAUSED_UNTIL:
        _AI_PAUSED_UNTIL = 0.0

    hour_cutoff = now - 3600.0
    day_cutoff = now - 86400.0
    _AI_GLOBAL_HOURLY_SENDS[:] = [ts for ts in _AI_GLOBAL_HOURLY_SENDS if ts >= hour_cutoff]
    _AI_GLOBAL_DAILY_SENDS[:] = [ts for ts in _AI_GLOBAL_DAILY_SENDS if ts >= day_cutoff]

    for store in (_AI_USER_SENDS, _AI_IP_SENDS):
        for key in list(store.keys()):
            recent = [ts for ts in store[key] if ts >= hour_cutoff]
            if recent:
                store[key] = recent
            else:
                del store[key]

    cache_cutoff = now - AI_CACHE_TTL_SECONDS
    for ckey in list(_AI_RESPONSE_CACHE.keys()):
        if float(_AI_RESPONSE_CACHE[ckey].get("cached_at", 0)) < cache_cutoff:
            del _AI_RESPONSE_CACHE[ckey]
    if len(_AI_RESPONSE_CACHE) > AI_MAX_CACHE_ENTRIES:
        oldest_first = sorted(
            _AI_RESPONSE_CACHE.items(),
            key=lambda kv: float(kv[1].get("cached_at", 0)),
        )
        for ckey, _ in oldest_first[: len(_AI_RESPONSE_CACHE) - AI_MAX_CACHE_ENTRIES]:
            _AI_RESPONSE_CACHE.pop(ckey, None)

    job_cutoff = now - AI_JOB_TTL_SECONDS
    for jid in list(_AI_JOBS.keys()):
        if float(_AI_JOBS[jid].get("created_at", 0)) < job_cutoff:
            del _AI_JOBS[jid]
    if len(_AI_JOBS) > AI_MAX_JOBS:
        evict_order = sorted(
            _AI_JOBS.items(),
            key=lambda kv: (
                0 if kv[1].get("status") in ("done", "error") else 1,
                float(kv[1].get("created_at", 0)),
            ),
        )
        for jid, _ in evict_order[: len(_AI_JOBS) - AI_MAX_JOBS]:
            _AI_JOBS.pop(jid, None)


def _has_quota_keyword(text: str) -> bool:
    raw = str(text or "")
    return any(pat.search(raw) for pat in AI_QUOTA_ERROR_PATTERNS)


def _extract_nlm_output(stdout_str: str):
    """Bóc tách câu trả lời và JSON gốc từ stdout của CLI nlm."""
    text = (stdout_str or "").strip()
    if not text:
        return "", None
    try:
        parsed = json.loads(text)
    except Exception:
        return text, None
    if isinstance(parsed, dict):
        val = parsed.get("value") if isinstance(parsed.get("value"), dict) else parsed
        ans = val.get("answer") or val.get("response") or val.get("text") or ""
        return str(ans or "").strip(), parsed
    return text, None


def _is_nlm_quota_error(stdout_str: str, stderr_str: str, parsed_json, returncode: int, answer_text: str) -> bool:
    """Nhận diện hết hạn mức NotebookLM/Gemini Notebook chỉ trên lỗi thật hoặc thông báo từ chối dịch vụ."""
    has_json_error = False
    if isinstance(parsed_json, dict):
        err_bits = []
        for container in (parsed_json, parsed_json.get("value") if isinstance(parsed_json.get("value"), dict) else {}):
            if container.get("error") is not None or str(container.get("status") or "").lower() == "error":
                has_json_error = True
            for field in ("error", "message", "detail", "details", "debug_code", "status"):
                if container.get(field) is not None:
                    err_bits.append(str(container.get(field)))
        if err_bits and _has_quota_keyword(" ".join(err_bits)):
            return True

    if returncode != 0 or not answer_text or has_json_error:
        return _has_quota_keyword(stderr_str) or _has_quota_keyword(stdout_str)

    if len(answer_text) < 400 and any(pat.search(answer_text) for pat in AI_ANSWER_QUOTA_REJECTION_PATTERNS):
        return True
    return False


def _parse_nlm_usage_reset_ts(stdout_str: str, now: float) -> float:
    """Đọc windows[].resets_at (ISO 8601 UTC) từ JSON của `nlm usage --json`; fallback 60 phút."""
    default_ts = now + 3600.0
    text = (stdout_str or "").strip()
    if not text:
        return default_ts
    try:
        data = json.loads(text)
    except Exception:
        return default_ts
    windows = data.get("windows") if isinstance(data, dict) else None
    if not isinstance(windows, list):
        return default_ts
    candidates = []
    for win in windows:
        if not isinstance(win, dict):
            continue
        raw_reset = str(win.get("resets_at") or "").strip()
        if not raw_reset:
            continue
        try:
            iso = raw_reset[:-1] + "+00:00" if raw_reset.endswith("Z") else raw_reset
            dt = datetime.datetime.fromisoformat(iso)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            ts = dt.timestamp()
            if ts > now:
                candidates.append(ts)
        except Exception:
            continue
    return min(candidates) if candidates else default_ts


def _fetch_nlm_reset_timestamp(now: float) -> float:
    """Chạy `nlm usage --json` để lấy giờ hồi hạn mức; fallback sau 60 phút nếu không đọc được."""
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["NO_COLOR"] = "1"
    env["TERM"] = "dumb"
    env["NOTEBOOKLM_RATE_LIMIT_MAX_RETRIES"] = "0"
    try:
        proc = subprocess.run(
            ["nlm", "usage", "--json"],
            stdin=subprocess.DEVNULL,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            timeout=15,
        )
        return _parse_nlm_usage_reset_ts(proc.stdout or "", now)
    except Exception:
        return now + 3600.0


def _invoke_nlm_query(notebook_id: str, query: str) -> tuple:
    """Gọi `nlm query notebook --json --new-conversation --timeout 300` với retry=0."""
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    env["NO_COLOR"] = "1"
    env["TERM"] = "dumb"
    env["NOTEBOOKLM_RATE_LIMIT_MAX_RETRIES"] = "0"
    proc = subprocess.run(
        [
            "nlm",
            "query",
            "notebook",
            "--json",
            "--new-conversation",
            "--timeout",
            str(AI_QUERY_TIMEOUT_SECONDS),
            notebook_id,
            query,
        ],
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        timeout=AI_QUERY_TIMEOUT_SECONDS + 10,
    )
    return proc.returncode, proc.stdout or "", proc.stderr or ""


def postprocess_ai_answer(answer_text: str) -> str:
    """Hậu xử lý câu trả lời AI (R4-14 phần 1): ẩn NotebookLM/Gemini Notebook/sổ tay và bỏ lời mời tìm web."""
    text = str(answer_text or "").strip()
    if not text:
        return ""

    # 1. Loại bỏ dòng hoặc câu mời tìm kiếm trên web
    cleaned_lines = []
    web_prompt_re = re.compile(
        r"(?:(?:nếu\s+(?:bạn|quý\s+vị)\s+muốn[^.\n!?]*[,:]\s*)?"
        r"(?:bạn\s+có\s+muốn|quý\s+vị\s+có\s+muốn|tôi\s+có\s+thể|mình\s+có\s+thể|nếu\s+cần|hãy\s+cho\s+tôi\s+biết|"
        r"would\s+you\s+like|do\s+you\s+want|i\s+can)[^.\n!?]*)?"
        r"(?:tìm(?:\s+kiếm)?(?:\s+thêm)?(?:\s+thông\s+tin)?\s+trên\s+(?:web|internet)\b|search\s+(?:the\s+)?web\b)[^.\n!?]*[.?]*",
        flags=re.IGNORECASE,
    )
    for line in text.splitlines():
        line_clean = web_prompt_re.sub("", line).strip()
        if line and not line_clean:
            continue
        # Bỏ dòng chỉ còn dấu * hoặc khoảng trắng sau khi cắt câu mời
        if re.fullmatch(r"[\s*_~\-]+", line_clean) and not re.match(r"^(-{3,}|\*{3,}|_{3,})$", line.strip()):
            continue
        cleaned_lines.append(line_clean)

    text = "\n".join(cleaned_lines)

    # 2. Thay thế các cụm tên kỹ thuật / sổ tay bằng "kho tri thức ThuysTalk"
    replacements = [
        (r"\bgoogle\s+notebook\s*lm\b", "kho tri thức ThuysTalk"),
        (r"\bnotebook\s*lm\b", "kho tri thức ThuysTalk"),
        (r"\bgoogle\s+gemini\s+notebook\b", "kho tri thức ThuysTalk"),
        (r"\bgemini\s+notebook\b", "kho tri thức ThuysTalk"),
        (r"\bcác\s+sổ\s+tay(?:\s+(?:này|hiện\s+có|được\s+cung\s+cấp))?\b", "kho tri thức ThuysTalk"),
        (r"\bsổ\s+tay(?:\s+(?:này|nói\s+trên|hiện\s+có|được\s+cung\s+cấp))?\b", "kho tri thức ThuysTalk"),
    ]
    for pattern, repl in replacements:
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)

    # Khử lặp cụm thương hiệu và dòng trống dư thừa
    text = re.sub(r"(?:kho tri thức ThuysTalk\s*){2,}", "kho tri thức ThuysTalk ", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _release_ai_quota_slot(actor_type: str, actor_key: str, reserved_ts: float):
    """Hoàn trả lượt quota vừa giữ chỗ nếu quá trình gọi `nlm` lỗi hoặc chạm hạn mức."""
    if not reserved_ts:
        return
    with _AI_LOCK:
        if reserved_ts in _AI_GLOBAL_HOURLY_SENDS:
            _AI_GLOBAL_HOURLY_SENDS.remove(reserved_ts)
        if reserved_ts in _AI_GLOBAL_DAILY_SENDS:
            _AI_GLOBAL_DAILY_SENDS.remove(reserved_ts)
        store = _AI_USER_SENDS if actor_type == "user" else _AI_IP_SENDS
        recent = store.get(actor_key)
        if recent and reserved_ts in recent:
            recent.remove(reserved_ts)
            if not recent:
                store.pop(actor_key, None)


def _reserve_ai_quota_slot(actor_type: str, actor_key: str, now: float):
    """Kiểm tra trạng thái tạm nghỉ, các trần quota (uid/IP, giờ, ngày) và giữ chỗ trước khi gọi `nlm`."""
    per_user_hourly = _get_positive_int_env("THUYSTALK_AI_PER_USER_HOURLY", 10)
    per_ip_hourly = _get_positive_int_env("THUYSTALK_AI_PER_GUEST_IP_HOURLY", 20)
    global_hourly = _get_positive_int_env("THUYSTALK_AI_GLOBAL_HOURLY_LIMIT", 20)
    global_daily = _get_positive_int_env("THUYSTALK_AI_GLOBAL_DAILY_LIMIT", 120)
    actor_limit = per_user_hourly if actor_type == "user" else per_ip_hourly

    with _AI_LOCK:
        _prune_ai_state(now)
        if _AI_PAUSED_UNTIL > now:
            hh_mm = _format_vn_hh_mm(_AI_PAUSED_UNTIL)
            return (
                False,
                429,
                {
                    "ok": False,
                    "error_code": "ai_quota",
                    "paused_until": _AI_PAUSED_UNTIL,
                    "reset_time_str": hh_mm,
                    "error": f"Tra cứu AI đang tạm nghỉ đến {hh_mm}. Câu hỏi phổ biến vẫn trả lời ngay",
                },
                None,
            )

        store = _AI_USER_SENDS if actor_type == "user" else _AI_IP_SENDS
        actor_recent = store.setdefault(actor_key, [])

        if len(_AI_GLOBAL_DAILY_SENDS) >= global_daily:
            if not actor_recent:
                store.pop(actor_key, None)
            oldest = min(_AI_GLOBAL_DAILY_SENDS)
            wait_sec = max(1, math.ceil(oldest + 86400.0 - now))
            hh_mm = _format_vn_hh_mm(now + wait_sec)
            wait_vi = _format_wait_duration_vi(wait_sec)
            return (
                False,
                429,
                {
                    "ok": False,
                    "error_code": "rate_limit",
                    "rateLimited": True,
                    "scope": "global_daily",
                    "retry_after_seconds": wait_sec,
                    "reset_time_str": hh_mm,
                    "error": f"Hệ thống tra cứu AI đã đạt giới hạn lượt hỏi trong ngày. Bạn có thể hỏi lại sau {wait_vi} (khoảng {hh_mm}).",
                },
                None,
            )

        if len(_AI_GLOBAL_HOURLY_SENDS) >= global_hourly:
            if not actor_recent:
                store.pop(actor_key, None)
            oldest = min(_AI_GLOBAL_HOURLY_SENDS)
            wait_sec = max(1, math.ceil(oldest + 3600.0 - now))
            hh_mm = _format_vn_hh_mm(now + wait_sec)
            wait_vi = _format_wait_duration_vi(wait_sec)
            return (
                False,
                429,
                {
                    "ok": False,
                    "error_code": "rate_limit",
                    "rateLimited": True,
                    "scope": "global_hourly",
                    "retry_after_seconds": wait_sec,
                    "reset_time_str": hh_mm,
                    "error": f"Hệ thống tra cứu AI đang phục vụ tối đa lượt hỏi trong giờ. Vui lòng thử lại sau {wait_vi} (lúc {hh_mm}).",
                },
                None,
            )

        if len(actor_recent) >= actor_limit:
            oldest = min(actor_recent)
            wait_sec = max(1, math.ceil(oldest + 3600.0 - now))
            hh_mm = _format_vn_hh_mm(now + wait_sec)
            wait_vi = _format_wait_duration_vi(wait_sec)
            scope = "user_hourly" if actor_type == "user" else "ip_hourly"
            subject = "tài khoản của bạn" if actor_type == "user" else "địa chỉ mạng này"
            return (
                False,
                429,
                {
                    "ok": False,
                    "error_code": "rate_limit",
                    "rateLimited": True,
                    "scope": scope,
                    "retry_after_seconds": wait_sec,
                    "reset_time_str": hh_mm,
                    "error": f"Lượt tra cứu AI chuyên sâu của {subject} đã đạt {actor_limit} câu/giờ. Bạn có thể hỏi lại sau {wait_vi} (lúc {hh_mm}).",
                },
                None,
            )

        reserved_ts = now
        _AI_GLOBAL_HOURLY_SENDS.append(reserved_ts)
        _AI_GLOBAL_DAILY_SENDS.append(reserved_ts)
        actor_recent.append(reserved_ts)
        return True, 200, None, reserved_ts


def _execute_notebook_job_worker(
    job_id: str,
    notebook_id: str,
    query: str,
    norm_query: str,
    actor_type: str,
    actor_key: str,
    reserved_ts: float,
):
    """Luồng nền chạy `nlm` có Semaphore(2), tự nhận diện ai_quota và hoàn trả slot nếu lỗi."""
    global _AI_PAUSED_UNTIL
    branch_name = ALLOWED_NOTEBOOK_IDS.get(notebook_id, "Kho Tri Thức Pháp Lý ThuysTalk")
    with _AI_SEMAPHORE:
        with _AI_LOCK:
            job = _AI_JOBS.get(job_id)
            if not job:
                _release_ai_quota_slot_unlocked = True
            else:
                job["status"] = "running"
                job["started_at"] = time.time()
                _release_ai_quota_slot_unlocked = False
        if _release_ai_quota_slot_unlocked:
            _release_ai_quota_slot(actor_type, actor_key, reserved_ts)
            return

        try:
            returncode, stdout_str, stderr_str = _invoke_nlm_query(notebook_id, query)
            raw_answer, parsed_json = _extract_nlm_output(stdout_str)
            now = time.time()

            if _is_nlm_quota_error(stdout_str, stderr_str, parsed_json, returncode, raw_answer):
                _release_ai_quota_slot(actor_type, actor_key, reserved_ts)
                reset_ts = _fetch_nlm_reset_timestamp(now)
                hh_mm = _format_vn_hh_mm(reset_ts)
                with _AI_LOCK:
                    _AI_PAUSED_UNTIL = max(_AI_PAUSED_UNTIL, reset_ts)
                    job = _AI_JOBS.get(job_id)
                    if job:
                        job.update(
                            {
                                "status": "error",
                                "finished_at": time.time(),
                                "error_code": "ai_quota",
                                "paused_until": _AI_PAUSED_UNTIL,
                                "reset_time_str": hh_mm,
                                "error": f"Tra cứu AI đang tạm nghỉ đến {hh_mm}. Câu hỏi phổ biến vẫn trả lời ngay",
                            }
                        )
                return

            if returncode != 0 or not raw_answer:
                _release_ai_quota_slot(actor_type, actor_key, reserved_ts)
                print(
                    f"[AI JOB ERROR] job={job_id[:8]} rc={returncode} stderr={stderr_str[:240]!r} stdout={stdout_str[:240]!r}",
                    flush=True,
                )
                with _AI_LOCK:
                    job = _AI_JOBS.get(job_id)
                    if job:
                        job.update(
                            {
                                "status": "error",
                                "finished_at": time.time(),
                                "error_code": "ai_error",
                                "error": "Hệ thống tra cứu chuyên sâu hiện chưa thể xử lý câu hỏi này. Vui lòng thử lại hoặc gửi câu hỏi cho Thúy.",
                            }
                        )
                return

            final_answer = postprocess_ai_answer(raw_answer)
            if not final_answer:
                _release_ai_quota_slot(actor_type, actor_key, reserved_ts)
                with _AI_LOCK:
                    job = _AI_JOBS.get(job_id)
                    if job:
                        job.update(
                            {
                                "status": "error",
                                "finished_at": time.time(),
                                "error_code": "ai_error",
                                "error": "Chưa nhận được nội dung trả lời phù hợp từ kho dữ liệu. Vui lòng thử lại hoặc gửi câu hỏi cho Thúy.",
                            }
                        )
                return

            done_ts = time.time()
            with _AI_LOCK:
                _AI_RESPONSE_CACHE[(notebook_id, norm_query)] = {
                    "answer": final_answer,
                    "branch_name": branch_name,
                    "cached_at": done_ts,
                }
                _prune_ai_state(done_ts)
                job = _AI_JOBS.get(job_id)
                if job:
                    job.update(
                        {
                            "status": "done",
                            "finished_at": done_ts,
                            "branch_name": branch_name,
                            "answer": final_answer,
                            "cached": False,
                        }
                    )
        except Exception as exc:
            _release_ai_quota_slot(actor_type, actor_key, reserved_ts)
            with _AI_LOCK:
                job = _AI_JOBS.get(job_id)
                if job:
                    job.update(
                        {
                            "status": "error",
                            "finished_at": time.time(),
                            "error_code": "ai_error",
                            "error": f"Quá trình tra cứu gặp gián đoạn ({type(exc).__name__}). Vui lòng thử lại sau giây lát.",
                        }
                    )


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

        if parsed.path == "/api/notebook-job":
            if not self._is_origin_allowed():
                self.close_connection = True
                self._send_json(403, {"ok": False, "error": "Origin không được phép."})
                return
            self.handle_notebook_job_status(parsed)
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

    def _resolve_ai_caller_identity(self):
        """Lấy định danh tính quota AI: ưu tiên uid từ ID token hợp lệ, không tin uid body; nếu chưa đăng nhập lấy IP."""
        auth_header = (self.headers.get("Authorization") or "").strip()
        if auth_header.startswith("Bearer "):
            ok, _status, identity, _msg = self._verify_firebase_id_token()
            if ok and identity and identity.get("uid"):
                return "user", identity["uid"]
        cf_ip = (self.headers.get("CF-Connecting-IP") or "").split(",", 1)[0].strip()
        client_ip = cf_ip or (self.client_address[0] if getattr(self, "client_address", None) else "") or "127.0.0.1"
        return "ip", str(client_ip)[:64]

    def handle_notebook_job_status(self, parsed):
        params = urllib.parse.parse_qs(parsed.query)
        job_id = (params.get("id") or [""])[0].strip()
        if not job_id or len(job_id) > 64:
            self._send_json(400, {"ok": False, "error": "Mã phiên tra cứu không hợp lệ."})
            return

        now = time.time()
        with _AI_LOCK:
            _prune_ai_state(now)
            job = _AI_JOBS.get(job_id)
            if not job:
                self._send_json(404, {"ok": False, "error": "Phiên tra cứu không tồn tại hoặc đã hết hạn."})
                return
            snapshot = {
                "ok": job.get("status") != "error",
                "job_id": job_id,
                "status": job.get("status", "queued"),
                "branch_name": job.get("branch_name", ""),
                "query": job.get("query", ""),
                "cached": bool(job.get("cached", False)),
            }
            if job.get("status") == "done":
                snapshot["answer"] = job.get("answer", "")
            elif job.get("status") == "error":
                snapshot["error"] = job.get("error", "Đã xảy ra lỗi khi tra cứu.")
                snapshot["error_code"] = job.get("error_code", "ai_error")
                if job.get("paused_until"):
                    snapshot["paused_until"] = job["paused_until"]
                if job.get("reset_time_str"):
                    snapshot["reset_time_str"] = job["reset_time_str"]

        self._send_json(200, snapshot)

    def handle_notebook_query(self, payload: dict):
        try:
            notebook_id = str(payload.get("notebook_id", "")).strip()
            query = str(payload.get("query", "")).strip()

            if notebook_id not in ALLOWED_NOTEBOOK_IDS:
                notebook_id = "c3b76775-2095-4866-b634-139c71e0df40"

            if not query or len(query) > 600:
                self._send_json(400, {"ok": False, "error": "Câu hỏi không hợp lệ hoặc quá dài."})
                return

            branch_name = ALLOWED_NOTEBOOK_IDS.get(notebook_id, "Kho Tri Thức Pháp Lý ThuysTalk")
            norm_query = _normalize_ai_query(query)
            now = time.time()

            with _AI_LOCK:
                _prune_ai_state(now)
                cached = _AI_RESPONSE_CACHE.get((notebook_id, norm_query))
                if cached and (now - float(cached.get("cached_at", 0))) <= AI_CACHE_TTL_SECONDS:
                    job_id = uuid.uuid4().hex
                    _AI_JOBS[job_id] = {
                        "job_id": job_id,
                        "status": "done",
                        "created_at": now,
                        "finished_at": now,
                        "branch_name": cached.get("branch_name", branch_name),
                        "query": query,
                        "answer": cached.get("answer", ""),
                        "cached": True,
                    }
                    _prune_ai_state(now)
                    self._send_json(
                        200,
                        {
                            "ok": True,
                            "job_id": job_id,
                            "status": "done",
                            "cached": True,
                            "branch_name": cached.get("branch_name", branch_name),
                            "query": query,
                            "answer": cached.get("answer", ""),
                        },
                    )
                    return

            actor_type, actor_key = self._resolve_ai_caller_identity()
            allowed, err_status, err_payload, reserved_ts = _reserve_ai_quota_slot(actor_type, actor_key, now)
            if not allowed:
                self._send_json(err_status, err_payload)
                return

            job_id = uuid.uuid4().hex
            with _AI_LOCK:
                _AI_JOBS[job_id] = {
                    "job_id": job_id,
                    "status": "queued",
                    "created_at": now,
                    "branch_name": branch_name,
                    "query": query,
                    "cached": False,
                }
                _prune_ai_state(now)

            worker = threading.Thread(
                target=_execute_notebook_job_worker,
                args=(job_id, notebook_id, query, norm_query, actor_type, actor_key, reserved_ts),
                daemon=True,
            )
            worker.start()

            self._send_json(
                200,
                {
                    "ok": True,
                    "job_id": job_id,
                    "status": "queued",
                    "branch_name": branch_name,
                    "query": query,
                },
            )
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi khởi tạo phiên tra cứu: {type(exc).__name__}"})

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
            user_recent = _DEVICE_USER_SENDS.setdefault(uid, [])
            if len(_DEVICE_GLOBAL_SENDS) >= global_limit or len(user_recent) >= per_user_limit:
                if not user_recent:
                    _DEVICE_USER_SENDS.pop(uid, None)
                self._send_json(
                    429,
                    {
                        "ok": False,
                        "rateLimited": True,
                        "error": "Bạn đã yêu cầu gửi mã quá số lần quy định trong 1 giờ. Vui lòng chờ rồi thử lại sau.",
                    },
                )
                return
            reserved_ts = now
            _DEVICE_GLOBAL_SENDS.append(reserved_ts)
            user_recent.append(reserved_ts)

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
            with _DEVICE_LOCK:
                if reserved_ts in _DEVICE_GLOBAL_SENDS:
                    _DEVICE_GLOBAL_SENDS.remove(reserved_ts)
                user_sends = _DEVICE_USER_SENDS.get(uid)
                if user_sends and reserved_ts in user_sends:
                    user_sends.remove(reserved_ts)
                    if not user_sends:
                        _DEVICE_USER_SENDS.pop(uid, None)
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
