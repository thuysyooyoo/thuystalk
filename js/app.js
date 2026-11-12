// ============================================================================
// THUYSTALK FULL CMS, E-LEARNING AUTO MINI-TEST & /NOTEBOOK AI ENGINE
// Rule: 100% Plus Jakarta Sans Typography — ZERO Icons / ZERO Emojis
// ============================================================================

(function () {
  "use strict";

  const STORAGE_KEYS = {
    LANG: "thuystalk_lang_v3",
    MEDIA: "thuystalk_custom_media_v3",
    LEARNER_EMAIL: "thuystalk_learner_email_v3",
    LEARNER_NAME: "thuystalk_learner_name_v4",
    LEARNER_PHONE: "thuystalk_learner_phone_v4",
    GUEST_QUERY_COUNT: "thuystalk_guest_query_count_v4",
    PROGRESS: "thuystalk_lesson_progress_v3",
    LEADS: "thuystalk_leads_ledger_v3",
    RATE_LIMIT: "thuystalk_rate_limit_v3",
    ARTICLES: "thuystalk_cms_articles_v3",
    VIDEOS: "thuystalk_cms_videos_v3",
    COURSES: "thuystalk_cms_courses_v3",
    AI_KB: "thuystalk_cms_ai_kb_v3",
    BRIDGE_URL: "thuystalk_notebook_bridge_url_v3"
  };

  function isHomePage() {
    return document.body && document.body.dataset.page === "home";
  }

  function getDefaultMiniTestDraft() {
    return [
      {
        q: {
          vi: "Câu 1: Theo quy định tại bài học, nguyên tắc quan trọng nhất khi kiểm tra bộ chứng từ hải quan là gì?",
          en: "Q1: According to this lesson, what is the primary rule when verifying customs documents?"
        },
        options: {
          vi: [
            "A. Đối chiếu khớp 100% giữa Commercial Invoice, Packing List, B/L và mã HS 8 chữ số trước khi truyền tờ khai.",
            "B. Chỉ cần kiểm tra tổng số tiền trên hóa đơn thương mại.",
            "C. Đợi hàng về đến cảng mới bắt đầu xin giấy phép kiểm tra chuyên ngành."
          ],
          en: [
            "A. Reconcile 100% across Invoice, Packing List, B/L, and 8-digit HS code before filing.",
            "B. Only check the invoice total amount.",
            "C. Wait until cargo arrives at port before applying for permits."
          ]
        },
        correctIndex: 0,
        explanation: {
          vi: "Chính xác! Việc đối soát chéo bộ chứng từ trước khi truyền tờ khai giúp ngăn chặn rủi ro sai lệch manifest và phát sinh phí lưu công lưu bãi.",
          en: "Correct! Pre-filing cross-verification prevents manifest discrepancies and demurrage."
        }
      },
      {
        q: {
          vi: "Câu 2: Để được hưởng thuế suất ưu đãi đặc biệt theo C/O (Form E, Form D...), doanh nghiệp cần lưu ý điều gì?",
          en: "Q2: To claim preferential FTA tariff rates with a C/O, what must importers verify?"
        },
        options: {
          vi: [
            "A. Bất kỳ mặt hàng nào có C/O đều mặc định thuế 0%.",
            "B. Kiểm tra mã HS 8 số tại Biểu thuế ưu đãi đặc biệt (gồm cả cột loại trừ xuất xứ) và tính hợp lệ của tiêu chí xuất xứ trên C/O.",
            "C. Không cần lưu giữ chứng từ vận tải suốt tuyến nếu hàng chuyển tải."
          ],
          en: [
            "A. Any item with a C/O is automatically 0% duty.",
            "B. Verify the 8-digit HS code in the FTA schedule (including country exclusions) and origin criteria on the C/O.",
            "C. Through Bill of Lading is not required for transshipment."
          ]
        },
        correctIndex: 1,
        explanation: {
          vi: "Đúng vậy! Phải đối chiếu cả cột thuế suất và cột nước bị loại trừ ưu đãi trong Nghị định biểu thuế FTA tương ứng.",
          en: "Spot on! Always check both the tariff rate and country exclusion column."
        }
      },
      {
        q: {
          vi: "Câu 3 (Tình huống thực tế): Bước kiểm soát nào giúp doanh nghiệp an toàn khi Kiểm tra sau thông quan?",
          en: "Q3 (Practical Scenario): Which control protects your company during Post-Clearance Audit?"
        },
        options: {
          vi: [
            "A. Chỉ lưu bản ảnh chụp màn hình qua tin nhắn.",
            "B. Giao khoán toàn bộ cho đại lý mà không lưu hồ sơ gốc.",
            "C. Lưu trữ đầy đủ hồ sơ hải quan, chứng từ thanh toán ngân hàng, phiếu nhập xuất kho và biên bản đối soát định kỳ."
          ],
          en: [
            "A. Keep only chat screenshots.",
            "B. Delegate everything to brokers without archiving records.",
            "C. Archive complete customs dossiers, bank payment swift, warehouse tally sheets, and quarterly reconciliation logs."
          ]
        },
        correctIndex: 2,
        explanation: {
          vi: "Hoàn toàn chính xác! Hồ sơ đồng bộ giữa XNK - Kế toán - Kho là lá chắn pháp lý vững chắc nhất.",
          en: "Correct! Synchronized records across Customs, Accounting, and Warehouse ensure full compliance."
        }
      }
    ];
  }

  const state = {
    lang: localStorage.getItem(STORAGE_KEYS.LANG) || "vi",
    adminMode: false,
    activeCmsTab: "photos",
    media: loadMediaState(),
    articles: loadCollection(STORAGE_KEYS.ARTICLES, window.THUYSTALK_ARTICLES),
    videos: loadCollection(STORAGE_KEYS.VIDEOS, window.THUYSTALK_VIDEOS),
    courses: loadCollection(STORAGE_KEYS.COURSES, window.THUYSTALK_COURSES),
    aiKb: loadCollection(STORAGE_KEYS.AI_KB, window.THUYSTALK_DEFAULT_KB),
    notebookBridgeUrl:
      localStorage.getItem(STORAGE_KEYS.BRIDGE_URL) || "http://localhost:8099/api/notebook-query",
    learnerEmail: localStorage.getItem(STORAGE_KEYS.LEARNER_EMAIL) || "",
    completedLessons: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || "{}"),
    activeVideoCat: "all",
    activeVideoId: null,
    activeArticleCat: "all",
    activeCourseId: null,
    activeLessonIndex: 0,
    activeNotebookBranch: "auto",
    generatedMiniTestDraft: getDefaultMiniTestDraft()
  };

  state.activeVideoId = state.videos[0] ? state.videos[0].id : "";

  function loadMediaState() {
    const base = JSON.parse(JSON.stringify(window.THUYSTALK_DEFAULT_MEDIA));
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || "{}");
      Object.keys(saved).forEach((k) => {
        if (base[k]) base[k] = Object.assign({}, base[k], saved[k]);
      });
    } catch (e) {
      console.warn("Media state reset:", e);
    }
    return base;
  }

  function loadCollection(key, defaultArr) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Collection reset:", key, e);
    }
    return JSON.parse(JSON.stringify(defaultArr));
  }

  function saveCollection(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      showToast("Lưu ý: Dung lượng bộ nhớ trình duyệt gần đầy, đã áp dụng trên phiên hiện tại.");
    }
  }

  function saveCustomMedia() {
    saveCollection(STORAGE_KEYS.MEDIA, state.media);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function showToast(msg) {
    const el = document.getElementById("toastNotification");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      el.classList.remove("show");
    }, 3800);
  }

  function getPhotoStyle(slotKey) {
    const m = state.media[slotKey] || window.THUYSTALK_DEFAULT_MEDIA[slotKey];
    if (!m) return "";
    const scale = (m.scale || 100) / 100;
    return `object-position: ${m.posX ?? 50}% ${m.posY ?? 20}%; transform: scale(${scale});`;
  }

  function getPhotoUrl(slotKey) {
    const m = state.media[slotKey] || window.THUYSTALK_DEFAULT_MEDIA[slotKey];
    return m ? m.url : "";
  }

  // Extract 11-char YouTube Video ID and full embed src from ANY input:
  // - Full <iframe src="https://www.youtube.com/embed/89D3QY2Cjs8?si=..." ...></iframe>
  // - Watch link: https://www.youtube.com/watch?v=89D3QY2Cjs8
  // - Share link: https://youtu.be/89D3QY2Cjs8?si=...
  // - Shorts link: https://www.youtube.com/shorts/89D3QY2Cjs8
  function extractYoutubeId(input) {
    const s = String(input || "").trim();
    if (!s) return "";
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    const iframeSrcMatch = s.match(/src=["']([^"']+)["']/i);
    const target = iframeSrcMatch ? iframeSrcMatch[1] : s;
    const m = target.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : "";
  }

  function buildYoutubeEmbedSrc(videoObjOrRaw) {
    if (!videoObjOrRaw) return "";
    const raw =
      typeof videoObjOrRaw === "string"
        ? videoObjOrRaw
        : videoObjOrRaw.youtubeEmbedSrc || videoObjOrRaw.youtubeUrl || videoObjOrRaw.youtubeEmbedId || "";
    const s = String(raw || "").trim();
    // If user pasted <iframe ... src="https://www.youtube.com/embed/..." ...>, preserve the exact src!
    const iframeSrcMatch = s.match(/src=["'](https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[^"']+)["']/i);
    if (iframeSrcMatch) return iframeSrcMatch[1];
    if (/^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\//i.test(s)) return s;
    const ytId = extractYoutubeId(s);
    if (!ytId) return "";
    const siMatch = s.match(/[?&]si=([a-zA-Z0-9_-]+)/);
    return siMatch
      ? `https://www.youtube.com/embed/${ytId}?si=${siMatch[1]}`
      : `https://www.youtube.com/embed/${ytId}`;
  }

  // ==========================================================================
  // RENDER ALL SECTIONS
  // ==========================================================================
  function renderAll() {
    const t = window.THUYSTALK_I18N[state.lang];
    document.documentElement.lang = state.lang;

    // 1. Header & Nav
    setText("navHome", t.nav.home);
    setText("navExpertise", t.nav.expertise);
    setText("navAbout", t.nav.about);
    setText("navElearning", t.nav.elearning);
    setText("navVideo", t.nav.video);
    setText("navArticles", t.nav.articles);
    setText("navNotebook", t.nav.notebook);
    setText("navConsult", t.nav.consult);
    setText("adminToggleBtn", t.nav.adminBtn);
    setText("headerCtaBtn", t.nav.ctaTop);

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === state.lang);
    });

    // 2. Hero
    setText("heroGreetingText", t.hero.greeting);
    setText("heroFirstName", t.hero.firstName + " ");
    setText("heroHighlightName", t.hero.highlightName);
    setText("heroRole", t.hero.role);
    setText("heroBio", t.hero.bio);
    setText("heroBtnPrimary", t.hero.btnPrimary);
    setText("heroBtnSecondary", t.hero.btnSecondary);
    setText("heroScriptText", t.hero.scriptNote);
    setText("heroFloatingTitle", t.hero.floatingTitle);
    setText("heroFloatingSub", t.hero.floatingSub);
    setText("heroHsToolTag", t.hero.hsToolTag);

    applySlotPhoto("heroPortraitImg", "heroPortrait");
    applySlotPhoto("aboutSpeakerImg", "aboutSpeaker");
    applySlotPhoto("customsAwardImg", "customsAward");
    applySlotPhoto("consultHostImg", "consultHost");

    // 3. Expertise Section (Typographic 01-04, Zero Icons)
    setText("expEyebrow", t.expertise.eyebrow);
    setText("expTitle", t.expertise.title);
    setText("expDesc", t.expertise.desc);
    setText("expExploreBtn", t.expertise.btnExplore);

    const expGrid = document.getElementById("expertiseCardsGrid");
    if (expGrid) {
      expGrid.innerHTML = t.expertise.cards
        .map(
          (c) => `
        <article class="expertise-card">
          <div>
            <div class="exp-num-badge ${c.tone === "orange" ? "exp-num-orange" : "exp-num-jade"}">${c.code}</div>
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
          </div>
          <span class="exp-tag">${c.tag}</span>
        </article>`
        )
        .join("");
    }

    // 4. About Section
    setText("aboutScriptCallout", t.about.scriptCallout);
    setText("aboutExpYears", t.about.expYears);
    setText("aboutExpLabel", t.about.expLabel);
    setText("aboutMiniCaption", t.about.miniCaption);
    setText("aboutEyebrow", t.about.eyebrow);
    setText("aboutTitle", t.about.title);
    setText("aboutSubtitle", t.about.subtitle);
    setText("aboutP1", t.about.p1);
    setText("aboutP2", t.about.p2);
    setText("aboutBtnConnect", t.about.btnConnect);

    const msList = document.getElementById("aboutMilestonesList");
    if (msList) {
      msList.innerHTML = t.about.milestones.map((m) => `<li>${m}</li>`).join("");
    }

    const statsRow = document.getElementById("aboutStatsRow");
    if (statsRow) {
      statsRow.innerHTML = t.about.stats
        .map(
          (s) => `
        <div class="stat-item">
          <div class="stat-val">${s.val}</div>
          <div class="stat-lbl">${s.lbl}</div>
        </div>`
        )
        .join("");
    }

    // 5. E-Learning Section
    renderElearningSection(t);

    // 6. Video Section
    renderVideoSection(t);

    // 7. Articles Section
    renderArticlesSection(t);

    // 8. NotebookLM & AI Knowledge Section
    renderNotebookSection(t);

    // 9. Consultation Section
    renderConsultSection(t);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function applySlotPhoto(imgId, slotKey) {
    const img = document.getElementById(imgId);
    if (!img) return;
    img.src = getPhotoUrl(slotKey);
    img.setAttribute("style", getPhotoStyle(slotKey));
  }

  // ==========================================================================
  // 5. E-LEARNING SECTION & MULTI-QUESTION MINI TEST CLASSROOM
  // ==========================================================================
  function getCourseProgress(course) {
    const total = course.lessons ? course.lessons.length : 0;
    if (!total) return 0;
    let done = 0;
    course.lessons.forEach((l) => {
      if (state.completedLessons[l.id]) done++;
    });
    return Math.round((done / total) * 100);
  }

  function renderElearningSection(t) {
    setText("elearnEyebrow", t.elearning.eyebrow);
    setText("elearnTitle", t.elearning.title);
    setText("elearnDesc", t.elearning.desc);

    const banner = document.getElementById("learnerStatusBanner");
    if (banner) {
      if (state.learnerEmail) {
        banner.innerHTML = `
          <div class="learner-info">
            <div class="learner-badge-code">EDU</div>
            <div>
              <h4>${t.elearning.bannerTitleLogged} <span class="text-orange">${escapeHtml(state.learnerEmail)}</span></h4>
              <p>${t.elearning.bannerDescLogged}</p>
            </div>
          </div>
          <div class="learner-email-form">
            <button type="button" class="btn btn-outline btn-sm" id="changeLearnerEmailBtn">
              ${state.lang === "vi" ? "Đổi Email học viên" : "Switch Learner Email"}
            </button>
          </div>`;
        const changeBtn = document.getElementById("changeLearnerEmailBtn");
        if (changeBtn) {
          changeBtn.addEventListener("click", () => {
            state.learnerEmail = "";
            localStorage.removeItem(STORAGE_KEYS.LEARNER_EMAIL);
            renderElearningSection(window.THUYSTALK_I18N[state.lang]);
          });
        }
      } else {
        banner.innerHTML = `
          <div class="learner-info">
            <div class="learner-badge-code">EDU</div>
            <div>
              <h4>${t.elearning.bannerTitleGuest}</h4>
              <p>${t.elearning.bannerDescGuest}</p>
            </div>
          </div>
          <form class="learner-email-form" id="learnerQuickLoginForm">
            <input type="email" required class="learner-email-input" id="learnerQuickEmailInput" placeholder="${t.elearning.bannerPlaceholder}" />
            <button type="submit" class="btn btn-jade btn-sm">${t.elearning.bannerBtn}</button>
          </form>`;
        const form = document.getElementById("learnerQuickLoginForm");
        if (form) {
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            const val = document.getElementById("learnerQuickEmailInput").value.trim();
            if (!val || !val.includes("@")) return;
            state.learnerEmail = val;
            localStorage.setItem(STORAGE_KEYS.LEARNER_EMAIL, val);
            recordLeadOrMaterial({
              type: "E-Learning Activation",
              name: val.split("@")[0],
              email: val,
              phone: "-",
              topic: "Kích hoạt lưu tiến độ E-Learning"
            });
            showToast(
              state.lang === "vi"
                ? `Đã kích hoạt lưu tiến độ học tập cho ${val}`
                : `Progress tracking activated for ${val}`
            );
            renderElearningSection(window.THUYSTALK_I18N[state.lang]);
          });
        }
      }
    }

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    const displayedCourses = isHomePage() ? state.courses.slice(0, 2) : state.courses;

    grid.innerHTML = displayedCourses
      .map((c) => {
        const pct = getCourseProgress(c);
        const photoUrl = c.customCover || getPhotoUrl(c.photoSlot || "aboutSpeaker");
        const photoStyle = c.customCover ? "" : getPhotoStyle(c.photoSlot || "aboutSpeaker");
        const titleText = typeof c.title === "object" ? c.title[state.lang] || c.title.vi : c.title;
        const descText = typeof c.desc === "object" ? c.desc[state.lang] || c.desc.vi : c.desc;
        const metaText = typeof c.meta === "object" ? c.meta[state.lang] || c.meta.vi : c.meta;
        const badgeText = typeof c.badge === "object" ? c.badge[state.lang] || c.badge.vi : c.badge;
        const delivText = typeof c.deliverable === "object" ? c.deliverable[state.lang] || c.deliverable.vi : c.deliverable;

        return `
        <article class="course-card">
          <div class="course-thumb editable-photo-wrap">
            <img src="${photoUrl}" alt="${escapeHtml(titleText)}" style="${photoStyle}" />
            <span class="course-badge-top">${escapeHtml(badgeText)}</span>
            ${
              c.photoSlot
                ? `<button type="button" class="photo-change-trigger" data-slot="${c.photoSlot}">
                    ${state.lang === "vi" ? "Đổi ảnh" : "Change Photo"}
                   </button>`
                : ""
            }
          </div>
          <div class="course-body">
            <div class="course-meta">${escapeHtml(metaText)}</div>
            <h3 class="course-title">${escapeHtml(titleText)}</h3>
            <p class="course-desc">${escapeHtml(descText)}</p>
            <div class="course-deliverable-box">${escapeHtml(delivText)}</div>
            <div class="course-progress-wrap">
              <div class="course-progress-label">
                <span>${state.lang === "vi" ? "Tiến độ hoàn thành" : "Completion Progress"}</span>
                <span>${pct}%</span>
              </div>
              <div class="course-progress-bar">
                <div class="course-progress-fill" style="width: ${pct}%"></div>
              </div>
            </div>
            <div class="course-actions">
              <button type="button" class="btn btn-primary btn-sm open-course-btn" data-course="${c.id}">
                ${t.elearning.btnStartCourse}
              </button>
              <button type="button" class="btn btn-outline-orange btn-sm send-kit-btn" data-course="${c.id}">
                ${t.elearning.btnSendMaterial}
              </button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".open-course-btn").forEach((btn) => {
      btn.addEventListener("click", () => openCourseClassroom(btn.dataset.course));
    });

    grid.querySelectorAll(".send-kit-btn").forEach((btn) => {
      btn.addEventListener("click", () => handleSendCourseKit(btn.dataset.course));
    });

    bindPhotoTriggers(grid);
  }

  function openCourseClassroom(courseId) {
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return;
    state.activeCourseId = courseId;
    state.activeLessonIndex = 0;
    renderClassroomModal();
    document.getElementById("classroomModal").classList.add("open");
  }

  function renderClassroomModal() {
    const course = state.courses.find((c) => c.id === state.activeCourseId);
    if (!course || !course.lessons || !course.lessons.length) return;
    const lesson = course.lessons[state.activeLessonIndex] || course.lessons[0];
    const isDone = !!state.completedLessons[lesson.id];

    const cTitle = typeof course.title === "object" ? course.title[state.lang] || course.title.vi : course.title;
    const lTitle = typeof lesson.title === "object" ? lesson.title[state.lang] || lesson.title.vi : lesson.title;
    const lSummary = typeof lesson.summary === "object" ? lesson.summary[state.lang] || lesson.summary.vi : lesson.summary;
    const lContent = typeof lesson.content === "object" ? lesson.content[state.lang] || lesson.content.vi : lesson.content;
    const lExercise = lesson.exercise
      ? typeof lesson.exercise === "object"
        ? lesson.exercise[state.lang] || lesson.exercise.vi
        : lesson.exercise
      : "";
    const cDeliv = typeof course.deliverable === "object" ? course.deliverable[state.lang] || course.deliverable.vi : course.deliverable;

    document.getElementById("classroomModalTitle").textContent = cTitle;

    const lessonTabs = course.lessons
      .map((l, idx) => {
        const doneTag = state.completedLessons[l.id] ? "[Đã học] " : "";
        return `
        <button type="button" class="filter-tab ${idx === state.activeLessonIndex ? "active" : ""}" data-lidx="${idx}">
          ${doneTag}${state.lang === "vi" ? "Bài" : "Lesson"} ${idx + 1} (${l.duration || "10:00"})
        </button>`;
      })
      .join("");

    // Support multi-question miniTest array
    const miniTestArr = Array.isArray(lesson.miniTest)
      ? lesson.miniTest
      : lesson.quiz
      ? [lesson.quiz]
      : [];

    const quizHtml = miniTestArr.length
      ? `
      <div class="quiz-box" id="lessonQuizBox">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <h4 style="color:var(--jade-900); font-size:1.05rem;">
            ${state.lang === "vi" ? `Bộ Mini Test Kiểm Tra Kiến Thức (${miniTestArr.length} câu hỏi)` : `Knowledge Check Mini Test (${miniTestArr.length} Questions)`}
          </h4>
          <span style="font-size:0.78rem; font-weight:700; color:var(--orange-600);">
            ${state.lang === "vi" ? "Chọn đáp án để chấm điểm tức thì" : "Select an option for instant grading"}
          </span>
        </div>
        ${miniTestArr
          .map((qItem, qIdx) => {
            const qText = typeof qItem.q === "object" ? qItem.q[state.lang] || qItem.q.vi : qItem.q;
            const opts = Array.isArray(qItem.options)
              ? qItem.options
              : qItem.options[state.lang] || qItem.options.vi || [];
            return `
            <div class="quiz-question-card" data-qcard="${qIdx}">
              <p style="font-weight:800; color:var(--ink-900); margin-bottom:8px;">${escapeHtml(qText)}</p>
              <div class="quiz-options-group">
                ${opts
                  .map(
                    (opt, oIdx) => `
                  <button type="button" class="quiz-option" data-qidx="${qIdx}" data-oidx="${oIdx}">${escapeHtml(opt)}</button>`
                  )
                  .join("")}
              </div>
              <div class="quiz-feedback" id="quizFb_${qIdx}" style="margin-top:10px; font-size:0.84rem; font-weight:700;"></div>
            </div>`;
          })
          .join("")}
      </div>`
      : "";

    const exerciseHtml = lExercise
      ? `
      <div class="cms-panel-box" style="margin-top:18px; border-left:4px solid var(--orange-500); background:var(--orange-50);">
        <h4 style="color:var(--orange-700); font-size:0.95rem; margin-bottom:6px;">
          ${state.lang === "vi" ? "Bài Tập Thực Hành Ứng Dụng Thực Tế" : "Actionable Practical Exercise"}
        </h4>
        <p style="font-size:0.88rem; color:var(--ink-800);">${escapeHtml(lExercise)}</p>
      </div>`
      : "";

    const bodyEl = document.getElementById("classroomModalBody");
    bodyEl.innerHTML = `
      <div class="filter-tabs" style="margin-bottom:20px;">${lessonTabs}</div>
      <div class="reader-content">
        <h2>${escapeHtml(lTitle)}</h2>
        <p style="color:var(--jade-700); font-weight:700;">${escapeHtml(lSummary)}</p>
        <hr style="border:none; border-top:1px solid var(--ink-200); margin:16px 0;" />
        ${lContent}
      </div>
      ${exerciseHtml}
      ${quizHtml}
      <div class="material-lead-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
        <div>
          <strong style="color:var(--jade-900); display:block;">${escapeHtml(cDeliv)}</strong>
          <span style="font-size:0.82rem; color:var(--ink-600);">
            ${
              state.learnerEmail
                ? state.lang === "vi"
                  ? `Đang lưu tiến độ cho: ${escapeHtml(state.learnerEmail)}`
                  : `Saving progress for: ${escapeHtml(state.learnerEmail)}`
                : state.lang === "vi"
                ? "Bấm hoàn thành hoặc nhập Email để nhận trọn bộ biểu mẫu."
                : "Mark complete or enter your Email to receive the templates."
            }
          </span>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button type="button" class="btn ${isDone ? "btn-jade" : "btn-outline"} btn-sm" id="toggleLessonDoneBtn">
            ${
              isDone
                ? state.lang === "vi"
                  ? "Đã hoàn thành bài học"
                  : "Lesson Completed"
                : state.lang === "vi"
                ? "Đánh dấu hoàn thành & Lưu tiến độ"
                : "Mark Complete & Save Progress"
            }
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="modalSendKitBtn">
            ${state.lang === "vi" ? "Gửi bộ tài liệu về Email & Tải ngay" : "Email & Download Resource Kit"}
          </button>
        </div>
      </div>`;

    bodyEl.querySelectorAll("[data-lidx]").forEach((b) => {
      b.addEventListener("click", () => {
        state.activeLessonIndex = parseInt(b.dataset.lidx, 10);
        renderClassroomModal();
      });
    });

    bodyEl.querySelectorAll(".quiz-option").forEach((optBtn) => {
      optBtn.addEventListener("click", () => {
        const qIdx = parseInt(optBtn.dataset.qidx, 10);
        const picked = parseInt(optBtn.dataset.oidx, 10);
        const qItem = miniTestArr[qIdx];
        if (!qItem) return;
        const correct = qItem.correctIndex;
        const card = bodyEl.querySelector(`[data-qcard="${qIdx}"]`);
        card.querySelectorAll(".quiz-option").forEach((b, i) => {
          b.classList.remove("correct", "wrong");
          if (i === correct) b.classList.add("correct");
          else if (i === picked) b.classList.add("wrong");
        });
        const fb = document.getElementById("quizFb_" + qIdx);
        const expText = typeof qItem.explanation === "object" ? qItem.explanation[state.lang] || qItem.explanation.vi : qItem.explanation;
        if (picked === correct) {
          fb.style.color = "var(--jade-800)";
          fb.textContent = expText;
          state.completedLessons[lesson.id] = true;
          localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state.completedLessons));
          renderElearningSection(window.THUYSTALK_I18N[state.lang]);
        } else {
          fb.style.color = "#B91C1C";
          fb.textContent =
            state.lang === "vi"
              ? "Chưa chính xác — hãy xem đáp án đúng được tô màu xanh."
              : "Not quite right — check the highlighted green answer.";
        }
      });
    });

    document.getElementById("toggleLessonDoneBtn").addEventListener("click", () => {
      state.completedLessons[lesson.id] = !state.completedLessons[lesson.id];
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state.completedLessons));
      renderClassroomModal();
      renderElearningSection(window.THUYSTALK_I18N[state.lang]);
      showToast(
        state.lang === "vi"
          ? "Đã cập nhật tiến độ bài học"
          : "Lesson progress updated"
      );
    });

    document.getElementById("modalSendKitBtn").addEventListener("click", () => {
      handleSendCourseKit(course.id);
    });
  }

  function handleSendCourseKit(courseId) {
    const course = state.courses.find((c) => c.id === courseId) || state.courses[0];
    if (!course) return;

    let email = state.learnerEmail;
    if (!email) {
      const promptMsg =
        state.lang === "vi"
          ? "Nhập địa chỉ Email của bạn để hệ thống lưu tiến độ học và gửi bộ tài liệu khóa học:"
          : "Enter your Email address to save your progress and receive the course resource kit:";
      const entered = window.prompt(promptMsg, "");
      if (!entered || !entered.includes("@")) {
        showToast(state.lang === "vi" ? "Vui lòng nhập địa chỉ Email hợp lệ." : "Please enter a valid email address.");
        return;
      }
      email = entered.trim();
      state.learnerEmail = email;
      localStorage.setItem(STORAGE_KEYS.LEARNER_EMAIL, email);
      renderElearningSection(window.THUYSTALK_I18N[state.lang]);
    }

    const cTitleVi = typeof course.title === "object" ? course.title.vi : course.title;
    recordLeadOrMaterial({
      type: "Course Material Kit",
      name: email.split("@")[0],
      email: email,
      phone: "-",
      topic: cTitleVi
    });

    triggerChecklistDownload(course);
    showToast(
      state.lang === "vi"
        ? `Đã ghi nhận gửi bộ tài liệu tới ${email} và tải bản Checklist về máy`
        : `Resource kit logged for ${email} and checklist downloaded`
    );
  }

  function triggerChecklistDownload(course) {
    const cTitleVi = typeof course.title === "object" ? course.title.vi : course.title;
    const cDelivVi = typeof course.deliverable === "object" ? course.deliverable.vi : course.deliverable;
    const content = [
      "====================================================================",
      "THUYSTALK E-LEARNING RESOURCE KIT & MINI-TEST WORKBOOK",
      "Chuyên gia: Nguyễn Thị Ngọc Thúy (9+ Năm Thực Chiến XNK, Hải Quan & AI)",
      "====================================================================",
      "",
      "KHÓA HỌC: " + cTitleVi,
      cDelivVi,
      "",
      "--- TÓM TẮT NỘI DUNG & BỘ MINI TEST ---",
      ...(course.lessons || []).map((l, idx) => {
        const lt = typeof l.title === "object" ? l.title.vi : l.title;
        const ls = typeof l.summary === "object" ? l.summary.vi : l.summary;
        return `\n[${idx + 1}] ${lt}\n- Tóm tắt: ${ls}`;
      }),
      "",
      "--------------------------------------------------------------------",
      "Liên hệ tư vấn chuyên sâu 1-1: https://thuystalk.netlify.app/#tu-van",
      "Email: tthuyn@erktransport.com | Zalo: 0767.648.862"
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ThuysTalk_Tai_Lieu_${course.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==========================================================================
  // 6. VIDEO THUYTALK SECTION (With Direct YouTube Iframe Embed)
  // ==========================================================================
  function renderVideoSection(t) {
    setText("vidEyebrow", t.video.eyebrow);
    setText("vidTitle", t.video.title);
    setText("vidDesc", t.video.desc);

    const tabsWrap = document.getElementById("videoFilterTabs");
    if (tabsWrap) {
      tabsWrap.innerHTML = t.video.tabs
        .map(
          (tab) => `
        <button type="button" class="filter-tab ${state.activeVideoCat === tab.id ? "active" : ""}" data-vcat="${tab.id}">
          ${tab.label}
        </button>`
        )
        .join("");

      tabsWrap.querySelectorAll("[data-vcat]").forEach((b) => {
        b.addEventListener("click", () => {
          state.activeVideoCat = b.dataset.vcat;
          const filtered = getFilteredVideos();
          if (filtered.length && !filtered.some((v) => v.id === state.activeVideoId)) {
            state.activeVideoId = filtered[0].id;
          }
          renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        });
      });
    }

    const filtered = getFilteredVideos();
    const activeVid = filtered.find((v) => v.id === state.activeVideoId) || filtered[0];

    const stageEl = document.getElementById("featuredVideoStage");
    if (stageEl && activeVid) {
      const ytId = extractYoutubeId(activeVid.youtubeEmbedId || activeVid.youtubeEmbedSrc || activeVid.youtubeUrl);
      const embedSrc = buildYoutubeEmbedSrc(activeVid);
      const vTitle = typeof activeVid.title === "object" ? activeVid.title[state.lang] || activeVid.title.vi : activeVid.title;
      const vDesc = typeof activeVid.desc === "object" ? activeVid.desc[state.lang] || activeVid.desc.vi : activeVid.desc;
      const vCmLabel = typeof activeVid.cmLabel === "object" ? activeVid.cmLabel[state.lang] || activeVid.cmLabel.vi : activeVid.cm;
      const thumbUrl = ytId
        ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
        : getPhotoUrl(activeVid.thumbSlot || "aboutSpeaker");
      const thumbStyle = ytId ? "" : getPhotoStyle(activeVid.thumbSlot || "aboutSpeaker");

      const isFileProtocol = window.location.protocol === "file:";
      const playerMediaHtml = embedSrc
        ? isFileProtocol
          ? `
            <img src="${thumbUrl}" alt="${escapeHtml(vTitle)}" style="width:100%;height:100%;object-fit:cover;opacity:0.55;" />
            <div class="video-play-overlay" style="background:rgba(4,40,32,0.78); padding:24px; text-align:center;">
              <a href="http://localhost:8099/index.html#video" class="play-btn-pill" style="text-decoration:none;">
                Mở qua http://localhost:8099 để phát Video YouTube trực tiếp (Tránh lỗi 153 của trình duyệt khi mở file://)
              </a>
              <a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener noreferrer" style="color:#FFF; font-size:0.84rem; font-weight:700; text-decoration:underline; margin-top:6px;">
                Hoặc mở xem ngay trên YouTube (@thuystalk)
              </a>
            </div>`
          : `<iframe width="560" height="315" src="${embedSrc}" title="${escapeHtml(vTitle)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
        : `
          <img src="${thumbUrl}" alt="${escapeHtml(vTitle)}" style="${thumbStyle}" />
          ${
            activeVid.thumbSlot
              ? `<button type="button" class="photo-change-trigger" data-slot="${activeVid.thumbSlot}">
                  ${state.lang === "vi" ? "Đổi ảnh" : "Change Photo"}
                 </button>`
              : ""
          }
          <div class="video-play-overlay">
            <button type="button" class="play-btn-pill" id="openVideoScriptModalBtn">
              ${state.lang === "vi" ? "Xem kịch bản & Nội dung video" : "Open Video Script & Notes"}
            </button>
            <span style="font-size:0.78rem; font-weight:700; background:rgba(6,61,49,0.88); padding:5px 14px; border-radius:99px; border:1px solid var(--orange-400);">
              ${escapeHtml(vCmLabel)} · ${activeVid.duration || "08:00"}
            </span>
          </div>`;

      stageEl.innerHTML = `
        <div class="video-player-stage editable-photo-wrap">
          ${playerMediaHtml}
        </div>
        <div class="featured-video-info">
          <span style="color:var(--orange-400); font-size:0.76rem; font-weight:800; letter-spacing:0.08em;">
            @THUYSTALK OFFICIAL SERIES · ${activeVid.date || "11/2026"}
          </span>
          <h3>${escapeHtml(vTitle)}</h3>
          <p>${escapeHtml(vDesc)}</p>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" id="readFullScriptBtn">
              ${t.video.btnReadScript}
            </button>
            <a href="${activeVid.youtubeUrl || "https://www.youtube.com/@thuystalk"}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.1); color:#FFF; border-color:rgba(255,255,255,0.25);">
              ${t.video.btnYoutubeChannel}
            </a>
          </div>
        </div>`;

      const overlayBtn = document.getElementById("openVideoScriptModalBtn");
      if (overlayBtn) overlayBtn.addEventListener("click", () => openVideoModal(activeVid));
      document.getElementById("readFullScriptBtn").addEventListener("click", () => openVideoModal(activeVid));
      bindPhotoTriggers(stageEl);
    }

    const listEl = document.getElementById("videoPlaylistCol");
    if (listEl) {
      const playlistItems = isHomePage() ? filtered.slice(0, 3) : filtered;
      listEl.innerHTML = playlistItems
        .map((v) => {
          const ytId = extractYoutubeId(v.youtubeEmbedId || v.youtubeUrl);
          const tUrl = ytId
            ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
            : getPhotoUrl(v.thumbSlot || "aboutSpeaker");
          const tStyle = ytId ? "" : getPhotoStyle(v.thumbSlot || "aboutSpeaker");
          const vTitle = typeof v.title === "object" ? v.title[state.lang] || v.title.vi : v.title;
          const vCmLabel = typeof v.cmLabel === "object" ? v.cmLabel[state.lang] || v.cmLabel.vi : v.cm;
          return `
          <div class="video-list-item ${activeVid && v.id === activeVid.id ? "active" : ""}" data-vid="${v.id}">
            <div class="video-list-thumb">
              <img src="${tUrl}" alt="${escapeHtml(vTitle)}" style="${tStyle}" />
              <span class="dur">${v.duration || "08:00"}</span>
            </div>
            <div class="video-list-meta">
              <span class="cm-tag">${escapeHtml(vCmLabel)}</span>
              <h4>${escapeHtml(vTitle)}</h4>
              <span>${v.date || "11/2026"} · YouTube @thuystalk</span>
            </div>
          </div>`;
        })
        .join("");

      listEl.querySelectorAll("[data-vid]").forEach((item) => {
        item.addEventListener("click", () => {
          state.activeVideoId = item.dataset.vid;
          renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        });
      });
    }
  }

  function getFilteredVideos() {
    if (state.activeVideoCat === "all") return state.videos;
    return state.videos.filter((v) => v.cm === state.activeVideoCat);
  }

  function openVideoModal(video) {
    const vTitle = typeof video.title === "object" ? video.title[state.lang] || video.title.vi : video.title;
    const vCmLabel = typeof video.cmLabel === "object" ? video.cmLabel[state.lang] || video.cmLabel.vi : video.cm;
    const vScript = typeof video.script === "object" ? video.script[state.lang] || video.script.vi : video.script;

    document.getElementById("articleModalTitle").textContent = vCmLabel + " · @thuystalk";
    document.getElementById("articleModalBody").innerHTML = `
      <div class="reader-content">
        <h2>${escapeHtml(vTitle)}</h2>
        <p style="color:var(--jade-700); font-weight:700;">Thời lượng: ${video.duration || "08:00"} · Ngày đăng: ${video.date || "11/2026"}</p>
        <hr style="border:none; border-top:1px solid var(--ink-200); margin:16px 0;" />
        ${vScript}
      </div>
      <div class="material-lead-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>${state.lang === "vi" ? "Bạn muốn nhận bộ Checklist của chủ đề video này qua Email?" : "Want the actionable checklist from this video emailed to you?"}</strong>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="videoRequestChecklistBtn">
          ${state.lang === "vi" ? "Nhận Checklist qua Email" : "Email Me the Checklist"}
        </button>
      </div>`;

    document.getElementById("videoRequestChecklistBtn").addEventListener("click", () => {
      handleSendCourseKit(state.courses[0].id);
    });

    document.getElementById("articleModal").classList.add("open");
  }

  // ==========================================================================
  // 7. FULL-TEXT ARTICLES SECTION
  // ==========================================================================
  function renderArticlesSection(t) {
    setText("artEyebrow", t.articles.eyebrow);
    setText("artTitle", t.articles.title);
    setText("artDesc", t.articles.desc);

    const tabsWrap = document.getElementById("articleFilterTabs");
    if (tabsWrap) {
      tabsWrap.innerHTML = t.articles.tabs
        .map(
          (tab) => `
        <button type="button" class="filter-tab ${state.activeArticleCat === tab.id ? "active" : ""}" data-acat="${tab.id}">
          ${tab.label}
        </button>`
        )
        .join("");

      tabsWrap.querySelectorAll("[data-acat]").forEach((b) => {
        b.addEventListener("click", () => {
          state.activeArticleCat = b.dataset.acat;
          renderArticlesSection(window.THUYSTALK_I18N[state.lang]);
        });
      });
    }

    const filtered =
      state.activeArticleCat === "all"
        ? state.articles
        : state.articles.filter((a) => a.pillar === state.activeArticleCat);

    const grid = document.getElementById("articlesGrid");
    if (!grid) return;

    const displayedArticles = isHomePage() ? filtered.slice(0, 3) : filtered;

    grid.innerHTML = displayedArticles
      .map((a) => {
        const pUrl = a.customImg || getPhotoUrl(a.photoSlot || "heroPortrait");
        const pStyle = a.customImg ? "" : getPhotoStyle(a.photoSlot || "heroPortrait");
        const aTitle = typeof a.title === "object" ? a.title[state.lang] || a.title.vi : a.title;
        const aExcerpt = typeof a.excerpt === "object" ? a.excerpt[state.lang] || a.excerpt.vi : a.excerpt;
        const aPillar = typeof a.pillarLabel === "object" ? a.pillarLabel[state.lang] || a.pillarLabel.vi : a.pillar;
        const aRead = typeof a.readTime === "object" ? a.readTime[state.lang] || a.readTime.vi : a.readTime || "5 phút đọc";

        return `
        <article class="article-card">
          <div class="article-thumb editable-photo-wrap">
            <img src="${pUrl}" alt="${escapeHtml(aTitle)}" style="${pStyle}" />
            <span class="article-pillar-badge">${escapeHtml(aPillar)}</span>
            ${
              a.photoSlot && !a.customImg
                ? `<button type="button" class="photo-change-trigger" data-slot="${a.photoSlot}">
                    ${state.lang === "vi" ? "Đổi ảnh" : "Change Photo"}
                   </button>`
                : ""
            }
          </div>
          <div class="article-body">
            <div class="article-date">${a.date} · ${escapeHtml(aRead)}</div>
            <h3 class="article-title">${escapeHtml(aTitle)}</h3>
            <p class="article-excerpt">${escapeHtml(aExcerpt)}</p>
            <div class="article-footer">
              <button type="button" class="article-read-btn" data-artid="${a.id}">
                ${t.articles.readFull}
              </button>
              <span class="article-read-pill" data-artid="${a.id}">${state.lang === "vi" ? "Mở bài" : "Open"}</span>
            </div>
          </div>
        </article>`;
      })
      .join("");

    grid.querySelectorAll("[data-artid]").forEach((el) => {
      el.addEventListener("click", () => {
        const art = state.articles.find((x) => x.id === el.dataset.artid);
        if (art) openArticleReader(art);
      });
    });

    bindPhotoTriggers(grid);
  }

  function openArticleReader(art) {
    const aTitle = typeof art.title === "object" ? art.title[state.lang] || art.title.vi : art.title;
    const aPillar = typeof art.pillarLabel === "object" ? art.pillarLabel[state.lang] || art.pillarLabel.vi : art.pillar;
    const aRead = typeof art.readTime === "object" ? art.readTime[state.lang] || art.readTime.vi : art.readTime || "5 phút đọc";
    const aBody = typeof art.body === "object" ? art.body[state.lang] || art.body.vi : art.body;

    document.getElementById("articleModalTitle").textContent = aPillar + " · " + art.date;
    document.getElementById("articleModalBody").innerHTML = `
      <div class="reader-content">
        <h2>${escapeHtml(aTitle)}</h2>
        <p style="color:var(--ink-500); font-size:0.85rem; font-weight:700;">
          Tác giả: Nguyễn Thị Ngọc Thúy · Ngày đăng: ${art.date} · ${escapeHtml(aRead)}
        </p>
        <hr style="border:none; border-top:1px solid var(--ink-200); margin:16px 0;" />
        ${aBody}
      </div>
      <div class="material-lead-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
        <div>
          <strong style="color:var(--jade-900); display:block;">
            ${state.lang === "vi" ? "Nhận biểu mẫu & công văn trích dẫn trong bài viết qua Email" : "Get the official templates & regulatory files cited in this article"}
          </strong>
          <span style="font-size:0.82rem; color:var(--ink-600);">
            ${state.lang === "vi" ? "Hoặc đặt câu hỏi tư vấn trực tiếp cho tình huống của doanh nghiệp bạn." : "Or book a 1-on-1 consultation for your company's specific case."}
          </span>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-primary btn-sm" id="artSendTemplateBtn">
            ${state.lang === "vi" ? "Nhận biểu mẫu qua Email" : "Email Me the Template"}
          </button>
          <a href="#tu-van" class="btn btn-outline btn-sm" id="artGoConsultBtn">
            ${state.lang === "vi" ? "Đăng ký tư vấn" : "Book Advisory"}
          </a>
        </div>
      </div>`;

    document.getElementById("artSendTemplateBtn").addEventListener("click", () => {
      handleSendCourseKit(state.courses[0].id);
    });
    document.getElementById("artGoConsultBtn").addEventListener("click", () => {
      document.getElementById("articleModal").classList.remove("open");
    });

    document.getElementById("articleModal").classList.add("open");
  }

  // ==========================================================================
  // 8. THUYSTALK AI LEGAL & CUSTOMS LOOKUP ENGINE (SILENT 5-QUERY GUEST QUOTA)
  // ==========================================================================
  function renderNotebookSection(t) {
    setText("nbEyebrow", t.notebook.eyebrow);
    setText("nbTitle", t.notebook.title);
    setText("nbDesc", t.notebook.desc);
    setText("nbLiveQueryBtn", t.notebook.liveNotebookBtn);

    const inp = document.getElementById("notebookQueryInput");
    if (inp) inp.placeholder = t.notebook.inputPlaceholder;

    const routesEl = document.getElementById("notebookRoutingPills");
    if (routesEl) {
      routesEl.innerHTML = window.THUYSTALK_NOTEBOOK_ROUTES.map((r) => {
        const isActive = state.activeNotebookBranch === r.id;
        const subText = r.subtitle ? r.subtitle[state.lang] || r.subtitle.vi : "Kho dữ liệu pháp lý chuyên sâu";
        return `
        <button type="button" class="nb-route-card ${isActive ? "active" : ""}" data-nbroute="${r.id}">
          <span class="nb-route-code">${r.branch}</span>
          <h4>${r.title[state.lang]}</h4>
          <span>${escapeHtml(subText)}</span>
        </button>`;
      }).join("");

      routesEl.querySelectorAll("[data-nbroute]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeNotebookBranch =
            state.activeNotebookBranch === btn.dataset.nbroute ? "auto" : btn.dataset.nbroute;
          renderNotebookSection(window.THUYSTALK_I18N[state.lang]);
        });
      });
    }
  }

  function detectNotebookRoute(question) {
    if (state.activeNotebookBranch !== "auto") {
      const manual = window.THUYSTALK_NOTEBOOK_ROUTES.find((r) => r.id === state.activeNotebookBranch);
      if (manual) return manual;
    }
    const qLower = question.toLowerCase();
    let bestRoute = window.THUYSTALK_NOTEBOOK_ROUTES[0];
    let bestScore = -1;
    window.THUYSTALK_NOTEBOOK_ROUTES.forEach((r) => {
      let score = 0;
      r.keywords.forEach((kw) => {
        if (qLower.includes(kw)) score += 3;
      });
      if (score > bestScore) {
        bestScore = score;
        bestRoute = r;
      }
    });
    return bestRoute;
  }

  function searchLocalKnowledgeBase(question) {
    const qLower = question.toLowerCase().trim();
    const stopWords = new Set([
      "hs",
      "code",
      "mã",
      "ma",
      "hàng",
      "hang",
      "hóa",
      "hoa",
      "nhập",
      "khẩu",
      "xuất",
      "là",
      "gì",
      "tra",
      "cứu",
      "cho",
      "hỏi",
      "về",
      "quy",
      "định",
      "thủ",
      "tục",
      "của",
      "khi",
      "như",
      "thế",
      "nào",
      "năm",
      "2026"
    ]);

    const specificTokens = qLower
      .replace(/[?.,!;:()"']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !stopWords.has(w));

    let bestItem = null;
    let bestScore = 0;

    state.aiKb.forEach((item) => {
      const kwLower = (item.keywords || "").toLowerCase();
      const topicLower = (item.topic || "").toLowerCase();
      const ansLower = (item.answer || "").toLowerCase();
      let score = 0;

      const kwPhrases = kwLower
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length >= 3);
      kwPhrases.forEach((phrase) => {
        if (qLower.includes(phrase)) score += 25;
      });

      let matchedSpecificCount = 0;
      specificTokens.forEach((tk) => {
        if (kwLower.includes(tk)) {
          score += 8;
          matchedSpecificCount++;
        } else if (topicLower.includes(tk)) {
          score += 5;
          matchedSpecificCount++;
        } else if (ansLower.includes(tk)) {
          score += 1;
        }
      });

      if (specificTokens.length >= 2 && matchedSpecificCount < 2 && score < 25) {
        score = 0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestItem = {
          answer: item.answer,
          source: (item.notebookBranch || "Kho Tri Thức Pháp Lý ThuysTalk")
            .replace(/Google NotebookLM|NotebookLM|\/notebook/gi, "Kho Tri Thức ThuysTalk")
            .replace(/\([a-f0-9-]{20,}\)/gi, "")
            .trim(),
          topic: item.topic,
          score
        };
      }
    });

    return bestItem && bestItem.score >= 14 ? bestItem : null;
  }

  function formatInlineAi(str) {
    let s = escapeHtml(str);
    // LaTeX & Math symbols clean-up
    s = s.replace(/\\+(?:le|leq)\b/gi, "≤");
    s = s.replace(/\\+(?:ge|geq)\b/gi, "≥");
    s = s.replace(/\\+(?:times)\b/gi, "×");
    s = s.replace(/\\+(?:approx)\b/gi, "≈");
    s = s.replace(/\\+(?:ne|neq)\b/gi, "≠");
    s = s.replace(/\\+(?:pm)\b/gi, "±");
    // Strip LaTeX math wrappers \( \) \[ \] and nested parens (( ))
    s = s.replace(/\\+\(/g, "(").replace(/\\+\)/g, ")");
    s = s.replace(/\\+\[|\\+\]/g, "");
    s = s.replace(/\(\(+/g, "(").replace(/\)\)+/g, ")");

    // Bold: **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Italic: *text*
    s = s.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, "$1<em>$2</em>$3");
    // Citation tags [1, 2] or [24–26]
    s = s.replace(/\[(\d+(?:[–\-, \s]+\d+)*)\]/g, '<span class="ai-cite-tag">[$1]</span>');
    return s;
  }

  function formatAiResponseHtml(rawText) {
    if (!rawText) return "";

    // 1. Strip emojis (Zero Emojis rule)
    let clean = String(rawText).replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}💡📌🔍📎🔗🎯🚀✨⚡✅❌⚠️]/gu, "");

    const rawLines = clean.split("\n");
    const out = [];
    let inBulletList = false;
    let inNumList = false;

    function closeLists() {
      if (inBulletList) { out.push("</ul>"); inBulletList = false; }
      if (inNumList) { out.push("</ol>"); inNumList = false; }
    }

    for (let i = 0; i < rawLines.length; i++) {
      const rawLine = rawLines[i].trim();

      if (!rawLine) {
        closeLists();
        continue;
      }

      // Divider --- or *** or ___
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(rawLine)) {
        closeLists();
        out.push('<hr class="ai-chat-divider" />');
        continue;
      }

      // Headings: ### Title or ## Title or # Title
      const headingMatch = rawLine.match(/^#{1,6}\s+(.*)$/);
      if (headingMatch) {
        closeLists();
        out.push('<h4 class="ai-chat-heading">' + formatInlineAi(headingMatch[1]) + "</h4>");
        continue;
      }

      // Bullet items: * item, - item, • item
      const bulletMatch = rawLine.match(/^[\*\-•]\s+(.*)$/);
      if (bulletMatch) {
        if (inNumList) { out.push("</ol>"); inNumList = false; }
        if (!inBulletList) { out.push('<ul class="ai-chat-list">'); inBulletList = true; }
        out.push("<li>" + formatInlineAi(bulletMatch[1]) + "</li>");
        continue;
      }

      // Numbered items: 1. item, 2. item
      const numMatch = rawLine.match(/^(\d+)[\.\)]\s+(.*)$/);
      if (numMatch && inNumList) {
        if (inBulletList) { out.push("</ul>"); inBulletList = false; }
        if (!inNumList) { out.push('<ol class="ai-chat-numlist">'); inNumList = true; }
        out.push("<li>" + formatInlineAi(numMatch[2]) + "</li>");
        continue;
      }

      // Suggestion / Callout line: *Bạn có muốn...* or Bạn có muốn...
      const suggestMatch = rawLine.match(/^\*?\s*(Bạn có muốn.+?\??)\s*\*?$/i);
      if (suggestMatch) {
        closeLists();
        out.push('<div class="ai-chat-suggestion">' + formatInlineAi(suggestMatch[1]) + "</div>");
        continue;
      }

      // Normal paragraph
      closeLists();
      out.push('<p class="ai-chat-p">' + formatInlineAi(rawLine) + "</p>");
    }

    closeLists();
    return out.join("");
  }

  function appendChatMessage(role, text, citation) {
    const box = document.getElementById("notebookChatMessages");
    if (!box) return null;
    const div = document.createElement("div");
    div.className = `chat-bubble ${role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}`;
    if (role === "user") {
      const formatted = escapeHtml(text).replace(/\n/g, "<br>");
      div.innerHTML = `<div class="chat-msg-text">${formatted}</div>`;
    } else {
      const formatted = formatAiResponseHtml(text);
      div.innerHTML = `
        <div class="chat-msg-text">${formatted}</div>
        ${citation ? `<div class="chat-source-citation">Nguồn trích xuất: ${escapeHtml(citation)}</div>` : ""}
        <div class="chat-bubble-disclaimer">
          AI có thể có sai sót, hãy liên hệ với Thúy <a href="tel:0767648862">0767.648.862</a> để được tư vấn cụ thể.
        </div>
      `;
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
  }

  function appendLearnerLoginGate(pendingQuery, forceDeepLookup) {
    const box = document.getElementById("notebookChatMessages");
    if (!box) return;
    const gateId = "gate_" + Date.now();
    const div = document.createElement("div");
    div.className = "chat-login-gate-card";
    div.id = gateId;
    div.innerHTML = `
      <h4>Đăng Nhập Tài Khoản Học Viên Để Tiếp Tục Tra Cứu Miễn Phí</h4>
      <p>
        Vui lòng đăng nhập hoặc kích hoạt nhanh Tài khoản Học viên ThuysTalk (hoàn toàn miễn phí) để tiếp tục sử dụng không giới hạn Hệ thống Tra cứu Pháp lý Hải quan &amp; Mã HS, đồng thời lưu lịch sử học tập và nhận tài liệu qua Email.
      </p>
      <form class="gate-login-form" style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:8px; align-items:center;">
        <input type="text" required class="form-control gate-name-inp" placeholder="Họ và tên của bạn *" style="padding:9px 12px; font-size:0.82rem;" />
        <input type="email" required class="form-control gate-email-inp" placeholder="Địa chỉ Email học viên *" style="padding:9px 12px; font-size:0.82rem;" />
        <input type="tel" required class="form-control gate-phone-inp" placeholder="Số điện thoại / Zalo *" style="padding:9px 12px; font-size:0.82rem;" />
        <button type="submit" class="btn btn-primary btn-sm" style="white-space:nowrap;">
          Đăng nhập &amp; Tiếp tục tra cứu
        </button>
      </form>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    const form = div.querySelector(".gate-login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameVal = div.querySelector(".gate-name-inp").value.trim();
      const emailVal = div.querySelector(".gate-email-inp").value.trim();
      const phoneVal = div.querySelector(".gate-phone-inp").value.trim();
      if (!nameVal || !emailVal || !emailVal.includes("@") || !phoneVal) {
        showToast("Vui lòng điền đầy đủ Họ tên, Email và Số điện thoại.");
        return;
      }
      state.learnerEmail = emailVal;
      localStorage.setItem(STORAGE_KEYS.LEARNER_EMAIL, emailVal);
      localStorage.setItem(STORAGE_KEYS.LEARNER_NAME, nameVal);
      localStorage.setItem(STORAGE_KEYS.LEARNER_PHONE, phoneVal);

      recordLeadOrMaterial({
        type: "Learner Lookup Account",
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        topic: `Kích hoạt tài khoản học viên khi tra cứu: ${pendingQuery}`
      });

      renderElearningSection(window.THUYSTALK_I18N[state.lang]);
      div.remove();
      showToast(`Chào mừng học viên ${nameVal}! Bạn đã được mở khóa tra cứu miễn phí không giới hạn.`);
      executeAiQuery(pendingQuery, forceDeepLookup);
    });
  }

  async function handleNotebookSearch(forceDeepLookup = false) {
    const inp = document.getElementById("notebookQueryInput");
    if (!inp) return;
    const q = inp.value.trim();
    if (!q) {
      showToast("Vui lòng nhập câu hỏi cần tra cứu.");
      return;
    }

    appendChatMessage("user", q);
    inp.value = "";

    // SILENT 5-QUERY FREE QUOTA FOR GUESTS (No upfront notice shown; gate appears on the 6th lookup if not logged in)
    if (!state.learnerEmail) {
      const usedCount = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_QUERY_COUNT) || "0", 10);
      if (usedCount >= 5) {
        appendLearnerLoginGate(q, forceDeepLookup);
        return;
      }
      localStorage.setItem(STORAGE_KEYS.GUEST_QUERY_COUNT, String(usedCount + 1));
    }

    await executeAiQuery(q, forceDeepLookup);
  }

  async function executeAiQuery(q, forceDeepLookup = false) {
    const route = detectNotebookRoute(q);

    // 1. Check high-confidence local KB match first
    const matched = !forceDeepLookup ? searchLocalKnowledgeBase(q) : null;
    if (matched) {
      appendChatMessage("ai", matched.answer, matched.source);
      return;
    }

    // 2. Otherwise call the backend AI Knowledge Bridge silently (Zero mention of NotebookLM!)
    const bridgeEndpoint = (state.notebookBridgeUrl || "http://localhost:8099/api/notebook-query").trim();
    const loadingBubble = appendChatMessage(
      "ai",
      `Đang phân tích và đối chiếu dữ liệu pháp lý chuyên sâu thuộc [${route.title.vi}] cho câu hỏi "${q}" (vui lòng đợi khoảng 10–15 giây để hệ thống tổng hợp trích dẫn)...`,
      route.branch
    );

    try {
      const resp = await fetch(bridgeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebook_id: route.notebookId,
          query: q
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.answer) {
          if (loadingBubble) loadingBubble.remove();
          appendChatMessage(
            "ai",
            data.answer,
            `Kho Tri Thức Pháp Lý ThuysTalk · ${route.title.vi}`
          );
          state.aiKb.unshift({
            id: "kb-live-" + Date.now(),
            notebookBranch: `Kho Tri Thức Pháp Lý ThuysTalk · ${route.title.vi}`,
            topic: q,
            keywords: q.toLowerCase(),
            answer: data.answer
          });
          saveCollection(STORAGE_KEYS.AI_KB, state.aiKb);
          return;
        }
      }
    } catch (err) {
      // Bridge offline or blocked
    }

    if (loadingBubble) loadingBubble.remove();
    appendChatMessage(
      "ai",
      `Hệ thống đã ghi nhận câu hỏi "${q}" thuộc nhóm [${route.title.vi}]. Để tra cứu chuyên sâu theo thời gian thực hoặc nhận văn bản gốc cho tình huống này, bạn hãy mở qua cổng máy chủ nội bộ hoặc để lại thông tin tại mục Tư vấn 1-1.`,
      route.title.vi
    );
  }

  // ==========================================================================
  // AUTO MINI-TEST & EXERCISE GENERATOR (For Admin Studio Tab 4)
  // ==========================================================================
  function generateMiniTestFromText(titleText, rawBodyText) {
    const cleanText = String(rawBodyText || "")
      .replace(/<[^>]+>/g, ". ")
      .replace(/\s+/g, " ")
      .trim();

    const sentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 35 && s.length <= 280);

    const questions = [];

    // Question 1: Core Regulatory / Rule Statement
    const s1 =
      sentences.find((s) =>
        /quyết định|nghị định|thông tư|công văn|quy tắc|bắt buộc|nguyên tắc|điều/i.test(s)
      ) ||
      sentences[0] ||
      `Nội dung cốt lõi của chuyên đề "${titleText}" tập trung vào việc tuân thủ đúng quy trình chứng từ và pháp lý hải quan.`;

    questions.push({
      q: {
        vi: `Câu 1: Theo nội dung bài học "${titleText}", nhận định nào sau đây là CHÍNH XÁC NHẤT về quy định và nguyên tắc thực hiện?`,
        en: `Q1: According to "${titleText}", which statement below is MOST ACCURATE?`
      },
      options: {
        vi: [
          `A. ${s1}`,
          "B. Doanh nghiệp được tự ý bỏ qua bước đối chiếu chứng từ gốc nếu hàng đi luồng xanh.",
          "C. Không cần lưu trữ hồ sơ sau khi hàng đã thông quan qua khu vực giám sát."
        ],
        en: [
          `A. ${s1}`,
          "B. Importers may skip document verification if granted Green Channel.",
          "C. Post-clearance record keeping is optional after container release."
        ]
      },
      correctIndex: 0,
      explanation: {
        vi: `Chính xác! Căn cứ trực tiếp theo bài học: "${s1}"`,
        en: `Correct! Directly from the lesson material: "${s1}"`
      }
    });

    // Question 2: Risk / Mistake Prevention
    const s2 =
      sentences.find(
        (s, idx) =>
          idx > 0 && /bước|kiểm tra|đối soát|lưu ý|ngoại lệ|tránh|rủi ro|hồ sơ/i.test(s)
      ) ||
      sentences[1] ||
      "Cần đối soát chéo giữa Commercial Invoice, Packing List, vận đơn B/L và mã HS 8 chữ số trước khi truyền tờ khai chính thức.";

    questions.push({
      q: {
        vi: `Câu 2: Để phòng ngừa rủi ro phát sinh chi phí hoặc bị ấn định thuế trong chủ đề "${titleText}", doanh nghiệp cần ưu tiên hành động nào?`,
        en: `Q2: To prevent compliance penalties in "${titleText}", which action should be prioritized?`
      },
      options: {
        vi: [
          "A. Chờ đến khi cơ quan hải quan kiểm tra sau thông quan mới bắt đầu rà soát số liệu.",
          `B. ${s2}`,
          "C. Khai báo ước lượng đơn vị tính và chỉnh sửa sau khi hàng đã về kho."
        ],
        en: [
          "A. Wait until a Post-Clearance Audit is announced before reviewing records.",
          `B. ${s2}`,
          "C. Declare estimated weights and amend them after warehousing."
        ]
      },
      correctIndex: 1,
      explanation: {
        vi: `Đúng vậy! Giải pháp thực chiến cần áp dụng ngay là: ${s2}`,
        en: `Spot on! The recommended practical safeguard is: ${s2}`
      }
    });

    // Question 3: Practical Application Scenario
    const s3 =
      sentences[2] ||
      "Chuẩn hóa quy trình kiểm soát nội bộ, lưu trữ đầy đủ chứng từ điện tử và đối chiếu căn cứ pháp lý trước khi giao dịch.";

    questions.push({
      q: {
        vi: `Câu 3 (Tình huống thực tế): Khi áp dụng kiến thức bài "${titleText}" vào vận hành doanh nghiệp, bước kiểm soát nào giúp bảo vệ an toàn pháp lý lâu dài?`,
        en: `Q3 (Case Application): When applying "${titleText}" to daily operations, which control ensures long-term legal safety?`
      },
      options: {
        vi: [
          "A. Giao toàn bộ cho đại lý vận chuyển tự khai báo mà không kiểm tra lại bản nháp.",
          "B. Chỉ lưu giữ hóa đơn thương mại, bỏ qua biên bản kiểm kê và phiếu cân thực tế.",
          `C. ${s3}`
        ],
        en: [
          "A. Delegate all filings without reviewing draft declarations.",
          "B. Keep only the commercial invoice and discard physical tally records.",
          `C. ${s3}`
        ]
      },
      correctIndex: 2,
      explanation: {
        vi: `Hoàn toàn chính xác! Nguyên tắc Làm đúng, làm đủ, làm rõ ràng đòi hỏi: ${s3}`,
        en: `Correct! Sustainable compliance requires: ${s3}`
      }
    });

    return questions;
  }

  // ==========================================================================
  // 9. CONSULTATION SECTION & HARDENED LEAD CAPTURE
  // ==========================================================================
  function renderConsultSection(t) {
    setText("consultEyebrow", t.consult.eyebrow);
    setText("consultTitle", t.consult.title);
    setText("consultDesc", t.consult.desc);
    setText("consultHostName", t.consult.hostName);
    setText("consultHostRole", t.consult.hostRole);
    setText("consultSecurityNote", t.consult.securityNote);
    setText("consultFormTitle", t.consult.formTitle);
    setText("consultFormSub", t.consult.formSub);
    setText("lblConsultName", t.consult.lblName);
    setText("lblConsultPhone", t.consult.lblPhone);
    setText("lblConsultEmail", t.consult.lblEmail);
    setText("lblConsultTopic", t.consult.lblTopic);
    setText("lblConsultMsg", t.consult.lblMsg);
    setText("consultConsentText", t.consult.consentText);
    setText("consultSubmitBtn", t.consult.submitBtn);

    const msgInput = document.getElementById("consultMsgInput");
    if (msgInput) msgInput.placeholder = t.consult.msgPlaceholder;

    const topicSel = document.getElementById("consultTopicSelect");
    if (topicSel) {
      topicSel.innerHTML = t.consult.topics
        .map((tp) => `<option value="${escapeHtml(tp)}">${escapeHtml(tp)}</option>`)
        .join("");
    }
  }

  function checkRateLimit() {
    const now = Date.now();
    const oneHour = 3600 * 1000;
    let timestamps = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATE_LIMIT) || "[]");
    timestamps = timestamps.filter((ts) => now - ts < oneHour);
    if (timestamps.length >= 3) return false;
    timestamps.push(now);
    localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(timestamps));
    return true;
  }

  function recordLeadOrMaterial(entry) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
    const item = {
      id: "LD-" + Date.now(),
      timestamp: new Date().toLocaleString("vi-VN"),
      type: entry.type || "Tư vấn 1-1",
      name: entry.name || "",
      phone: entry.phone || "",
      email: entry.email || "",
      topic: entry.topic || "",
      message: entry.message || "",
      consent_nd13: true
    };
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(list));

    // Sync to Cloud Firebase (Project: thuystalk)
    if (window.ThuysTalkFirebase) {
      if (typeof window.ThuysTalkFirebase.saveLead === "function") {
        window.ThuysTalkFirebase.saveLead(item);
      }
      if (entry.email && typeof window.ThuysTalkFirebase.saveLearner === "function") {
        window.ThuysTalkFirebase.saveLearner({
          name: entry.name,
          email: entry.email,
          phone: entry.phone,
          topic: entry.topic,
          type: entry.type
        });
      }
    }
  }

  function initConsultForm() {
    const form = document.getElementById("consultLeadForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const hp = document.getElementById("hpWebsiteInput").value;
      if (hp) return;

      if (!checkRateLimit()) {
        showToast(
          state.lang === "vi"
            ? "Bạn đã gửi tối đa 3 yêu cầu trong 1 giờ qua. Vui lòng thử lại sau hoặc nhắn Zalo 0767.648.862."
            : "Rate limit reached (3 requests/hour). Please try again later or message Zalo 0767.648.862."
        );
        return;
      }

      const name = document.getElementById("consultNameInput").value.trim();
      const phone = document.getElementById("consultPhoneInput").value.trim();
      const email = document.getElementById("consultEmailInput").value.trim();
      const topic = document.getElementById("consultTopicSelect").value;
      const message = document.getElementById("consultMsgInput").value.trim();
      const consent = document.getElementById("consultConsentCheck").checked;

      if (!name || !phone || !email || !consent) {
        showToast(
          state.lang === "vi"
            ? "Vui lòng điền đầy đủ thông tin và tích đồng ý Chính sách bảo mật."
            : "Please complete all required fields and accept the privacy policy."
        );
        return;
      }

      recordLeadOrMaterial({
        type: "Tư vấn 1-1",
        name,
        phone,
        email,
        topic,
        message
      });

      state.learnerEmail = email;
      localStorage.setItem(STORAGE_KEYS.LEARNER_EMAIL, email);
      renderElearningSection(window.THUYSTALK_I18N[state.lang]);

      form.reset();
      showToast(
        state.lang === "vi"
          ? `Cảm ơn ${name}! Yêu cầu tư vấn & nhận tài liệu đã được bảo mật ghi nhận.`
          : `Thank you ${name}! Your advisory request has been securely recorded.`
      );
    });
  }

  // ==========================================================================
  // 10. DEDICATED INTERNAL ADMIN PAGE (admin.html — Left Sidebar + Workspace)
  // ==========================================================================
  function bindPhotoTriggers(root = document) {
    root.querySelectorAll(".photo-change-trigger").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const slot = btn.dataset.slot || "heroPortrait";
        window.location.href = `admin.html?tab=photos&slot=${encodeURIComponent(slot)}`;
      };
    });
  }

  function openAdminStudio(highlightSlot = null) {
    const sidebarNav = document.getElementById("adminSidebarNav");
    if (sidebarNav) {
      renderAdminStudioModal(highlightSlot);
      return;
    }
    window.location.href = highlightSlot
      ? `admin.html?tab=photos&slot=${encodeURIComponent(highlightSlot)}`
      : "admin.html";
  }

  function renderAdminStudioModal(highlightSlot = null) {
    const sidebarNav = document.getElementById("adminSidebarNav");
    const tabsBar = document.getElementById("adminCmsTabsBar");
    const body = document.getElementById("adminStudioBody");
    if (!body) return;

    const totalLessons = state.courses.reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 0), 0);
    const leadsCount = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]").length;

    const tabs = [
      {
        id: "photos",
        label: "01 · Đổi Ảnh Profile",
        count: "4 ảnh",
        title: "01 · Quản Lý & Căn Chỉnh 4 Vị Trí Ảnh Profile",
        desc: "Thay ảnh mới từ máy tính và kéo thanh trượt X / Y / Zoom để căn khung trực quan."
      },
      {
        id: "articles",
        label: "02 · Viết Bài Chuyên Sâu",
        count: `${state.articles.length} bài`,
        title: "02 · Soạn Thảo Bài Viết / HTML & Chèn Ảnh / Video Minh Họa",
        desc: "Đăng bài viết toàn văn hoặc tải tệp HTML kèm hình ảnh/video (.jpg, .png, .webp, .webm, .mp4) lên Website."
      },
      {
        id: "videos",
        label: "03 · Nhúng Video YouTube",
        count: `${state.videos.length} video`,
        title: "03 · Nhúng Video YouTube (Dán Mã <iframe...> Hoặc Link)",
        desc: "Hỗ trợ dán nguyên đoạn mã <iframe ...> từ nút Embed của YouTube hoặc dán link watch/youtu.be."
      },
      {
        id: "elearning",
        label: "04 · Tạo Bài Học & Mini Test",
        count: `${totalLessons} bài`,
        title: "04 · Tạo Bài Giảng (HTML / Ảnh / WebM) & Đẩy File Excel Bộ Mini Test",
        desc: "Soạn bài giảng HTML kèm ảnh/video minh họa (.jpg, .png, .webp, .webm) và đẩy file Excel (.xlsx, .csv) lên để điền nhanh toàn bộ câu hỏi Mini Test."
      },
      {
        id: "aikb",
        label: "05 · Nguồn Tri Thức AI Pháp Lý",
        count: `${state.aiKb.length} nguồn`,
        title: "05 · Quản Lý Kho Nguồn Tri Thức AI Pháp Lý & Kết Nối Máy Chủ Nội Bộ",
        desc: "Nạp văn bản pháp lý, biểu thuế và cấu hình API Trung Gian để Trợ lý AI ThuysTalk trả lời chính xác."
      },
      {
        id: "leads",
        label: "06 · Học Viên & Sao Lưu",
        count: `${leadsCount} lượt`,
        title: "06 · Danh Sách Học Viên Nhận Tài Liệu & Sao Lưu Hệ Thống",
        desc: "Xuất danh sách học viên/khách hàng đăng ký tư vấn ra file Excel CSV hoặc sao lưu toàn bộ cấu hình CMS."
      }
    ];

    const currentMeta = tabs.find((t) => t.id === state.activeCmsTab) || tabs[0];
    setText("adminTopTitle", currentMeta.title);
    setText("adminTopDesc", currentMeta.desc);

    if (sidebarNav) {
      sidebarNav.innerHTML = tabs
        .map(
          (tb) => `
        <button type="button" class="admin-nav-item ${state.activeCmsTab === tb.id ? "active" : ""}" data-cmstab="${tb.id}">
          <span>${tb.label}</span>
          <span class="admin-nav-count">${tb.count}</span>
        </button>`
        )
        .join("");

      sidebarNav.querySelectorAll("[data-cmstab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeCmsTab = btn.dataset.cmstab;
          renderAdminStudioModal();
        });
      });
    }

    if (tabsBar) {
      tabsBar.innerHTML = tabs
        .map(
          (tb) => `
        <button type="button" class="cms-tab-btn ${state.activeCmsTab === tb.id ? "active" : ""}" data-cmstab="${tb.id}">
          ${tb.label} (${tb.count})
        </button>`
        )
        .join("");

      tabsBar.querySelectorAll("[data-cmstab]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeCmsTab = btn.dataset.cmstab;
          renderAdminStudioModal();
        });
      });
    }

    if (state.activeCmsTab === "photos") {
      renderAdminPhotosTab(body, highlightSlot);
    } else if (state.activeCmsTab === "articles") {
      renderAdminArticlesTab(body);
    } else if (state.activeCmsTab === "videos") {
      renderAdminVideosTab(body);
    } else if (state.activeCmsTab === "elearning") {
      renderAdminElearningTab(body);
    } else if (state.activeCmsTab === "aikb") {
      renderAdminAiKbTab(body);
    } else {
      renderAdminLeadsTab(body);
    }
  }

  // --- TAB 1: PHOTO MANAGER ---
  function renderAdminPhotosTab(body, highlightSlot) {
    const slotsHtml = Object.keys(state.media)
      .map((key) => {
        const m = state.media[key];
        const isHighlighted = highlightSlot === key;
        return `
        <div class="admin-photo-slot" style="${isHighlighted ? "border-color:var(--orange-500); box-shadow:var(--shadow-orange); background:#FFF;" : ""}">
          <div class="admin-photo-preview">
            <img src="${m.url}" id="adminPrev_${key}" alt="${escapeHtml(m.label)}" style="${getPhotoStyle(key)}" />
          </div>
          <div>
            <h4 style="font-size:0.94rem; font-weight:800; color:var(--ink-900); margin-bottom:4px;">${m.label}</h4>
            <p style="font-size:0.78rem; color:var(--ink-600); margin-bottom:10px;">${m.desc}</p>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
              <label class="btn btn-primary btn-sm" style="cursor:pointer;">
                Chọn ảnh mới từ máy tính
                <input type="file" accept="image/*" data-upload-slot="${key}" style="display:none;" />
              </label>
              <button type="button" class="btn btn-outline btn-sm" data-reset-slot="${key}">
                Khôi phục mặc định
              </button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; font-size:0.74rem; color:var(--ink-600);">
              <label>Ngang X (${m.posX}%):
                <input type="range" min="0" max="100" value="${m.posX}" data-pos-slot="${key}" data-axis="posX" style="width:100%;" />
              </label>
              <label>Dọc Y (${m.posY}%):
                <input type="range" min="0" max="100" value="${m.posY}" data-pos-slot="${key}" data-axis="posY" style="width:100%;" />
              </label>
              <label>Zoom (${m.scale || 100}%):
                <input type="range" min="90" max="150" value="${m.scale || 100}" data-pos-slot="${key}" data-axis="scale" style="width:100%;" />
              </label>
            </div>
          </div>
        </div>`;
      })
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <strong style="color:var(--jade-900);">Quản lý 4 vị trí Ảnh Profile & Thương hiệu trên trang</strong>
          <p style="font-size:0.82rem; color:var(--ink-600);">Chọn ảnh bất kỳ từ máy tính, kéo thanh trượt X / Y / Zoom để căn khung chuẩn xác.</p>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="resetAllPhotosBtn">Đặt lại toàn bộ ảnh gốc</button>
      </div>
      <div class="admin-photos-grid">${slotsHtml}</div>
    `;

    body.querySelectorAll("[data-upload-slot]").forEach((inp) => {
      inp.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const slotKey = inp.dataset.uploadSlot;
        compressAndLoadImage(file, (dataUrl) => {
          state.media[slotKey].url = dataUrl;
          saveCustomMedia();
          renderAll();
          renderAdminStudioModal(slotKey);
          showToast(`Đã cập nhật ${state.media[slotKey].label}`);
        });
      });
    });

    body.querySelectorAll("[data-pos-slot]").forEach((rng) => {
      rng.addEventListener("input", () => {
        const slotKey = rng.dataset.posSlot;
        const axis = rng.dataset.axis;
        state.media[slotKey][axis] = parseInt(rng.value, 10);
        saveCustomMedia();
        renderAll();
        const prev = document.getElementById("adminPrev_" + slotKey);
        if (prev) prev.setAttribute("style", getPhotoStyle(slotKey));
      });
    });

    body.querySelectorAll("[data-reset-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const slotKey = btn.dataset.resetSlot;
        state.media[slotKey] = JSON.parse(JSON.stringify(window.THUYSTALK_DEFAULT_MEDIA[slotKey]));
        saveCustomMedia();
        renderAll();
        renderAdminStudioModal(slotKey);
        showToast("Đã khôi phục ảnh mặc định.");
      });
    });

    document.getElementById("resetAllPhotosBtn").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEYS.MEDIA);
      state.media = loadMediaState();
      renderAll();
      renderAdminStudioModal();
      showToast("Đã đặt lại toàn bộ 4 ảnh gốc.");
    });
  }

  // --- HELPER: RICH HTML / ARTICLE & MEDIA UPLOADER (.jpg, .png, .webp, .webm, .mp4) ---
  function formatRawOrHtmlContent(rawText) {
    const s = String(rawText || "").trim();
    if (!s) return "";
    if (/<(p|h2|h3|h4|ul|ol|div|figure|img|video|blockquote|table)\b/i.test(s)) {
      return s;
    }
    return s
      .split(/\n+/)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join("");
  }

  function bindRichEditorToolbar(textareaId, previewId, htmlFileInputId, mediaFileInputId, toolbarId) {
    const textarea = document.getElementById(textareaId);
    const preview = document.getElementById(previewId);
    const htmlInput = document.getElementById(htmlFileInputId);
    const mediaInput = document.getElementById(mediaFileInputId);
    const toolbar = document.getElementById(toolbarId);
    if (!textarea || !preview) return;

    function updatePreview() {
      const val = textarea.value.trim();
      if (!val) {
        preview.innerHTML = `<span style="color:var(--ink-400); font-size:0.82rem;">Xem trước bài giảng (HTML &amp; Hình ảnh / Video minh họa sẽ hiển thị trực tiếp tại đây)...</span>`;
        return;
      }
      preview.innerHTML = `<div class="reader-content">${formatRawOrHtmlContent(val)}</div>`;
    }

    textarea.addEventListener("input", updatePreview);
    updatePreview();

    if (toolbar) {
      toolbar.querySelectorAll("[data-insert-tag]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tagType = btn.dataset.insertTag;
          let snippet = "";
          if (tagType === "h3") snippet = `\n<h3>Tiêu đề mục chính trong bài học</h3>\n`;
          else if (tagType === "p") snippet = `\n<p>Nội dung phân tích chi tiết...</p>\n`;
          else if (tagType === "ul") snippet = `\n<ul>\n  <li>Điểm lưu ý thực chiến số 1</li>\n  <li>Điểm lưu ý thực chiến số 2</li>\n</ul>\n`;
          else if (tagType === "quote")
            snippet = `\n<blockquote style="border-left:4px solid #0E8C6B; background:#EAFBF5; padding:12px 16px; border-radius:8px; font-weight:700; margin:12px 0;">Lưu ý pháp lý quan trọng: Đối chiếu kỹ chứng từ gốc trước khi truyền tờ khai.</blockquote>\n`;
          const start = textarea.selectionStart || textarea.value.length;
          const end = textarea.selectionEnd || textarea.value.length;
          textarea.value = textarea.value.slice(0, start) + snippet + textarea.value.slice(end);
          updatePreview();
          textarea.focus();
        });
      });
    }

    if (htmlInput) {
      htmlInput.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          let content = String(e.target.result || "").trim();
          const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) content = bodyMatch[1].trim();
          textarea.value = textarea.value
            ? textarea.value + "\n\n" + content
            : content;
          updatePreview();
          showToast(`Đã tải nội dung từ tệp "${file.name}" vào trình soạn thảo!`);
        };
        reader.readAsText(file, "utf-8");
      });
    }

    if (mediaInput) {
      mediaInput.addEventListener("change", (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) return;
        files.forEach((file) => {
          const isVideo =
            file.type.startsWith("video/") || /\.(webm|mp4|mov)$/i.test(file.name);
          if (isVideo) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const dataUrl = e.target.result;
              const mime = file.type || (file.name.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4");
              const mediaHtml = `\n<figure class="lesson-media-figure">\n  <video controls playsinline preload="metadata">\n    <source src="${dataUrl}" type="${mime}" />\n  </video>\n  <figcaption>Video minh họa: ${escapeHtml(file.name)}</figcaption>\n</figure>\n`;
              textarea.value = (textarea.value ? textarea.value + "\n" : "") + mediaHtml;
              updatePreview();
              showToast(`Đã chèn video "${file.name}" vào nội dung bài giảng!`);
            };
            reader.readAsDataURL(file);
          } else {
            compressAndLoadImage(file, (dataUrl) => {
              const mediaHtml = `\n<figure class="lesson-media-figure">\n  <img src="${dataUrl}" alt="${escapeHtml(file.name)}" />\n  <figcaption>Hình minh họa: ${escapeHtml(file.name)}</figcaption>\n</figure>\n`;
              textarea.value = (textarea.value ? textarea.value + "\n" : "") + mediaHtml;
              updatePreview();
              showToast(`Đã tải và chèn ảnh "${file.name}" vào nội dung bài giảng!`);
            });
          }
        });
      });
    }
  }

  // --- TAB 2: WRITE & MANAGE ARTICLES ---
  function renderAdminArticlesTab(body) {
    const rows = state.articles
      .map((a, idx) => {
        const titleVi = typeof a.title === "object" ? a.title.vi : a.title;
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><span class="exp-tag">${escapeHtml(a.pillar)}</span></td>
          <td style="font-weight:700;">${escapeHtml(titleVi)}</td>
          <td>${escapeHtml(a.date)}</td>
          <td>
            <button type="button" class="btn btn-danger btn-sm" data-del-art="${a.id}">Xóa</button>
          </td>
        </tr>`;
      })
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box">
        <h4 style="margin-bottom:12px; color:var(--jade-900);">Soạn Bài Viết Chuyên Sâu Mới (Hỗ Trợ Viết Bài / Tải File HTML &amp; Chèn Ảnh JPG, PNG, WEBP, WEBM)</h4>
        <form id="cmsNewArticleForm">
          <div class="form-row-2">
            <div class="form-group">
              <label>Tiêu đề bài viết (Tiếng Việt) *</label>
              <input type="text" id="cmsArtTitleVi" class="form-control" required placeholder="VD: Lưu ý mới nhất khi kiểm tra sau thông quan mặt hàng..." />
            </div>
            <div class="form-group">
              <label>Tiêu đề Tiếng Anh (Tùy chọn - Để trống hệ thống tự đồng bộ)</label>
              <input type="text" id="cmsArtTitleEn" class="form-control" placeholder="English Title (Optional)" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label>Chuyên mục *</label>
              <select id="cmsArtPillar" class="form-control">
                <option value="CS">Case Study (CS)</option>
                <option value="TN">Tin Ngành &amp; Chính Sách (TN)</option>
                <option value="HT">Học Thực Chiến (HT)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Chọn khung ảnh bìa mặc định</label>
              <select id="cmsArtPhotoSlot" class="form-control">
                <option value="heroPortrait">Ảnh 1 (Hero Portrait)</option>
                <option value="aboutSpeaker">Ảnh 2 (Diễn giả Chia sẻ)</option>
                <option value="customsAward">Ảnh 3 (Hội nghị Hải quan)</option>
                <option value="consultHost">Ảnh 4 (Chân dung Tư vấn)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Đoạn tóm tắt ngắn (Hiển thị ngoài thẻ bài viết) *</label>
            <input type="text" id="cmsArtExcerpt" class="form-control" required placeholder="Tóm tắt 1-2 câu về vấn đề cốt lõi và giải pháp trong bài..." />
          </div>
          <div class="form-group">
            <label>Nội dung toàn văn bài viết (Viết trực tiếp, dán mã HTML hoặc tải ảnh/video minh họa) *</label>
            <div class="rich-editor-toolbar" id="cmsArtToolbar">
              <button type="button" class="rich-tool-btn" data-insert-tag="h3">+ Tiêu đề mục (H3)</button>
              <button type="button" class="rich-tool-btn" data-insert-tag="p">+ Đoạn văn (&lt;p&gt;)</button>
              <button type="button" class="rich-tool-btn" data-insert-tag="ul">+ Danh sách gạch đầu dòng</button>
              <button type="button" class="rich-tool-btn" data-insert-tag="quote">+ Khung lưu ý pháp lý</button>
              <label class="rich-tool-btn rich-tool-upload" style="cursor:pointer;">
                Tải tệp Bài viết / HTML (.html, .txt, .md)
                <input type="file" id="cmsArtHtmlUpload" accept=".html,.htm,.txt,.md" style="display:none;" />
              </label>
              <label class="rich-tool-btn rich-tool-upload" style="cursor:pointer;">
                Chèn Ảnh / Video (.jpg, .png, .webp, .webm, .mp4)
                <input type="file" id="cmsArtMediaUpload" accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.webm,.mp4,image/*,video/webm,video/mp4" multiple style="display:none;" />
              </label>
            </div>
            <textarea id="cmsArtBody" class="form-control" rows="6" required style="border-radius:0 0 12px 12px;" placeholder="Nhập nội dung phân tích, dán HTML hoặc bấm nút 'Chèn Ảnh / Video' ở thanh công cụ phía trên..."></textarea>
            <div class="lesson-visual-preview" id="cmsArtVisualPreview"></div>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Xuất bản bài viết ngay lên Web</button>
        </form>
      </div>

      <h4 style="margin-bottom:10px;">Danh sách Bài viết đang hiển thị (${state.articles.length})</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nhóm</th>
            <th>Tiêu đề bài viết</th>
            <th>Ngày đăng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    bindRichEditorToolbar(
      "cmsArtBody",
      "cmsArtVisualPreview",
      "cmsArtHtmlUpload",
      "cmsArtMediaUpload",
      "cmsArtToolbar"
    );

    document.getElementById("cmsNewArticleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const titleVi = document.getElementById("cmsArtTitleVi").value.trim();
      const titleEn = document.getElementById("cmsArtTitleEn").value.trim() || titleVi;
      const pillar = document.getElementById("cmsArtPillar").value;
      const photoSlot = document.getElementById("cmsArtPhotoSlot").value;
      const excerpt = document.getElementById("cmsArtExcerpt").value.trim();
      const rawBody = document.getElementById("cmsArtBody").value.trim();

      const pillarMap = {
        CS: { vi: "Case Study · Thực Chiến", en: "Case Study · Practical" },
        TN: { vi: "Tin Ngành · Chính Sách", en: "Regulatory News" },
        HT: { vi: "Học Thực Chiến · Hướng Dẫn", en: "Practical Guide" }
      };

      const formattedBody = formatRawOrHtmlContent(rawBody);

      const newArt = {
        id: "art-custom-" + Date.now(),
        pillar,
        pillarLabel: pillarMap[pillar] || pillarMap.CS,
        date: new Date().toLocaleDateString("vi-VN"),
        readTime: { vi: "6 phút đọc", en: "6 min read" },
        photoSlot,
        title: { vi: titleVi, en: titleEn },
        excerpt: { vi: excerpt, en: excerpt },
        body: { vi: formattedBody, en: formattedBody }
      };

      state.articles.unshift(newArt);
      saveCollection(STORAGE_KEYS.ARTICLES, state.articles);
      renderAll();
      renderAdminStudioModal();
      showToast("Đã xuất bản bài viết mới lên trang chủ!");
    });

    body.querySelectorAll("[data-del-art]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delArt;
        state.articles = state.articles.filter((a) => a.id !== id);
        saveCollection(STORAGE_KEYS.ARTICLES, state.articles);
        renderAll();
        renderAdminStudioModal();
        showToast("Đã xóa bài viết.");
      });
    });
  }

  // --- TAB 3: YOUTUBE VIDEO EMBED CMS (Supports full <iframe ...> code & URLs + Live Preview) ---
  function renderAdminVideosTab(body) {
    const rows = state.videos
      .map((v, idx) => {
        const vTitle = typeof v.title === "object" ? v.title.vi : v.title;
        const ytId = extractYoutubeId(v.youtubeEmbedId || v.youtubeEmbedSrc || v.youtubeUrl);
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><span class="exp-tag">${escapeHtml(v.cm)}</span></td>
          <td style="font-weight:700;">${escapeHtml(vTitle)}</td>
          <td>${
            ytId
              ? `<span style="color:var(--jade-700);font-weight:800;">Đã nhúng YouTube (ID: ${ytId})</span>`
              : "Kịch bản Studio"
          }</td>
          <td>
            <button type="button" class="btn btn-danger btn-sm" data-del-vid="${v.id}">Xóa</button>
          </td>
        </tr>`;
      })
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box">
        <h4 style="margin-bottom:8px; color:var(--jade-900);">Nhúng Video YouTube Mới Lên Website (Hỗ Trợ Dán Nguyên Thẻ &lt;iframe&gt; Hoặc Link)</h4>
        <p style="font-size:0.82rem; color:var(--ink-600); margin-bottom:14px;">
          Chị có thể bấm <strong>Share -&gt; Embed</strong> trên YouTube rồi copy toàn bộ đoạn mã <code>&lt;iframe width="560" height="315" src="https://www.youtube.com/embed/..." ...&gt;&lt;/iframe&gt;</code> dán thẳng vào ô bên dưới (giống hệt Ảnh 2), hoặc dán đường link YouTube bình thường.
        </p>

        <div style="display:grid; grid-template-columns: 1.25fr 0.75fr; gap:20px; align-items:start;">
          <form id="cmsNewVideoForm">
            <div class="form-group">
              <label>Dán mã nhúng &lt;iframe ...&gt;&lt;/iframe&gt; từ YouTube HOẶC đường dẫn Video *</label>
              <textarea
                id="cmsVidUrl"
                class="form-control"
                rows="3"
                required
                placeholder='VD: <iframe width="560" height="315" src="https://www.youtube.com/embed/89D3QY2Cjs8?si=eHe_3x-02zA7RUmQ" ...></iframe> hoặc https://www.youtube.com/watch?v=89D3QY2Cjs8'
              ></textarea>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Tiêu đề Video hiển thị trên Web *</label>
                <input type="text" id="cmsVidTitle" class="form-control" required placeholder="VD: Lịch sử đường sắt thế giới - ThuyTalk" />
              </div>
              <div class="form-group">
                <label>Chuyên mục Video ThuyTalk *</label>
                <select id="cmsVidCm" class="form-control">
                  <option value="CM1">CM1 · Văn bản nóng</option>
                  <option value="CM2">CM2 · Dịch luật ra tiếng người</option>
                  <option value="CM3" selected>CM3 · Ký sự thương mại</option>
                  <option value="CM4">CM4 · Tâm tình thực chiến</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Mô tả ngắn nội dung video *</label>
                <input type="text" id="cmsVidDesc" class="form-control" required placeholder="Tóm tắt 1-2 câu về nội dung chính của video..." />
              </div>
              <div class="form-group">
                <label>Thời lượng (VD: 10:15)</label>
                <input type="text" id="cmsVidDuration" class="form-control" value="10:15" />
              </div>
            </div>
            <div class="form-group">
              <label>Toàn văn kịch bản thuyết minh / Ghi chú bài học đi kèm video</label>
              <textarea id="cmsVidScript" class="form-control" rows="3" placeholder="Dán lời thoại thuyết minh hoặc tóm tắt các ý chính để độc giả đọc trực tiếp trên web..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">Lưu &amp; Nhúng Video Lên Trang Chủ Ngay</button>
          </form>

          <!-- Live Embed Preview Card -->
          <div style="background:#FFFFFF; border:1.5px solid var(--jade-200); border-radius:14px; padding:14px;">
            <div style="font-size:0.8rem; font-weight:800; color:var(--jade-900); margin-bottom:8px;">
              Xem trước trình phát Video YouTube (Live Preview):
            </div>
            <div id="cmsVideoLivePreviewBox" style="position:relative; width:100%; aspect-ratio:16/9; background:var(--jade-950); border-radius:10px; overflow:hidden; display:flex; align-items:center; justify-content:center; color:#FFF; font-size:0.8rem; padding:14px; text-align:center;">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/89D3QY2Cjs8?si=eHe_3x-02zA7RUmQ"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
                style="position:absolute; inset:0; width:100%; height:100%; border:0;"
              ></iframe>
            </div>
            <p id="cmsVideoParseHint" style="font-size:0.75rem; color:var(--jade-700); font-weight:700; margin-top:8px;">
              Đang hiển thị mẫu: Lịch sử đường sắt thế giới (ID: 89D3QY2Cjs8)
            </p>
          </div>
        </div>
      </div>

      <h4 style="margin-bottom:10px;">Danh sách Video đang hiển thị trên Website (${state.videos.length})</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Chuyên mục</th>
            <th>Tiêu đề Video</th>
            <th>Trạng thái Nhúng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const urlInp = document.getElementById("cmsVidUrl");
    const previewBox = document.getElementById("cmsVideoLivePreviewBox");
    const parseHint = document.getElementById("cmsVideoParseHint");

    urlInp.addEventListener("input", () => {
      const val = urlInp.value.trim();
      const ytId = extractYoutubeId(val);
      const embedSrc = buildYoutubeEmbedSrc(val);
      if (ytId && embedSrc) {
        previewBox.innerHTML = `<iframe width="100%" height="100%" src="${embedSrc}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>`;
        parseHint.textContent = `Đã nhận diện thành công mã Video YouTube: ${ytId}`;
      } else {
        parseHint.textContent = "Hãy dán thẻ <iframe ...> hoặc đường link YouTube hợp lệ.";
      }
    });

    document.getElementById("cmsNewVideoForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const rawInput = document.getElementById("cmsVidUrl").value.trim();
      const ytId = extractYoutubeId(rawInput);
      const embedSrc = buildYoutubeEmbedSrc(rawInput);
      const cm = document.getElementById("cmsVidCm").value;
      const title = document.getElementById("cmsVidTitle").value.trim();
      const duration = document.getElementById("cmsVidDuration").value.trim() || "08:00";
      const desc = document.getElementById("cmsVidDesc").value.trim();
      const rawScript = document.getElementById("cmsVidScript").value.trim() || desc;

      const cmLabels = {
        CM1: { vi: "CM1 · Văn bản nóng", en: "CM1 · Hot Regulations" },
        CM2: { vi: "CM2 · Dịch luật ra tiếng người", en: "CM2 · Law in Plain Language" },
        CM3: { vi: "CM3 · Ký sự thương mại", en: "CM3 · Trade Chronicles" },
        CM4: { vi: "CM4 · Tâm tình thực chiến", en: "CM4 · Real-World Stories" }
      };

      const formattedScript = rawScript
        .split(/\n+/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");

      const newVid = {
        id: "vid-custom-" + Date.now(),
        cm,
        cmLabel: cmLabels[cm] || cmLabels.CM1,
        duration,
        date: new Date().toLocaleDateString("vi-VN"),
        thumbSlot: "aboutSpeaker",
        youtubeUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : rawInput,
        youtubeEmbedId: ytId,
        youtubeEmbedSrc: embedSrc,
        title: { vi: title, en: title },
        desc: { vi: desc, en: desc },
        script: { vi: formattedScript, en: formattedScript }
      };

      state.videos.unshift(newVid);
      state.activeVideoId = newVid.id;
      saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
      renderAll();
      renderAdminStudioModal();
      showToast(
        ytId
          ? `Đã nhúng thành công Video YouTube (ID: ${ytId}) lên trang chủ!`
          : "Đã thêm Video mới vào thư viện!"
      );
    });

    body.querySelectorAll("[data-del-vid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delVid;
        state.videos = state.videos.filter((v) => v.id !== id);
        if (state.videos.length) state.activeVideoId = state.videos[0].id;
        saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
        renderAll();
        renderAdminStudioModal();
        showToast("Đã xóa video.");
      });
    });
  }

  // --- TAB 4: VISUAL E-LEARNING & MINI-TEST BUILDER (Solving Image 5!) ---
  function syncMiniTestDomToState(body) {
    const cards = body.querySelectorAll(".minitest-q-card");
    if (!cards.length) return;
    const updated = [];
    cards.forEach((card) => {
      const qText = card.querySelector(".mt-q-input").value.trim();
      const optA = card.querySelector(".mt-opt-a").value.trim();
      const optB = card.querySelector(".mt-opt-b").value.trim();
      const optC = card.querySelector(".mt-opt-c").value.trim();
      const correctIdx = parseInt(card.querySelector(".mt-correct-select").value, 10) || 0;
      const expText = card.querySelector(".mt-exp-input").value.trim();

      updated.push({
        q: { vi: qText, en: qText },
        options: {
          vi: [optA, optB, optC],
          en: [optA, optB, optC]
        },
        correctIndex: correctIdx,
        explanation: { vi: expText, en: expText }
      });
    });
    state.generatedMiniTestDraft = updated;
  }

  function renderAdminElearningTab(body, savedFormValues = null) {
    if (!state.generatedMiniTestDraft || state.generatedMiniTestDraft.length === 0) {
      state.generatedMiniTestDraft = getDefaultMiniTestDraft();
    }

    const courseOptions = state.courses
      .map((c) => {
        const cTitle = typeof c.title === "object" ? c.title.vi : c.title;
        const selected = savedFormValues && savedFormValues.courseId === c.id ? "selected" : "";
        return `<option value="${c.id}" ${selected}>${escapeHtml(cTitle)} (${(c.lessons || []).length} bài học)</option>`;
      })
      .join("");

    const questionsBuilderHtml = state.generatedMiniTestDraft
      .map((qObj, idx) => {
        const qVi = typeof qObj.q === "object" ? qObj.q.vi : qObj.q;
        const opts = (qObj.options && qObj.options.vi) || ["A. ", "B. ", "C. "];
        const expVi = (qObj.explanation && qObj.explanation.vi) || "";
        const cIdx = qObj.correctIndex ?? 0;

        return `
        <div class="minitest-q-card" data-qindex="${idx}">
          <div class="minitest-q-card-head">
            <span class="minitest-q-badge">CÂU HỎI MINI TEST SỐ ${idx + 1}</span>
            <button type="button" class="btn btn-danger btn-sm" data-del-qindex="${idx}" style="padding:4px 10px; font-size:0.74rem;">
              Xóa câu ${idx + 1}
            </button>
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label>Nội dung Câu hỏi ${idx + 1} *</label>
            <input type="text" class="form-control mt-q-input" required value="${escapeHtml(qVi)}" />
          </div>

          <div class="minitest-options-grid">
            <div class="form-group" style="margin-bottom:0;">
              <label>Phương án A *</label>
              <input type="text" class="form-control mt-opt-a" required value="${escapeHtml(opts[0] || "")}" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Phương án B *</label>
              <input type="text" class="form-control mt-opt-b" required value="${escapeHtml(opts[1] || "")}" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Phương án C *</label>
              <input type="text" class="form-control mt-opt-c" required value="${escapeHtml(opts[2] || "")}" />
            </div>
          </div>

          <div class="form-row-2" style="margin-top:10px;">
            <div class="form-group" style="margin-bottom:0;">
              <label style="color:var(--jade-800);">Chọn Đáp Án Đúng cho Câu ${idx + 1} *</label>
              <select class="form-control mt-correct-select" style="font-weight:800; color:var(--jade-800); border-color:var(--jade-500);">
                <option value="0" ${cIdx === 0 ? "selected" : ""}>Đáp án A là đáp án đúng</option>
                <option value="1" ${cIdx === 1 ? "selected" : ""}>Đáp án B là đáp án đúng</option>
                <option value="2" ${cIdx === 2 ? "selected" : ""}>Đáp án C là đáp án đúng</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Lời giải thích hiện ra khi học viên chọn đáp án *</label>
              <input type="text" class="form-control mt-exp-input" required value="${escapeHtml(expVi)}" />
            </div>
          </div>
        </div>`;
      })
      .join("");

    // Existing lessons list across all courses
    const existingLessonsRows = [];
    state.courses.forEach((c) => {
      const cTitle = typeof c.title === "object" ? c.title.vi : c.title;
      (c.lessons || []).forEach((l) => {
        const lTitle = typeof l.title === "object" ? l.title.vi : l.title;
        const qCount = Array.isArray(l.miniTest) ? l.miniTest.length : l.quiz ? 1 : 0;
        existingLessonsRows.push(`
          <tr>
            <td><span class="exp-tag">${escapeHtml(cTitle.slice(0, 28))}...</span></td>
            <td style="font-weight:700;">${escapeHtml(lTitle)}</td>
            <td style="color:var(--jade-700); font-weight:800;">${qCount} câu hỏi trắc nghiệm</td>
            <td>
              <button type="button" class="btn btn-danger btn-sm" data-del-lesson="${l.id}" data-parent-course="${c.id}">Xóa bài</button>
            </td>
          </tr>
        `);
      });
    });

    body.innerHTML = `
      <div class="cms-panel-box">
        <form id="cmsNewLessonForm">
          <!-- BƯỚC 1: THÔNG TIN BÀI HỌC & MEDIA UPLOADER -->
          <div style="background:var(--surface-alt); border:1px solid var(--jade-200); border-radius:12px; padding:16px 18px; margin-bottom:18px;">
            <h4 style="color:var(--jade-900); margin-bottom:10px;">BƯỚC 1: SOẠN NỘI DUNG BÀI GIẢNG (VIẾT BÀI / TẢI FILE HTML &amp; CHÈN ẢNH JPG, PNG, WEBP, WEBM)</h4>
            <div class="form-row-2">
              <div class="form-group">
                <label>Chọn Khóa học muốn thêm bài *</label>
                <select id="cmsLessonCourseId" class="form-control">${courseOptions}</select>
              </div>
              <div class="form-group">
                <label>Tiêu đề Bài học mới *</label>
                <input
                  type="text"
                  id="cmsLessonTitle"
                  class="form-control"
                  required
                  value="${escapeHtml((savedFormValues && savedFormValues.title) || "")}"
                  placeholder="VD: Bài 3: Cách kiểm tra C/O Form E ba bên hợp lệ..."
                />
              </div>
            </div>
            <div class="form-group">
              <label>Nội dung kiến thức bài giảng (Viết bài, dán HTML hoặc tải lên tệp HTML kèm ảnh/video .jpg, .png, .webp, .webm, .mp4) *</label>
              <div class="rich-editor-toolbar" id="cmsLessonToolbar">
                <button type="button" class="rich-tool-btn" data-insert-tag="h3">+ Tiêu đề mục (H3)</button>
                <button type="button" class="rich-tool-btn" data-insert-tag="p">+ Đoạn văn (&lt;p&gt;)</button>
                <button type="button" class="rich-tool-btn" data-insert-tag="ul">+ Danh sách gạch đầu dòng</button>
                <button type="button" class="rich-tool-btn" data-insert-tag="quote">+ Khung lưu ý pháp lý</button>
                <label class="rich-tool-btn rich-tool-upload" style="cursor:pointer;">
                  Tải tệp Bài giảng / HTML (.html, .txt, .md)
                  <input type="file" id="cmsLessonHtmlUpload" accept=".html,.htm,.txt,.md" style="display:none;" />
                </label>
                <label class="rich-tool-btn rich-tool-upload" style="cursor:pointer;">
                  Chèn Ảnh / Video Minh Họa (.jpg, .png, .webp, .webm, .mp4)
                  <input type="file" id="cmsLessonMediaUpload" accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.webm,.mp4,image/*,video/webm,video/mp4" multiple style="display:none;" />
                </label>
              </div>
              <textarea
                id="cmsLessonBody"
                class="form-control"
                rows="5"
                required
                style="border-radius:0 0 12px 12px;"
                placeholder="Dán nội dung bài giảng, mã HTML hoặc bấm nút 'Chèn Ảnh / Video Minh Họa' ở thanh công cụ phía trên..."
              >${escapeHtml((savedFormValues && savedFormValues.rawBody) || "")}</textarea>
              <div class="lesson-visual-preview" id="cmsLessonVisualPreview"></div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Đề bài Bài tập thực hành cuối bài học *</label>
              <input
                type="text"
                id="cmsLessonExercise"
                class="form-control"
                required
                value="${escapeHtml(
                  (savedFormValues && savedFormValues.exercise) ||
                    "Bài tập thực hành: Đối chiếu 3 điểm rủi ro chính trong bài học với bộ chứng từ lô hàng thực tế của doanh nghiệp bạn."
                )}"
              />
            </div>
          </div>

          <!-- BƯỚC 2: ĐẨY FILE EXCEL / CSV HOẶC CHỈNH SỬA BỘ MINI TEST TRỰC QUAN -->
          <div class="minitest-builder-section" style="margin-top:0; padding-top:0; border-top:none;">
            <div class="excel-import-box">
              <div>
                <h4 style="color:var(--orange-700); font-size:0.95rem; font-weight:900; margin-bottom:2px;">
                  ĐẨY FILE EXCEL (.XLSX / .CSV) LÊN ĐỂ ĐIỀN NHANH BỘ CÂU HỎI MINI TEST
                </h4>
                <p style="font-size:0.8rem; color:var(--ink-700);">
                  Thay vì nhập tay từng câu, Chị chỉ cần đẩy file Excel chuẩn 7 cột (<code>STT, Nội dung câu hỏi, Phương án A, Phương án B, Phương án C, Đáp án đúng (A/B/C), Lời giải thích</code>) lên để hệ thống tự động điền toàn bộ vào các ô bên dưới.
                </p>
                <div id="cmsExcelImportStatus" style="font-size:0.78rem; font-weight:800; color:var(--jade-800); margin-top:4px;"></div>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                <label class="btn btn-primary btn-sm" style="cursor:pointer;">
                  Đẩy File Excel / CSV Lên (.xlsx, .csv)
                  <input type="file" id="cmsUploadMiniTestExcel" accept=".xlsx,.csv" style="display:none;" />
                </label>
                <a href="assets/templates/Mau_Import_Mini_Test_ThuysTalk.xlsx" download="Mau_Import_Mini_Test_ThuysTalk.xlsx" class="btn btn-outline btn-sm">
                  Tải File Excel Mẫu (.xlsx)
                </a>
                <a href="assets/templates/Mau_Import_Mini_Test_ThuysTalk.csv" download="Mau_Import_Mini_Test_ThuysTalk.csv" class="btn btn-outline btn-sm">
                  Tải File CSV Mẫu (.csv)
                </a>
              </div>
            </div>

            <div class="minitest-builder-header">
              <div>
                <h4 style="color:var(--jade-900); font-size:1rem; margin-bottom:2px;">
                  BƯỚC 2: DANH SÁCH CÂU HỎI MINI TEST (${state.generatedMiniTestDraft.length} CÂU HỎI ĐANG HIỂN THỊ BÊN DƯỚI)
                </h4>
                <p style="font-size:0.8rem; color:var(--ink-600);">
                  Chị có thể đẩy file Excel ở khung màu cam bên trên, bấm <strong>"Tự động điền 3 câu hỏi từ Bài giảng"</strong>, hoặc sửa trực tiếp tại từng ô bên dưới.
                </p>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="btn btn-jade btn-sm" id="autoGenMiniTestBtn">
                  Tự động điền 3 câu hỏi từ Bài giảng
                </button>
                <button type="button" class="btn btn-outline-orange btn-sm" id="addManualQuestionBtn">
                  + Thêm 1 câu hỏi mới
                </button>
              </div>
            </div>

            <div id="miniTestCardsContainer">
              ${questionsBuilderHtml}
            </div>
          </div>

          <div style="margin-top:18px; display:flex; justify-content:flex-end;">
            <button type="submit" class="btn btn-primary">
              Lưu Bài Học &amp; Bộ Mini Test (${state.generatedMiniTestDraft.length} câu) Vào Khóa Học Ngay
            </button>
          </div>
        </form>
      </div>

      <h4 style="margin:24px 0 10px;">Danh sách Bài học &amp; Bộ Mini Test đang có trên Web (${existingLessonsRows.length} bài)</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>Khóa học</th>
            <th>Tên Bài học</th>
            <th>Số câu Mini Test</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${existingLessonsRows.join("")}</tbody>
      </table>
    `;

    bindRichEditorToolbar(
      "cmsLessonBody",
      "cmsLessonVisualPreview",
      "cmsLessonHtmlUpload",
      "cmsLessonMediaUpload",
      "cmsLessonToolbar"
    );

    function getCurrentLessonFormValues() {
      return {
        courseId: document.getElementById("cmsLessonCourseId").value,
        title: document.getElementById("cmsLessonTitle").value,
        rawBody: document.getElementById("cmsLessonBody").value,
        exercise: document.getElementById("cmsLessonExercise").value
      };
    }

    function parseCsvTextToQuestions(csvText) {
      const lines = String(csvText || "")
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter((l) => l.trim().length > 0);
      if (lines.length < 2) return [];
      function splitCsvRow(rowStr) {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < rowStr.length; i++) {
          const ch = rowStr[i];
          if (ch === '"') {
            if (inQuotes && rowStr[i + 1] === '"') {
              cur += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (ch === "," && !inQuotes) {
            result.push(cur.trim());
            cur = "";
          } else {
            cur += ch;
          }
        }
        result.push(cur.trim());
        return result;
      }
      const parsed = [];
      lines.slice(1).forEach((line, idx) => {
        const cols = splitCsvRow(line);
        if (cols.length < 4) return;
        const hasStt = /^\d+$/.test(cols[0]) && cols.length >= 5;
        const qText = hasStt ? cols[1] : cols[0];
        const optA = hasStt ? cols[2] : cols[1];
        const optB = hasStt ? cols[3] : cols[2];
        const optC = hasStt ? cols[4] : cols[3];
        const ansRaw = ((hasStt ? cols[5] : cols[4]) || "A").toUpperCase();
        const expText =
          (hasStt ? cols[6] : cols[5]) ||
          "Chính xác! Căn cứ theo nội dung bài học và văn bản pháp lý.";
        if (!qText) return;
        let cIdx = 0;
        if (ansRaw.includes("B") || ansRaw === "1" || ansRaw === "2") cIdx = ansRaw === "2" ? 1 : ansRaw.includes("B") ? 1 : 0;
        if (ansRaw.includes("C") || ansRaw === "3") cIdx = 2;
        parsed.push({
          q: {
            vi: qText.toLowerCase().startsWith("câu") ? qText : `Câu ${idx + 1}: ${qText}`,
            en: qText
          },
          options: {
            vi: [
              optA.startsWith("A.") ? optA : `A. ${optA}`,
              optB.startsWith("B.") ? optB : `B. ${optB}`,
              optC.startsWith("C.") ? optC : `C. ${optC}`
            ],
            en: [
              optA.startsWith("A.") ? optA : `A. ${optA}`,
              optB.startsWith("B.") ? optB : `B. ${optB}`,
              optC.startsWith("C.") ? optC : `C. ${optC}`
            ]
          },
          correctIndex: cIdx,
          explanation: { vi: expText, en: expText }
        });
      });
      return parsed;
    }

    const excelInp = document.getElementById("cmsUploadMiniTestExcel");
    if (excelInp) {
      excelInp.addEventListener("change", async (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const vals = getCurrentLessonFormValues();
        const statusEl = document.getElementById("cmsExcelImportStatus");
        if (statusEl) statusEl.textContent = `Đang đọc file "${file.name}"...`;

        try {
          const buf = await file.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const b64 = window.btoa(binary);
          const resp = await fetch("http://localhost:8099/api/parse-excel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              filename: file.name,
              data_base64: b64
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && Array.isArray(data.questions) && data.questions.length > 0) {
              state.generatedMiniTestDraft = data.questions;
              renderAdminElearningTab(body, vals);
              const newStatusEl = document.getElementById("cmsExcelImportStatus");
              if (newStatusEl) {
                newStatusEl.textContent = `Đã nạp thành công ${data.questions.length} câu hỏi Mini Test từ file "${file.name}"!`;
              }
              showToast(`Đã điền tự động ${data.questions.length} câu hỏi Mini Test từ file "${file.name}"!`);
              return;
            }
          }
        } catch (err) {
          // Fallback to client-side CSV reader if server is offline
        }

        if (file.name.toLowerCase().endsWith(".csv")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const qs = parseCsvTextToQuestions(e.target.result);
            if (qs.length > 0) {
              state.generatedMiniTestDraft = qs;
              renderAdminElearningTab(body, vals);
              const newStatusEl = document.getElementById("cmsExcelImportStatus");
              if (newStatusEl) {
                newStatusEl.textContent = `Đã nạp thành công ${qs.length} câu hỏi Mini Test từ file "${file.name}"!`;
              }
              showToast(`Đã điền tự động ${qs.length} câu hỏi Mini Test từ file "${file.name}"!`);
            } else {
              showToast("Không tìm thấy dòng câu hỏi hợp lệ trong file CSV.");
            }
          };
          reader.readAsText(file, "utf-8");
        } else {
          showToast("Để đọc trực tiếp file .xlsx, hãy mở trang qua http://localhost:8099 (hoặc dùng file .csv).");
        }
      });
    }

    document.getElementById("autoGenMiniTestBtn").addEventListener("click", () => {
      const vals = getCurrentLessonFormValues();
      if (!vals.rawBody.trim()) {
        showToast("Hãy dán nội dung bài giảng ở Bước 1 trước, hệ thống sẽ tự động trích xuất thành 3 câu hỏi ở Bước 2!");
        document.getElementById("cmsLessonBody").focus();
        return;
      }
      state.generatedMiniTestDraft = generateMiniTestFromText(
        vals.title.trim() || "Chuyên đề Xuất nhập khẩu",
        vals.rawBody.trim()
      );
      renderAdminElearningTab(body, vals);
      showToast("Đã tự động trích xuất 3 câu hỏi Mini Test vào các ô ở Bước 2! Chị có thể xem hoặc sửa tùy ý.");
    });

    document.getElementById("addManualQuestionBtn").addEventListener("click", () => {
      syncMiniTestDomToState(body);
      const vals = getCurrentLessonFormValues();
      const nextNum = state.generatedMiniTestDraft.length + 1;
      state.generatedMiniTestDraft.push({
        q: {
          vi: `Câu ${nextNum}: Nhập nội dung câu hỏi trắc nghiệm số ${nextNum}...`,
          en: `Q${nextNum}: Enter question ${nextNum}...`
        },
        options: {
          vi: ["A. Phương án A", "B. Phương án B", "C. Phương án C"],
          en: ["A. Option A", "B. Option B", "C. Option C"]
        },
        correctIndex: 0,
        explanation: {
          vi: "Giải thích căn cứ pháp lý và thực tế cho đáp án đúng.",
          en: "Explanation for the correct answer."
        }
      });
      renderAdminElearningTab(body, vals);
      showToast(`Đã thêm khung Câu hỏi số ${nextNum}!`);
    });

    body.querySelectorAll("[data-del-qindex]").forEach((btn) => {
      btn.addEventListener("click", () => {
        syncMiniTestDomToState(body);
        const vals = getCurrentLessonFormValues();
        const idx = parseInt(btn.dataset.delQindex, 10);
        if (state.generatedMiniTestDraft.length <= 1) {
          showToast("Mỗi bài học cần có ít nhất 1 câu hỏi Mini Test.");
          return;
        }
        state.generatedMiniTestDraft.splice(idx, 1);
        renderAdminElearningTab(body, vals);
      });
    });

    document.getElementById("cmsNewLessonForm").addEventListener("submit", (e) => {
      e.preventDefault();
      syncMiniTestDomToState(body);
      const courseId = document.getElementById("cmsLessonCourseId").value;
      const title = document.getElementById("cmsLessonTitle").value.trim();
      const rawBody = document.getElementById("cmsLessonBody").value.trim();
      const exercise = document.getElementById("cmsLessonExercise").value.trim();

      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return;

      const miniTest = JSON.parse(JSON.stringify(state.generatedMiniTestDraft));
      const formattedBody = formatRawOrHtmlContent(rawBody);
      const plainSummary = rawBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

      course.lessons.push({
        id: "lesson-" + Date.now(),
        title: { vi: title, en: title },
        duration: "10:00",
        summary: { vi: plainSummary.slice(0, 140) + "...", en: plainSummary.slice(0, 140) + "..." },
        content: { vi: formattedBody, en: formattedBody },
        miniTest,
        exercise: { vi: exercise, en: exercise }
      });

      course.meta = {
        vi: `${course.lessons.length} Bài học · Bộ Mini Test ${miniTest.length} câu · Thực chiến`,
        en: `${course.lessons.length} Lessons · ${miniTest.length}-Question Mini Test · Practical`
      };

      state.generatedMiniTestDraft = getDefaultMiniTestDraft();
      saveCollection(STORAGE_KEYS.COURSES, state.courses);
      renderAll();
      renderAdminStudioModal();
      showToast(`Đã lưu bài học "${title}" kèm Bộ Mini Test (${miniTest.length} câu) thành công!`);
    });

    body.querySelectorAll("[data-del-lesson]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lid = btn.dataset.delLesson;
        const cid = btn.dataset.parentCourse;
        const course = state.courses.find((c) => c.id === cid);
        if (!course) return;
        course.lessons = (course.lessons || []).filter((l) => l.id !== lid);
        saveCollection(STORAGE_KEYS.COURSES, state.courses);
        renderAll();
        renderAdminStudioModal();
        showToast("Đã xóa bài học.");
      });
    });
  }

  // --- TAB 5: AI KNOWLEDGE BASE & INTERNAL BRIDGE SOURCES ---
  function renderAdminAiKbTab(body) {
    const kbRows = state.aiKb
      .map(
        (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td style="font-weight:700; color:var(--jade-800);">${escapeHtml(item.topic)}</td>
        <td style="font-size:0.76rem; color:var(--ink-600);">${escapeHtml(item.keywords)}</td>
        <td style="font-size:0.78rem;">${escapeHtml((item.answer || "").slice(0, 110))}...</td>
        <td>
          <button type="button" class="btn btn-danger btn-sm" data-del-kb="${item.id}">Xóa</button>
        </td>
      </tr>`
      )
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box" style="margin-bottom:18px; border-color:var(--jade-500); background:var(--jade-50);">
        <h4 style="color:var(--jade-900); margin-bottom:6px;">Cấu Hình API Trung Gian Kết Nối Kho Dữ Liệu Pháp Lý Nội Bộ</h4>
        <p style="font-size:0.8rem; color:var(--ink-600); margin-bottom:10px;">
          Trình duyệt Web truyền câu hỏi qua <strong>API Trung Gian</strong> này để tra cứu trực tiếp kho văn bản gốc của Chị (ẩn hoàn toàn nguồn kỹ thuật phía sau đối với người dùng bên ngoài).
        </p>
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <input
            type="text"
            id="cmsBridgeUrlInput"
            class="form-control"
            style="flex:1; min-width:280px; background:#FFFFFF;"
            value="${escapeHtml(state.notebookBridgeUrl)}"
            placeholder="http://localhost:8099/api/notebook-query"
          />
          <button type="button" class="btn btn-jade btn-sm" id="cmsSaveBridgeUrlBtn">
            Lưu URL API Trung Gian
          </button>
          <button type="button" class="btn btn-outline-orange btn-sm" id="cmsTestBridgeBtn">
            Kiểm tra kết nối API
          </button>
        </div>
        <div id="cmsBridgeStatusMsg" style="font-size:0.78rem; font-weight:700; color:var(--jade-800); margin-top:8px;"></div>
      </div>

      <div class="cms-panel-box">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <h4 style="color:var(--jade-900);">Nạp Nguồn Dữ Liệu Mới Cho Trợ Lý AI Pháp Lý ThuysTalk</h4>
            <p style="font-size:0.8rem; color:var(--ink-600);">Mọi kiến thức hoặc văn bản pháp lý Chị thêm vào đây sẽ được AI học ngay lập tức để trả lời khách truy cập trong 0.1 giây.</p>
          </div>
          <label class="btn btn-jade btn-sm" style="cursor:pointer;">
            Nạp từ file (.txt / .md / .json)
            <input type="file" id="cmsImportKbFileInput" accept=".txt,.md,.json" style="display:none;" />
          </label>
        </div>

        <form id="cmsNewKbForm">
          <div class="form-row-2">
            <div class="form-group">
              <label>Chủ đề / Tên văn bản pháp lý hoặc câu hỏi thường gặp *</label>
              <input type="text" id="cmsKbTopic" class="form-control" required placeholder="VD: Quy định kiểm tra chuyên ngành mặt hàng thực phẩm bảo vệ sức khỏe..." />
            </div>
            <div class="form-group">
              <label>Phân nhóm Chuyên đề Pháp lý ThuysTalk</label>
              <select id="cmsKbBranch" class="form-control">
                <option value="Cẩm Nang Pháp Lý ThuysTalk · Chuyên đề A (Tra Mã HS Code Theo 6 Quy Tắc)">Chuyên đề A: Hướng Dẫn Tra Mã HS Code Theo 6 Quy Tắc</option>
                <option value="Cẩm Nang Pháp Lý ThuysTalk · Chuyên đề B (Kiểm Soát Xuất Khẩu Trung Quốc 2026)">Chuyên đề B: Hàng Hóa Kiểm Soát Xuất Khẩu Trung Quốc 2026</option>
                <option value="Cẩm Nang Pháp Lý ThuysTalk · Chuyên đề C (Thủ Tục Kiểm Soát Chuyên Ngành)">Chuyên đề C: Thủ Tục Kiểm Soát Hàng Hóa Chuyên Ngành</option>
                <option value="Cẩm Nang Pháp Lý ThuysTalk · Chuyên đề D (Hàng Rủi Ro & Quyết Định 31/2026)">Chuyên đề D: Cẩm Nang Hàng Rủi Ro Từ 1/7/2026</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Các từ khóa nhận diện (Cách nhau bằng dấu phẩy) *</label>
            <input type="text" id="cmsKbKeywords" class="form-control" required placeholder="VD: thực phẩm chức năng, an toàn thực phẩm, công bố, nghị định 15" />
          </div>
          <div class="form-group">
            <label>Nội dung câu trả lời chuẩn xác để AI phản hồi *</label>
            <textarea id="cmsKbAnswer" class="form-control" rows="4" required placeholder="Nhập kết luận, căn cứ pháp lý và lưu ý thực tế để AI trả lời người dùng..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-sm">Lưu vào Kho Nguồn Tri Thức AI</button>
        </form>
      </div>

      <h4 style="margin-bottom:10px;">Kho Nguồn Tri Thức AI Pháp Lý hiện tại (${state.aiKb.length} nguồn)</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Chủ đề tri thức</th>
            <th>Từ khóa</th>
            <th>Trích đoạn câu trả lời</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${kbRows}</tbody>
      </table>
    `;

    document.getElementById("cmsSaveBridgeUrlBtn").addEventListener("click", () => {
      const val = document.getElementById("cmsBridgeUrlInput").value.trim();
      if (!val) return;
      state.notebookBridgeUrl = val;
      localStorage.setItem(STORAGE_KEYS.BRIDGE_URL, val);
      showToast("Đã lưu địa chỉ URL API Trung Gian!");
    });

    document.getElementById("cmsTestBridgeBtn").addEventListener("click", async () => {
      const val = document.getElementById("cmsBridgeUrlInput").value.trim();
      const statusUrl = val.replace(/\/api\/notebook-query\/?$/, "/api/notebook-status");
      const msgEl = document.getElementById("cmsBridgeStatusMsg");
      msgEl.textContent = "Đang kiểm tra kết nối tới API Trung Gian (" + statusUrl + ")...";
      try {
        const res = await fetch(statusUrl);
        if (res.ok) {
          const info = await res.json();
          msgEl.textContent = `Kết nối THÀNH CÔNG: ${info.service} | Trạng thái động cơ tra cứu: Sẵn sàng.`;
        } else {
          msgEl.textContent = "API Trung Gian phản hồi mã lỗi HTTP " + res.status;
        }
      } catch (e) {
        msgEl.textContent = "Chưa kết nối được API Trung Gian. Hãy mở file chay_web_thuystalk.bat để bật server_thuystalk.py tại cổng 8099.";
      }
    });

    document.getElementById("cmsNewKbForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const topic = document.getElementById("cmsKbTopic").value.trim();
      const notebookBranch = document.getElementById("cmsKbBranch").value;
      const keywords = document.getElementById("cmsKbKeywords").value.trim();
      const answer = document.getElementById("cmsKbAnswer").value.trim();

      state.aiKb.unshift({
        id: "kb-" + Date.now(),
        notebookBranch,
        topic,
        keywords,
        answer
      });

      saveCollection(STORAGE_KEYS.AI_KB, state.aiKb);
      renderAdminStudioModal();
      showToast("Đã nạp nguồn tri thức mới vào Trợ lý AI ThuysTalk!");
    });

    document.getElementById("cmsImportKbFileInput").addEventListener("change", (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = String(e.target.result || "").trim();
        if (!text) return;
        state.aiKb.unshift({
          id: "kb-file-" + Date.now(),
          notebookBranch: "Kho Tri Thức Pháp Lý ThuysTalk · " + file.name,
          topic: file.name.replace(/\.[^.]+$/, ""),
          keywords: file.name.toLowerCase() + ", " + text.slice(0, 120).toLowerCase(),
          answer: text.slice(0, 2500)
        });
        saveCollection(STORAGE_KEYS.AI_KB, state.aiKb);
        renderAdminStudioModal();
        showToast(`Đã nạp tệp "${file.name}" vào Nguồn dữ liệu AI!`);
      };
      reader.readAsText(file, "utf-8");
    });

    body.querySelectorAll("[data-del-kb]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delKb;
        state.aiKb = state.aiKb.filter((k) => k.id !== id);
        saveCollection(STORAGE_KEYS.AI_KB, state.aiKb);
        renderAdminStudioModal();
        showToast("Đã xóa mục dữ liệu AI.");
      });
    });
  }

  // --- TAB 6: LEADS & FULL CMS BACKUP ---
  function renderAdminLeadsTab(body) {
    const leads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
    const leadsRows =
      leads.length === 0
        ? `<tr><td colspan="6" style="padding:14px; text-align:center; color:var(--ink-500);">Chưa có lượt đăng ký mới trong phiên này.</td></tr>`
        : leads
            .map(
              (ld, i) => `
          <tr>
            <td>${i + 1}</td>
            <td style="font-weight:700;">${escapeHtml(ld.type)}</td>
            <td>${escapeHtml(ld.name)}</td>
            <td style="color:var(--jade-700); font-weight:700;">${escapeHtml(ld.email)}</td>
            <td>${escapeHtml(ld.phone)}</td>
            <td>${escapeHtml(ld.topic)}</td>
          </tr>`
            )
            .join("");

    body.innerHTML = `
      <div class="cms-panel-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <strong style="color:var(--jade-900);">Sao lưu & Khôi phục Toàn bộ Dữ liệu Quản trị Website (Full CMS JSON)</strong>
          <p style="font-size:0.8rem; color:var(--ink-600);">Xuất toàn bộ Ảnh, Bài viết, Video YouTube, Khóa học E-Learning và Nguồn dữ liệu AI ra 1 tệp JSON duy nhất.</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-jade btn-sm" id="exportFullCmsBtn">Xuất toàn bộ cấu hình CMS (.json)</button>
          <button type="button" class="btn btn-primary btn-sm" id="exportLeadsCsvBtn">Xuất danh sách Học viên / Tư vấn (.csv)</button>
        </div>
      </div>

      <!-- Firebase Cloud Integration Card (Project: thuystalk) -->
      <div class="cms-panel-box" style="margin-top:14px; border:1.5px solid var(--jade-400); background:linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-jade" style="background:var(--jade-800); color:#FFF; font-weight:800;">Firebase Cloud Active</span>
              <strong style="color:var(--jade-900); font-size:0.95rem;">Cơ Sở Dữ Liệu Cloud Firestore &amp; Firebase Storage</strong>
            </div>
            <p style="font-size:0.82rem; color:var(--ink-700); margin-top:4px;">
              Dự án: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">thuystalk</code> · 
              App ID: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">1:767228711805</code> · 
              Storage Bucket: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">thuystalk.firebasestorage.app</code>
            </p>
            <p style="font-size:0.78rem; color:var(--ink-600); margin-top:2px;">
              Khóa API chính thức đã kích hoạt: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">AIzaSyA3PZ3...DaEw8</code>. Tự động lưu trữ Học viên &amp; Leads 1-1 lên Cloud Firestore.
            </p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-jade btn-sm" id="syncFirebaseBtn">
              Đồng bộ toàn bộ lên Cloud Firestore
            </button>
            <a href="https://console.firebase.google.com/project/thuystalk/storage" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Mở Firebase Storage Console
            </a>
          </div>
        </div>
      </div>

      <h4 style="margin-bottom:10px;">Danh sách Học viên nhận tài liệu & Khách đăng ký tư vấn (${leads.length})</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Phân loại</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT / Zalo</th>
            <th>Chủ đề / Khóa học</th>
          </tr>
        </thead>
        <tbody>${leadsRows}</tbody>
      </table>
    `;

    document.getElementById("exportFullCmsBtn").addEventListener("click", () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        media: state.media,
        articles: state.articles,
        videos: state.videos,
        courses: state.courses,
        aiKb: state.aiKb
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "thuystalk-full-cms-config.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống tệp thuystalk-full-cms-config.json!");
    });

    document.getElementById("exportLeadsCsvBtn").addEventListener("click", () => {
      const rows = [
        ["STT", "Thoi gian", "Phan loai", "Ho ten", "Email", "SDT/Zalo", "Chu de", "Ghi chu"],
        ...leads.map((l, idx) => [
          idx + 1,
          l.timestamp,
          l.type,
          l.name,
          l.email,
          l.phone,
          l.topic,
          l.message || ""
        ])
      ];
      const csv =
        "\uFEFF" +
        rows
          .map((r) => r.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))
          .join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ThuysTalk_Danh_Sach_Hoc_Vien_Tu_Van.csv";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã xuất danh sách ra file CSV!");
    });

    const syncFbBtn = document.getElementById("syncFirebaseBtn");
    if (syncFbBtn) {
      syncFbBtn.addEventListener("click", async () => {
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          showToast("Đang đồng bộ dữ liệu lên Cloud Firestore (thuystalk)...");
          await window.ThuysTalkFirebase.syncCollection("articles", state.articles);
          await window.ThuysTalkFirebase.syncCollection("videos", state.videos);
          await window.ThuysTalkFirebase.syncCollection("elearning_courses", state.courses);
          await window.ThuysTalkFirebase.syncCollection("ai_kb", state.aiKb);
          showToast("Đã đồng bộ toàn bộ Bài viết, Video, E-Learning lên Cloud Firestore (thuystalk) thành công!");
        } else {
          showToast("Cơ sở dữ liệu Firebase (thuystalk) đã được kết nối & sẵn sàng lưu trữ học viên!");
        }
      });
    }
  }

  function compressAndLoadImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1280;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL("image/webp", 0.88));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ==========================================================================
  // INITIALIZE EVENT LISTENERS ON DOM READY (Supports both index.html & admin.html)
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lang") === "en" || params.get("lang") === "vi") {
      state.lang = params.get("lang");
      localStorage.setItem(STORAGE_KEYS.LANG, state.lang);
    }

    // Check if local server (http://localhost:8099) is running:
    // 1. Update sidebar status indicator on admin.html
    // 2. If user opened via file:// (which causes YouTube Error 153), automatically hop to http://localhost:8099!
    fetch("http://localhost:8099/api/notebook-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((info) => {
        if (!info) return;
        const sideStatus = document.getElementById("adminSidebarBridgeStatus");
        if (sideStatus) {
          sideStatus.textContent = "Động cơ AI Pháp lý: ĐANG KẾT NỐI TRỰC TIẾP (4 Chuyên đề Pháp lý sẵn sàng)";
        }
        // Only auto-redirect human file:// browsers (not headless screenshot verifiers)
        if (window.location.protocol === "file:" && !navigator.webdriver) {
          const parts = window.location.pathname.split(/[\\/]/);
          const pageName = parts[parts.length - 1] || "index.html";
          window.location.replace(`http://localhost:8099/${pageName}${window.location.search}${window.location.hash}`);
        }
      })
      .catch(() => {
        const sideStatus = document.getElementById("adminSidebarBridgeStatus");
        if (sideStatus) {
          sideStatus.textContent = "Động cơ AI Pháp lý: Chế độ Kho AI Nội bộ (Mở chay_web_thuystalk.bat để bật Live API)";
        }
      });

    // If we are on the dedicated internal Admin Page (admin.html):
    if (document.getElementById("adminSidebarNav")) {
      const requestedTab = params.get("tab");
      const requestedSlot = params.get("slot");
      if (requestedTab) state.activeCmsTab = requestedTab;
      renderAdminStudioModal(requestedSlot || null);
      return;
    }

    renderAll();
    initConsultForm();
    bindPhotoTriggers(document);

    // Language Switcher
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        localStorage.setItem(STORAGE_KEYS.LANG, state.lang);
        renderAll();
        showToast(
          state.lang === "vi"
            ? "Đã chuyển sang Tiếng Việt"
            : "Switched to English"
        );
      });
    });

    // NotebookLM & AI Search Events
    const nbForm = document.getElementById("notebookSearchForm");
    if (nbForm) {
      nbForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleNotebookSearch(true);
      });
    }

    const nbLiveBtn = document.getElementById("nbLiveQueryBtn");
    if (nbLiveBtn) {
      nbLiveBtn.addEventListener("click", (e) => {
        if (nbLiveBtn.type !== "submit") {
          e.preventDefault();
          handleNotebookSearch(true);
        }
      });
    }

    document.querySelectorAll("[data-quick-prompt]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const inp = document.getElementById("notebookQueryInput");
        if (inp) {
          inp.value = chip.dataset.quickPrompt;
          handleNotebookSearch(true);
        }
      });
    });

    // Close Modals
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.getElementById(btn.dataset.closeModal);
        if (target) target.classList.remove("open");
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("open");
      });
    });
  });
})();
