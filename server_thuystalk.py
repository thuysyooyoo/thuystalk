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
import urllib.request
import uuid
import webbrowser
from email import encoders
from email.header import Header
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
    "https://thuysyooyoo.github.io",
    "http://localhost:8099",
    "http://127.0.0.1:8099",
}
MAX_POST_BODY_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_DOC_CHECK_BODY_BYTES = 20 * 1024 * 1024  # 20 MB for base64 document bundles
DOC_AUDIT_RECEIVER = "thuystalk.official@gmail.com"
DOC_CHECK_DISCLAIMER = "AI có thể có sai sót, liên hệ Thúy 0767.648.862 để được tư vấn cụ thể."
DOC_CHECK_ALLOWED_EXTENSIONS = {
    ".pdf", ".docx", ".xlsx", ".xls", ".csv", ".txt", ".md", ".jpg", ".jpeg", ".png", ".webp",
}
DOC_TRAINING_ALLOWED_EXTENSIONS = {".txt", ".md", ".csv", ".xlsx", ".docx", ".pdf"}
DOC_CHECK_MAX_FILES = 8
DOC_CHECK_MAX_SINGLE_FILE_BYTES = 8 * 1024 * 1024
DOC_CHECK_MAX_TOTAL_FILE_BYTES = 14 * 1024 * 1024
DOC_CHECK_IP_HOURLY_LIMIT = 15
_DOC_CHECK_LOCK = threading.Lock()
_DOC_CHECK_IP_HITS = {}
_DOC_RULES_CACHE = {"fetched_at": 0.0, "text": ""}
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
AI_SOURCE_CACHE_TTL_SECONDS = 86400
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
_NOTEBOOK_SOURCES_CACHE = {}
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


def _get_notebook_source_map(notebook_id: str) -> dict:
    """Lấy ánh xạ source_id -> tiêu đề nguồn của kho từ `nlm source list <id> --json`, cache theo ngày."""
    if not notebook_id or notebook_id not in ALLOWED_NOTEBOOK_IDS:
        return {}
    now = time.time()
    with _AI_LOCK:
        cached_entry = _NOTEBOOK_SOURCES_CACHE.get(notebook_id)
        if cached_entry and (now - float(cached_entry.get("fetched_at", 0))) <= AI_SOURCE_CACHE_TTL_SECONDS:
            return dict(cached_entry.get("sources") or {})
    try:
        proc = subprocess.run(
            ["nlm", "source", "list", notebook_id, "--json"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdin=subprocess.DEVNULL,
            timeout=25,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if proc.returncode != 0:
            return {}
        parsed = json.loads((proc.stdout or "").strip() or "[]")
        items = parsed if isinstance(parsed, list) else (parsed.get("sources") or parsed.get("value") or []) if isinstance(parsed, dict) else []
        source_map = {}
        for item in items:
            if not isinstance(item, dict):
                continue
            sid = str(item.get("id") or "").strip()
            title = str(item.get("title") or "").strip()
            if sid and title:
                source_map[sid] = title
        with _AI_LOCK:
            _NOTEBOOK_SOURCES_CACHE[notebook_id] = {
                "fetched_at": time.time(),
                "sources": dict(source_map),
            }
        return source_map
    except Exception:
        return {}


def _normalize_citation_sources(parsed_json, source_map: dict) -> list:
    """Ánh xạ references[{source_id, citation_number}] với tiêu đề tài liệu, giữ đúng số trích dẫn [n]."""
    if not isinstance(parsed_json, dict) or not source_map:
        return []
    val = parsed_json.get("value") if isinstance(parsed_json.get("value"), dict) else parsed_json
    refs = val.get("references")
    if not isinstance(refs, list) or not refs:
        return []
    out = []
    seen = set()
    for ref in refs:
        if not isinstance(ref, dict):
            continue
        sid = str(ref.get("source_id") or "").strip()
        raw_num = ref.get("citation_number")
        try:
            cit_num = int(raw_num)
        except (TypeError, ValueError):
            continue
        if cit_num < 1 or not sid:
            continue
        title = str(source_map.get(sid) or "").strip()
        if not title:
            continue
        key = (cit_num, sid)
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "number": cit_num,
            "source_id": sid,
            "title": title,
        })
    out.sort(key=lambda item: item["number"])
    return out


def _extract_nlm_sources_for_answer(parsed_json, notebook_id: str) -> list:
    """Tra cứu tên tài liệu cho các trích dẫn của câu trả lời; nếu lỗi trả [] để không làm hỏng câu trả lời."""
    try:
        if not isinstance(parsed_json, dict):
            return []
        val = parsed_json.get("value") if isinstance(parsed_json.get("value"), dict) else parsed_json
        refs = val.get("references")
        if not isinstance(refs, list) or not refs:
            return []
        source_map = _get_notebook_source_map(notebook_id)
        return _normalize_citation_sources(parsed_json, source_map)
    except Exception:
        return []


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
            "--",
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

            sources_list = _extract_nlm_sources_for_answer(parsed_json, notebook_id)
            done_ts = time.time()
            with _AI_LOCK:
                _AI_RESPONSE_CACHE[(notebook_id, norm_query)] = {
                    "answer": final_answer,
                    "branch_name": branch_name,
                    "sources": sources_list,
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
                            "sources": sources_list,
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

        correct_map = {"A": 0, "B": 1, "C": 2, "1": 0, "2": 1, "3": 2}
        norm_ans = re.sub(r"\.0+$", "", str(correct_raw or "").strip().upper())
        norm_ans = norm_ans.rstrip(".)").strip()
        if norm_ans in correct_map:
            correct_idx = correct_map[norm_ans]
        else:
            m_ans = re.search(r"(?:^|\b)([ABC123])(?:\b|$)", norm_ans)
            correct_idx = correct_map[m_ans.group(1)] if m_ans else 0

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


DEFAULT_DOC_CHECK_RULES = (
    "- Đối chiếu chéo tên người bán/mua (Shipper/Consignee), địa chỉ, mã số thuế giữa Sales Contract, Commercial Invoice, Packing List, B/L và C/O.\n"
    "- Đối chiếu tổng số kiện, trọng lượng tịnh (Net Weight), trọng lượng cả bì (Gross Weight), CBM giữa Invoice, Packing List và B/L.\n"
    "- Kiểm tra đồng nhất đơn giá, thành tiền, điều kiện Incoterms, đồng tiền thanh toán và điều khoản thanh toán trên Hợp đồng và Invoice.\n"
    "- Kiểm tra tên hàng, mô tả hàng hóa, mã HS (6-8 số) giữa các chứng từ và cảnh báo nếu HS thuộc diện kiểm tra chuyên ngành hoặc rủi ro thuế."
)


def _sanitize_doc_filename(raw_name: str, fallback: str = "tai-lieu.bin") -> str:
    """Làm sạch tên tệp người dùng tải lên, loại bỏ ký tự điều khiển và path traversal."""
    cleaned = os.path.basename(str(raw_name or "").replace("\\", "/")).strip()
    cleaned = re.sub(r"[\x00-\x1f\r\n]+", "_", cleaned)
    if not cleaned or cleaned in (".", ".."):
        return fallback
    return cleaned[:160]


def _decode_uploaded_base64(raw_b64: str, max_bytes: int) -> bytes:
    """Giải mã base64 an toàn và kiểm tra kích thước nhị phân tối đa."""
    text = str(raw_b64 or "").strip()
    if "," in text and text[:64].lower().startswith("data:"):
        text = text.split(",", 1)[1].strip()
    if not text:
        raise ValueError("Nội dung tệp rỗng.")
    raw = base64.b64decode(text, validate=True)
    if not raw:
        raise ValueError("Tệp không có dữ liệu.")
    if len(raw) > max_bytes:
        raise ValueError(f"Kích thước tệp vượt quá giới hạn {max_bytes // (1024 * 1024)} MB.")
    return raw


def _fetch_doc_checker_training_rules(force_refresh: bool = False) -> str:
    """Lấy quy tắc và tài liệu huấn luyện AI kiểm tra chứng từ từ Firestore site_settings/doc_checker_rules (cache 60s)."""
    now = time.time()
    with _DOC_CHECK_LOCK:
        if not force_refresh and _DOC_RULES_CACHE["text"] and (now - float(_DOC_RULES_CACHE["fetched_at"]) < 60.0):
            return _DOC_RULES_CACHE["text"]

    url = (
        f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}"
        "/databases/(default)/documents/site_settings/doc_checker_rules"
    )
    sections = []
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            doc = json.loads(resp.read().decode("utf-8"))
        fields = doc.get("fields") or {}
        rules_text = str((fields.get("rulesText") or {}).get("stringValue") or "").strip()
        if rules_text:
            sections.append(f"[QUY TẮC KIỂM TRA TỪ QUẢN TRỊ VIÊN]\n{rules_text[:6000]}")
        docs_arr = ((fields.get("trainingDocs") or {}).get("arrayValue") or {}).get("values") or []
        for idx, item in enumerate(docs_arr[:12], start=1):
            map_fields = (item.get("mapValue") or {}).get("fields") or {}
            t_name = str((map_fields.get("title") or {}).get("stringValue") or f"Tài liệu {idx}").strip()
            t_body = str((map_fields.get("content") or {}).get("stringValue") or "").strip()
            if t_body:
                sections.append(f"[TÀI LIỆU HUẤN LUYỆN #{idx}: {t_name}]\n{t_body[:4000]}")
    except Exception as exc:
        print(f"[DOC_CHECK] Khong doc duoc rule tu Firestore (dung rule mac dinh): {exc}", flush=True)

    combined = "\n\n".join(sections).strip() or DEFAULT_DOC_CHECK_RULES
    combined = combined[:18000]
    with _DOC_CHECK_LOCK:
        _DOC_RULES_CACHE["fetched_at"] = now
        _DOC_RULES_CACHE["text"] = combined
    return combined


def _render_pdf_pages_for_vision(raw_bytes: bytes, max_pages: int = 3) -> list:
    """Chuyển tối đa 3 trang PDF scan thành ảnh PNG để AI đọc trực quan."""
    rendered = []
    try:
        import pypdfium2 as pdfium  # type: ignore
        pdf = pdfium.PdfDocument(raw_bytes)
        try:
            for page_idx in range(min(len(pdf), max_pages)):
                page = pdf[page_idx]
                bitmap = page.render(scale=1.6)
                pil_img = bitmap.to_pil()
                buf = io.BytesIO()
                pil_img.save(buf, format="PNG")
                rendered.append(("image/png", buf.getvalue(), f"trang {page_idx + 1}"))
        finally:
            pdf.close()
    except Exception as exc:
        print(f"[DOC_CHECK] Khong render duoc anh PDF scan: {exc}", flush=True)
    return rendered


def _extract_document_payload(filename: str, raw_bytes: bytes) -> dict:
    """Trích xuất văn bản (PDF/DOCX/XLSX/TXT) hoặc dữ liệu ảnh trực quan từ tệp tải lên."""
    ext = Path(filename).suffix.lower()
    text_out = ""
    visual_parts = []
    note = ""

    try:
        if ext in (".txt", ".md", ".csv"):
            text_out = raw_bytes.decode("utf-8", errors="replace")
        elif ext == ".docx":
            import docx  # type: ignore
            document = docx.Document(io.BytesIO(raw_bytes))
            chunks = [p.text.strip() for p in document.paragraphs if p.text and p.text.strip()]
            for table in document.tables[:15]:
                for row in table.rows[:60]:
                    cells = [c.text.strip() for c in row.cells]
                    if any(cells):
                        chunks.append(" | ".join(cells))
            text_out = "\n".join(chunks)
        elif ext == ".xlsx":
            import openpyxl  # type: ignore
            wb = openpyxl.load_workbook(io.BytesIO(raw_bytes), data_only=True, read_only=True)
            sheet_chunks = []
            try:
                for sheet_name in wb.sheetnames[:6]:
                    ws = wb[sheet_name]
                    rows_txt = []
                    for r_idx, row in enumerate(ws.iter_rows(values_only=True), start=1):
                        if r_idx > 120:
                            break
                        vals = [str(c).strip() if c is not None else "" for c in row[:15]]
                        if any(vals):
                            rows_txt.append(" | ".join(vals))
                    if rows_txt:
                        sheet_chunks.append(f"[Sheet: {sheet_name}]\n" + "\n".join(rows_txt))
            finally:
                wb.close()
            text_out = "\n\n".join(sheet_chunks)
        elif ext == ".xls":
            note = "Định dạng Excel cũ (.xls): AI đọc giới hạn sơ bộ, Thúy sẽ kiểm tra file gốc qua email."
        elif ext == ".pdf":
            import pdfplumber  # type: ignore
            pages_txt = []
            with pdfplumber.open(io.BytesIO(raw_bytes)) as pdf:
                for p_idx, page in enumerate(pdf.pages[:10], start=1):
                    txt = (page.extract_text() or "").strip()
                    if txt:
                        pages_txt.append(f"[Trang {p_idx}]\n{txt}")
            text_out = "\n\n".join(pages_txt)
            if len(text_out.strip()) < 40:
                rendered = _render_pdf_pages_for_vision(raw_bytes, max_pages=3)
                for mime_t, img_bytes, page_tag in rendered:
                    visual_parts.append((f"{filename} ({page_tag})", mime_t, img_bytes))
                if rendered:
                    note = f"PDF dạng ảnh scan ({len(rendered)} trang đầu được phân tích bằng thị giác AI)."
                else:
                    note = "PDF dạng ảnh scan chưa đọc được OCR cục bộ; file gốc đã được chuyển bảo mật cho chuyên gia."
        elif ext in (".jpg", ".jpeg", ".png", ".webp"):
            mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
            visual_parts.append((filename, mime_map.get(ext, "image/png"), raw_bytes))
            note = "Ảnh chứng từ được gửi trực tiếp cho AI đọc và chuyển chuyên gia kiểm tra."
    except Exception as exc:
        note = f"Không đọc hết nội dung tự động ({exc}); file gốc vẫn được gửi bảo mật qua email cho Thúy kiểm tra."

    return {
        "filename": filename,
        "text": text_out.strip()[:12000],
        "visual_parts": visual_parts,
        "note": note,
    }


def _evaluate_dossier_with_gemini(customer_meta: dict, extracted_docs: list, training_rules: str) -> tuple[str, str]:
    """Đánh giá sơ bộ tính đồng nhất bộ chứng từ bằng Gemini multimodal kết hợp tài liệu huấn luyện của Admin."""
    api_key = (os.environ.get("THUYSTALK_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") or "").strip()

    doc_summary_lines = []
    visual_attachments = []
    for idx, doc in enumerate(extracted_docs, start=1):
        line = f"### Chứng từ #{idx}: {doc['filename']}"
        if doc["note"]:
            line += f"\n(Ghi chú kỹ thuật: {doc['note']})"
        if doc["text"]:
            line += f"\nNội dung trích xuất:\n{doc['text'][:8000]}"
        doc_summary_lines.append(line)
        for v_label, v_mime, v_bytes in doc["visual_parts"]:
            if len(visual_attachments) < 6:
                visual_attachments.append((v_label, v_mime, v_bytes))

    trade_type = customer_meta.get("tradeType") or "Xuất nhập khẩu"
    cust_note = customer_meta.get("notes") or "(Không có ghi chú thêm)"

    prompt_text = (
        "Bạn là Chuyên gia Kiểm tra Bộ Chứng Từ Xuất Nhập Khẩu & Hải Quan của ThuysTalk (15 năm kinh nghiệm thực chiến).\n"
        "NHIỆM VỤ: Kiểm tra sơ bộ tính ĐỒNG NHẤT, phát hiện SAI SÓT / MÂU THUẪN / RỦI RO HẢI QUAN & THUẾ, "
        "và tư vấn HƯỚNG ĐIỀU CHỈNH cho bộ chứng từ mà khách hàng vừa tải lên.\n\n"
        f"NGHIỆP VỤ / LOẠI HÌNH: {trade_type}\n"
        f"GHI CHÚ CỦA KHÁCH HÀNG: {cust_note}\n\n"
        f"TÀI LIỆU & QUY TẮC HUẤN LUYỆN TỪ CHUYÊN GIA THUYTALK:\n{training_rules}\n\n"
        "DANH SÁCH CHỨNG TỪ KHÁCH HÀNG TẢI LÊN:\n"
        + "\n\n".join(doc_summary_lines)
        + "\n\nYÊU CẦU TRÌNH BÀY KẾT QUẢ (Tiếng Việt, rõ ràng, chuyên nghiệp, KHÔNG dùng emoji/ký tự trang trí, đánh số rõ ràng):\n"
        "1. **Tóm tắt bộ chứng từ đã nhận**: Liệt kê nhanh từng file và vai trò chứng từ nhận diện được.\n"
        "2. **Đánh giá sơ bộ sự đồng nhất giữa các chứng từ**: So sánh Shipper/Consignee, Mô tả hàng hóa, Mã HS, Số lượng/Trọng lượng (NW/GW/Số kiện), Trị giá/Đơn giá, Incoterms, B/L - Invoice - Packing List - Hợp đồng - C/O.\n"
        "3. **Cảnh báo sai sót & điểm rủi ro cần lưu ý**: Nêu cụ thể điểm lệch hoặc thông tin còn thiếu có nguy cơ bị hải quan/ngân hàng bác hồ sơ hoặc ấn định thuế.\n"
        "4. **Hướng đề xuất điều chỉnh cụ thể**: Khuyến nghị sửa chứng từ nào, sửa mục nào trước khi truyền tờ khai hoặc xuất/nhập hàng.\n"
        f"5. Cuối cùng nhắc rõ: {DOC_CHECK_DISCLAIMER}"
    )

    if api_key:
        try:
            from google import genai  # type: ignore
            from google.genai import types  # type: ignore

            client = genai.Client(api_key=api_key)
            contents = [prompt_text]
            for v_label, v_mime, v_bytes in visual_attachments:
                contents.append(f"[Ảnh chứng từ kèm theo: {v_label}]")
                contents.append(types.Part.from_bytes(data=v_bytes, mime_type=v_mime))

            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=contents,
                config=types.GenerateContentConfig(temperature=0.2, max_output_tokens=2048),
            )
            answer_text = str(getattr(resp, "text", "") or "").strip()
            if answer_text:
                if "0767.648.862" not in answer_text:
                    answer_text += f"\n\n**Lưu ý quan trọng:** {DOC_CHECK_DISCLAIMER}"
                return answer_text, "gemini-2.5-flash"
        except Exception as exc:
            print(f"[DOC_CHECK] Gemini loi, chuyen sang phan tich du phong: {exc}", flush=True)

    fallback_lines = [
        "1. **Tóm tắt bộ chứng từ đã nhận**:",
    ]
    for doc in extracted_docs:
        fallback_lines.append(f"- {doc['filename']}" + (f" ({doc['note']})" if doc["note"] else ""))
    fallback_lines.extend([
        "",
        "2. **Trạng thái kiểm tra tự động sơ bộ**:",
        "- Hệ thống AI phân tích sâu tạm thời quá tải hoặc đang chờ xác nhận OCR thủ công cho tệp scan.",
        "- Toàn bộ bộ chứng từ gốc của bạn đã được đóng gói gửi **bảo mật** về email chuyên gia Nguyễn Thị Ngọc Thúy để đối chiếu chi tiết từng chỉ tiêu (Hợp đồng, Invoice, Packing List, B/L, C/O, mã HS & quy định kiểm tra chuyên ngành).",
        "",
        f"3. **Lưu ý quan trọng**: {DOC_CHECK_DISCLAIMER}",
    ])
    return "\n".join(fallback_lines), "fallback"


def _send_confidential_dossier_email(customer_meta: dict, decoded_files: list, ai_analysis: str) -> tuple[bool, str]:
    """Gửi bảo mật toàn bộ bộ chứng từ gốc kèm phân tích sơ bộ về DUY NHẤT email thuystalk.official@gmail.com."""
    smtp_cfg = _get_smtp_config()
    if not smtp_cfg["app_password"]:
        return False, "Chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env để chuyển email bảo mật."

    now_vn = datetime.datetime.now(VN_TZ).strftime("%d/%m/%Y %H:%M:%S")
    c_name = str(customer_meta.get("name") or "Khách hàng chưa ghi tên").strip()
    c_phone = str(customer_meta.get("phone") or "").strip()
    c_email = str(customer_meta.get("email") or "(Chưa cung cấp)").strip()
    c_trade = str(customer_meta.get("tradeType") or "Xuất nhập khẩu").strip()
    c_notes = str(customer_meta.get("notes") or "(Không có)").strip()

    safe_name_subj = re.sub(r"[\r\n]+", " ", c_name)[:60]
    safe_phone_subj = re.sub(r"[\r\n]+", " ", c_phone)[:30]
    subject = f"[THUYSTALK · BẢO MẬT CHỨNG TỪ] {safe_name_subj} ({safe_phone_subj}) - {len(decoded_files)} tệp"

    msg = MIMEMultipart("mixed")
    msg["From"] = f"ThuysTalk Doc Auditor <{smtp_cfg['sender']}>"
    msg["To"] = DOC_AUDIT_RECEIVER
    msg["Subject"] = str(Header(subject, "utf-8"))

    file_rows = "".join(
        f"<li><strong>{html.escape(f['filename'])}</strong> ({len(f['bytes']):,} bytes)</li>"
        for f in decoded_files
    )
    analysis_html = html.escape(ai_analysis).replace("\n", "<br>")
    html_body = (
        "<div style='font-family:Arial,Helvetica,sans-serif;max-width:740px;margin:0 auto;color:#111827;line-height:1.55;'>"
        "<div style='background:#0D4738;color:#FFFFFF;padding:18px 22px;border-radius:12px 12px 0 0;'>"
        "<div style='font-size:12px;letter-spacing:0.06em;color:#FDBA74;font-weight:700;'>HỒ SƠ BẢO MẬT TỪ CÔNG CỤ KIỂM TRA BỘ CHỨNG TỪ</div>"
        f"<h2 style='margin:6px 0 0;font-size:18px;'>Khách hàng: {html.escape(c_name)}</h2>"
        "</div>"
        "<div style='border:1px solid #D1D5DB;border-top:none;padding:20px 22px;border-radius:0 0 12px 12px;background:#FFFFFF;'>"
        "<table style='width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;'>"
        f"<tr><td style='padding:6px 0;width:150px;color:#4B5563;'><strong>Điện thoại / Zalo:</strong></td><td><strong>{html.escape(c_phone)}</strong></td></tr>"
        f"<tr><td style='padding:6px 0;color:#4B5563;'><strong>Email khách:</strong></td><td>{html.escape(c_email)}</td></tr>"
        f"<tr><td style='padding:6px 0;color:#4B5563;'><strong>Loại hình:</strong></td><td>{html.escape(c_trade)}</td></tr>"
        f"<tr><td style='padding:6px 0;color:#4B5563;'><strong>Thời gian gửi:</strong></td><td>{html.escape(now_vn)} (UTC+7)</td></tr>"
        f"<tr><td style='padding:6px 0;color:#4B5563;vertical-align:top;'><strong>Ghi chú khách hàng:</strong></td><td>{html.escape(c_notes)}</td></tr>"
        "</table>"
        f"<h3 style='color:#0D4738;margin:14px 0 6px;'>Danh sách {len(decoded_files)} chứng từ đính kèm bảo mật:</h3>"
        f"<ul style='margin:0 0 16px 18px;padding:0;font-size:13px;'>{file_rows}</ul>"
        "<h3 style='color:#0D4738;margin:14px 0 8px;'>Bản đánh giá sơ bộ AI vừa trả cho khách hàng:</h3>"
        f"<div style='background:#F9FAFB;border:1px solid #E5E7EB;border-left:4px solid #F47A20;padding:14px;border-radius:8px;font-size:13px;'>{analysis_html}</div>"
        "</div></div>"
    )
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    for f in decoded_files:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f["bytes"])
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment", filename=("utf-8", "", f["filename"]))
        msg.attach(part)

    server = None
    try:
        server, sender = _open_smtp_connection(timeout=18)
        server.sendmail(sender, [DOC_AUDIT_RECEIVER], msg.as_string())
        return True, ""
    except Exception as exc:
        print(f"[DOC_CHECK] Loi gui email bao mat toi {DOC_AUDIT_RECEIVER}: {exc}", flush=True)
        return False, f"Lỗi gửi email bảo mật: {exc}"
    finally:
        if server is not None:
            try:
                server.quit()
            except Exception:
                pass


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
            "/api/doc-check",
            "/api/parse-doc-training",
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

        max_body = MAX_DOC_CHECK_BODY_BYTES if parsed.path == "/api/doc-check" else MAX_POST_BODY_BYTES
        if content_length < 0 or content_length > max_body:
            limit_mb = max_body // (1024 * 1024)
            self.close_connection = True
            self._send_json(413, {"ok": False, "error": f"Dữ liệu gửi lên vượt quá giới hạn {limit_mb} MB."})
            return

        learner_identity = None
        if parsed.path in ("/api/parse-excel", "/api/send-bulk-email", "/api/parse-doc-training"):
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
        elif parsed.path == "/api/doc-check":
            self.handle_doc_check(payload)
        elif parsed.path == "/api/parse-doc-training":
            self.handle_parse_doc_training(payload)

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
                snapshot["sources"] = list(job.get("sources") or [])
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
                    cached_sources = list(cached.get("sources") or [])
                    _AI_JOBS[job_id] = {
                        "job_id": job_id,
                        "status": "done",
                        "created_at": now,
                        "finished_at": now,
                        "branch_name": cached.get("branch_name", branch_name),
                        "query": query,
                        "answer": cached.get("answer", ""),
                        "sources": cached_sources,
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
                            "sources": cached_sources,
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

    def handle_parse_doc_training(self, payload: dict):
        """Phân tích tệp tài liệu huấn luyện AI kiểm tra chứng từ do Admin tải lên."""
        try:
            raw_name = _sanitize_doc_filename(payload.get("filename"), fallback="rule.txt")
            ext = Path(raw_name).suffix.lower()
            if ext not in DOC_TRAINING_ALLOWED_EXTENSIONS:
                self._send_json(400, {
                    "ok": False,
                    "error": "Định dạng tài liệu huấn luyện không hỗ trợ. Chỉ nhận .txt, .md, .csv, .xlsx, .docx, .pdf.",
                })
                return
            raw_bytes = _decode_uploaded_base64(payload.get("contentBase64"), max_bytes=4 * 1024 * 1024)
            extracted = _extract_document_payload(raw_name, raw_bytes)
            content = extracted["text"].strip()
            if not content:
                self._send_json(400, {
                    "ok": False,
                    "error": "Không trích xuất được nội dung chữ từ tài liệu này (nếu là PDF scan hãy chuyển sang DOCX/TXT hoặc gõ tóm tắt vào ô quy tắc).",
                })
                return
            self._send_json(200, {
                "ok": True,
                "title": Path(raw_name).stem[:120],
                "filename": raw_name,
                "content": content[:8000],
                "chars": len(content),
            })
        except ValueError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._send_json(500, {"ok": False, "error": f"Lỗi đọc tài liệu huấn luyện: {exc}"})

    def handle_doc_check(self, payload: dict):
        """Nhận bộ chứng từ khách hàng, kiểm tra đồng nhất bằng AI và gửi bảo mật về thuystalk.official@gmail.com."""
        client_ip = (self.client_address[0] if self.client_address else "unknown") or "unknown"
        now = time.time()
        with _DOC_CHECK_LOCK:
            cutoff = now - 3600.0
            for ip_key in list(_DOC_CHECK_IP_HITS.keys()):
                kept = [ts for ts in _DOC_CHECK_IP_HITS[ip_key] if ts >= cutoff]
                if kept:
                    _DOC_CHECK_IP_HITS[ip_key] = kept
                else:
                    del _DOC_CHECK_IP_HITS[ip_key]
            recent_hits = _DOC_CHECK_IP_HITS.get(client_ip, [])
            if len(recent_hits) >= DOC_CHECK_IP_HOURLY_LIMIT:
                self._send_json(429, {
                    "ok": False,
                    "error": "Bạn đã gửi quá nhiều yêu cầu kiểm tra trong 1 giờ. Vui lòng thử lại sau hoặc liên hệ trực tiếp Thúy 0767.648.862.",
                })
                return

        name = str(payload.get("name") or "").strip()
        phone = str(payload.get("phone") or "").strip()
        email_addr = str(payload.get("email") or "").strip()
        trade_type = str(payload.get("tradeType") or "Xuất nhập khẩu").strip()[:100]
        notes = str(payload.get("notes") or "").strip()[:2500]
        files_in = payload.get("files")

        if len(name) < 2 or len(phone) < 7:
            self._send_json(400, {"ok": False, "error": "Vui lòng nhập đầy đủ Họ tên và Số điện thoại / Zalo để nhận hỗ trợ."})
            return
        if not isinstance(files_in, list) or not files_in:
            self._send_json(400, {"ok": False, "error": "Vui lòng đính kèm ít nhất 1 tệp chứng từ (PDF, DOCX, XLSX hoặc ảnh JPG/PNG)."})
            return
        if len(files_in) > DOC_CHECK_MAX_FILES:
            self._send_json(400, {"ok": False, "error": f"Tối đa {DOC_CHECK_MAX_FILES} tệp cho mỗi lượt kiểm tra."})
            return

        decoded_files = []
        total_decoded_bytes = 0
        for idx, f_item in enumerate(files_in, start=1):
            if not isinstance(f_item, dict):
                self._send_json(400, {"ok": False, "error": f"Dữ liệu tệp thứ {idx} không hợp lệ."})
                return
            fname = _sanitize_doc_filename(f_item.get("filename"), fallback=f"chung-tu-{idx}.bin")
            ext = Path(fname).suffix.lower()
            if ext not in DOC_CHECK_ALLOWED_EXTENSIONS:
                self._send_json(400, {
                    "ok": False,
                    "error": f"Tệp '{fname}' có định dạng không được hỗ trợ. Chỉ nhận PDF, DOCX, XLSX/XLS, CSV, TXT, JPG, PNG, WEBP.",
                })
                return
            try:
                raw_bytes = _decode_uploaded_base64(f_item.get("contentBase64"), max_bytes=DOC_CHECK_MAX_SINGLE_FILE_BYTES)
            except ValueError as exc:
                self._send_json(400, {"ok": False, "error": f"Tệp '{fname}': {exc}"})
                return
            total_decoded_bytes += len(raw_bytes)
            if total_decoded_bytes > DOC_CHECK_MAX_TOTAL_FILE_BYTES:
                self._send_json(413, {"ok": False, "error": "Tổng dung lượng bộ chứng từ vượt quá giới hạn 14 MB."})
                return
            decoded_files.append({"filename": fname, "bytes": raw_bytes})

        with _DOC_CHECK_LOCK:
            _DOC_CHECK_IP_HITS.setdefault(client_ip, []).append(now)

        customer_meta = {
            "name": name[:120],
            "phone": phone[:40],
            "email": email_addr[:160],
            "tradeType": trade_type,
            "notes": notes,
        }
        extracted_docs = [_extract_document_payload(f["filename"], f["bytes"]) for f in decoded_files]
        training_rules = _fetch_doc_checker_training_rules()
        ai_analysis, engine_used = _evaluate_dossier_with_gemini(customer_meta, extracted_docs, training_rules)
        mail_ok, mail_err = _send_confidential_dossier_email(customer_meta, decoded_files, ai_analysis)

        self._send_json(200, {
            "ok": True,
            "engine": engine_used,
            "analysis": ai_analysis,
            "fileNames": [f["filename"] for f in decoded_files],
            "confidentialEmailSent": mail_ok,
            "confidentialEmailError": "" if mail_ok else mail_err,
            "disclaimer": DOC_CHECK_DISCLAIMER,
        })

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
