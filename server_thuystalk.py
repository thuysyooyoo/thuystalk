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
import http.server
import io
import json
import os
import shutil
import subprocess
import sys
import urllib.parse
import webbrowser
from pathlib import Path

PORT = 8099
WEB_DIR = Path(__file__).resolve().parent

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
        else:
            self._send_json(404, {"error": "Endpoint Not Found"})

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
    print("=" * 72, flush=True)
    print(f"THUYSTALK WEB & KNOWLEDGE API DANG CHAY TAI: {url}", flush=True)
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
