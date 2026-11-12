# ThuysTalk - Nền Tảng Tri Thức & Hệ Thống AI Pháp Lý Hải Quan
**Website Chính Thức của Nguyễn Thị Ngọc Thúy (@thuystalk)**

Nền tảng thương hiệu cá nhân, hệ thống E-Learning xuất nhập khẩu chính ngạch, thư viện video đa nền tảng, trợ lý AI tra cứu pháp lý hải quan chuyên sâu và hệ thống quản trị nội dung CMS Studio toàn diện.

---

## 🌟 Tính Năng Cốt Lõi

1. **Trang Chủ Thương Hiệu Cá Nhân ([`index.html`](index.html)):**
   - Định vị chuyên gia 9+ năm kinh nghiệm trong ngành Xuất Nhập Khẩu, Thủ tục Hải quan và Tự động hóa AI.
   - Trực quan hóa lộ trình, triết lý vận hành và kết nối đa kênh (YouTube, Facebook, Zalo, Email).
   - Thiết kế chuẩn nhận diện: Gam màu Xanh Ngọc Trầm (`Dark Jade #0D4738`), Vàng Champagne (`#F5D77F`) và Cam Năng Lượng (`#E65100`), 100% font `Plus Jakarta Sans`, không sử dụng icon hay emoji rác.

2. **Hệ Thống Khóa Học E-Learning ([`elearning.html`](elearning.html)):**
   - Đào tạo xuất nhập khẩu chính ngạch, kiểm soát rủi ro hải quan, C/O và Báo cáo quyết toán DNCX (Mẫu 15).
   - Đăng nhập học viên miễn phí để lưu tiến độ học tập và tự động nhận tài liệu chuyên khảo qua Email.
   - Tích hợp bài tập thực hành và bộ câu hỏi trắc nghiệm tự động (Auto Mini-Test).

3. **Thư Viện Video YouTube ([`videos.html`](videos.html)):**
   - Phân loại rõ nét theo 4 chuyên mục:
     - **CM1:** Văn bản nóng & Thông tư mới.
     - **CM2:** Dịch luật ra tiếng người & Giải mã quy định.
     - **CM3:** Ký sự lịch sử thương mại, logistics & container quốc tế.
     - **CM4:** Tâm tình thực chiến & Bài học thương trường.
   - Nhúng video trực tiếp qua YouTube Player API chuẩn điện ảnh.

4. **Trợ Lý AI Tra Cứu Pháp Lý Hải Quan & Mã HS ([`tra-cuu.html`](tra-cuu.html)):**
   - Tự động điều hướng và tra cứu thông minh trên 4 kho cẩm nang chuyên sâu:
     - **Nhánh A:** Hướng Dẫn Tra Mã HS Code Theo Sáu Quy Tắc (87 tài liệu nguồn).
     - **Nhánh B:** Hàng hóa kiểm soát chặt khi xuất khẩu ở Trung Quốc 2026 (26 tài liệu nguồn).
     - **Nhánh C:** Thủ tục hồ sơ kiểm soát hàng hóa theo chuyên ngành (52 tài liệu nguồn).
     - **Nhánh D:** Cẩm nang hỏi đáp hàng rủi ro từ 1/7/2026 & Quyết định 31/2026/QĐ-TTg (21 tài liệu nguồn).
   - Phân tích và hiển thị kết quả chuẩn mực: làm sạch công thức toán học LaTeX, trích dẫn văn bản, danh mục phân cấp và ghi chú hỗ trợ liên hệ chuyên gia `0767.648.862`.
   - Cơ chế Silent 5-Query Guest Gate: Cho phép khách tra cứu 5 lượt miễn phí trước khi yêu cầu đăng nhập tài khoản học viên.

5. **Hệ Thống Quản Trị Nội Dung Toàn Diện ([`admin.html`](admin.html)):**
   - Bảng điều khiển riêng biệt dạng Internal CMS với menu bên hông:
     - **Tab 1:** Quản lý và thay đổi ảnh đại diện (Profile, Lifestyle, Hội thảo, Giảng dạy).
     - **Tab 2:** Soạn thảo bài viết mới (hỗ trợ nhập văn bản thuần hoặc HTML).
     - **Tab 3:** Nhúng video YouTube mới lên website.
     - **Tab 4:** Thêm bài học mới & Tự động tạo bộ Mini-Test từ văn bản hoặc tải file Excel (`.xlsx`, `.csv`).
     - **Tab 5:** Quản lý kho nguồn dữ liệu AI & Cấu hình kết nối Firebase / Cloud Database.
     - **Tab 6:** Quản lý danh sách học viên, khách hàng đăng ký tư vấn 1-1 và sao lưu toàn bộ dữ liệu.

---

## 🛠️ Cấu Trúc Thư Mục

```
website_thuystalk/
├── index.html                 # Trang chủ chính thức
├── elearning.html             # Hệ thống khóa học E-Learning
├── videos.html                # Thư viện video ThuyTalk
├── bai-viet.html              # Bài viết chuyên sâu
├── tra-cuu.html               # Trợ lý AI tra cứu pháp lý
├── admin.html                 # Trang quản trị toàn diện (CMS Studio)
├── server_thuystalk.py        # Máy chủ nội bộ & Cầu nối API
├── chay_web_thuystalk.bat     # File kích hoạt chạy nhanh máy chủ
├── netlify.toml               # Cấu hình triển khai Netlify
├── _headers                   # Bảo mật HTTP Security Headers
├── styles/
│   └── main.css               # Bộ giao diện chuẩn Plus Jakarta Sans
├── js/
│   ├── app.js                 # Logic điều khiển toàn bộ tương tác web
│   └── data.js                # Dữ liệu khởi tạo & Đa ngôn ngữ (VI/EN)
├── assets/
│   ├── images/                # Hình ảnh chuyên gia, chân dung & sự kiện
│   └── templates/             # File mẫu Excel / CSV nhập Mini-Test
└── backend/
    ├── supabase_schema.sql    # Schema cơ sở dữ liệu quan hệ
    └── edge_function_sync_sheet_email.ts
```

---

## 🚀 Hướng Dẫn Vận Hành

### Chạy Cục Bộ (Local Development):
Chạy file batch:
```cmd
chay_web_thuystalk.bat
```
Hoặc qua dòng lệnh Python:
```bash
python server_thuystalk.py
```
Mở trình duyệt truy cập: `http://localhost:8099/index.html`

### Triển Khai Lên Web (Hosting):
Dự án được cấu hình sẵn để triển khai trực tiếp lên **GitHub Pages**, **Netlify**, hoặc **Firebase Hosting**.

---

## 🔒 Bảo Mật & Bản Quyền
* Bản quyền nội dung © 2026 thuộc về **Nguyễn Thị Ngọc Thúy** (@thuystalk).
* Tuân thủ quy định bảo vệ dữ liệu cá nhân Nghị định 13/2023/NĐ-CP.
