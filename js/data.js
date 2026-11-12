// ============================================================================
// THUYSTALK DATA STORE, BILINGUAL CONTENT, AI KNOWLEDGE BASE & /NOTEBOOK CONFIG
// Rule: 100% Plus Jakarta Sans Typography — ZERO Icons / ZERO Emojis
// ============================================================================

window.THUYSTALK_DEFAULT_MEDIA = {
  heroPortrait: {
    id: "heroPortrait",
    label: "1. Ảnh Chính Đầu Trang (Hero Portrait)",
    desc: "Hiển thị trên khối hình học Phỉ Thúy & Cam ở đầu trang",
    url: "assets/images/hero-portrait.webp",
    fallback: "assets/images/hero-portrait.jpg",
    posX: 50,
    posY: 18,
    scale: 100
  },
  aboutSpeaker: {
    id: "aboutSpeaker",
    label: "2. Ảnh Khu Vực Về Tôi (Diễn giả / Chia sẻ)",
    desc: "Hiển thị kèm huy hiệu 9+ Năm Kinh Nghiệm Thực Tế",
    url: "assets/images/about-speaker.webp",
    fallback: "assets/images/about-speaker.jpg",
    posX: 50,
    posY: 20,
    scale: 100
  },
  customsAward: {
    id: "customsAward",
    label: "3. Ảnh Dấu Ấn Thực Tiễn (Hội nghị Hải quan 2026)",
    desc: "Hiển thị ở góc phải khu vực Về Tôi & Thư viện",
    url: "assets/images/customs-conference.webp",
    fallback: "assets/images/customs-conference.jpg",
    posX: 50,
    posY: 25,
    scale: 100
  },
  consultHost: {
    id: "consultHost",
    label: "4. Ảnh Chân Dung Khu Tư Vấn 1-1",
    desc: "Hiển thị tại thẻ Chuyên gia ở khu vực Đăng ký tư vấn",
    url: "assets/images/portrait-lifestyle.webp",
    fallback: "assets/images/portrait-lifestyle.jpg",
    posX: 50,
    posY: 22,
    scale: 100
  }
};

// ============================================================================
// THUYTALK AI LEGAL & CUSTOMS KNOWLEDGE ROUTING MAP (4 Specialized Pillars)
// ============================================================================
window.THUYSTALK_NOTEBOOK_ROUTES = [
  {
    id: "nb-hs-code",
    branch: "CHUYÊN ĐỀ A · PHÂN LOẠI MÃ HS",
    notebookId: "c3b76775-2095-4866-b634-139c71e0df40",
    title: {
      vi: "Hướng Dẫn Tra Mã HS Code Theo Sáu Quy Tắc",
      en: "HS Code Classification Under 6 GRI Rules"
    },
    desc: {
      vi: "Tra mã HS, 6 quy tắc GRI, biểu thuế XNK, chú giải chương và chính sách nhập khẩu Việt Nam.",
      en: "HS classification, 6 GRI rules, tariff schedules, chapter notes & Vietnam import policies."
    },
    keywords: ["hs", "hs code", "mã hs", "quy tắc", "gir", "gri", "phân loại", "biểu thuế", "chú giải", "nhập khẩu", "thuế suất"]
  },
  {
    id: "nb-china-export",
    branch: "CHUYÊN ĐỀ B · CHÍNH SÁCH QUỐC TẾ",
    notebookId: "e6f63d82-c00f-4876-9e45-1673a45408b1",
    title: {
      vi: "Hàng Hóa Kiểm Soát Chặt Khi Xuất Khẩu Ở Trung Quốc 2026",
      en: "China Export Control & Dual-Use Goods 2026"
    },
    desc: {
      vi: "Kiểm soát hàng lưỡng dụng, khoáng sản, pin, nam châm, hóa chất và giấy phép MOFCOM Trung Quốc.",
      en: "Dual-use items, critical minerals, batteries, magnets, chemicals & China MOFCOM licenses."
    },
    keywords: ["trung quốc", "xuất khẩu trung quốc", "lưỡng dụng", "mofcom", "pin", "graphite", "nam châm", "khoáng sản", "dual-use", "china"]
  },
  {
    id: "nb-specialized",
    branch: "CHUYÊN ĐỀ C · KIỂM TRA CHUYÊN NGÀNH",
    notebookId: "430a7e0e-6c27-4384-a86e-9486f9bfba37",
    title: {
      vi: "Thủ Tục Hồ Sơ Kiểm Soát Hàng Hóa Theo Chuyên Ngành",
      en: "Specialized Inspection & Regulatory Permits"
    },
    desc: {
      vi: "Kiểm tra chất lượng, hợp quy, an toàn thực phẩm, thiết bị y tế, hóa chất và giấy phép bộ ngành.",
      en: "Quality inspection, conformity certification, food safety, medical devices & ministerial permits."
    },
    keywords: ["chuyên ngành", "kiểm tra chất lượng", "hợp quy", "an toàn thực phẩm", "công bố", "y tế", "hóa chất", "giấy phép", "quatest"]
  },
  {
    id: "nb-high-risk",
    branch: "CHUYÊN ĐỀ D · QUẢN TRỊ RỦI RO",
    notebookId: "b3954c5b-d6c1-46b6-9192-2c2c30d72419",
    title: {
      vi: "Cẩm Nang Hỏi Đáp Hàng Rủi Ro & Thủ Tục Cửa Khẩu",
      en: "High-Risk Goods & Customs Valuation Handbook"
    },
    desc: {
      vi: "Danh mục hàng rủi ro cao, tham vấn giá hải quan, kiểm hóa thực tế và kiểm tra sau thông quan.",
      en: "High-risk cargo lists, customs price consultation, physical inspection & post-clearance audit."
    },
    keywords: ["rủi ro", "tham vấn giá", "sau thông quan", "kiểm hóa", "luồng đỏ", "trị giá hải quan", "ấn định thuế", "1/7/2026"]
  }
];

// ============================================================================
// DEFAULT AI CHATBOT & LEGAL KNOWLEDGE BASE (Editable in Admin Studio)
// ============================================================================
window.THUYSTALK_DEFAULT_KB = [
  {
    id: "kb-hs-may-giat-8450",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Phân loại Mã HS & Biểu thuế",
    topic: "Tra cứu Mã HS Code Máy giặt (Nhóm 84.50), Thuế ACFTA và Kiểm tra chuyên ngành QCVN/Hiệu suất năng lượng",
    keywords: "máy giặt, giặt sấy, 8450, 8450.11, 8450.12, 8450.19, 8450.20, lồng ngang, lồng đứng",
    answer: `KẾT LUẬN TRA CỨU MÃ HS MÁY GIẶT (HỆ THỐNG DỮ LIỆU PHÁP LÝ THUYTALK):
1. Phân nhóm HS Code máy giặt (Nhóm 84.50 - Máy giặt gia đình hoặc trong hiệu giặt, kể cả máy giặt có chức năng sấy khô):
- 8450.11.10: Máy giặt tự động hoàn toàn, sức chứa KHÔNG QUÁ 6 kg vải khô/lần giặt.
- 8450.11.90: Máy giặt tự động hoàn toàn, sức chứa TRÊN 6 kg ĐẾN 10 kg vải khô/lần giặt (phổ biến nhất với máy giặt gia đình 7kg - 10kg).
- 8450.12.10 / 8450.12.90: Máy giặt loại khác có chức năng sấy ly tâm (bán tự động 2 lồng), sức chứa <= 6kg hoặc từ 6kg - 10kg.
- 8450.20.00: Máy giặt có sức chứa TRÊN 10 kg vải khô/lần giặt (máy giặt gia đình cỡ lớn 11-15kg hoặc máy giặt tiệm giặt là).
- Lưu ý loại trừ: Máy giặt khô công nghiệp dây chuyền dệt nhuộm thuộc nhóm 84.51. Máy giặt đã qua sử dụng thuộc Danh mục CẤM nhập khẩu (Thông tư 08/2023/TT-BCT).
2. Thuế nhập khẩu ưu đãi đặc biệt ACFTA (C/O Form E - Nghị định 118/2022/NĐ-CP):
- Mã 8450.11.10, 8450.11.90 và 8450.20.00: Thuế suất ACFTA là 5% (Hàng xuất xứ Trung Quốc có C/O Form E hợp lệ được hưởng 5%; lưu ý Cột 4 loại trừ TH/KH/PH).
3. Chính sách Kiểm tra chuyên ngành bắt buộc khi nhập khẩu máy giặt mới 100%:
- Chứng nhận & Công bố hợp quy An toàn điện / Tương thích điện từ (EMC) theo QCVN 4:2009/BKHCN và QCVN 9:2012/BKHCN (Sửa đổi 1:2018) thuộc quản lý của Bộ KH&CN.
- Thử nghiệm Hiệu suất năng lượng tối thiểu (MEPS) và Công bố dán nhãn năng lượng theo TCVN 8526:2013 (áp dụng cho máy giặt gia dụng dung tích từ 2kg đến 15kg).`
  },
  {
    id: "kb-gri-6-rules",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Phân loại Mã HS & Biểu thuế",
    topic: "6 Quy tắc tổng quát giải thích Hệ thống Hài hòa (GRI 1–6) khi áp mã HS Code",
    keywords: "6 quy tắc, sáu quy tắc, gri, quy tắc 1, quy tắc 2a, quy tắc 2b, quy tắc 3a, quy tắc 3b, quy tắc 3c, quy tắc 4, quy tắc 5, quy tắc 6, chú giải chương",
    answer: `KẾT LUẬN TRA CỨU 6 QUY TẮC ÁP MÃ HS (HỆ THỐNG DỮ LIỆU PHÁP LÝ THUYTALK):
Khi phân loại hàng hóa xuất nhập khẩu theo Thông tư 31/2022/TT-BTC và Danh mục AHTN, bắt buộc áp dụng tuần tự từ Quy tắc 1 đến Quy tắc 6 (không được nhảy cóc):
- Quy tắc 1 (Quan trọng nhất - xử lý hơn 90% mặt hàng): Tên của Phần, Chương, Phân chương chỉ có giá trị định hướng; việc phân loại phải căn cứ vào nội dung của Nhóm hàng (4 số) và Chú giải Phần/Chương có liên quan.
- Quy tắc 2(a): Mặt hàng chưa hoàn chỉnh, chưa hoàn thiện hoặc tháo rời (SKD/CKD) để thuận tiện vận chuyển nhưng đã mang đặc trưng cơ bản của mặt hàng hoàn chỉnh thì áp vào mã của mặt hàng hoàn chỉnh đó.
- Quy tắc 2(b) & Quy tắc 3: Hàng hỗn hợp, hợp chất hoặc bộ sản phẩm bán lẻ áp dụng tuần tự: 3(a) Nhóm mô tả cụ thể nhất -> 3(b) Thành phần mang lại đặc tính cơ bản (Essential Character) -> 3(c) Nhóm có thứ tự sau cùng.
- Quy tắc 4: Hàng không phân loại được theo QT 1-3 thì xếp vào nhóm của mặt hàng giống chúng nhất.
- Quy tắc 5: Bao bì đặc chủng đi kèm định hình riêng cho sản phẩm (hộp đàn, hộp máy ảnh) và bao bì thông thường.
- Quy tắc 6: Phân loại ở cấp độ Phân nhóm (6 số / 8 số) dựa trên nội dung phân nhóm cùng cấp và Chú giải phân nhóm.`
  },
  {
    id: "kb-china-export-2026",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Chính sách Xuất khẩu Quốc tế",
    topic: "Chính sách kiểm soát xuất khẩu hàng lưỡng dụng & khoáng sản chiến lược Trung Quốc 2026",
    keywords: "trung quốc, xuất khẩu trung quốc, hàng lưỡng dụng, mofcom, giấy phép xuất khẩu, graphite, gali, germani, antimon, nam châm đất hiếm, máy khắc laser, drone, pin lithium",
    answer: `KẾT LUẬN TRA CỨU CHÍNH SÁCH XUẤT KHẨU TRUNG QUỐC 2026 (HỆ THỐNG DỮ LIỆU PHÁP LÝ THUYTALK):
1. Tình trạng chính sách: Bộ Thương mại Trung Quốc (MOFCOM) và Tổng cục Hải quan Trung Quốc (GACC) kiểm soát chặt Danh mục Hàng hóa và Công nghệ Lưỡng dụng (Dual-Use Items) năm 2026.
2. Các nhóm hàng trọng tâm bị kiểm soát:
- Khoáng sản & kim loại chiến lược: Graphite (than chì độ tinh khiết cao), Gallium, Germanium, Antimony, đất hiếm và vật liệu nam châm vĩnh cửu.
- Thiết bị công nghiệp & điện tử: Máy khắc laser công suất cao, máy gia công CNC đa trục chính xác cao, thiết bị bay không người lái (UAV/Drone), pin năng lượng mật độ cao và một số tiền chất hóa học.
3. Quy trình bắt buộc: Nhà xuất khẩu Trung Quốc phải nộp hồ sơ xin Giấy phép xuất khẩu hàng lưỡng dụng tại MOFCOM kèm End-User & End-Use Certificate (Giấy chứng nhận người sử dụng cuối và mục đích sử dụng dân sự) do doanh nghiệp nhập khẩu Việt Nam cam kết, thời gian thẩm định 30–45 ngày làm việc.`
  },
  {
    id: "kb-qd31-2026-icd",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Quản trị Rủi ro & Thủ tục Cửa khẩu",
    topic: "Quyết định 31/2026/QĐ-TTg thay thế Quyết định 23/2019/QĐ-TTg về chuyển cửa khẩu ICD",
    keywords: "quyết định 31, 31/2026/qđ-ttg, quyết định 23, chuyển cửa khẩu, icd, cảng cạn, ola, cảng đích, port of discharge, place of delivery, luồng đỏ",
    answer: `KẾT LUẬN TRA CỨU QUYẾT ĐỊNH 31/2026/QĐ-TTG:
1. Nguyên tắc cốt lõi: Các mặt hàng nằm trong Danh mục hàng hóa nhập khẩu bắt buộc làm thủ tục hải quan tại cửa khẩu nhập theo Quyết định 31/2026/QĐ-TTg phải mở tờ khai, kiểm hóa và hoàn thành kiểm tra chuyên ngành ngay tại Cửa khẩu nhập đầu tiên (Cảng biển loại 1, Cảng hàng không quốc tế), không được mở tờ khai vận chuyển độc lập OLA kéo về ICD nội địa.
2. 3 Trường hợp ngoại lệ được chuyển về ICD nội địa:
- Máy móc, thiết bị, nguyên vật liệu nhập khẩu phục vụ trực tiếp cho hoạt động Gia công hoặc Sản xuất xuất khẩu (SXXK) của chính nhà máy.
- Hàng hóa của Doanh nghiệp ưu tiên (AEO).
- Hàng hóa tạo tài sản cố định của dự án đầu tư được hưởng ưu đãi đầu tư.
3. Lưu ý thực tế: Phải kiểm tra mã HS 8 số trước khi hướng dẫn Shipper phát hành B/L để tránh bị nghẽn manifest tại cảng biển.`
  },
  {
    id: "kb-cv23913-dncx-chemical",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Kiểm tra Chuyên ngành",
    topic: "Công văn 23913/CHQ-GSQL về giấy phép nhập khẩu hóa chất vào Doanh nghiệp chế xuất (DNCX)",
    keywords: "công văn 23913, 23913/chq-gsql, hóa chất, tiền chất, dncx, doanh nghiệp chế xuất, nghị định 113, nghị định 82, luật quản lý ngoại thương, điều 59, msds",
    answer: `KẾT LUẬN TRA CỨU CÔNG VĂN 23913/CHQ-GSQL (HỆ THỐNG DỮ LIỆU PHÁP LÝ THUYTALK):
1. Bản chất vướng mắc: Xung đột giữa Khoản 1 Điều 59 Luật Quản lý ngoại thương 2017 (khu phi thuế quan/DNCX không áp dụng giấy phép ngoại thương đối với hàng nhập từ nước ngoài phục vụ sản xuất) và Nghị định 113/2017/NĐ-CP (sửa đổi bởi NĐ 82/2022/NĐ-CP) về giấy phép hóa chất hạn chế/tiền chất.
2. Hướng tháo gỡ theo Công văn 23913/CHQ-GSQL:
- Áp dụng cơ chế thông quan bằng "Bản cam kết sử dụng hóa chất đúng mục đích sản xuất nội bộ, không chuyển nhượng thương mại" kèm Bảng dữ liệu an toàn hóa chất (MSDS).
- Chuyển từ tiền kiểm tại cửa khẩu sang hậu kiểm điều kiện lưu trữ, kho bồn chứa an toàn và định mức sử dụng tại nhà xưởng DNCX.`
  },
  {
    id: "kb-bcqt-mau-15-dncx",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Kiểm tra Sau thông quan",
    topic: "Báo cáo quyết toán Mẫu 15/BCQT-NVL và Công thức Tam Giác Vàng Kho - Kế toán - XNK",
    keywords: "báo cáo quyết toán, mẫu 15, 15/bcqt-nvl, thanh khoản, dncx, gia công, sxxk, kiểm tra sau thông quan, lệch kho, định mức bom, phế liệu, phế phẩm",
    answer: `KẾT LUẬN TRA CỨU BÁO CÁO QUYẾT TOÁN MẪU 15/BCQT-NVL:
1. Thời hạn nộp: Chậm nhất 90 ngày kể từ ngày kết thúc năm tài chính đối với doanh nghiệp Gia công, SXXK và DNCX.
2. 3 Nguyên nhân gây lệch số liệu bị ấn định thuế khi Kiểm tra sau thông quan:
- Đứt gãy Đơn vị tính (UOM) giữa tờ khai hải quan (kg, m2) và thẻ kho sản xuất (cuộn, chiếc, thùng).
- Phế liệu, phế phẩm và hao hụt kỹ thuật trong sản xuất bị bỏ đi nhưng không lập phiếu xuất hủy và biên bản kiểm kê hợp lệ.
- Không đối soát định kỳ mà đợi cuối năm mới cộng sổ.
3. Giải pháp Tam Giác Vàng: Đối soát chéo 3 bên (Kho thực tế - Tài khoản 152/155 Kế toán - Tờ khai E11/E15/E42/E52 XNK) định kỳ hàng quý, khóa bảng quy đổi đơn vị tính và lưu đủ hồ sơ hủy phế phẩm.`
  },
  {
    id: "kb-smart-port-edo",
    notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · Chuyên đề Cảng Biển Số & Hải Quan",
    topic: "Quy trình Cảng biển số (Smart Port) 2026: Lệnh giao hàng điện tử eDO, eEIR và VASSCM",
    keywords: "edo, lệnh giao hàng điện tử, eeir, eport, smart port, cảng biển số, vasscm, mã vạch hải quan, lấy hàng tại cảng",
    answer: `KẾT LUẬN TRA CỨU QUY TRÌNH CẢNG BIỂN SỐ (SMART PORT 2026):
1. Lệnh giao hàng điện tử (eDO): Hãng tàu truyền dữ liệu eDO qua API sang Cổng thông tin một cửa quốc gia và hệ thống ePort của cảng.
2. Thanh toán & Phiếu eEIR: Doanh nghiệp xác thực bằng chữ ký số trên ePort, thanh toán phí nâng hạ trực tuyến 24/7 và nhận phiếu giao nhận container điện tử (eEIR) có mã QR cho tài xế.
3. Giám sát hải quan tự động VASSCM: Tờ khai thông quan từ VNACCS tự động truyền sang hệ thống VASSCM của cảng; cổng Smart Gate dùng Camera AI (OCR) quét biển số xe và số container trong 30 giây, không cần đóng dấu mã vạch giấy.`
  }
];

window.THUYSTALK_I18N = {
  vi: {
    nav: {
      home: "Trang chủ",
      expertise: "Chuyên môn",
      about: "Về tôi",
      elearning: "E-Learning",
      video: "Video",
      articles: "Bài viết",
      notebook: "Tra cứu AI Pháp lý",
      consult: "Tư vấn 1-1",
      adminBtn: "Quản trị hệ thống",
      ctaTop: "Nhận tài liệu & Tư vấn"
    },
    hero: {
      greeting: "XIN CHÀO, MÌNH LÀ",
      firstName: "Nguyễn Thị Ngọc",
      highlightName: "Thúy",
      role: "Chuyên gia Tư vấn Xuất Nhập Khẩu – Logistics & Ứng dụng AI",
      bio: "Hơn 9 năm tự tay thực hiện từng khâu trong chuỗi cung ứng quốc tế — từ đàm phán ngoại thương, áp mã HS, mở tờ khai hải quan đến tự động hóa quy trình bằng AI. Mình xây dựng ThuysTalk để chia sẻ kiến thức thực tế miễn phí, gửi tặng biểu mẫu gốc và đồng hành cùng bạn kinh doanh chính ngạch an toàn, bền vững.",
      btnPrimary: "Vào học E-Learning miễn phí",
      btnSecondary: "Tra cứu AI Pháp lý & Mã HS",
      scriptNote: "Tận tâm – Minh bạch – Bền vững",
      floatingTitle: "9+ Năm Kinh Nghiệm Thực Tế",
      floatingSub: "100% Chính ngạch · Hải quan · AI",
      hsToolTag: "Công cụ Tra cứu Mã HS miễn phí"
    },
    expertise: {
      eyebrow: "LĨNH VỰC CHUYÊN MÔN & ĐÀO TẠO",
      title: "Kiến Thức Thực Tế Bảo Vệ Dòng Tiền & Pháp Lý",
      desc: "Không lý thuyết suông. Mọi chủ đề trên ThuysTalk đều đính kèm quy trình từng bước, văn bản pháp lý đối chiếu và biểu mẫu thực tế để bạn áp dụng ngay.",
      btnExplore: "Khám phá khóa học miễn phí",
      cards: [
        {
          code: "01",
          tone: "jade",
          title: "XNK Chính Ngạch & Hải Quan",
          desc: "Quy trình mở tờ khai, Incoterms 2020, kiểm tra chuyên ngành, chuyển cửa khẩu ICD và phòng ngừa rủi ro sau thông quan.",
          tag: "Kèm Checklist Hồ Sơ"
        },
        {
          code: "02",
          tone: "orange",
          title: "Tra Mã HS Code & Thuế FTA",
          desc: "Áp mã HS chuẩn 6 quy tắc tổng quát (GRI), rà soát C/O ưu đãi thuế quan và tối ưu giá vốn nhập khẩu đúng luật.",
          tag: "Kèm Bảng Tra 6 Quy Tắc"
        },
        {
          code: "03",
          tone: "jade",
          title: "AI Agent & Tự Động Hóa",
          desc: "Ứng dụng AI & n8n tự động đối chiếu chứng từ Invoice – Packing List – B/L và tra cứu văn bản hải quan trong 10 giây.",
          tag: "Kèm Workflow Mẫu"
        },
        {
          code: "04",
          tone: "orange",
          title: "Đàm Phán & Quản Trị Rủi Ro",
          desc: "Kỹ thuật thẩm định nhà cung cấp quốc tế, soạn hợp đồng ngoại thương chặt chẽ và phòng tránh bẫy lừa đảo xuyên biên giới.",
          tag: "Kèm Mẫu Hợp Đồng"
        }
      ]
    },
    about: {
      scriptCallout: "Làm đúng, làm đủ, làm rõ ràng",
      expYears: "9+",
      expLabel: "Năm kinh nghiệm thực tế",
      miniCaption: "Hội nghị Đối thoại Hải quan – Doanh nghiệp 2026",
      eyebrow: "VỀ TÔI · CÂU CHUYỆN THUYTALK",
      title: "Mình là Nguyễn Thị Ngọc Thúy",
      subtitle: "Chuyên gia Tư vấn XNK – Logistics & Tiên phong Ứng dụng AI",
      p1: "Tốt nghiệp Học viện Ngân hàng chuyên ngành Thương mại Quốc tế, hơn 9 năm qua mình đã trực tiếp đi qua từng mắt xích của ngành xuất nhập khẩu: từ đàm phán giá, soạn thảo hợp đồng ngoại thương, chuẩn bị bộ chứng từ, tự mở tờ khai hải quan cho đến làm việc trực tiếp khi kiểm hóa và kiểm tra sau thông quan.",
      p2: "Tiếp xúc với hàng ngàn chủ doanh nghiệp và người làm nghề, mình thấu hiểu nỗi lo lớn nhất không nằm ở việc thiếu thông tin, mà là thông tin rời rạc và những chiếc bẫy ngầm có thể khiến lô hàng bị đình trệ hàng tuần lễ. Đó là lý do mình lập nên ThuysTalk — nơi chia sẻ thẳng thắn, minh bạch với triết lý: Làm đúng, làm đủ, làm rõ ràng.",
      milestones: [
        "Đồng hành toàn trình: Đàm phán quốc tế – Thủ tục Hải quan – Kiểm soát rủi ro pháp lý & thuế quan.",
        "Tiên phong công nghệ: Thiết kế hệ thống AI Agent & Tự động hóa giúp rút ngắn 70% thời gian xử lý chứng từ.",
        "Trao giá trị thật: Học viên đăng ký miễn phí được lưu tiến độ học tập và nhận trọn bộ biểu mẫu, checklist qua Email."
      ],
      stats: [
        { val: "9<span>+</span>", lbl: "Năm kinh nghiệm thực tế XNK & Hải quan" },
        { val: "100<span>%</span>", lbl: "Kiến thức chính ngạch, minh bạch & kèm biểu mẫu" },
        { val: "Miễn phí", lbl: "E-Learning lưu tiến độ & nhận tài liệu qua Email" }
      ],
      btnConnect: "Đăng ký tư vấn chuyên sâu cùng Thúy"
    },
    elearning: {
      eyebrow: "HỌC VIỆN E-LEARNING THUYTALK",
      title: "Khóa Học Thực Hành Miễn Phí & Nhận Tài Liệu Qua Email",
      desc: "Học từng bước ngắn gọn, làm bộ Mini Test & Bài tập tình huống để kiểm tra độ hiểu bài, tự động lưu tiến độ học tập và nhận bộ biểu mẫu thực tế gửi thẳng về Email của bạn.",
      bannerTitleGuest: "Đăng nhập Email miễn phí để lưu tiến độ học & nhận bộ tài liệu gốc",
      bannerDescGuest: "Nhập địa chỉ Email của bạn để hệ thống lưu lại các bài đã học và gửi biểu mẫu, checklist của từng khóa học.",
      bannerPlaceholder: "Nhập email của bạn (VD: lan.nguyen@company.com)...",
      bannerBtn: "Kích hoạt & Lưu tiến độ",
      bannerTitleLogged: "Học viên đang kích hoạt:",
      bannerDescLogged: "Tiến độ học tập của bạn đang được tự động lưu. Bạn có thể bấm Nhận tài liệu về Email ở bất kỳ khóa học nào.",
      btnStartCourse: "Vào học & Làm Mini Test",
      btnSendMaterial: "Gửi tài liệu về Email"
    },
    video: {
      eyebrow: "KÊNH YOUTUBE @THUYSTALK",
      title: "Video Phân Tích & Chia Sẻ Kinh Nghiệm Thực Tế",
      desc: "Hệ thống 4 chuyên mục video từ phân tích văn bản hải quan mới nhất, giải thích luật dễ hiểu đến các câu chuyện thực tế trên thương trường quốc tế. Có thể nhúng thêm video YouTube mới bất kỳ lúc nào từ Quản trị.",
      tabs: [
        { id: "all", label: "Tất cả video" },
        { id: "CM1", label: "CM1 · Văn bản nóng" },
        { id: "CM2", label: "CM2 · Dịch luật ra tiếng người" },
        { id: "CM3", label: "CM3 · Ký sự thương mại" },
        { id: "CM4", label: "CM4 · Chuyện nghề & Thực tế" }
      ],
      btnReadScript: "Đọc toàn văn kịch bản & Tải tài liệu",
      btnYoutubeChannel: "Xem kênh YouTube @thuystalk"
    },
    articles: {
      eyebrow: "BÀI VIẾT CHUYÊN SÂU · ĐĂNG TOÀN VĂN TRÊN WEB",
      title: "Góc Nhìn Pháp Lý Hải Quan, Tình Huống Thực Tế & Quản Trị",
      desc: "Mỗi bài viết đều bắt đầu từ vấn đề thực tế của doanh nghiệp, đối chiếu căn cứ pháp lý mới nhất và đưa ra giải pháp từng bước rõ ràng.",
      tabs: [
        { id: "all", label: "Tất cả bài viết" },
        { id: "CS", label: "Tình huống thực tế (CS)" },
        { id: "TN", label: "Tin Ngành (TN)" },
        { id: "HT", label: "Hướng Dẫn Thực Hành (HT)" }
      ],
      readFull: "Đọc toàn văn bài viết"
    },
    notebook: {
      eyebrow: "TRỢ LÝ AI TRA CỨU PHÁP LÝ & HẢI QUAN THUYTALK",
      title: "Tra Cứu Nhanh Mã HS, Chính Sách Hải Quan & Kiểm Soát Xuất Nhập Khẩu",
      desc: "Hệ thống AI tra cứu chuyên sâu được huấn luyện từ kho văn bản pháp quy Hải quan, Biểu thuế XNK và các tình huống thực tế của Nguyễn Thị Ngọc Thúy.",
      inputPlaceholder: "Nhập câu hỏi tra cứu (VD: HS code máy giặt? Quy tắc 3b áp mã HS? Quyết định 31/2026 cấm hàng nào về ICD?)...",
      sendBtn: "Tra cứu ngay",
      liveNotebookBtn: "Phân tích chuyên sâu AI"
    },
    consult: {
      eyebrow: "ĐỒNG HÀNH & TƯ VẤN CHUYÊN SÂU 1-1",
      title: "Bạn Cần Tư Vấn Kỹ Hơn Cho Lô Hàng Hoặc Doanh Nghiệp Của Mình?",
      desc: "Sau khi học E-Learning hoặc tra cứu trên hệ thống, nếu bạn đang gặp vướng mắc thực tế về mã HS, thủ tục thông quan, kiểm tra sau thông quan hay muốn ứng dụng AI vào quy trình làm việc, hãy để lại thông tin để Thúy hỗ trợ trực tiếp.",
      hostName: "Nguyễn Thị Ngọc Thúy",
      hostRole: "9+ Năm Kinh Nghiệm Thực Tế XNK, Hải Quan & Tự Động Hóa AI",
      securityNote: "Bảo mật 3 lớp theo chuẩn /secure-hybrid-web-architect & Nghị định 13/2023/NĐ-CP",
      formTitle: "Đăng Ký Tư Vấn Kỹ Hơn & Nhận Tài Liệu",
      formSub: "Thông tin của bạn được mã hóa bảo mật và phản hồi qua Email / Zalo (https://zalo.me/84767648862) trong 24h.",
      lblName: "Họ và tên của bạn *",
      lblPhone: "Số điện thoại / Zalo *",
      lblEmail: "Địa chỉ Email nhận tài liệu *",
      lblTopic: "Chủ đề bạn cần tư vấn chuyên sâu *",
      topics: [
        "Thủ tục Xuất nhập khẩu chính ngạch & Thông quan",
        "Tra cứu Mã HS Code, C/O & Tối ưu thuế quan FTA",
        "Kiểm tra sau thông quan & Báo cáo quyết toán DNCX",
        "Ứng dụng AI Agent & Tự động hóa quy trình XNK",
        "Thẩm định nhà cung cấp & Đàm phán hợp đồng ngoại thương"
      ],
      lblMsg: "Mô tả ngắn tình huống hoặc câu hỏi của bạn *",
      msgPlaceholder: "VD: Mình đang chuẩn bị nhập khẩu lô hàng máy móc / hóa chất về cảng Hải Phòng và cần tư vấn mã HS, thủ tục giấy phép...",
      consentText: "Tôi đồng ý cho phép ThuysTalk lưu trữ thông tin liên hệ để gửi tài liệu học tập và phản hồi tư vấn theo Chính sách bảo mật (Nghị định 13/2023/NĐ-CP).",
      submitBtn: "Gửi đăng ký tư vấn & Nhận bộ tài liệu"
    }
  },

  en: {
    nav: {
      home: "Home",
      expertise: "Expertise",
      about: "About Me",
      elearning: "E-Learning",
      video: "Videos",
      articles: "Articles",
      notebook: "AI Legal Lookup",
      consult: "1-on-1 Advisory",
      adminBtn: "CMS Admin Studio",
      ctaTop: "Get Templates & Advisory"
    },
    hero: {
      greeting: "HELLO, I AM",
      firstName: "Nguyen Thi Ngoc",
      highlightName: "Thuy",
      role: "Practical International Trade, Customs Compliance & AI Automation Specialist",
      bio: "With over 9 years of hands-on experience across the international supply chain—from foreign trade contracts, HS classification, and customs declaration to AI workflow automation—I built ThuysTalk to share free e-learning courses, authentic templates, and practical advisory for sustainable global trade.",
      btnPrimary: "Start Free E-Learning",
      btnSecondary: "AI Legal & HS Lookup",
      scriptNote: "Practical – Transparent – Sustainable",
      floatingTitle: "9+ Years Hands-On",
      floatingSub: "Official Trade · Customs · AI",
      hsToolTag: "Free Automated HS Code Lookup Tool"
    },
    expertise: {
      eyebrow: "CORE EXPERTISE & TRAINING PILLARS",
      title: "Actionable Knowledge That Protects Your Cash Flow & Compliance",
      desc: "Zero vague theory. Every topic on ThuysTalk includes step-by-step SOPs, official regulatory citations, and ready-to-use templates.",
      btnExplore: "Explore Free Courses",
      cards: [
        {
          code: "01",
          tone: "jade",
          title: "Official Customs & Clearance",
          desc: "VNACCS declarations, Incoterms 2020, specialized inspection, ICD customs transfer rules, and Post-Clearance Audit (PCA) defense.",
          tag: "Includes Document Checklist"
        },
        {
          code: "02",
          tone: "orange",
          title: "HS Classification & FTA Tariffs",
          desc: "Apply the 6 General Rules of Interpretation (GRI), verify Certificates of Origin (C/O), and legally optimize landed cost.",
          tag: "Includes 6-Rule Matrix"
        },
        {
          code: "03",
          tone: "jade",
          title: "AI Agents & Trade Automation",
          desc: "Deploy AI Agents & n8n workflows to cross-check Invoice, Packing List & Bill of Lading and query customs laws in seconds.",
          tag: "Includes Sample Workflows"
        },
        {
          code: "04",
          tone: "orange",
          title: "Global Sourcing & Fraud Prevention",
          desc: "Supplier due diligence, airtight international sales contracts, UCP 600 L/C safeguards, and cross-border scam prevention.",
          tag: "Includes Contract Templates"
        }
      ]
    },
    about: {
      scriptCallout: "Do it right, do it thoroughly, do it clearly",
      expYears: "9+",
      expLabel: "Years of Hands-On Experience",
      miniCaption: "Customs – Enterprise Dialogue Conference 2026",
      eyebrow: "ABOUT ME · THE THUYTALK STORY",
      title: "I'm Nguyen Thi Ngoc Thuy",
      subtitle: "International Trade & Customs Specialist · AI Automation Pioneer",
      p1: "A graduate of the Banking Academy majoring in International Trade, I have spent over 9 years executing every single link in the import-export chain: supplier negotiation, foreign trade contract drafting, shipping documentation, direct customs declaration, physical inspection, and post-clearance compliance.",
      p2: "Working alongside thousands of business owners and practitioners, I realized the biggest risk isn't a lack of information—it's fragmented advice and hidden compliance traps that stall containers at ports. I created ThuysTalk as an independent knowledge & e-learning hub guided by one principle: Do it right, do it thoroughly, do it clearly.",
      milestones: [
        "End-to-End Execution: International Negotiation – Customs Clearance – Tariff & Legal Risk Control.",
        "Tech-Driven Operations: Designing AI Agents & automation pipelines that cut document review time by 70%.",
        "Value-First Sharing: Free learner registration to track course progress and receive templates straight to your inbox."
      ],
      stats: [
        { val: "9<span>+</span>", lbl: "Years of Hands-On Trade & Customs Experience" },
        { val: "100<span>%</span>", lbl: "Compliant, Transparent & Template-Backed" },
        { val: "Free", lbl: "Progress-Tracked E-Learning & Email Templates" }
      ],
      btnConnect: "Book a 1-on-1 Advisory Session"
    },
    elearning: {
      eyebrow: "THUYTALK E-LEARNING ACADEMY",
      title: "Free Practical Courses · Save Progress & Receive Templates via Email",
      desc: "Learn through structured micro-lessons, complete multi-question Mini Tests & practical exercises, track your completion percentage, and receive downloadable templates via Email.",
      bannerTitleGuest: "Sign in with your Email (Free) to save course progress & receive templates",
      bannerDescGuest: "Enter your Email address to automatically save completed lessons and receive checklists & templates for each course.",
      bannerPlaceholder: "Enter your email (e.g., alex@company.com)...",
      bannerBtn: "Activate & Save Progress",
      bannerTitleLogged: "Active Learner:",
      bannerDescLogged: "Your learning progress is automatically saved. Click Email Me the Kit on any course to receive its templates.",
      btnStartCourse: "Open Classroom & Mini Test",
      btnSendMaterial: "Email Me the Kit"
    },
    video: {
      eyebrow: "YOUTUBE CHANNEL @THUYSTALK",
      title: "Practical Trade & Customs Video Library",
      desc: "Explore 4 signature series covering breaking customs regulations, plain-language legal breakdowns, trade history, and real-world case studies. Embed new YouTube videos anytime via Admin.",
      tabs: [
        { id: "all", label: "All Videos" },
        { id: "CM1", label: "CM1 · Hot Regulations" },
        { id: "CM2", label: "CM2 · Law in Plain Language" },
        { id: "CM3", label: "CM3 · Trade Chronicles" },
        { id: "CM4", label: "CM4 · Real-World Stories" }
      ],
      btnReadScript: "Read Full Script & Download Checklist",
      btnYoutubeChannel: "Visit YouTube @thuystalk"
    },
    articles: {
      eyebrow: "IN-DEPTH ARTICLES · FULL TEXT ON SITE",
      title: "Customs Compliance, Case Studies & Trade Management",
      desc: "Every article starts from a real operational bottleneck, cross-references official legal texts, and delivers a concrete action plan.",
      tabs: [
        { id: "all", label: "All Articles" },
        { id: "CS", label: "Case Study (CS)" },
        { id: "TN", label: "Regulatory News (TN)" },
        { id: "HT", label: "Practical Guides (HT)" }
      ],
      readFull: "Read Full Article"
    },
    notebook: {
      eyebrow: "THUYTALK AI LEGAL & CUSTOMS RESEARCH ENGINE",
      title: "Instant Lookup for HS Codes, Customs Laws & Export Controls",
      desc: "Intelligent trade compliance lookup across Nguyen Thi Ngoc Thuy's curated legal regulatory database and practical case library.",
      inputPlaceholder: "Ask a trade or customs question (e.g., HS code for washing machines? Decision 31/2026 ICD rules?)...",
      sendBtn: "Search Now",
      liveNotebookBtn: "Deep AI Analysis"
    },
    consult: {
      eyebrow: "1-ON-1 EXPERT ADVISORY",
      title: "Need Deeper Guidance for Your Shipment or Trade Workflow?",
      desc: "If you are facing a complex HS classification, customs clearance bottleneck, EPE final settlement audit, or want to automate your trade documentation with AI, book a consultation below.",
      hostName: "Nguyen Thi Ngoc Thuy",
      hostRole: "9+ Years in International Trade, Customs & AI Automation",
      securityNote: "3-Layer Security Hardened (/secure-hybrid-web-architect & Decree 13/2023/ND-CP)",
      formTitle: "Register for In-Depth Advisory & Resource Kit",
      formSub: "Your inquiry is protected by Row-Level Security and answered via Email / Zalo within 24 hours.",
      lblName: "Your Full Name *",
      lblPhone: "Phone / Zalo / WhatsApp *",
      lblEmail: "Email Address (for receiving materials) *",
      lblTopic: "Advisory Topic *",
      topics: [
        "Official Import-Export Procedures & Customs Clearance",
        "HS Code Classification, C/O & FTA Tariff Optimization",
        "Post-Clearance Audit & EPE Final Settlement (Form 15)",
        "AI Agents & Trade Document Automation (n8n / LLM)",
        "Supplier Due Diligence & Foreign Trade Contracts"
      ],
      lblMsg: "Briefly describe your situation or question *",
      msgPlaceholder: "Example: We are importing specialized chemicals/machinery through Hai Phong Port and need guidance on HS code & permits...",
      consentText: "I agree to allow ThuysTalk to process my contact details to send learning materials and advisory responses under Decree 13/2023/ND-CP.",
      submitBtn: "Submit Advisory Request & Get Kit"
    }
  }
};

// ============================================================================
// 3 COMPREHENSIVE E-LEARNING COURSES (With Multi-Question Mini Test & Exercise)
// ============================================================================
window.THUYSTALK_COURSES = [
  {
    id: "course-xnk-chinh-ngach",
    photoSlot: "aboutSpeaker",
    badge: { vi: "MIỄN PHÍ · KÈM BIỂU MẪU", en: "FREE · WITH TEMPLATES" },
    meta: { vi: "2 Bài học · Bộ Mini Test 3 câu · Thực hành", en: "2 Lessons · 3-Question Mini Test · Practical" },
    title: {
      vi: "Lộ Trình Xuất Nhập Khẩu Chính Ngạch & Phòng Vệ Rủi Ro Tại Cửa Khẩu",
      en: "Official Import-Export Roadmap & Port Clearance Risk Defense"
    },
    desc: {
      vi: "Làm chủ quy trình kiểm tra bộ chứng từ (Invoice, Packing List, B/L), quy định chuyển cửa khẩu ICD theo Quyết định 31/2026/QĐ-TTg và vận hành lệnh giao hàng điện tử eDO.",
      en: "Master shipping document verification (Invoice, Packing List, B/L), ICD transfer rules under Decision 31/2026/QD-TTg, and electronic Delivery Order (eDO) workflows."
    },
    deliverable: {
      vi: "Tài liệu gửi qua Email: Checklist 6 bước rà soát bộ chứng từ + Bảng tra mặt hàng bắt buộc thông quan tại cửa khẩu (QĐ 31/2026).",
      en: "Emailed Resource Kit: 6-Step Document Verification Checklist + Port-Mandatory HS Lookup Table (Decision 31/2026)."
    },
    lessons: [
      {
        id: "c1-l1",
        title: {
          vi: "Bài 1: 4 Điểm tử huyệt khi đối chiếu Hợp đồng, Invoice, Packing List và Vận đơn (B/L)",
          en: "Lesson 1: 4 Critical Checkpoints Across Contract, Invoice, Packing List & Bill of Lading"
        },
        duration: "09:30",
        summary: {
          vi: "Hướng dẫn cách kiểm tra chéo tên hàng, điều kiện Incoterms 2020 (FOB, CIF, EXW), trọng lượng Gross/Net Weight và thông tin nhà sản xuất trên nhãn gốc trước khi tàu chạy.",
          en: "How to cross-check goods description, Incoterms 2020 (FOB, CIF, EXW), Gross/Net Weight, and manufacturer origin labeling before vessel departure."
        },
        content: {
          vi: `<p><strong>1. Nguyên tắc Truyền tờ khai chuẩn ngay từ nháp:</strong> 80% các vụ phát sinh phí lưu bãi (Storage) và lưu cont (Demurrage) tại cảng Cát Lái hay Hải Phòng xuất phát từ sự bất nhất giữa 3 chứng từ: Commercial Invoice, Packing List và Bill of Lading (B/L).</p>
               <ul>
                 <li><strong>Điểm kiểm tra số 1 (Incoterms & Cước phí):</strong> Nếu mua giá EXW hoặc FOB, bắt buộc kiểm tra khoản phụ phí Local Charges và cước quốc tế có khớp với hóa đơn cước để khai trị giá tính thuế hải quan chuẩn xác hay không.</li>
                 <li><strong>Điểm kiểm tra số 2 (Cảng đích trên B/L theo Quyết định 31/2026/QĐ-TTg):</strong> Tuyệt đối không ghi bừa tên ICD nội địa vào ô <em>Port of Discharge / Place of Delivery</em> nếu mã HS hàng hóa thuộc danh mục bắt buộc làm thủ tục tại cửa khẩu nhập đầu tiên.</li>
                 <li><strong>Điểm kiểm tra số 3 (Nhãn gốc hàng hóa):</strong> Đảm bảo tên nhà sản xuất và xuất xứ trên kiện hàng thực tế khớp 100% với C/O và tờ khai.</li>
               </ul>`,
          en: `<p><strong>1. The First-Time-Right Declaration Principle:</strong> Over 80% of port storage and demurrage penalties stem from discrepancies among the Commercial Invoice, Packing List, and Bill of Lading (B/L).</p>
               <ul>
                 <li><strong>Checkpoint 1 (Incoterms & Customs Valuation):</strong> For EXW or FOB shipments, verify ocean freight and surcharges so customs dutiable value is declared accurately.</li>
                 <li><strong>Checkpoint 2 (Port of Discharge under Decision 31/2026/QD-TTg):</strong> Never blindly put an inland ICD in the B/L Place of Delivery if your HS code requires clearance at the first port of entry.</li>
                 <li><strong>Checkpoint 3 (Original Cargo Labels):</strong> Ensure manufacturer name and origin markings physically match your C/O and customs declaration.</li>
               </ul>`
        },
        miniTest: [
          {
            q: {
              vi: "Câu 1: Theo Quyết định 31/2026/QĐ-TTg, nếu hàng hóa thuộc Danh mục bắt buộc làm thủ tục tại cửa khẩu nhập nhưng vận đơn (B/L) lại ghi đích đến là Cảng cạn ICD nội địa (không thuộc diện ngoại lệ DNCX/SXXK/AEO), điều gì sẽ xảy ra?",
              en: "Q1: Under Decision 31/2026/QD-TTg, if goods are on the mandatory port-clearance list but the B/L names an inland ICD (without EPE/AEO exemption), what happens?"
            },
            options: {
              vi: [
                "A. Vẫn kéo cont về ICD bình thường và nộp phạt hành chính nhẹ.",
                "B. Hệ thống VNACCS chặn tờ khai vận chuyển OLA về ICD; chủ hàng phải chỉnh manifest/B/L và mở tờ khai ngay tại cảng biển cửa khẩu.",
                "C. Hải quan tự động miễn kiểm tra thực tế hàng hóa."
              ],
              en: [
                "A. Container moves to the ICD normally with a minor administrative fee.",
                "B. VNACCS blocks the OLA transit declaration; the importer must amend the manifest/B/L and clear customs directly at the seaport.",
                "C. Customs automatically waives physical inspection."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Chính xác! Hệ thống VNACCS sẽ chặn tờ khai vận chuyển độc lập OLA. Doanh nghiệp phải sửa manifest/B/L và làm thủ tục ngay tại cảng biển đầu tiên.",
              en: "Correct! VNACCS blocks the OLA transit filing. You must amend the manifest/B/L and clear customs at the first seaport of entry."
            }
          },
          {
            q: {
              vi: "Câu 2: Khi nhập khẩu theo điều kiện FOB (Incoterms 2020), khoản chi phí nào bắt buộc phải cộng vào trị giá tính thuế hải quan?",
              en: "Q2: When importing under FOB (Incoterms 2020), which cost must be added to the customs dutiable value?"
            },
            options: {
              vi: [
                "A. Phí vận chuyển nội địa từ cảng Cát Lái về kho người mua sau khi thông quan.",
                "B. Cước vận tải quốc tế (Ocean Freight) và phí bảo hiểm quốc tế (nếu có) tính đến cửa khẩu nhập đầu tiên.",
                "C. Phí lưu kho bãi phát sinh do doanh nghiệp làm thủ tục chậm."
              ],
              en: [
                "A. Inland trucking cost from the port to the buyer's warehouse after clearance.",
                "B. International Ocean Freight and insurance (if applicable) up to the first port of entry.",
                "C. Port demurrage caused by delayed customs filing."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Đúng! Trị giá hải quan hàng nhập khẩu là giá thực tế phải trả tính đến cửa khẩu nhập đầu tiên (CIF/CIP), nên mua giá FOB phải cộng thêm cước vận tải quốc tế.",
              en: "Correct! Import customs value is calculated up to the first port of entry, so international freight must be added to FOB value."
            }
          },
          {
            q: {
              vi: "Câu 3: Trường hợp nào dưới đây VẪN ĐƯỢC PHÉP chuyển cửa khẩu về ICD nội địa theo Quyết định 31/2026/QĐ-TTg?",
              en: "Q3: Which case below is STILL PERMITTED to transfer customs clearance to an inland ICD under Decision 31/2026/QD-TTg?"
            },
            options: {
              vi: [
                "A. Hàng tiêu dùng nhập khẩu kinh doanh thương mại thuần túy nằm trong danh mục rủi ro.",
                "B. Nguyên liệu, vật tư, máy móc nhập khẩu phục vụ trực tiếp cho hoạt động Gia công, Sản xuất xuất khẩu của nhà máy hoặc của Doanh nghiệp ưu tiên (AEO).",
                "C. Mọi lô hàng có trị giá dưới 50.000 USD."
              ],
              en: [
                "A. Purely commercial consumer goods listed in the restricted annex.",
                "B. Raw materials and machinery imported directly for Export Processing / Manufacturing or by an Authorized Economic Operator (AEO).",
                "C. Any shipment valued under $50,000."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Chính xác! Quyết định 31/2026/QĐ-TTg quy định rõ ngoại lệ cho hàng phục vụ Gia công, SXXK, Doanh nghiệp ưu tiên AEO và dự án đầu tư ưu đãi.",
              en: "Correct! Decision 31/2026/QD-TTg explicitly exempts Export Processing/Manufacturing, AEO enterprises, and incentivized investment projects."
            }
          }
        ],
        exercise: {
          vi: "Bài tập thực hành: Hãy lấy 1 bộ chứng từ (Invoice, Packing List, B/L nháp) của lô hàng gần nhất bạn đang làm, đối chiếu 3 trường: (1) Mã HS 8 số với Phụ lục QĐ 31/2026, (2) Port of Discharge / Place of Delivery trên B/L, và (3) Tên nhà sản xuất trên C/O.",
          en: "Practical Exercise: Take a draft B/L, Invoice, and Packing List from your current shipment and cross-verify: (1) 8-digit HS code against Decision 31/2026, (2) Port of Discharge/Place of Delivery, and (3) Manufacturer name on the C/O."
        }
      },
      {
        id: "c1-l2",
        title: {
          vi: "Bài 2: Quy trình 4 bước lấy hàng qua Cảng biển số (Smart Port) với eDO & eEIR",
          en: "Lesson 2: 4-Step Container Release at Smart Ports via eDO & eEIR"
        },
        duration: "08:45",
        summary: {
          vi: "Chuyển đổi hoàn toàn từ hồ sơ giấy sang Lệnh giao hàng điện tử (eDO), phiếu eEIR mã QR và cổng giám sát tự động VASSCM chỉ trong 30 giây.",
          en: "Transitioning from paper D/O to electronic Delivery Order (eDO), mobile QR eEIR, and VASSCM automated gate clearance."
        },
        content: {
          vi: `<p>Hệ sinh thái Cảng biển số 2026 giúp rút ngắn thời gian lấy hàng từ 4–8 tiếng xuống chỉ còn vài phút thao tác trực tuyến:</p>
               <ul>
                 <li><strong>Bước 1:</strong> Nhận mã eDO điện tử từ hãng tàu qua API liên thông Cổng thông tin một cửa quốc gia.</li>
                 <li><strong>Bước 2:</strong> Đăng nhập ePort bằng chữ ký số doanh nghiệp, khai báo nhận cont và thanh toán phí nâng hạ không tiền mặt 24/7.</li>
                 <li><strong>Bước 3:</strong> Hệ thống VNACCS tự động đẩy trạng thái thông quan sang hệ thống giám sát VASSCM của cảng.</li>
                 <li><strong>Bước 4:</strong> Gửi phiếu eEIR có mã QR về điện thoại tài xế để quét qua cổng Smart Gate nhận diện biển số tự động bằng Camera AI.</li>
               </ul>`,
          en: `<p>The 2026 Smart Port ecosystem cuts container pickup time from 4–8 hours down to minutes online:</p>
               <ul>
                 <li><strong>Step 1:</strong> Receive the electronic Delivery Order (eDO) from the shipping line via API.</li>
                 <li><strong>Step 2:</strong> Log in to ePort with your corporate digital signature and pay lift-on/lift-off fees cashlessly 24/7.</li>
                 <li><strong>Step 3:</strong> VNACCS pushes customs release status directly to the port's VASSCM system.</li>
                 <li><strong>Step 4:</strong> Send the QR eEIR to the driver's smartphone for AI OCR license-plate recognition at the Smart Gate.</li>
               </ul>`
        },
        miniTest: [
          {
            q: {
              vi: "Câu 1: Trong quy trình Cảng biển số (Smart Port) hiện nay, dữ liệu xác nhận hàng đủ điều kiện qua khu vực giám sát hải quan được xử lý như thế nào?",
              en: "Q1: In today's Smart Port workflow, how is customs supervision release verified at the port gate?"
            },
            options: {
              vi: [
                "A. Nhân viên phải in tờ khai mã vạch giấy ra cổng xin đóng dấu mộc đỏ.",
                "B. Dữ liệu tờ khai thông quan truyền tự động từ VNACCS sang hệ thống VASSCM kết hợp Camera AI quét biển số và mã QR eEIR.",
                "C. Tài xế chỉ cần đọc biển số xe bằng miệng cho bảo vệ cảng."
              ],
              en: [
                "A. Staff must print paper barcode sheets for manual stamping at the gate.",
                "B. VNACCS transmits release data automatically to VASSCM, paired with AI OCR camera scanning and mobile eEIR QR codes.",
                "C. The driver verbally states the container number at the gate."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Hoàn toàn chính xác! Hệ thống VASSCM đối soát tự động tờ khai từ VNACCS cùng Camera AI quét biển số xe và mã QR eEIR trong 30 giây.",
              en: "Spot on! VASSCM automatically reconciles VNACCS release status with AI OCR gate cameras and the eEIR QR code."
            }
          }
        ],
        exercise: {
          vi: "Bài tập thực hành: Kiểm tra tài khoản ePort của doanh nghiệp bạn đã được phân quyền chữ ký số để kích hoạt eDO và thanh toán trực tuyến 24/7 chưa.",
          en: "Practical Exercise: Verify that your corporate ePort account has digital signature delegation enabled for 24/7 eDO activation."
        }
      }
    ]
  },
  {
    id: "course-dncx-bcqt-hscode",
    photoSlot: "customsAward",
    badge: { vi: "CHUYÊN SÂU · PHÁP LÝ HẢI QUAN", en: "ADVANCED · CUSTOMS COMPLIANCE" },
    meta: { vi: "1 Chuyên đề · Bộ Mini Test 2 câu · Có Bài tập", en: "1 Module · 2-Question Mini Test · With Exercise" },
    title: {
      vi: "Áp Mã HS Chuẩn 6 Quy Tắc & Công Thức Tam Giác Vàng Báo Cáo Quyết Toán DNCX",
      en: "6-Rule HS Classification & Golden Triangle EPE Final Settlement (Form 15)"
    },
    desc: {
      vi: "Giải quyết triệt để bài toán lệch số liệu giữa Kho – Kế toán – XNK khi lập Báo cáo quyết toán Mẫu 15/BCQT-NVL và cập nhật Công văn 23913/CHQ-GSQL về hóa chất DNCX.",
      en: "Eliminate inventory discrepancies across Warehouse, Accounting, and Customs when filing Form 15/BCQT-NVL and apply Official Letter 23913/CHQ-GSQL."
    },
    deliverable: {
      vi: "Tài liệu gửi qua Email: File Excel đối soát Tam Giác Vàng Kho - Kế toán - XNK + Mẫu Bản cam kết sử dụng hóa chất nội bộ DNCX.",
      en: "Emailed Resource Kit: Golden Triangle Reconciliation Excel Template + Internal Chemical Usage Commitment Template for EPEs."
    },
    lessons: [
      {
        id: "c2-l1",
        title: {
          vi: "Bài 1: Khử Tam Giác Quỷ lệch số liệu Kho – Kế toán – XNK trước kỳ Kiểm tra sau thông quan",
          en: "Lesson 1: Eliminating the Warehouse–Accounting–Customs Discrepancy Triangle Before PCA"
        },
        duration: "14:20",
        summary: {
          vi: "Phân tích 3 nguyên nhân cốt lõi khiến kho thực tế âm/dương hàng chục tấn nguyên liệu và quy trình đối soát 3 bên theo quý.",
          en: "Analyzing the 3 root causes of massive raw-material variances and the quarterly 3-way reconciliation SOP."
        },
        content: {
          vi: `<p>Tại sao 10 doanh nghiệp gia công / DNCX thì có tới 8 doanh nghiệp lệch số liệu khi lập Báo cáo quyết toán Mẫu 15/BCQT-NVL?</p>
               <ul>
                 <li><strong>Đứt gãy Đơn vị tính (UOM):</strong> Hải quan khai theo kg/mét vuông, nhưng Kho xuất theo cuộn/thùng/chiếc, làm tròn số thập phân trên ERP gây sai lệch lũy kế.</li>
                 <li><strong>Bỏ quên phế liệu & hao hụt kỹ thuật:</strong> Nhựa cháy đầu đùn, linh kiện hỏng bỏ thùng rác không làm phiếu xuất hủy khiến tồn kho trên giấy tờ vẫn còn nhưng kho thực tế bị âm.</li>
                 <li><strong>Giải pháp Tam Giác Vàng:</strong> Khóa sổ đối soát chéo 3 bên (Kho - Kế toán - XNK) định kỳ mỗi quý + chuẩn hóa BOM thực tế kèm biên bản kiểm kê phế phẩm.</li>
               </ul>`,
          en: `<p>Why do most EPEs face inventory mismatches when preparing Form 15/BCQT-NVL?</p>
               <ul>
                 <li><strong>Unit of Measure (UOM) Rounding Drift:</strong> Customs declarations use kg/sqm while the warehouse issues rolls/boxes/pieces.</li>
                 <li><strong>Unrecorded Scrap & Technical Loss:</strong> Defective parts discarded without formal scrap write-off vouchers create phantom book inventory.</li>
                 <li><strong>The Golden Triangle Fix:</strong> Mandatory quarterly 3-way reconciliation across Warehouse, Accounting, and Customs + standardized BOM and scrap minutes.</li>
               </ul>`
        },
        miniTest: [
          {
            q: {
              vi: "Câu 1: Nguyên nhân phổ biến nào khiến số liệu tồn kho nguyên vật liệu trên tờ khai hải quan lớn hơn rất nhiều so với tồn kho thực tế tại nhà xưởng DNCX?",
              en: "Q1: What commonly causes customs book inventory to be significantly higher than physical warehouse stock in an EPE?"
            },
            options: {
              vi: [
                "A. Do phế liệu, phế phẩm và hao hụt thực tế trong sản xuất không được lập phiếu xuất hủy và cập nhật vào định mức BOM.",
                "B. Do doanh nghiệp nộp báo cáo quyết toán sớm hơn hạn 90 ngày.",
                "C. Do sử dụng lệnh giao hàng điện tử eDO."
              ],
              en: [
                "A. Production scrap and technical loss were discarded without formal write-off vouchers and BOM updates.",
                "B. Filing the settlement report before the 90-day deadline.",
                "C. Using electronic Delivery Orders (eDO)."
              ]
            },
            correctIndex: 0,
            explanation: {
              vi: "Đúng vậy! Khi phế phẩm không có phiếu xuất hủy và biên bản kiểm kê, trên sổ sách hải quan lượng nguyên liệu đó vẫn tồn tại, dẫn tới chênh lệch âm kho thực tế.",
              en: "Correct! Without scrap write-off records, customs books still show those raw materials as on-hand."
            }
          },
          {
            q: {
              vi: "Câu 2: Thời hạn chậm nhất phải nộp Báo cáo quyết toán Mẫu 15/BCQT-NVL đối với doanh nghiệp gia công, SXXK và DNCX là khi nào?",
              en: "Q2: What is the statutory deadline for submitting the Form 15/BCQT-NVL settlement report?"
            },
            options: {
              vi: [
                "A. Chậm nhất ngày thứ 30 kể từ ngày kết thúc năm tài chính.",
                "B. Chậm nhất ngày thứ 90 kể từ ngày kết thúc năm tài chính.",
                "C. 5 năm một lần."
              ],
              en: [
                "A. Within 30 days of fiscal year-end.",
                "B. Within 90 days of fiscal year-end.",
                "C. Once every 5 years."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Chính xác! Thời hạn nộp Báo cáo quyết toán là trong vòng 90 ngày kể từ ngày kết thúc năm tài chính.",
              en: "Correct! Form 15/BCQT-NVL must be submitted within 90 days after the end of the fiscal year."
            }
          }
        ],
        exercise: {
          vi: "Bài tập thực hành: Chọn 3 mã nguyên vật liệu có giá trị lớn nhất trong kho nhà máy, đặt số tồn thực tế của Kho cạnh số tồn TK 152 của Kế toán và số tồn tờ khai E11/E15 để kiểm tra độ lệch UOM.",
          en: "Practical Exercise: Pick your top 3 raw material SKUs and compare physical warehouse stock against Account 152 and VNACCS declaration balances."
        }
      }
    ]
  },
  {
    id: "course-ai-agent-xnk",
    photoSlot: "consultHost",
    badge: { vi: "CÔNG NGHỆ · ỨNG DỤNG AI", en: "TECH · PRACTICAL AI" },
    meta: { vi: "1 Chuyên đề · Bộ Mini Test · Có Workflow", en: "1 Module · Mini Test · Workflow Included" },
    title: {
      vi: "Ứng Dụng AI Agent & Tự Động Hóa Rà Soát Chứng Từ Xuất Nhập Khẩu",
      en: "Deploying AI Agents & Automation for Trade Document QC"
    },
    desc: {
      vi: "Cách thiết lập Trợ lý AI kiểm tra sai số giữa Invoice, Packing List, B/L và tra cứu nhanh quy định hải quan giúp tiết kiệm 70% thời gian lặp lại.",
      en: "Build an AI QC Assistant to cross-verify Invoice, Packing List, and B/L fields and query customs regulations in seconds."
    },
    deliverable: {
      vi: "Tài liệu gửi qua Email: Bộ Prompt chuẩn rà soát bộ chứng từ XNK + Sơ đồ kiến trúc AI Document QC Agent.",
      en: "Emailed Resource Kit: Trade Document QC Prompt Library + AI Document Verification Architecture Blueprint."
    },
    lessons: [
      {
        id: "c3-l1",
        title: {
          vi: "Bài 1: Thiết kế Trợ lý QC Chứng từ đối chiếu tự động B/L – Invoice – Packing List",
          en: "Lesson 1: Designing an AI Document QC Agent for B/L – Invoice – Packing List"
        },
        duration: "11:15",
        summary: {
          vi: "Quy trình bóc tách trường dữ liệu OCR và dùng mô hình ngôn ngữ lớn (LLM) phát hiện sai lệch số cont, số seal, mã HS và trọng lượng trong 15 giây.",
          en: "Extracting fields via OCR and using LLMs to flag container number, seal, HS code, and weight mismatches in 15 seconds."
        },
        content: {
          vi: `<p>Thay vì dò từng dòng bằng mắt thường trên 20 trang Packing List, bạn có thể áp dụng quy trình 3 bước với AI Agent:</p>
               <ul>
                 <li><strong>Bước 1 (Chuẩn hóa đầu vào):</strong> Chuyển file PDF/Ảnh chụp B/L, Invoice, Packing List qua lớp trích xuất cấu trúc JSON chuẩn.</li>
                 <li><strong>Bước 2 (Luật đối soát cứng):</strong> Tự động so khớp 10 trường bắt buộc: Shipper, Consignee, Notify Party, Port of Loading, Port of Discharge, Container/Seal No., Số kiện, Gross Weight, Net Weight và Tổng trị giá.</li>
                 <li><strong>Bước 3 (Cảnh báo sớm):</strong> Xuất bảng báo cáo các điểm lệch màu cam/đỏ để nhân sự chứng từ yêu cầu đầu nước ngoài sửa ngay trước khi đóng manifest.</li>
               </ul>`,
          en: `<p>Instead of manually scanning 20-page Packing Lists line by line, apply this 3-step AI QC pipeline:</p>
               <ul>
                 <li><strong>Step 1 (Structured Extraction):</strong> Convert PDF/image B/L, Invoice, and Packing List files into structured JSON.</li>
                 <li><strong>Step 2 (Deterministic Rules):</strong> Cross-verify 10 mandatory fields: Shipper, Consignee, Notify Party, POL, POD, Container/Seal, Packages, Gross/Net Weight, and Total Value.</li>
                 <li><strong>Step 3 (Early Alert):</strong> Generate a discrepancy report before manifest cutoff.</li>
               </ul>`
        },
        miniTest: [
          {
            q: {
              vi: "Câu 1: Mục tiêu quan trọng nhất khi ứng dụng AI Agent vào kiểm tra bộ chứng từ xuất nhập khẩu là gì?",
              en: "Q1: What is the primary goal of using an AI Agent for shipping document verification?"
            },
            options: {
              vi: [
                "A. Để thay thế hoàn toàn chữ ký số của doanh nghiệp trên VNACCS.",
                "B. Phát hiện sớm các sai số giữa B/L, Invoice, Packing List trước giờ cắt máng/đóng manifest để con người phê duyệt sửa kịp thời.",
                "C. Tự động đổi mã HS sang mức thuế 0% không cần căn cứ."
              ],
              en: [
                "A. To replace the company's legal digital signature on VNACCS.",
                "B. To catch discrepancies across B/L, Invoice, and Packing List before manifest cutoff for human review and correction.",
                "C. To arbitrarily change HS codes to 0% duty."
              ]
            },
            correctIndex: 1,
            explanation: {
              vi: "Chính xác! AI đóng vai trò người gác cổng rà soát sai số siêu tốc với độ chính xác cao, giúp con người ra quyết định và chỉnh sửa chứng từ trước khi phát sinh phí phạt.",
              en: "Exactly! AI acts as a high-speed verification layer so your team can fix discrepancies before manifest cutoff."
            }
          }
        ],
        exercise: {
          vi: "Bài tập thực hành: Liệt kê 10 trường dữ liệu bắt buộc phải khớp 100% giữa Commercial Invoice, Packing List và Bill of Lading trong quy trình của bạn.",
          en: "Practical Exercise: List the 10 mandatory fields that must match 100% across your Invoice, Packing List, and Bill of Lading."
        }
      }
    ]
  }
];

// ============================================================================
// 4 THUYTALK VIDEO EPISODES (@thuystalk — CM1 to CM4 + YouTube Embed Support)
// ============================================================================
window.THUYSTALK_VIDEOS = [
  {
    id: "vid-cm3-lich-su-duong-sat",
    cm: "CM3",
    cmLabel: { vi: "CM3 · Ký sự thương mại", en: "CM3 · Trade Chronicles" },
    duration: "10:15",
    date: "11/2026",
    thumbSlot: "aboutSpeaker",
    youtubeUrl: "https://www.youtube.com/watch?v=89D3QY2Cjs8",
    youtubeEmbedId: "89D3QY2Cjs8",
    youtubeEmbedSrc: "https://www.youtube.com/embed/89D3QY2Cjs8?si=eHe_3x-02zA7RUmQ",
    title: {
      vi: "Lịch Sử Đường Sắt Thế Giới — Huyết Mạch Giao Thương Xuyên Lục Địa (ThuyTalk)",
      en: "World Railway History — The Transcontinental Artery of Global Trade (ThuyTalk)"
    },
    desc: {
      vi: "Khám phá hành trình lịch sử đường sắt thế giới từ những đầu máy hơi nước đầu tiên đến tuyến vận tải đường sắt liên vận quốc tế kết nối chuỗi cung ứng Á – Âu.",
      en: "Explore the history of world railways from early steam locomotives to modern transcontinental freight corridors connecting Eurasian supply chains."
    },
    script: {
      vi: `<h4>1. Sự ra đời của Đường sắt và Cuộc cách mạng Logistics trên bộ</h4>
           <p>Trước khi có đường sắt, việc vận chuyển hàng hóa nặng sâu trong lục địa tốn kém gấp nhiều lần đường biển. Sự xuất hiện của đầu máy hơi nước và hệ thống khổ đường ray tiêu chuẩn (1.435 mm) đã mở ra kỷ nguyên vận tải khối lượng lớn xuyên lục địa với chi phí và thời gian định trước chính xác.</p>
           <h4>2. Bài học cho Vận tải Đa phương thức & Liên vận Quốc tế hiện đại</h4>
           <p>Ngày nay, kết hợp vận tải đường sắt liên vận quốc tế với đường biển và đường bộ giúp doanh nghiệp xuất nhập khẩu tối ưu thời gian giao hàng và giảm thiểu rủi ro đứt gãy chuỗi cung ứng.</p>`,
      en: `<h4>1. The Birth of Railways and the Inland Logistics Revolution</h4>
           <p>The standardization of rail gauges (1,435 mm) unlocked predictable, high-volume continental freight movement.</p>
           <h4>2. Modern Intermodal & Cross-Border Rail</h4>
           <p>Integrating cross-border rail with ocean and road transport gives shippers resilient alternatives during maritime bottlenecks.</p>`
    }
  },
  {
    id: "vid-cm4-scam-ep1",
    cm: "CM4",
    cmLabel: { vi: "CM4 · Chuyện nghề & Thực tế", en: "CM4 · Real-World Stories" },
    duration: "09:45",
    date: "11/2026",
    thumbSlot: "aboutSpeaker",
    youtubeUrl: "https://www.youtube.com/@thuystalk",
    youtubeEmbedId: "",
    title: {
      vi: "[Tập 1] Người Bán Nước Ngoài Lừa: Vở Kịch Nhà Máy Ảo, Cú Sốc Container Gạch Vụn Cát Lái & Bẫy Thanh Toán L/C",
      en: "[Ep 1] Foreign Supplier Scams: Fake Factory Tours, The Rubble Container Shock at Cat Lai & L/C Traps"
    },
    desc: {
      vi: "Bóc tách vụ án có thật: Chủ xưởng chuyển 3,5 tỷ đồng nhập hạt nhựa nhưng mở cont tại Cát Lái chỉ thấy gạch vụn, cùng lỗ hổng chết người khi quá tin vào L/C At Sight theo UCP 600.",
      en: "Dissecting a real case: A manufacturer wired 3.5 billion VND for plastic resin only to open a container of construction rubble at Cat Lai Port, plus the hidden UCP 600 L/C trap."
    },
    script: {
      vi: `<h4>1. Mở đầu (00:00 – 01:15): Cú sốc mở container tại cảng Cát Lái</h4>
           <p>Xin chào các anh chị và các bạn! Chào mừng mọi người đã quay trở lại với chuyên mục của Thúy Talk: <strong>Xuất nhập khẩu Easy!</strong> Trong hoạt động mua bán quốc tế, chỉ một cái tặc lưỡi ham lô hàng giá rẻ hơn thị trường 15%, một anh chủ xưởng ở Bình Dương đã chuyển đi hơn 3,5 tỷ đồng. Đến ngày ra cảng Cát Lái mở container kiểm hóa thì chết lặng: phía ngoài xếp đúng 2 hàng bao hạt nhựa mẫu, còn bên trong toàn bộ là đất cát và gạch vỡ công trình!</p>
           <h4>2. Tại sao kiểm tra cả Video nhà máy và mở L/C ngân hàng vẫn sập bẫy?</h4>
           <ul>
             <li><strong>Kịch bản Thuê phim trường nhà máy:</strong> Kẻ lừa đảo dẫn khách đi thăm hoặc gọi video call ngay trong một nhà máy thật (nhưng thực chất chúng chỉ đóng giả làm khách mua hàng vào quay nhờ), sau đó ký hợp đồng bằng pháp nhân công ty ma ở thiên đường thuế.</li>
             <li><strong>Ngộ nhận về L/C At Sight (Điều 5 UCP 600):</strong> Ngân hàng chỉ kiểm tra bề mặt bộ chứng từ (On their face). Nếu kẻ gian làm giả vận đơn hoặc đóng gạch vụn vào container cho đủ đúng số cân nặng trên Packing List thì ngân hàng vẫn buộc phải giải ngân tiền!</li>
           </ul>
           <h4>3. 4 Nguyên tắc Bảo vệ Dòng tiền (06:00 – 09:45)</h4>
           <p>Luôn yêu cầu giám định độc lập (SGS / Bureau Veritas / Intertek) giám sát <strong>ngay lúc đóng hàng vào container và kẹp chì (Loading Supervision)</strong>; xác minh chéo giấy phép kinh doanh qua cơ quan thương vụ và kiểm tra lịch sử vận đơn quốc tế của nhà cung cấp.</p>`,
      en: `<h4>1. Opening (00:00 – 01:15): The Cat Lai Container Shock</h4>
           <p>Welcome back to ThuyTalk! In cross-border trade, wiring funds abroad without physical verification can mean 100% loss. We examine a real case where a seasoned factory owner wired 3.5 billion VND for plastic resin, only to find two front rows of real bags hiding tons of construction rubble.</p>
           <h4>2. Why Video Calls & Sight L/Cs Alone Won't Save You</h4>
           <ul>
             <li><strong>Staged Factory Video Calls:</strong> Scammers pose as domestic buyers inside a legitimate third-party factory to livestream a tour, then sign contracts under an offshore shell company.</li>
             <li><strong>The UCP 600 Article 5 Reality:</strong> Banks deal with documents, not goods. If shipping documents appear compliant on their face, the issuing bank must honor the L/C even if the container holds bricks matching the declared gross weight.</li>
           </ul>
           <h4>3. 4 Safeguards for Importers</h4>
           <p>Mandate third-party Pre-Shipment & Container Loading Supervision (SGS/Intertek) certified in the L/C required documents, and verify supplier customs export history before wiring any deposit.</p>`
    }
  },
  {
    id: "vid-cm1-dpp-eu",
    cm: "CM1",
    cmLabel: { vi: "CM1 · Văn bản nóng", en: "CM1 · Hot Regulations" },
    duration: "05:30",
    date: "11/2026",
    thumbSlot: "customsAward",
    youtubeUrl: "https://www.youtube.com/@thuystalk",
    youtubeEmbedId: "",
    title: {
      vi: "Hàng Xuất Khẩu Vào EU Sẽ Bị Kiểm Soát Thế Nào? Hộ Chiếu Sản Phẩm Số (DPP) & Lộ Trình 2026–2029",
      en: "Exporting to the EU: Digital Product Passport (DPP) Registry & The 2026–2029 Compliance Roadmap"
    },
    desc: {
      vi: "Giải mã cơ chế EU DPP Registry (vận hành từ 20/07/2026), lộ trình bắt buộc với pin, sắt thép, dệt may, nội thất và 6 bước chuẩn bị dữ liệu cho nhà xuất khẩu Việt Nam.",
      en: "Decoding the EU DPP Registry, mandatory timelines for batteries, steel, textiles, and furniture, plus a 6-step preparation checklist for Vietnamese exporters."
    },
    script: {
      vi: `<h4>1. DPP thực chất là gì?</h4>
           <p>DPP (Digital Product Passport) không phải là một mã QR trang trí, mà là hồ sơ dữ liệu số có cấu trúc gắn với sản phẩm/lô hàng được đăng ký định danh trên <strong>EU DPP Registry</strong> (đi vào hoạt động từ 20/07/2026 theo Quy định EU 2024/1781).</p>
           <h4>2. 6 Bước chuẩn bị cho doanh nghiệp Việt Nam</h4>
           <ul>
             <li>Xác định đúng mã HS và nhóm sản phẩm chịu quy định (Pin công nghiệp/xe điện từ 18/02/2027; Sắt thép, Dệt may, Nội thất theo lộ trình 2026–2029).</li>
             <li>Lập bản đồ chuỗi cung ứng đến cấp nguyên liệu và chuẩn hóa BOM, chứng nhận vật liệu, hóa đơn nguồn gốc.</li>
             <li>Đưa nghĩa vụ cung cấp dữ liệu DPP vào hợp đồng mua nguyên liệu ngay từ hôm nay.</li>
           </ul>`,
      en: `<h4>1. What is the EU Digital Product Passport (DPP)?</h4>
           <p>Under Regulation (EU) 2024/1781, the DPP is a structured digital compliance record registered in the <strong>EU DPP Registry</strong> (active since July 20, 2026) verified electronically during customs clearance and market surveillance.</p>
           <h4>2. 6-Step Action Plan for Exporters</h4>
           <ul>
             <li>Map your HS codes against EU delegated acts (Batteries mandatory Feb 18, 2027; Steel, Textiles, and Furniture following in 2026–2029).</li>
             <li>Standardize BOMs, material test reports, and upstream supplier data clauses in procurement contracts.</li>
           </ul>`
    }
  },
  {
    id: "vid-cm2-qd31-icd",
    cm: "CM2",
    cmLabel: { vi: "CM2 · Dịch luật ra tiếng người", en: "CM2 · Law in Plain Language" },
    duration: "07:20",
    date: "11/2026",
    thumbSlot: "heroPortrait",
    youtubeUrl: "https://www.youtube.com/@thuystalk",
    youtubeEmbedId: "",
    title: {
      vi: "Quyết Định 31/2026/QĐ-TTg: Hàng Nào Bị Cấm Cửa Chuyển Cửa Khẩu Về ICD Nội Địa?",
      en: "Decision 31/2026/QD-TTg Explained: Which Goods Cannot Be Transferred to Inland ICDs?"
    },
    desc: {
      vi: "Phân tích dễ hiểu sự thay đổi từ Quyết định 23/2019 sang Quyết định 31/2026 và 3 trường hợp ngoại lệ (Gia công/SXXK, Doanh nghiệp ưu tiên AEO, Dự án ưu đãi đầu tư).",
      en: "Plain-language breakdown of Decision 31/2026 replacing Decision 23/2019, mandatory seaport clearance rules, and the 3 legal exemptions."
    },
    script: {
      vi: `<p>Nhiều chủ hàng có thói quen yêu cầu Shipper ghi Cảng đích trên B/L là ICD Tiên Sơn, ICD Mỹ Đình hay ICD Long Bình để kéo hàng về gần kho mới mở tờ khai. Nhưng với Quyết định 31/2026/QĐ-TTg, nếu mã HS thuộc danh mục kiểm soát tại cửa khẩu đầu tiên mà không thuộc 3 nhóm ngoại lệ (SXXK/Gia công, AEO, Dự án đầu tư ưu đãi), tờ khai vận chuyển OLA sẽ bị chặn ngay lập tức!</p>`,
      en: `<p>Many importers habitually instruct shippers to list inland ICDs on the Bill of Lading. Under Decision 31/2026/QD-TTg, restricted HS codes must complete full customs clearance at the first port of entry unless exempted under Processing/Export Manufacturing, AEO status, or investment incentives.</p>`
    }
  },
  {
    id: "vid-cm3-container-1956",
    cm: "CM3",
    cmLabel: { vi: "CM3 · Ký sự thương mại", en: "CM3 · Trade Chronicles" },
    duration: "08:15",
    date: "10/2026",
    thumbSlot: "consultHost",
    youtubeUrl: "https://www.youtube.com/@thuystalk",
    youtubeEmbedId: "",
    title: {
      vi: "Ký Sự Container 1956: Chiếc Thùng Sắt Của Malcolm McLean Đã Cắt Giảm 90% Chi Phí Vận Tải Toàn Cầu Thế Nào?",
      en: "The 1956 Container Chronicle: How Malcolm McLean's Steel Box Slashed Global Shipping Costs by 90%"
    },
    desc: {
      vi: "Câu chuyện lịch sử thương mại đầy cảm hứng về chuyến tàu Ideal X năm 1956 — từ mức phí bốc dỡ 5,86 USD/tấn xuống chỉ còn 0,16 USD/tấn (giảm 36 lần).",
      en: "The inspiring trade history of the SS Ideal X in 1956—slashing stevedoring costs from $5.86/ton down to $0.16/ton and reshaping world commerce."
    },
    script: {
      vi: `<p>Trước ngày 26/04/1956, bốc dỡ một con tàu hàng rời tại cảng mất cả tuần lễ với chi phí 5,86 USD/tấn. Xuất phát từ góc nhìn của một tài xế xe tải phải ngồi chờ cả ngày ở bến cảng, Malcolm McLean đã tạo ra chuẩn hóa container liên vận, đưa chi phí bốc dỡ xuống 0,16 USD/tấn — giảm 36 lần và mở ra kỷ nguyên toàn cầu hóa!</p>`,
      en: `<p>Before April 26, 1956, loading break-bulk cargo cost $5.86 per ton and kept ships idle in port for a week. Former trucker Malcolm McLean standardized intermodal containers aboard the Ideal X, cutting handling cost to $0.16/ton—a 36-fold reduction that powered modern globalization.</p>`
    }
  }
];

// ============================================================================
// 4 FULL-TEXT BLOG ARTICLES (100% On-Site Reader + Bilingual VI/EN)
// ============================================================================
window.THUYSTALK_ARTICLES = [
  {
    id: "art-qd31-2026-icd",
    pillar: "TN",
    pillarLabel: { vi: "Tin Ngành · Cửa Khẩu", en: "Regulatory News · Ports" },
    date: "11/11/2026",
    readTime: { vi: "6 phút đọc", en: "6 min read" },
    photoSlot: "heroPortrait",
    title: {
      vi: "Quyết định 31/2026/QĐ-TTg thay thế Quyết định 23/2019: Hàng nào bị cấm cửa chuyển cửa khẩu về ICD nội địa?",
      en: "Decision 31/2026/QD-TTg Replaces Decision 23/2019: Which Goods Are Barred from Inland ICD Transfer?"
    },
    excerpt: {
      vi: "Thói quen ghi tên ICD nội địa trên vận đơn (B/L) có thể khiến lô hàng bị chặn tờ khai vận chuyển OLA và phơi bãi cảng biển 5–7 ngày. Xem ngay 4 nguyên tắc phòng vệ.",
      en: "Listing an inland ICD on your Bill of Lading for restricted HS codes will trigger an automatic OLA transit block on VNACCS. Learn the 4 defense rules."
    },
    body: {
      vi: `
        <p>Trong giới làm xuất nhập khẩu, rất nhiều chủ hàng có thói quen khi đặt booking tàu luôn yêu cầu Shipper điền Cảng đích (<em>Port of Discharge / Place of Delivery</em>) là các Cảng cạn ICD nội địa gần nhà máy (như ICD Tiên Sơn, ICD Mỹ Đình, ICD Long Bình, ICD Phước Long...) để kéo container về gần kho mới làm thủ tục hải quan.</p>
        <p>Thế nhưng, nếu doanh nghiệp không cập nhật ngay <strong>Quyết định số 31/2026/QĐ-TTg</strong> của Thủ tướng Chính phủ (thay thế Quyết định 23/2019/QĐ-TTg), thói quen này rất dễ biến thành một chiếc bẫy chi phí đắt đỏ.</p>
        <h4>1. Chuyện gì xảy ra khi ghi sai cảng đích trên B/L?</h4>
        <ul>
          <li>Hệ thống hải quan điện tử VNACCS/VCIS sẽ <strong>tự động chặn</strong>, không chấp nhận tờ khai vận chuyển độc lập OLA để kéo hàng về ICD nội địa.</li>
          <li>Hãng tàu không thể cấp lệnh giao hàng chuyển cảng vì manifest đã truyền về ICD bị nghẽn.</li>
          <li>Chủ hàng buộc phải xin điều chỉnh manifest, sửa B/L và quay đầu mở tờ khai trực tiếp tại Chi cục Hải quan cảng biển cửa khẩu — mất từ 5 đến 7 ngày lưu bãi (Storage) và lưu cont (Demurrage).</li>
        </ul>
        <h4>2. Ba trường hợp ngoại lệ vẫn được đưa hàng về ICD nội địa</h4>
        <ul>
          <li>Hàng hóa là máy móc, thiết bị, nguyên vật liệu nhập khẩu phục vụ trực tiếp cho hoạt động <strong>Gia công, Sản xuất xuất khẩu</strong> của chính nhà máy.</li>
          <li>Hàng hóa nhập khẩu của <strong>Doanh nghiệp ưu tiên (AEO)</strong> theo quy định của Luật Hải quan.</li>
          <li>Hàng hóa tạo tài sản cố định của các dự án đầu tư được ưu đãi đầu tư.</li>
        </ul>
        <h4>3. Bốn nguyên tắc phòng vệ sống còn cho chủ hàng</h4>
        <p><strong>Nguyên tắc 1 — Tra cứu chéo mã HS trước khi ký hợp đồng:</strong> Kiểm tra mã HS 8 chữ số có thuộc Phụ lục Quyết định 31/2026/QĐ-TTg hay không.<br>
        <strong>Nguyên tắc 2 — Hướng dẫn Shipper phát hành B/L chuẩn:</strong> Nếu hàng bắt buộc thông quan tại cửa khẩu, mục <em>Port of Discharge</em> và <em>Place of Delivery</em> phải ghi rõ cảng biển thực tế (Cat Lai Port / Hai Phong Port).<br>
        <strong>Nguyên tắc 3 — Chuẩn bị sẵn hồ sơ kiểm tra chuyên ngành</strong> trước khi tàu cập cảng 3 ngày.<br>
        <strong>Nguyên tắc 4 — Lên phương án vận tải đường bộ nội địa</strong> ngay sau khi tờ khai thông quan tại cảng biển.</p>
      `,
      en: `
        <p>Many importers habitually instruct overseas shippers to enter an inland ICD (such as ICD My Dinh, ICD Tien Son, or ICD Long Binh) as the <em>Place of Delivery</em> on the Bill of Lading so containers can clear customs near their factory.</p>
        <p>However, under the Prime Minister's <strong>Decision 31/2026/QD-TTg</strong> (replacing Decision 23/2019/QD-TTg), doing so for restricted HS codes will trigger an immediate clearance bottleneck.</p>
        <h4>1. What Happens When Restricted Goods Are Consigned to an Inland ICD?</h4>
        <ul>
          <li>The VNACCS/VCIS electronic customs system <strong>automatically blocks</strong> the independent transit declaration (OLA).</li>
          <li>The shipping line cannot release the container for inland transit because the e-Manifest is locked to the ICD.</li>
          <li>The importer must file a manifest amendment and clear customs directly at the first seaport of entry—often incurring 5–7 days of storage and demurrage charges.</li>
        </ul>
        <h4>2. Three Legal Exemptions Allowed to Clear at Inland ICDs</h4>
        <ul>
          <li>Machinery, equipment, and raw materials imported directly for the factory's own <strong>Export Processing or Export Manufacturing</strong> operations.</li>
          <li>Shipments imported by certified <strong>Authorized Economic Operators (AEO)</strong>.</li>
          <li>Fixed-asset machinery imported under incentivized investment projects.</li>
        </ul>
        <h4>3. Four Actionable Safeguards</h4>
        <p>Always cross-check your 8-digit HS code against the Decision 31/2026 Annex before issuing shipping instructions, and ensure the Bill of Lading specifies the actual seaport of entry (Hai Phong Port / Cat Lai Port) whenever port-level clearance is mandatory.</p>
      `
    }
  },
  {
    id: "art-smart-port-edo-2026",
    pillar: "TN",
    pillarLabel: { vi: "Tin Ngành · Công Nghệ Cảng", en: "Regulatory News · Smart Port" },
    date: "10/11/2026",
    readTime: { vi: "5 phút đọc", en: "5 min read" },
    photoSlot: "aboutSpeaker",
    title: {
      vi: "Hệ sinh thái Cảng biển số (Smart Port) 2026: Lệnh giao hàng điện tử eDO, eEIR & Giám sát VASSCM 30 giây",
      en: "Smart Port Ecosystem 2026: Electronic Delivery Orders (eDO), Mobile eEIR & 30-Second VASSCM Gate Release"
    },
    excerpt: {
      vi: "Từ cảnh nhân viên hiện trường cầm xấp tiền mặt chạy qua 4 cửa ải mất 8 tiếng đồng hồ đến quy trình kích hoạt eDO & quét QR qua cổng Smart Gate chỉ trong 30 giây.",
      en: "How 100% API-connected eDO, cashless ePort payments, and AI OCR gate cameras cut container pickup time from 8 hours down to 30 seconds."
    },
    body: {
      vi: `
        <p>Trước đây, để lấy một container hàng nhập tại cảng, nhân viên hiện trường (Ops) phải cầm hồ sơ giấy và tiền mặt chạy qua 4 cửa ải: Lấy lệnh D/O giấy tại hãng tàu -> Đổi phiếu EIR tại thương vụ cảng -> Trình tờ khai mã vạch tại hải quan giám sát -> Đưa phiếu giấy cho tài xế vào bãi. Quy trình đó ngốn từ 4 đến 8 tiếng đồng hồ.</p>
        <h4>1. Ba bước ngoặt của Hệ sinh thái Cảng biển số 2026</h4>
        <ul>
          <li><strong>100% Lệnh giao hàng điện tử (eDO) liên thông API:</strong> Dữ liệu lệnh giao hàng truyền thẳng từ hãng tàu sang Cổng thông tin một cửa quốc gia và ePort. Chủ hàng nhận mã eDO qua email và kích hoạt trong 30 giây.</li>
          <li><strong>Thanh toán 24/7 & Phiếu eEIR mã QR trên di động:</strong> Phí nâng hạ, lưu bãi được gạch nợ tức thì; tài xế nhận mã QR eEIR ngay trên điện thoại.</li>
          <li><strong>Hệ thống VASSCM & Camera AI nhận diện biển số (OCR):</strong> Dữ liệu thông quan từ VNACCS đẩy thẳng sang VASSCM. Khi xe cont qua cổng Smart Gate, camera AI quét biển số xe và số container, mở barrier tự động.</li>
        </ul>
        <h4>2. Ba bước chuẩn hóa cho doanh nghiệp</h4>
        <p>1. Đăng ký tài khoản định danh doanh nghiệp trên ePort (Tân Cảng Sài Gòn, Cảng Hải Phòng, Gemalink) kèm phân quyền chữ ký số.<br>
        2. Liên kết tài khoản ngân hàng với cổng nộp thuế hải quan điện tử 24/7.<br>
        3. Lưu trữ bộ hồ sơ điện tử đồng bộ để phục vụ hậu kiểm bất kỳ lúc nào.</p>
      `,
      en: `
        <p>Traditionally, picking up an import container required field staff to spend 4–8 hours queuing with paper documents across shipping line offices, port billing counters, and customs supervision booths.</p>
        <h4>1. Three Breakthroughs of the 2026 Smart Port Ecosystem</h4>
        <ul>
          <li><strong>API-Connected Electronic Delivery Orders (eDO):</strong> Shipping lines transmit release data directly to the National Single Window and ePort.</li>
          <li><strong>Cashless 24/7 Billing & Mobile QR eEIR:</strong> Terminal handling charges are settled online and drivers receive QR gate passes on their smartphones.</li>
          <li><strong>Automated VASSCM Customs Supervision & AI OCR Gates:</strong> VNACCS pushes clearance status straight to the port's VASSCM system, allowing AI cameras to verify license plates and container numbers in 30 seconds.</li>
        </ul>`
    }
  },
  {
    id: "art-cv23913-hoa-chat-dncx",
    pillar: "CS",
    pillarLabel: { vi: "Case Study · Pháp Lý DNCX", en: "Case Study · EPE Compliance" },
    date: "08/11/2026",
    readTime: { vi: "7 phút đọc", en: "7 min read" },
    photoSlot: "customsAward",
    title: {
      vi: "Công văn 23913/CHQ-GSQL: Gỡ nút thắt vênh luật giấy phép nhập khẩu hóa chất vào Doanh nghiệp chế xuất (DNCX)",
      en: "Official Letter 23913/CHQ-GSQL: Resolving the Chemical Import Permit Conflict for Export Processing Enterprises (EPEs)"
    },
    excerpt: {
      vi: "Giải quyết điểm nghẽn giữa Luật Quản lý ngoại thương (khu phi thuế quan) và Nghị định 113/2017/NĐ-CP bằng cơ chế Bản cam kết sử dụng nội bộ và hậu kiểm tại xưởng.",
      en: "How Official Letter 23913/CHQ-GSQL bridges the Foreign Trade Law and Decree 113/2017 via Internal Usage Commitments for high-tech EPE manufacturers."
    },
    body: {
      vi: `
        <p>Thời gian qua, nhiều nhà máy sản xuất linh kiện điện tử, bán dẫn trong khu chế xuất (DNCX) rơi vào thế tiến thoái lưỡng nan khi nhập khẩu hóa chất dung môi phục vụ sản xuất: Khoản 1 Điều 59 <strong>Luật Quản lý ngoại thương 2017</strong> quy định không áp dụng biện pháp giấy phép ngoại thương với hàng từ nước ngoài đưa vào khu phi thuế quan (DNCX), nhưng <strong>Nghị định 113/2017/NĐ-CP</strong> (sửa đổi bởi NĐ 82/2022/NĐ-CP) lại yêu cầu giấy phép tiền chất/hóa chất hạn chế.</p>
        <h4>Giải pháp tháo gỡ từ Công văn 23913/CHQ-GSQL</h4>
        <ul>
          <li><strong>Ưu tiên nguyên tắc khu phi thuế quan:</strong> Hóa chất đưa từ nước ngoài vào DNCX chỉ để phục vụ sản xuất nội bộ, không bán ra thị trường nội địa.</li>
          <li><strong>Cơ chế Bản cam kết sử dụng nội bộ kèm MSDS:</strong> Cho phép DNCX nộp Bản cam kết sử dụng hóa chất đúng mục đích sản xuất nội bộ để giải phóng hàng nhanh tại cửa khẩu, tránh đứt gãy dây chuyền sản xuất.</li>
          <li><strong>Chuyển từ tiền kiểm sang hậu kiểm tại nhà xưởng:</strong> Kiểm tra điều kiện bồn chứa, kho an toàn và sổ định mức thực tế tại nhà máy.</li>
        </ul>
      `,
      en: `
        <p>High-tech and semiconductor Export Processing Enterprises (EPEs) recently faced a regulatory conflict between Article 59 of the <strong>2017 Law on Foreign Trade Management</strong> (exempting non-tariff zones from import licensing) and <strong>Decree 113/2017/ND-CP</strong> on restricted chemicals and industrial precursors.</p>
        <h4>Key Solutions in Official Letter 23913/CHQ-GSQL</h4>
        <ul>
          <li><strong>Non-Tariff Zone Principle:</strong> Chemicals imported by an EPE strictly for internal manufacturing do not enter domestic commerce.</li>
          <li><strong>Internal Usage Commitment + MSDS:</strong> Enables rapid port release while transitioning oversight to post-clearance facility inspections.</li>
        </ul>`
    }
  },
  {
    id: "art-tam-giac-vang-bcqt-m15",
    pillar: "HT",
    pillarLabel: { vi: "Hướng Dẫn Thực Hành · Thanh Khoản", en: "Practical Guide · Audit Defense" },
    date: "05/11/2026",
    readTime: { vi: "8 phút đọc", en: "8 min read" },
    photoSlot: "consultHost",
    title: {
      vi: "Kiểm tra sau thông quan DNCX cuối năm: Công thức Tam Giác Vàng bảo vệ Báo cáo quyết toán Mẫu 15/BCQT-NVL",
      en: "Year-End EPE Post-Clearance Audit: The Golden Triangle Formula for Form 15/BCQT-NVL Settlement"
    },
    excerpt: {
      vi: "Tránh kịch bản âm 80 tấn hạt nhựa trên kho thực tế dẫn tới ấn định thuế tiền tỷ. Hướng dẫn quy trình đối soát 3 bên Kho – Kế toán – XNK định kỳ hàng quý.",
      en: "Prevent multi-billion VND tax assessments caused by warehouse-accounting-customs inventory drift with this 3-step quarterly reconciliation SOP."
    },
    body: {
      vi: `
        <p>Trong vòng 90 ngày kể từ khi kết thúc năm tài chính, doanh nghiệp gia công, SXXK và DNCX phải nộp Báo cáo quyết toán tình hình sử dụng nguyên liệu, vật tư theo <strong>Mẫu số 15/BCQT-NVL</strong>. Sai lầm lớn nhất của 80% nhà máy là để 3 phòng ban (Kho – Kế toán – XNK) chạy độc lập suốt 12 tháng rồi mới ngồi cộng sổ.</p>
        <h4>Quy trình Tam Giác Vàng 3 bước bảo vệ doanh nghiệp</h4>
        <ul>
          <li><strong>Bước 1 — Đối soát chéo 3 bên theo Quý:</strong> Đặt bảng Nhập - Xuất - Tồn thực tế của Kho cạnh sổ tài khoản 152/155 của Kế toán và tờ khai E11/E15 - E42/E52 của XNK mỗi 3 tháng/lần.</li>
          <li><strong>Bước 2 — Bảng quy đổi Đơn vị tính (UOM Conversion Table) thống nhất:</strong> Khóa chặt tỷ lệ quy đổi từ đơn vị mua hàng/sản xuất (cuộn, thùng, chiếc) sang đơn vị khai báo hải quan (kg, mét vuông).</li>
          <li><strong>Bước 3 — Hồ sơ xuất hủy phế liệu, phế phẩm hợp lệ:</strong> Lập biên bản kiểm kê, phiếu cân và giám sát hủy phế phẩm định kỳ để trừ hợp lệ khỏi tồn kho sổ sách.</li>
        </ul>
      `,
      en: `
        <p>Within 90 days of fiscal year-end, Processing, Export Manufacturing, and EPE factories must submit their raw material settlement report (<strong>Form 15/BCQT-NVL</strong>). Waiting until month 12 to reconcile Warehouse, Accounting, and Customs data is the #1 trigger for heavy Post-Clearance Audit penalties.</p>
        <h4>The 3-Step Golden Triangle Reconciliation Protocol</h4>
        <ul>
          <li><strong>Step 1 — Quarterly 3-Way Cut-Off:</strong> Reconcile physical warehouse stock, ERP ledger accounts (152/155), and VNACCS declaration balances every quarter.</li>
          <li><strong>Step 2 — Locked UOM Conversion Matrix:</strong> Standardize conversion ratios between production units (rolls, pcs) and customs tariff units (kg, sqm).</li>
          <li><strong>Step 3 — Documented Scrap Write-Offs:</strong> Maintain signed scrap destruction and weighing certificates to legally deduct technical loss from book inventory.</li>
        </ul>`
    }
  }
];
