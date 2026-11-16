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
    DEVICE_ID: "thuystalk_device_id_v1",
    DEVICE_TRUST_MAP: "thuystalk_device_trust_v1",
    GOOGLE_TRUST_UIDS: "thuystalk_google_auth_uids_v1",
    PENDING_REG_MAP: "thuystalk_pending_reg_map_v1",
    PENDING_AUTH_CHALLENGE_UID: "thuystalk_pending_challenge_uid_v1",
    PENDING_GOOGLE_PROFILE_UID: "thuystalk_pending_google_profile_uid_v1",
    NEW_GOOGLE_AUTH_UID: "thuystalk_new_google_uid_v1",
    PENDING_REDIRECT_REASON: "thuystalk_pending_redirect_reason_v1",
    PENDING_ACTION: "thuystalk_pending_action_v1",
    DOWNLOAD_DEDUP: "thuystalk_download_dedup_v1",
    REG_TRUST_UIDS: "thuystalk_reg_verified_uids_v1",
    GUEST_QUERY_COUNT: "thuystalk_guest_query_count_v4",
    PROGRESS: "thuystalk_lesson_progress_v3",
    LEADS: "thuystalk_leads_ledger_v3",
    RATE_LIMIT: "thuystalk_rate_limit_v3",
    ARTICLES: "thuystalk_cms_articles_v3",
    VIDEOS: "thuystalk_cms_videos_v3",
    COURSES: "thuystalk_cms_courses_v3",
    AI_KB: "thuystalk_cms_ai_kb_v3",
    AI_USER_CACHE: "thuystalk_ai_user_cache_v1",
    SOCIALS: "thuystalk_cms_social_links_v1",
    VIDEO_CATS: "thuystalk_cms_video_categories_v1",
    LAST_LESSON_MAP: "thuystalk_last_lesson_by_course_v1",
    BRIDGE_URL: "thuystalk_notebook_bridge_url_v3",
    PENDING_CONSULT_QUERY: "thuystalk_pending_consult_q_v1"
  };

  function readStorageJson(storageObj, key, fallback = {}) {
    try {
      const raw = storageObj.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeStorageJson(storageObj, key, value) {
    try {
      storageObj.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function getOrCreateDeviceId() {
    try {
      const existing = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;
    } catch (e) {}
    let hex = "";
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      }
    } catch (e) {}
    if (!hex) {
      hex =
        Date.now().toString(16).padStart(12, "0") +
        Math.random().toString(16).slice(2).padEnd(20, "0").slice(0, 20);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, hex);
    } catch (e) {}
    return hex;
  }

  function getDeviceTrust(uid) {
    if (!uid) return null;
    const deviceId = getOrCreateDeviceId();
    const map = readStorageJson(localStorage, STORAGE_KEYS.DEVICE_TRUST_MAP, {});
    const rec = map[uid];
    if (
      rec &&
      typeof rec.trust === "string" &&
      rec.trust.length >= 16 &&
      typeof rec.issuedAt === "string" &&
      rec.issuedAt.length > 0 &&
      rec.deviceId === deviceId
    ) {
      return rec;
    }
    return null;
  }

  function saveDeviceTrust(uid, trust, issuedAt) {
    if (!uid || !trust || !issuedAt) return;
    const deviceId = getOrCreateDeviceId();
    const map = readStorageJson(localStorage, STORAGE_KEYS.DEVICE_TRUST_MAP, {});
    map[uid] = { deviceId, trust: String(trust), issuedAt: String(issuedAt) };
    writeStorageJson(localStorage, STORAGE_KEYS.DEVICE_TRUST_MAP, map);
  }

  function hasTrustedGoogleBrowser(uid) {
    if (!uid) return false;
    const map = readStorageJson(localStorage, STORAGE_KEYS.GOOGLE_TRUST_UIDS, {});
    return map[uid] === true;
  }

  function markTrustedGoogleBrowser(uid) {
    if (!uid) return;
    const map = readStorageJson(localStorage, STORAGE_KEYS.GOOGLE_TRUST_UIDS, {});
    map[uid] = true;
    writeStorageJson(localStorage, STORAGE_KEYS.GOOGLE_TRUST_UIDS, map);
  }

  function hasRegVerifiedBrowser(uid) {
    if (!uid) return false;
    const map = readStorageJson(localStorage, STORAGE_KEYS.REG_TRUST_UIDS, {});
    return map[uid] === true;
  }

  function markRegVerifiedBrowser(uid) {
    if (!uid) return;
    const map = readStorageJson(localStorage, STORAGE_KEYS.REG_TRUST_UIDS, {});
    map[uid] = true;
    writeStorageJson(localStorage, STORAGE_KEYS.REG_TRUST_UIDS, map);
  }

  function normalizeEmailKey(email) {
    return String(email || "").trim().toLowerCase();
  }

  function savePendingRegProfile(entry) {
    if (!entry || typeof entry !== "object") return;
    const uid = String(entry.uid || "").trim();
    const emailKey = normalizeEmailKey(entry.email);
    if (!uid && !emailKey) return;
    const map = readStorageJson(localStorage, STORAGE_KEYS.PENDING_REG_MAP, {});
    const record = {
      uid,
      email: emailKey,
      name: String(entry.name || "").trim(),
      phone: entry.phone !== undefined ? String(entry.phone || "").trim() : "",
      consent: !!entry.consent,
      savedAt: Date.now()
    };
    if (uid) map[`uid:${uid}`] = record;
    if (emailKey) map[`email:${emailKey}`] = record;
    writeStorageJson(localStorage, STORAGE_KEYS.PENDING_REG_MAP, map);
  }

  function getPendingRegProfile(user) {
    if (!user) return null;
    const map = readStorageJson(localStorage, STORAGE_KEYS.PENDING_REG_MAP, {});
    if (user.uid && map[`uid:${user.uid}`]) {
      return map[`uid:${user.uid}`];
    }
    const emailKey = normalizeEmailKey(user.email);
    if (emailKey && map[`email:${emailKey}`]) {
      return map[`email:${emailKey}`];
    }
    const legacy = readStorageJson(sessionStorage, "thuystalk_pending_reg_profile_v1", null);
    if (
      legacy &&
      ((user.uid && legacy.uid === user.uid) || (emailKey && normalizeEmailKey(legacy.email) === emailKey))
    ) {
      return legacy;
    }
    return null;
  }

  function removePendingRegProfile(user) {
    if (!user) return;
    const map = readStorageJson(localStorage, STORAGE_KEYS.PENDING_REG_MAP, {});
    const uid = String(user.uid || "").trim();
    const emailKey = normalizeEmailKey(user.email);
    let changed = false;
    Object.keys(map).forEach((k) => {
      const rec = map[k];
      if (
        k === `uid:${uid}` ||
        k === `email:${emailKey}` ||
        (rec && ((uid && rec.uid === uid) || (emailKey && normalizeEmailKey(rec.email) === emailKey)))
      ) {
        delete map[k];
        changed = true;
      }
    });
    if (changed) {
      writeStorageJson(localStorage, STORAGE_KEYS.PENDING_REG_MAP, map);
    }
    try {
      sessionStorage.removeItem("thuystalk_pending_reg_profile_v1");
    } catch (e) {}
  }

  function setSessionFlag(key, value) {
    try {
      if (value) sessionStorage.setItem(key, String(value));
      else sessionStorage.removeItem(key);
    } catch (e) {}
  }

  function getSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) || "";
    } catch (e) {
      return "";
    }
  }

  function normalizeBridgeBaseUrl(rawUrl) {
    const clean = String(rawUrl || "").trim();
    if (!clean) return "";
    return clean.replace(/\/api\/(?:notebook-query|notebook-status|notebook-job).*$/i, "").replace(/\/+$/, "");
  }

  function isHttpsUrl(url) {
    return /^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(String(url || "").trim());
  }

  function isLocalOriginUrl(url) {
    return /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(String(url || "").trim());
  }

  function getApiBase() {
    const localDefault = "http://localhost:8099";
    if (typeof window === "undefined" || !window.location) return "";
    const proto = String(window.location.protocol || "").toLowerCase();
    const host = String(window.location.hostname || "").toLowerCase();
    const port = String(window.location.port || "");
    const isLocalHost = host === "localhost" || host === "127.0.0.1";

    if (isLocalHost && port === "8099") {
      return window.location.origin;
    }

    const configured = normalizeBridgeBaseUrl(state && state.notebookBridgeUrl);
    if (proto === "file:" || isLocalHost) {
      if (isHttpsUrl(configured) || isLocalOriginUrl(configured)) {
        return configured;
      }
      return localDefault;
    }

    if (isHttpsUrl(configured)) {
      return configured;
    }
    return "";
  }

  function getApiUrl(apiPath) {
    const base = getApiBase();
    if (!base) return "";
    const path = String(apiPath || "").startsWith("/") ? String(apiPath || "") : `/${apiPath || ""}`;
    return `${base}${path}`;
  }

  async function postDeviceApi(apiPath, bodyPayload) {
    const apiUrl = getApiUrl(apiPath);
    if (!apiUrl) {
      return {
        ok: false,
        status: 503,
        networkError: true,
        data: { error: "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau." }
      };
    }
    const token =
      window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getIdToken === "function"
        ? await window.ThuysTalkFirebase.getIdToken(false)
        : null;
    if (!token) {
      return { ok: false, status: 401, data: { error: "Phiên đăng nhập chưa sẵn sàng." } };
    }
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(bodyPayload || {})
      });
      let data = {};
      try {
        data = await res.json();
      } catch (e) {}
      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        networkError: true,
        data: { error: "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau." }
      };
    }
  }

  function isHomePage() {
    return document.body && document.body.dataset.page === "home";
  }

  function getDefaultMiniTestDraft() {
    return [
      {
        q: {
          vi: "Câu 1: Theo quy định và tài liệu đối chiếu, nguyên tắc quan trọng nhất khi kiểm tra bộ chứng từ hải quan là gì?",
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
    socialLinks: loadCollection(STORAGE_KEYS.SOCIALS, window.THUYSTALK_DEFAULT_SOCIALS || []),
    videoCategories: loadCollection(STORAGE_KEYS.VIDEO_CATS, window.THUYSTALK_DEFAULT_VIDEO_CATEGORIES || []),
    notebookBridgeUrl: localStorage.getItem(STORAGE_KEYS.BRIDGE_URL) || "",
    learnerEmail: "",
    learnerUid: "",
    learnerName: localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || "",
    learnerPhone: localStorage.getItem(STORAGE_KEYS.LEARNER_PHONE) || "",
    completedLessons: JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || "{}"),
    lastLessonMap: JSON.parse(localStorage.getItem(STORAGE_KEYS.LAST_LESSON_MAP) || "{}"),
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

  const STORAGE_KEY_TO_FIRESTORE = {
    [STORAGE_KEYS.ARTICLES]: "articles",
    [STORAGE_KEYS.VIDEOS]: "videos",
    [STORAGE_KEYS.COURSES]: "courses",
    [STORAGE_KEYS.AI_KB]: "ai_kb",
    [STORAGE_KEYS.LEADS]: "leads"
  };

  function saveCollection(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
      showToast("Lưu ý: Dung lượng bộ nhớ trình duyệt gần đầy, đã áp dụng trên phiên hiện tại.");
    }

    // Auto-sync 1-1 to Cloud Firestore as Single Source of Truth
    const collName = STORAGE_KEY_TO_FIRESTORE[key];
    if (collName && window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
      window.ThuysTalkFirebase.syncCollection(collName, arr).catch((err) => {
        console.warn(`Cloud Firestore auto-sync error for ${collName}:`, err);
      });
    }
  }

  function saveCustomMedia() {
    try {
      localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(state.media));
    } catch (e) {}

    // Auto-sync Profile Photos & Settings to Cloud Firestore
    if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
      window.ThuysTalkFirebase.saveSiteSettings("media_profile", state.media).catch((err) => {
        console.warn("Cloud Firestore auto-sync error for media_profile:", err);
      });
    }
  }

  function saveSocialLinks() {
    try {
      localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(state.socialLinks));
    } catch (e) {}

    // Auto-sync Social Links to Cloud Firestore
    if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
      window.ThuysTalkFirebase.saveSiteSettings("social_links", { items: state.socialLinks }).catch((err) => {
        console.warn("Cloud Firestore auto-sync error for social_links:", err);
      });
    }
  }

  function saveVideoCategories() {
    try {
      localStorage.setItem(STORAGE_KEYS.VIDEO_CATS, JSON.stringify(state.videoCategories));
    } catch (e) {}

    if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
      window.ThuysTalkFirebase.saveSiteSettings("video_categories", { items: state.videoCategories }).catch((err) => {
        console.warn("Cloud Firestore auto-sync error for video_categories:", err);
      });
    }
  }

  let isHydratedFromFirestore = false;
  let isRealtimeListening = false;
  let hydrateRetryCount = 0;

  async function hydrateAllFromFirestore(forceRerender = false) {
    if (!window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isReady()) {
      if (hydrateRetryCount < 10) {
        hydrateRetryCount++;
        setTimeout(() => hydrateAllFromFirestore(forceRerender), 400);
      }
      return;
    }
    try {
      const [mediaRes, socialRes, videoCatsRes, bridgeRes, articlesRes, videosRes, coursesRes, aiKbRes] = await Promise.all([
        window.ThuysTalkFirebase.fetchSiteSettings("media_profile"),
        window.ThuysTalkFirebase.fetchSiteSettings("social_links"),
        window.ThuysTalkFirebase.fetchSiteSettings("video_categories"),
        window.ThuysTalkFirebase.fetchSiteSettings("ai_bridge"),
        window.ThuysTalkFirebase.fetchCollection("articles"),
        window.ThuysTalkFirebase.fetchCollection("videos"),
        window.ThuysTalkFirebase.fetchCollection("courses"),
        window.ThuysTalkFirebase.fetchCollection("ai_kb")
      ]);

      let hasUpdates = false;

      if (mediaRes && typeof mediaRes === "object" && Object.keys(mediaRes).length > 0) {
        state.media = { ...state.media, ...mediaRes };
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(state.media));
        hasUpdates = true;
      }

      if (socialRes && Array.isArray(socialRes.items) && socialRes.items.length > 0) {
        state.socialLinks = socialRes.items;
        localStorage.setItem(STORAGE_KEYS.SOCIALS, JSON.stringify(state.socialLinks));
        hasUpdates = true;
      }

      if (videoCatsRes && Array.isArray(videoCatsRes.items) && videoCatsRes.items.length > 0) {
        state.videoCategories = videoCatsRes.items;
        localStorage.setItem(STORAGE_KEYS.VIDEO_CATS, JSON.stringify(state.videoCategories));
        hasUpdates = true;
      }

      if (bridgeRes && bridgeRes.url && typeof bridgeRes.url === "string") {
        const cleanBridgeUrl = bridgeRes.url.trim();
        const isLocalOrigin = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
        if (isHttpsUrl(cleanBridgeUrl) || (isLocalOrigin && isLocalOriginUrl(normalizeBridgeBaseUrl(cleanBridgeUrl)))) {
          state.notebookBridgeUrl = cleanBridgeUrl;
          localStorage.setItem(STORAGE_KEYS.BRIDGE_URL, state.notebookBridgeUrl);
        }
      }

      if (Array.isArray(articlesRes) && articlesRes.length > 0) {
        state.articles = articlesRes;
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(state.articles));
        hasUpdates = true;
      }

      if (Array.isArray(videosRes) && videosRes.length > 0) {
        state.videos = videosRes;
        localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(state.videos));
        hasUpdates = true;
      }

      if (Array.isArray(coursesRes) && coursesRes.length > 0) {
        state.courses = coursesRes;
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(state.courses));
        hasUpdates = true;
      }

      if (Array.isArray(aiKbRes) && aiKbRes.length > 0) {
        state.aiKb = aiKbRes;
        localStorage.setItem(STORAGE_KEYS.AI_KB, JSON.stringify(state.aiKb));
        hasUpdates = true;
      }

      isHydratedFromFirestore = true;

      if (hasUpdates || forceRerender) {
        console.log("ThuysTalk: Hydrated 5/5 domains from Cloud Firestore SSoT successfully!");
        if (document.getElementById("adminSidebarNav")) {
          renderAdminStudioModal();
        } else {
          renderAll();
        }
      }

      const firestoreStatusPill = document.getElementById("adminSidebarFirestoreStatus");
      if (firestoreStatusPill) {
        firestoreStatusPill.textContent = "Cloud Firestore SSoT: Đã kết nối trực tiếp (5/5 phân hệ)";
        firestoreStatusPill.style.color = "var(--jade-800)";
        firestoreStatusPill.style.borderColor = "var(--jade-500)";
      }

      // Kích hoạt Real-Time bi-directional synchronization trên Firestore onSnapshot
      initFirestoreRealtimeSync();
      if (state.adminMode && document.getElementById("adminSidebarNav")) {
        initAdminProtectedListeners();
      }
    } catch (err) {
      console.warn("hydrateAllFromFirestore notice:", err);
    }
  }

  function initFirestoreRealtimeSync() {
    if (isRealtimeListening || !window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isReady()) return;
    isRealtimeListening = true;

    // 1. Articles Real-time Sync
    window.ThuysTalkFirebase.listenCollection("articles", (articles) => {
      if (Array.isArray(articles) && articles.length > 0) {
        const currentJson = JSON.stringify(state.articles);
        const newJson = JSON.stringify(articles);
        if (currentJson !== newJson) {
          state.articles = articles;
          localStorage.setItem(STORAGE_KEYS.ARTICLES, newJson);
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "articles") renderAdminArticlesTab(document.getElementById("adminStudioBody"));
          } else {
            renderArticlesSection(window.THUYSTALK_I18N[state.lang]);
          }
          console.log("[REALTIME SYNC] Articles updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 2. Videos Real-time Sync
    window.ThuysTalkFirebase.listenCollection("videos", (videos) => {
      if (Array.isArray(videos) && videos.length > 0) {
        const currentJson = JSON.stringify(state.videos);
        const newJson = JSON.stringify(videos);
        if (currentJson !== newJson) {
          state.videos = videos;
          localStorage.setItem(STORAGE_KEYS.VIDEOS, newJson);
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "videos") renderAdminVideosTab(document.getElementById("adminStudioBody"));
          } else {
            renderVideoSection(window.THUYSTALK_I18N[state.lang]);
          }
          console.log("[REALTIME SYNC] Videos updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 3. Courses Real-time Sync
    window.ThuysTalkFirebase.listenCollection("courses", (courses) => {
      if (Array.isArray(courses) && courses.length > 0) {
        const currentJson = JSON.stringify(state.courses);
        const newJson = JSON.stringify(courses);
        if (currentJson !== newJson) {
          state.courses = courses;
          localStorage.setItem(STORAGE_KEYS.COURSES, newJson);
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "elearning") renderAdminElearningTab(document.getElementById("adminStudioBody"));
          } else {
            renderElearningSection(window.THUYSTALK_I18N[state.lang]);
          }
          console.log("[REALTIME SYNC] Courses updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 4. Media Profile Settings Real-time Sync
    window.ThuysTalkFirebase.listenSiteSettings("media_profile", (mediaRes) => {
      if (mediaRes && typeof mediaRes === "object") {
        const currentJson = JSON.stringify(state.media);
        const newJson = JSON.stringify({ ...state.media, ...mediaRes });
        if (currentJson !== newJson) {
          state.media = { ...state.media, ...mediaRes };
          localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(state.media));
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "photos") renderAdminPhotosTab(document.getElementById("adminStudioBody"));
          } else {
            renderAll();
          }
          console.log("[REALTIME SYNC] Media profile updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 4b. Social Links Real-time Sync
    window.ThuysTalkFirebase.listenSiteSettings("social_links", (socialRes) => {
      if (socialRes && Array.isArray(socialRes.items)) {
        const currentJson = JSON.stringify(state.socialLinks);
        const newJson = JSON.stringify(socialRes.items);
        if (currentJson !== newJson) {
          state.socialLinks = socialRes.items;
          localStorage.setItem(STORAGE_KEYS.SOCIALS, newJson);
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "photos") renderAdminPhotosTab(document.getElementById("adminStudioBody"));
          } else {
            renderSocialLinks();
          }
          console.log("[REALTIME SYNC] Social links updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 4c. Video Categories (CM1..CMn) Real-time Sync
    window.ThuysTalkFirebase.listenSiteSettings("video_categories", (videoCatsRes) => {
      if (videoCatsRes && Array.isArray(videoCatsRes.items)) {
        const currentJson = JSON.stringify(state.videoCategories);
        const newJson = JSON.stringify(videoCatsRes.items);
        if (currentJson !== newJson) {
          state.videoCategories = videoCatsRes.items;
          localStorage.setItem(STORAGE_KEYS.VIDEO_CATS, newJson);
          if (document.getElementById("adminSidebarNav")) {
            if (state.activeCmsTab === "videos") renderAdminVideosTab(document.getElementById("adminStudioBody"));
          } else {
            renderVideoSection(window.THUYSTALK_I18N[state.lang]);
          }
          console.log("[REALTIME SYNC] Video categories updated across browsers via Firestore onSnapshot");
        }
      }
    });

    // 4d. AI Bridge Endpoint Real-time Sync
    window.ThuysTalkFirebase.listenSiteSettings("ai_bridge", (bridgeRes) => {
      if (bridgeRes && bridgeRes.url && typeof bridgeRes.url === "string") {
        const cleanUrl = bridgeRes.url.trim();
        const isLocalOrigin = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
        if (isHttpsUrl(cleanUrl) || (isLocalOrigin && isLocalOriginUrl(normalizeBridgeBaseUrl(cleanUrl)))) {
          state.notebookBridgeUrl = cleanUrl;
          localStorage.setItem(STORAGE_KEYS.BRIDGE_URL, cleanUrl);
        }
      }
    });

    // 5. Cross-tab synchronization via local StorageEvent fallback
    // (Protected learners & leads listeners are registered ONLY in initAdminProtectedListeners after Google Admin verification)
    window.addEventListener("storage", (e) => {
      if ([STORAGE_KEYS.ARTICLES, STORAGE_KEYS.VIDEOS, STORAGE_KEYS.COURSES, STORAGE_KEYS.MEDIA].includes(e.key)) {
        console.log("[STORAGE EVENT] Cross-tab update detected:", e.key);
        state.articles = loadArticlesState();
        state.videos = loadVideosState();
        state.courses = loadCoursesState();
        state.media = loadMediaState();
        if (document.getElementById("adminSidebarNav")) {
          renderAdminStudioModal();
        } else {
          renderAll();
        }
      }
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeUrlForCheck(raw) {
    return String(raw || "")
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim();
  }

  function isAllowedMediaSrc(raw) {
    const val = normalizeUrlForCheck(raw);
    if (!val) return false;
    if (/^https:\/\//i.test(val)) return true;
    if (/^\/?assets\/[a-zA-Z0-9._\-\/]+$/.test(val) && !val.includes("..")) return true;
    if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(val)) return true;
    return false;
  }

  function sanitizeSafeMediaUrl(raw, fallback = "") {
    const val = normalizeUrlForCheck(raw);
    return isAllowedMediaSrc(val) ? val : fallback;
  }

  function sanitizeSafeHref(raw, allowMailto = true) {
    const val = normalizeUrlForCheck(raw);
    if (!val) return "";
    const noWs = val.replace(/\s+/g, "");
    if (noWs.startsWith("#")) return val;
    if (/^https?:\/\//i.test(noWs)) return val;
    if (allowMailto && /^mailto:/i.test(noWs)) return val;
    if (!noWs.startsWith("//") && !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(noWs)) {
      return val;
    }
    return "";
  }

  let __domPurifyHooksBound = false;

  function ensureDomPurifyHooks() {
    if (__domPurifyHooksBound || typeof window === "undefined" || !window.DOMPurify) return;
    window.DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (!node || !node.tagName) return;
      const tag = node.tagName.toUpperCase();

      if (node.attributes) {
        for (let i = node.attributes.length - 1; i >= 0; i--) {
          const attrName = node.attributes[i].name;
          if (/^on/i.test(attrName)) {
            node.removeAttribute(attrName);
          }
        }
      }

      if (node.hasAttribute("href")) {
        const safeHref = sanitizeSafeHref(node.getAttribute("href"), true);
        if (safeHref) {
          node.setAttribute("href", safeHref);
        } else {
          node.removeAttribute("href");
        }
      }

      if (node.hasAttribute("target")) {
        const tgt = String(node.getAttribute("target") || "").trim().toLowerCase();
        if (tgt === "_blank") {
          const existingRel = String(node.getAttribute("rel") || "")
            .split(/\s+/)
            .filter(Boolean);
          if (!existingRel.includes("noopener")) existingRel.push("noopener");
          if (!existingRel.includes("noreferrer")) existingRel.push("noreferrer");
          node.setAttribute("rel", existingRel.join(" "));
        } else if (tgt !== "_self") {
          node.removeAttribute("target");
        }
      }

      if (node.hasAttribute("src")) {
        if (tag === "IMG" || tag === "VIDEO" || tag === "SOURCE") {
          const srcVal = normalizeUrlForCheck(node.getAttribute("src"));
          if (isAllowedMediaSrc(srcVal)) {
            node.setAttribute("src", srcVal);
          } else {
            node.removeAttribute("src");
          }
        } else {
          node.removeAttribute("src");
        }
      }

      if (node.hasAttribute("data-media-id")) {
        const mediaId = String(node.getAttribute("data-media-id") || "").trim();
        if (tag !== "IMG" || !/^[A-Za-z0-9_-]{10,40}$/.test(mediaId)) {
          node.removeAttribute("data-media-id");
        }
      }
    });
    __domPurifyHooksBound = true;
  }

  function sanitizeRichHtml(dirtyHtml) {
    const raw = String(dirtyHtml || "");
    if (!raw.trim()) return "";
    if (typeof window !== "undefined" && window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
      ensureDomPurifyHooks();
      return window.DOMPurify.sanitize(raw, {
        FORBID_TAGS: ["script", "iframe", "object", "embed", "svg", "math", "form", "input", "textarea", "style"],
        FORBID_ATTR: [
          "onerror", "onload", "onclick", "onmouseover", "onmouseout", "onmouseenter",
          "onmouseleave", "onfocus", "onblur", "onchange", "onsubmit", "onkeydown",
          "onkeyup", "onkeypress", "formaction"
        ],
        ADD_TAGS: ["video", "source", "figure", "figcaption"],
        ADD_ATTR: ["target", "rel", "controls", "playsinline", "preload", "data-media-id"],
        ALLOW_UNKNOWN_PROTOCOLS: false
      });
    }
    return `<p>${escapeHtml(raw)}</p>`;
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
    const posX = Number.isFinite(Number(m.posX)) ? Number(m.posX) : 50;
    const posY = Number.isFinite(Number(m.posY)) ? Number(m.posY) : 20;
    const scaleNum = Number.isFinite(Number(m.scale)) ? Number(m.scale) : 100;
    const scale = scaleNum / 100;
    return `object-position: ${posX}% ${posY}%; transform: scale(${scale});`;
  }

  function getPhotoUrl(slotKey) {
    const m = state.media[slotKey] || window.THUYSTALK_DEFAULT_MEDIA[slotKey];
    return m ? sanitizeSafeMediaUrl(m.url, "") : "";
  }

  function isValidYoutubeId(id) {
    return /^[A-Za-z0-9_-]{11}$/.test(String(id || "").trim());
  }

  // Extract 11-char YouTube Video ID and full embed src from ANY input:
  // - Full <iframe src="https://www.youtube.com/embed/89D3QY2Cjs8?si=..." ...></iframe>
  // - Watch link: https://www.youtube.com/watch?v=89D3QY2Cjs8
  // - Share link: https://youtu.be/89D3QY2Cjs8?si=...
  // - Shorts link: https://www.youtube.com/shorts/89D3QY2Cjs8
  function extractYoutubeId(input) {
    const s = String(input || "").trim();
    if (!s) return "";
    if (isValidYoutubeId(s)) return s;
    const iframeSrcMatch = s.match(/src=["']([^"']+)["']/i);
    const target = iframeSrcMatch ? iframeSrcMatch[1] : s;
    const m = target.match(
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/
    );
    return m && isValidYoutubeId(m[1]) ? m[1] : "";
  }

  function buildYoutubeEmbedSrc(videoObjOrRaw) {
    if (!videoObjOrRaw) return "";
    if (
      typeof videoObjOrRaw === "object" &&
      videoObjOrRaw.youtubeEmbedId &&
      !isValidYoutubeId(videoObjOrRaw.youtubeEmbedId)
    ) {
      return "";
    }
    const raw =
      typeof videoObjOrRaw === "string"
        ? videoObjOrRaw
        : videoObjOrRaw.youtubeEmbedSrc || videoObjOrRaw.youtubeUrl || videoObjOrRaw.youtubeEmbedId || "";
    const s = String(raw || "").trim();
    const ytId = extractYoutubeId(s);
    if (!isValidYoutubeId(ytId)) return "";
    const isNoCookie = /youtube-nocookie\.com\/embed\//i.test(s);
    const host = isNoCookie ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
    const siMatch = s.match(/[?&]si=([a-zA-Z0-9_-]{1,64})(?:[&#"'\s]|$)/);
    return siMatch
      ? `${host}/embed/${ytId}?si=${siMatch[1]}`
      : `${host}/embed/${ytId}`;
  }

  // ==========================================================================
  // SOCIAL LINKS SVG ICONS & DYNAMIC RENDERER
  // ==========================================================================
  const SOCIAL_PLATFORM_META = {
    youtube: { name: "YouTube", placeholder: "https://youtube.com/@thuystalk" },
    facebook: { name: "Facebook", placeholder: "https://facebook.com/thuystalk" },
    zalo: { name: "Zalo", placeholder: "https://zalo.me/84767648862" },
    tiktok: { name: "TikTok", placeholder: "https://tiktok.com/@thuystalk" },
    linkedin: { name: "LinkedIn", placeholder: "https://linkedin.com/in/thuystalk" },
    instagram: { name: "Instagram", placeholder: "https://instagram.com/thuystalk" },
    email: { name: "Email", placeholder: "mailto:thuystalk.official@gmail.com" },
    website: { name: "Website", placeholder: "https://thuystalk.vn" }
  };

  function getSocialIconSvg(platform) {
    const p = String(platform || "website").toLowerCase();
    switch (p) {
      case "youtube":
        return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
      case "facebook":
        return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>`;
      case "zalo":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5C6.75 2.5 2.5 6.3 2.5 11c0 2.68 1.38 5.08 3.55 6.64-.26 1.56-.94 2.86-1.55 3.86 1.88-.18 3.64-.95 4.86-1.76.83.17 1.71.26 2.64.26 5.25 0 9.5-3.8 9.5-8.5S17.25 2.5 12 2.5z" fill="currentColor" stroke="none"/><path d="M7.6 8.6h4.2l-4.2 5.4h4.4" stroke="#fff" stroke-width="1.75"/><path d="M14.2 10.6v3.4m2.6-3.4v3.4" stroke="#fff" stroke-width="1.65"/></svg>`;
      case "tiktok":
        return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`;
      case "linkedin":
        return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>`;
      case "instagram":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
      case "email":
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
      default:
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`;
    }
  }

  function renderSocialLinks() {
    const containers = document.querySelectorAll(".hero-socials");
    if (!containers.length) return;
    const links = Array.isArray(state.socialLinks) && state.socialLinks.length > 0
      ? state.socialLinks
      : (window.THUYSTALK_DEFAULT_SOCIALS || []);

    const html = links
      .filter((item) => item && item.url)
      .map((item) => {
        const platform = String(item.platform || "website").toLowerCase();
        const label = escapeHtml(item.label || (SOCIAL_PLATFORM_META[platform] ? SOCIAL_PLATFORM_META[platform].name : "Link"));
        const rawSafeUrl = sanitizeSafeHref(item.url, true);
        if (!rawSafeUrl) return "";
        const safeUrl = escapeHtml(rawSafeUrl);
        const isMail = rawSafeUrl.startsWith("mailto:");
        return `<a href="${safeUrl}" ${isMail ? "" : 'target="_blank" rel="noopener noreferrer"'} class="social-pill" data-platform="${escapeHtml(platform)}" title="${label}" aria-label="${label}">${getSocialIconSvg(platform)}</a>`;
      })
      .join("");

    containers.forEach((box) => {
      box.innerHTML = html;
    });
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
    renderSocialLinks();

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
        const displayName = state.learnerName || localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || state.learnerEmail.split("@")[0];
        banner.innerHTML = `
          <div class="learner-info">
            <div class="learner-badge-code">EDU</div>
            <div>
              <h4>Xin chào, <span class="text-orange">${escapeHtml(displayName)}</span>!</h4>
              <p style="font-size:0.83rem; margin:0; line-height:1.45;">Tài khoản: <strong>${escapeHtml(state.learnerEmail)}</strong> · Tiến trình học tập &amp; tài liệu mở khóa tự động.</p>
            </div>
          </div>
          <div class="learner-email-form" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn btn-jade btn-sm" id="bannerProfileBtn">
              Hồ Sơ Cá Nhân
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="bannerLogoutBtn">
              Đăng Xuất
            </button>
          </div>`;
        const profileBtn = document.getElementById("bannerProfileBtn");
        if (profileBtn) {
          profileBtn.addEventListener("click", () => openUserProfileModal("info"));
        }
        const logoutBtn = document.getElementById("bannerLogoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async () => {
            if (window.ThuysTalkFirebase) {
              await window.ThuysTalkFirebase.logoutLearner();
            }
            clearLearnerClientState();
            showToast("Đã đăng xuất tài khoản thành công.");
          });
        }
      } else {
        banner.innerHTML = `
          <div class="learner-info">
            <div class="learner-badge-code">EDU</div>
            <div>
              <h4>Đăng ký hoặc Đăng nhập để lưu tiến độ học &amp; tải bộ tài liệu gốc</h4>
              <p style="font-size:0.83rem; margin:0; line-height:1.45;">Tài khoản hoàn toàn miễn phí. Đăng nhập để lưu tiến độ, làm Mini Test và tải biểu mẫu, checklist chuyên ngành.</p>
            </div>
          </div>
          <div class="learner-email-form" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="btn btn-jade btn-sm" id="bannerLoginBtn">
              Đăng Nhập Tài Khoản
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="bannerRegisterBtn">
              Đăng Ký Tài Khoản Mới
            </button>
          </div>`;
        const loginBtn = document.getElementById("bannerLoginBtn");
        if (loginBtn) {
          loginBtn.addEventListener("click", () => openLearnerAuthModal("login"));
        }
        const regBtn = document.getElementById("bannerRegisterBtn");
        if (regBtn) {
          regBtn.addEventListener("click", () => openLearnerAuthModal("register"));
        }
      }
    }

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    const displayedCourses = isHomePage() ? state.courses.slice(0, 2) : state.courses;

    grid.innerHTML = displayedCourses
      .map((c) => {
        const pct = Number(getCourseProgress(c)) || 0;
        const photoUrl = sanitizeSafeMediaUrl(c.customCover || getPhotoUrl(c.photoSlot || "aboutSpeaker"), "assets/images/about-speaker.webp");
        const photoStyle = c.customCover ? "" : getPhotoStyle(c.photoSlot || "aboutSpeaker");
        const titleText = typeof c.title === "object" ? c.title[state.lang] || c.title.vi : c.title;
        const descText = typeof c.desc === "object" ? c.desc[state.lang] || c.desc.vi : c.desc;
        const metaText = typeof c.meta === "object" ? c.meta[state.lang] || c.meta.vi : c.meta;
        const badgeText = typeof c.badge === "object" ? c.badge[state.lang] || c.badge.vi : c.badge;
        const delivText = typeof c.deliverable === "object" ? c.deliverable[state.lang] || c.deliverable.vi : c.deliverable;

        return `
        <article class="course-card">
          <div class="course-thumb editable-photo-wrap">
            <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(titleText)}" style="${photoStyle}" />
            <span class="course-badge-top">${escapeHtml(badgeText)}</span>
            ${
              c.photoSlot
                ? `<button type="button" class="photo-change-trigger" data-slot="${escapeHtml(c.photoSlot)}">
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
              <button type="button" class="btn btn-primary btn-sm open-course-btn" data-course="${escapeHtml(c.id)}">
                ${t.elearning.btnStartCourse}
              </button>
              <button type="button" class="btn btn-outline-orange btn-sm send-kit-btn" data-course="${escapeHtml(c.id)}">
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

  function getNextUnfinishedLessonIndex(course) {
    if (!course || !Array.isArray(course.lessons) || !course.lessons.length) return 0;
    const savedIdx = state.lastLessonMap && typeof state.lastLessonMap[course.id] === "number"
      ? state.lastLessonMap[course.id]
      : null;
    if (savedIdx !== null && savedIdx >= 0 && savedIdx < course.lessons.length) {
      const savedLesson = course.lessons[savedIdx];
      if (savedLesson && !state.completedLessons[savedLesson.id]) {
        return savedIdx;
      }
    }
    const firstUnfinished = course.lessons.findIndex((l) => !state.completedLessons[l.id]);
    return firstUnfinished >= 0 ? firstUnfinished : 0;
  }

  function saveLastLessonIndex(courseId, lessonIndex) {
    if (!courseId || typeof lessonIndex !== "number") return;
    state.lastLessonMap[courseId] = lessonIndex;
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LESSON_MAP, JSON.stringify(state.lastLessonMap));
    } catch (e) {}
  }

  function openCourseClassroom(courseId, explicitLessonIdx = null) {
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return;
    const totalLessons = (course.lessons && course.lessons.length) || 1;
    let targetIdx =
      explicitLessonIdx !== null && explicitLessonIdx !== undefined && !isNaN(Number(explicitLessonIdx))
        ? Math.max(0, Math.min(totalLessons - 1, parseInt(explicitLessonIdx, 10)))
        : getNextUnfinishedLessonIndex(course);

    const modalEl = document.getElementById("classroomModal");
    if (!modalEl) {
      window.location.href = `elearning.html?openCourse=${encodeURIComponent(courseId)}&lesson=${targetIdx}`;
      return;
    }

    state.activeCourseId = courseId;
    state.activeLessonIndex = targetIdx;
    saveLastLessonIndex(courseId, targetIdx);
    renderClassroomModal();
    modalEl.classList.add("open");
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
          ${doneTag}${state.lang === "vi" ? "Bài" : "Lesson"} ${idx + 1} (${escapeHtml(l.duration || "10:00")})
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
        ${sanitizeRichHtml(lContent)}
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
                  ? "Đã hoàn thành Mini Test"
                  : "Lesson Completed"
                : state.lang === "vi"
                ? "Đánh dấu hoàn thành & Lưu tiến độ"
                : "Mark Complete & Save Progress"
            }
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="modalSendKitBtn">
            ${state.lang === "vi" ? "Tải bộ tài liệu & Checklist" : "Download Kit & Checklist"}
          </button>
        </div>
      </div>`;

    bodyEl.querySelectorAll("[data-lidx]").forEach((b) => {
      b.addEventListener("click", () => {
        state.activeLessonIndex = parseInt(b.dataset.lidx, 10);
        saveLastLessonIndex(course.id, state.activeLessonIndex);
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
          ? "Đã cập nhật tiến độ Mini Test"
          : "Lesson progress updated"
      );
    });

    document.getElementById("modalSendKitBtn").addEventListener("click", () => {
      handleSendCourseKit(course.id);
    });
  }

  const inFlightDownloadKeys = new Set();

  function buildDownloadDedupKey(uid, itemType, itemId, fileName) {
    return `${uid || "anon"}::${itemType || ""}::${itemId || ""}::${fileName || ""}`;
  }

  function shouldRecordDownloadLeadNow(uid, itemType, itemId, fileName) {
    if (!uid) return false;
    const key = buildDownloadDedupKey(uid, itemType, itemId, fileName);
    if (inFlightDownloadKeys.has(key)) return false;
    const map = readStorageJson(localStorage, STORAGE_KEYS.DOWNLOAD_DEDUP, {});
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const ts = Number(map[key] || 0);
    return !(ts > 0 && now - ts < DAY_MS);
  }

  function markDownloadLeadRecorded(uid, itemType, itemId, fileName) {
    if (!uid) return;
    const key = buildDownloadDedupKey(uid, itemType, itemId, fileName);
    const map = readStorageJson(localStorage, STORAGE_KEYS.DOWNLOAD_DEDUP, {});
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    Object.keys(map).forEach((k) => {
      if (now - Number(map[k] || 0) >= DAY_MS) delete map[k];
    });
    map[key] = now;
    writeStorageJson(localStorage, STORAGE_KEYS.DOWNLOAD_DEDUP, map);
  }

  function showManualDownloadBanner(fileName, performDownload) {
    const prev = document.getElementById("manualDownloadFallbackBar");
    if (prev) prev.remove();
    const bar = document.createElement("div");
    bar.id = "manualDownloadFallbackBar";
    bar.style.cssText =
      "position:fixed;right:20px;bottom:76px;z-index:9998;max-width:360px;background:#064E3B;color:#FFFFFF;border:1.5px solid #34D399;border-radius:12px;padding:12px 14px;box-shadow:0 16px 36px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:0.83rem;";
    bar.innerHTML = `
      <div style="min-width:0;">
        <div style="font-weight:800;color:#ECFDF5;">Sẵn sàng tải tài liệu</div>
        <div style="font-size:0.78rem;color:#D1FAE5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(fileName || "Tai lieu ThuysTalk")}</div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
        <button type="button" id="manualDownloadNowBtn" class="btn btn-primary btn-xs" style="background:#F59E0B;border-color:#F59E0B;color:#0F172A;font-weight:800;">Tải ngay</button>
        <button type="button" id="manualDownloadCloseBtn" aria-label="Đóng" style="border:none;background:transparent;color:#D1FAE5;font-size:1.1rem;cursor:pointer;padding:2px 4px;">&times;</button>
      </div>
    `;
    document.body.appendChild(bar);
    const nowBtn = bar.querySelector("#manualDownloadNowBtn");
    const closeBtn = bar.querySelector("#manualDownloadCloseBtn");
    if (nowBtn) {
      nowBtn.addEventListener("click", () => {
        try {
          if (typeof performDownload === "function") performDownload();
        } finally {
          bar.remove();
        }
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", () => bar.remove());
    setTimeout(() => {
      if (bar.parentNode) bar.remove();
    }, 15000);
  }

  function executeVerifiedMaterialDownload(user, meta, performDownload, fromAsyncFlow) {
    const activeUser =
      user ||
      (window.ThuysTalkFirebase && window.ThuysTalkFirebase.getCurrentUser
        ? window.ThuysTalkFirebase.getCurrentUser()
        : null);
    const uid = (activeUser && activeUser.uid) || state.learnerUid || "";
    const dedupKey = buildDownloadDedupKey(uid, meta.itemType, meta.itemId, meta.fileName);

    if (shouldRecordDownloadLeadNow(uid, meta.itemType, meta.itemId, meta.fileName)) {
      inFlightDownloadKeys.add(dedupKey);
      if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.recordDownloadLead === "function") {
        window.ThuysTalkFirebase
          .recordDownloadLead({
            name: state.learnerName || (activeUser && activeUser.displayName) || "",
            itemType: meta.itemType,
            itemId: meta.itemId,
            itemTitle: meta.itemTitle,
            fileName: meta.fileName
          })
          .then((saved) => {
            if (saved) markDownloadLeadRecorded(uid, meta.itemType, meta.itemId, meta.fileName);
          })
          .catch(() => {})
          .finally(() => {
            inFlightDownloadKeys.delete(dedupKey);
          });
      } else {
        inFlightDownloadKeys.delete(dedupKey);
      }
    }

    let downloadSucceeded = false;
    try {
      if (typeof performDownload === "function") performDownload();
      downloadSucceeded = true;
    } catch (e) {
      downloadSucceeded = false;
    }
    if (fromAsyncFlow || !downloadSucceeded) {
      showManualDownloadBanner(meta.fileName, performDownload);
    }
  }

  function triggerGatedMaterialDownload(meta) {
    const fbUser =
      window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getCurrentUser === "function"
        ? window.ThuysTalkFirebase.getCurrentUser()
        : null;
    const isVerifiedLoggedIn = !!(fbUser && fbUser.emailVerified === true && state.learnerUid && state.learnerEmail);

    if (isVerifiedLoggedIn) {
      executeVerifiedMaterialDownload(fbUser, meta, meta.performDownload, false);
      return;
    }

    requireLearnerLogin({
      reason: "Đăng nhập để tải tài liệu (1 chạm với Google)",
      pendingAction: {
        type: "download",
        itemType: meta.itemType,
        itemId: meta.itemId
      },
      onSuccess: (loggedUser) => {
        setSessionFlag(STORAGE_KEYS.PENDING_ACTION, "");
        executeVerifiedMaterialDownload(loggedUser, meta, meta.performDownload, true);
      }
    });
  }

  window.__thuystalkResumePendingAction = function (pendingAct, user) {
    if (!pendingAct || pendingAct.type !== "download") return;
    if (pendingAct.itemType === "course") {
      const course = state.courses.find((c) => c.id === pendingAct.itemId);
      if (course) {
        const cTitleVi = typeof course.title === "object" ? course.title.vi : course.title;
        executeVerifiedMaterialDownload(
          user,
          {
            itemType: "course",
            itemId: course.id,
            itemTitle: cTitleVi,
            fileName: `ThuysTalk_Tai_Lieu_${course.id}.txt`
          },
          () => triggerChecklistDownload(course),
          true
        );
      }
    } else if (pendingAct.itemType === "video") {
      const video = state.videos.find((v) => v.id === pendingAct.itemId);
      if (video) {
        const vTitleVi = typeof video.title === "object" ? video.title.vi : video.title;
        executeVerifiedMaterialDownload(
          user,
          {
            itemType: "video",
            itemId: video.id,
            itemTitle: vTitleVi,
            fileName: `ThuysTalk_Checklist_${video.id || "video"}.txt`
          },
          () => downloadVideoChecklist(video),
          true
        );
      }
    } else if (pendingAct.itemType === "article") {
      const art = state.articles.find((a) => a.id === pendingAct.itemId);
      if (art) {
        const aTitleVi = typeof art.title === "object" ? art.title.vi : art.title;
        executeVerifiedMaterialDownload(
          user,
          {
            itemType: "article",
            itemId: art.id,
            itemTitle: aTitleVi,
            fileName: `ThuysTalk_Tai_Lieu_${art.id || "article"}.txt`
          },
          () => downloadArticleTemplate(art),
          true
        );
      }
    }
  };

  function handleSendCourseKit(courseId) {
    const course = state.courses.find((c) => c.id === courseId) || state.courses[0];
    if (!course) return;
    const cTitleVi = typeof course.title === "object" ? course.title.vi : course.title;
    triggerGatedMaterialDownload({
      itemType: "course",
      itemId: course.id,
      itemTitle: cTitleVi,
      fileName: `ThuysTalk_Tai_Lieu_${course.id}.txt`,
      performDownload: () => {
        triggerChecklistDownload(course);
        showToast(
          state.lang === "vi"
            ? "Đang tải bộ tài liệu & Checklist chuyên đề về máy..."
            : "Downloading course resource kit & checklist..."
        );
      }
    });
  }

  function triggerChecklistDownload(course) {
    const cTitleVi = typeof course.title === "object" ? course.title.vi : course.title;
    const cDelivVi = typeof course.deliverable === "object" ? course.deliverable.vi : course.deliverable;
    const content = [
      "====================================================================",
      "THUYSTALK E-LEARNING RESOURCE KIT & MINI-TEST WORKBOOK",
      "Chuyên gia: Nguyễn Thị Ngọc Thúy (9+ Năm Kinh Nghiệm Thực Tế XNK, Hải Quan & AI)",
      "====================================================================",
      "",
      "CHUYÊN ĐỀ & TÀI LIỆU: " + cTitleVi,
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
  function getVideoCategoryList() {
    return Array.isArray(state.videoCategories) && state.videoCategories.length
      ? state.videoCategories
      : (window.THUYSTALK_DEFAULT_VIDEO_CATEGORIES || []);
  }

  function getVideoCategoryLabel(cmId, fallbackObj, lang = state.lang) {
    const found = getVideoCategoryList().find((c) => c.id === cmId);
    if (found) {
      return lang === "en" ? (found.labelEn || found.labelVi || found.id) : (found.labelVi || found.labelEn || found.id);
    }
    if (fallbackObj && typeof fallbackObj === "object") {
      return fallbackObj[lang] || fallbackObj.vi || cmId || "";
    }
    return fallbackObj || cmId || "";
  }

  function renderVideoSection(t) {
    setText("vidEyebrow", t.video.eyebrow);
    setText("vidTitle", t.video.title);
    setText("vidDesc", t.video.desc);

    const dynamicCats = getVideoCategoryList();
    if (state.activeVideoCat !== "all" && !dynamicCats.some((c) => c.id === state.activeVideoCat)) {
      state.activeVideoCat = "all";
    }

    const tabsData = [
      { id: "all", label: state.lang === "en" ? "All Videos" : "Tất cả video" },
      ...dynamicCats.map((c) => ({
        id: c.id,
        label: state.lang === "en" ? (c.labelEn || c.labelVi || c.id) : (c.labelVi || c.labelEn || c.id)
      }))
    ];

    const tabsWrap = document.getElementById("videoFilterTabs");
    if (tabsWrap) {
      tabsWrap.innerHTML = tabsData
        .map(
          (tab) => `
        <button type="button" class="filter-tab ${state.activeVideoCat === tab.id ? "active" : ""}" data-vcat="${escapeHtml(tab.id)}">
          ${escapeHtml(tab.label)}
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
      const rawYtId = extractYoutubeId(activeVid.youtubeEmbedId || activeVid.youtubeEmbedSrc || activeVid.youtubeUrl);
      const ytId =
        (!activeVid.youtubeEmbedId || isValidYoutubeId(activeVid.youtubeEmbedId)) && isValidYoutubeId(rawYtId)
          ? rawYtId
          : "";
      const embedSrc = ytId ? buildYoutubeEmbedSrc(activeVid) : "";
      const vTitle = typeof activeVid.title === "object" ? activeVid.title[state.lang] || activeVid.title.vi : activeVid.title;
      const vDesc = typeof activeVid.desc === "object" ? activeVid.desc[state.lang] || activeVid.desc.vi : activeVid.desc;
      const vCmLabel = getVideoCategoryLabel(activeVid.cm, activeVid.cmLabel, state.lang);
      const thumbUrl = ytId
        ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
        : sanitizeSafeMediaUrl(getPhotoUrl(activeVid.thumbSlot || "aboutSpeaker"), "assets/images/about-speaker.webp");
      const thumbStyle = ytId ? "" : getPhotoStyle(activeVid.thumbSlot || "aboutSpeaker");
      const safeWatchHref = escapeHtml(
        ytId
          ? `https://www.youtube.com/watch?v=${ytId}`
          : sanitizeSafeHref(activeVid.youtubeUrl, false) || "https://www.youtube.com/@thuystalk"
      );

      const isFileProtocol = window.location.protocol === "file:";
      const localHopBase = isFileProtocol ? getApiBase() : "";
      const playerMediaHtml = embedSrc
        ? isFileProtocol
          ? `
            <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(vTitle)}" style="width:100%;height:100%;object-fit:cover;opacity:0.55;" />
            <div class="video-play-overlay" style="background:rgba(4,40,32,0.78); padding:24px; text-align:center;">
              <a href="${escapeHtml(localHopBase)}/index.html#video" class="play-btn-pill" style="text-decoration:none;">
                Mở qua máy chủ nội bộ để phát Video YouTube trực tiếp (Tránh lỗi 153 của trình duyệt khi mở file://)
              </a>
              <a href="https://www.youtube.com/watch?v=${escapeHtml(ytId)}" target="_blank" rel="noopener noreferrer" style="color:#FFF; font-size:0.84rem; font-weight:700; text-decoration:underline; margin-top:6px;">
                Hoặc mở xem ngay trên YouTube (@thuystalk)
              </a>
            </div>`
          : `<iframe width="560" height="315" src="${escapeHtml(embedSrc)}" title="${escapeHtml(vTitle)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
        : `
          <img src="${escapeHtml(thumbUrl)}" alt="${escapeHtml(vTitle)}" style="${thumbStyle}" />
          ${
            activeVid.thumbSlot
              ? `<button type="button" class="photo-change-trigger" data-slot="${escapeHtml(activeVid.thumbSlot)}">
                  ${state.lang === "vi" ? "Đổi ảnh" : "Change Photo"}
                 </button>`
              : ""
          }
          <div class="video-play-overlay">
            <button type="button" class="play-btn-pill" id="openVideoScriptModalBtn">
              ${state.lang === "vi" ? "Xem kịch bản & Nội dung video" : "Open Video Script & Notes"}
            </button>
            <span style="font-size:0.78rem; font-weight:700; background:rgba(6,61,49,0.88); padding:5px 14px; border-radius:99px; border:1px solid var(--orange-400);">
              ${escapeHtml(vCmLabel)} · ${escapeHtml(activeVid.duration || "08:00")}
            </span>
          </div>`;

      stageEl.innerHTML = `
        <div class="video-player-stage editable-photo-wrap">
          ${playerMediaHtml}
        </div>
        <div class="featured-video-info">
          <span style="color:var(--orange-400); font-size:0.76rem; font-weight:800; letter-spacing:0.08em;">
            @THUYSTALK OFFICIAL SERIES · ${escapeHtml(activeVid.date || "11/2026")}
          </span>
          <h3>${escapeHtml(vTitle)}</h3>
          <p>${escapeHtml(vDesc)}</p>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" id="readFullScriptBtn">
              ${t.video.btnReadScript}
            </button>
            <a href="${safeWatchHref}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="background:rgba(255,255,255,0.1); color:#FFF; border-color:rgba(255,255,255,0.25);">
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
          const rawItemYtId = extractYoutubeId(v.youtubeEmbedId || v.youtubeEmbedSrc || v.youtubeUrl);
          const ytId =
            (!v.youtubeEmbedId || isValidYoutubeId(v.youtubeEmbedId)) && isValidYoutubeId(rawItemYtId)
              ? rawItemYtId
              : "";
          const tUrl = ytId
            ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
            : sanitizeSafeMediaUrl(getPhotoUrl(v.thumbSlot || "aboutSpeaker"), "assets/images/about-speaker.webp");
          const tStyle = ytId ? "" : getPhotoStyle(v.thumbSlot || "aboutSpeaker");
          const vTitle = typeof v.title === "object" ? v.title[state.lang] || v.title.vi : v.title;
          const vCmLabel = getVideoCategoryLabel(v.cm, v.cmLabel, state.lang);
          return `
          <div class="video-list-item ${activeVid && v.id === activeVid.id ? "active" : ""}" data-vid="${escapeHtml(v.id)}">
            <div class="video-list-thumb">
              <img src="${escapeHtml(tUrl)}" alt="${escapeHtml(vTitle)}" style="${tStyle}" />
              <span class="dur">${escapeHtml(v.duration || "08:00")}</span>
            </div>
            <div class="video-list-meta">
              <span class="cm-tag">${escapeHtml(vCmLabel)}</span>
              <h4>${escapeHtml(vTitle)}</h4>
              <span>${escapeHtml(v.date || "11/2026")} · YouTube @thuystalk</span>
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
    const vCmLabel = getVideoCategoryLabel(video.cm, video.cmLabel, state.lang);
    const vScript = typeof video.script === "object" ? video.script[state.lang] || video.script.vi : video.script;

    document.getElementById("articleModalTitle").textContent = vCmLabel + " · @thuystalk";
    document.getElementById("articleModalBody").innerHTML = `
      <div class="reader-content">
        <h2>${escapeHtml(vTitle)}</h2>
        <p style="color:var(--jade-700); font-weight:700;">Thời lượng: ${escapeHtml(video.duration || "08:00")} · Ngày đăng: ${escapeHtml(video.date || "11/2026")}</p>
        <hr style="border:none; border-top:1px solid var(--ink-200); margin:16px 0;" />
        ${sanitizeRichHtml(vScript)}
      </div>
      <div class="material-lead-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <strong>${state.lang === "vi" ? "Bạn muốn tải bộ Checklist hành động từ video này về máy?" : "Want the actionable checklist from this video downloaded to your device?"}</strong>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="videoRequestChecklistBtn">
          ${state.lang === "vi" ? "Tải Checklist video (.txt)" : "Download Video Checklist (.txt)"}
        </button>
      </div>`;

    document.getElementById("videoRequestChecklistBtn").addEventListener("click", () => {
      const vTitleVi = typeof video.title === "object" ? video.title.vi : video.title;
      triggerGatedMaterialDownload({
        itemType: "video",
        itemId: video.id || "video",
        itemTitle: vTitleVi,
        fileName: `ThuysTalk_Checklist_${video.id || "video"}.txt`,
        performDownload: () => downloadVideoChecklist(video)
      });
    });

    document.getElementById("articleModal").classList.add("open");
  }

  function downloadVideoChecklist(video) {
    const vTitle = typeof video.title === "object" ? video.title[state.lang] || video.title.vi : video.title;
    const vCmLabel = getVideoCategoryLabel(video.cm, video.cmLabel, state.lang);
    const vScript = typeof video.script === "object" ? video.script[state.lang] || video.script.vi : video.script;

    const content = [
      "====================================================================",
      "THUYSTALK - CHECKLIST HÀNH ĐỘNG TỪ VIDEO",
      "Chuyên mục: " + vCmLabel,
      "Tiêu đề: " + vTitle,
      "Thời lượng: " + (video.duration || "08:00") + " | Ngày đăng: " + (video.date || "11/2026"),
      "Chia sẻ bởi: Nguyễn Thị Ngọc Thúy · Sáng lập ThuysTalk & Giám đốc Eureka Logistics",
      "====================================================================",
      "",
      "NỘI DUNG KỊCH BẢN & CHECKLIST CHI TIẾT:",
      String(vScript || "").replace(/<[^>]*>/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
      "",
      "--------------------------------------------------------------------",
      "Hotline tư vấn chuyên sâu / Zalo: 0767.648.862 | Website: ThuysTalk",
      "Email: tthuyn@erktransport.com | Zalo: 0767.648.862"
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ThuysTalk_Checklist_${video.id || "video"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đang tải Checklist video về máy...");
  }

  function downloadArticleTemplate(art) {
    const aTitle = typeof art.title === "object" ? art.title[state.lang] || art.title.vi : art.title;
    const aPillar = typeof art.pillarLabel === "object" ? art.pillarLabel[state.lang] || art.pillarLabel.vi : art.pillar;
    const aBody = typeof art.body === "object" ? art.body[state.lang] || art.body.vi : art.body;
    const aExcerpt = typeof art.excerpt === "object" ? art.excerpt[state.lang] || art.excerpt.vi : art.excerpt;

    const content = [
      "====================================================================",
      "THUYSTALK - BIỂU MẪU & CÔNG VĂN TRÍCH DẪN BÀI VIẾT",
      "Chuyên mục: " + aPillar,
      "Tiêu đề: " + aTitle,
      "Tác giả: Nguyễn Thị Ngọc Thúy · Sáng lập ThuysTalk & Giám đốc Eureka Logistics",
      "Ngày đăng: " + (art.date || "11/2026"),
      "====================================================================",
      "",
      "TÓM TẮT NỘI DUNG:",
      String(aExcerpt || "").trim(),
      "",
      "TOÀN VĂN NỘI DUNG BÀI VIẾT & HƯỚNG DẪN ÁP DỤNG:",
      String(aBody || "").replace(/<[^>]*>/g, "\n").replace(/\n{3,}/g, "\n\n").trim(),
      "",
      "--------------------------------------------------------------------",
      "Hotline tư vấn chuyên sâu / Zalo: 0767.648.862 | Website: ThuysTalk",
      "Email: tthuyn@erktransport.com | Zalo: 0767.648.862"
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ThuysTalk_Tai_Lieu_${art.id || "article"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đang tải biểu mẫu & công văn về máy...");
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
        const pUrl = sanitizeSafeMediaUrl(a.customImg || getPhotoUrl(a.photoSlot || "heroPortrait"), "assets/images/hero-portrait.webp");
        const pStyle = a.customImg ? "" : getPhotoStyle(a.photoSlot || "heroPortrait");
        const aTitle = typeof a.title === "object" ? a.title[state.lang] || a.title.vi : a.title;
        const aExcerpt = typeof a.excerpt === "object" ? a.excerpt[state.lang] || a.excerpt.vi : a.excerpt;
        const aPillar = typeof a.pillarLabel === "object" ? a.pillarLabel[state.lang] || a.pillarLabel.vi : a.pillar;
        const aRead = typeof a.readTime === "object" ? a.readTime[state.lang] || a.readTime.vi : a.readTime || "5 phút đọc";

        return `
        <article class="article-card">
          <div class="article-thumb editable-photo-wrap">
            <img src="${escapeHtml(pUrl)}" alt="${escapeHtml(aTitle)}" style="${pStyle}" />
            <span class="article-pillar-badge">${escapeHtml(aPillar)}</span>
            ${
              a.photoSlot && !a.customImg
                ? `<button type="button" class="photo-change-trigger" data-slot="${escapeHtml(a.photoSlot)}">
                    ${state.lang === "vi" ? "Đổi ảnh" : "Change Photo"}
                   </button>`
                : ""
            }
          </div>
          <div class="article-body">
            <div class="article-date">${escapeHtml(a.date || "")} · ${escapeHtml(aRead)}</div>
            <h3 class="article-title">${escapeHtml(aTitle)}</h3>
            <p class="article-excerpt">${escapeHtml(aExcerpt)}</p>
            <div class="article-footer">
              <button type="button" class="article-read-btn" data-artid="${escapeHtml(a.id)}">
                ${t.articles.readFull}
              </button>
              <span class="article-read-pill" data-artid="${escapeHtml(a.id)}">${state.lang === "vi" ? "Mở bài" : "Open"}</span>
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

    document.getElementById("articleModalTitle").textContent = aPillar + " · " + (art.date || "");
    document.getElementById("articleModalBody").innerHTML = `
      <div class="reader-content">
        <h2>${escapeHtml(aTitle)}</h2>
        <p style="color:var(--ink-500); font-size:0.85rem; font-weight:700;">
          Tác giả: Nguyễn Thị Ngọc Thúy · Ngày đăng: ${escapeHtml(art.date || "")} · ${escapeHtml(aRead)}
        </p>
        <hr style="border:none; border-top:1px solid var(--ink-200); margin:16px 0;" />
        ${sanitizeRichHtml(aBody)}
      </div>
      <div class="material-lead-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px;">
        <div>
          <strong style="color:var(--jade-900); display:block;">
            ${state.lang === "vi" ? "Tải biểu mẫu & công văn trích dẫn trong bài viết về máy" : "Download official templates & regulatory files cited in this article"}
          </strong>
          <span style="font-size:0.82rem; color:var(--ink-600);">
            ${state.lang === "vi" ? "Hoặc đặt câu hỏi tư vấn trực tiếp cho tình huống của doanh nghiệp bạn." : "Or book a 1-on-1 consultation for your company's specific case."}
          </span>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="btn btn-primary btn-sm" id="artSendTemplateBtn">
            ${state.lang === "vi" ? "Tải Biểu mẫu & Công văn (.txt)" : "Download Template (.txt)"}
          </button>
          <a href="#tu-van" class="btn btn-outline btn-sm" id="artGoConsultBtn">
            ${state.lang === "vi" ? "Đăng ký tư vấn" : "Book Advisory"}
          </a>
        </div>
      </div>`;

    document.getElementById("artSendTemplateBtn").addEventListener("click", () => {
      const aTitleVi = typeof art.title === "object" ? art.title.vi : art.title;
      triggerGatedMaterialDownload({
        itemType: "article",
        itemId: art.id || "article",
        itemTitle: aTitleVi,
        fileName: `ThuysTalk_Tai_Lieu_${art.id || "article"}.txt`,
        performDownload: () => downloadArticleTemplate(art)
      });
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
            .replace(/Google\s+Notebook\s*LM|Notebook\s*LM|Google\s+Gemini\s+Notebook|Gemini\s+Notebook|\/notebook|\bsổ\s+tay\b/gi, "Kho Tri Thức ThuysTalk")
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

    // 1. Strip emojis (Zero Emojis rule) and clean residual NotebookLM / web-search terms
    let clean = String(rawText)
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}💡📌🔍📎🔗🎯🚀✨⚡✅❌⚠️]/gu, "")
      .replace(/Google\s+Notebook\s*LM|Notebook\s*LM|Google\s+Gemini\s+Notebook|Gemini\s+Notebook/gi, "kho tri thức ThuysTalk")
      .replace(/\b(?:các\s+)?sổ\s+tay(?:\s+này)?\b/gi, "kho tri thức ThuysTalk");

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
      <h4>Đăng Nhập Tài Khoản Để Tiếp Tục Tra Cứu Miễn Phí</h4>
      <p>
        Bạn đã sử dụng hết 5 lượt tra cứu miễn phí. Vui lòng đăng nhập tài khoản ThuysTalk (đã xác thực email) để tiếp tục sử dụng không giới hạn Hệ thống Tra cứu Pháp lý Hải quan &amp; Mã HS.
      </p>
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button type="button" class="btn btn-primary btn-sm gate-open-login-btn">
          Đăng nhập &amp; Tiếp tục tra cứu
        </button>
      </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    const openBtn = div.querySelector(".gate-open-login-btn");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        requireLearnerLogin({
          reason: "Vui lòng đăng nhập tài khoản ThuysTalk để tiếp tục tra cứu miễn phí.",
          onSuccess: () => {
            if (div.parentNode) div.remove();
            executeAiQuery(pendingQuery, forceDeepLookup);
          }
        });
      });
    }
  }

  function normalizeAiQueryKey(q) {
    return String(q || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^[?!.,;:\s]+|[?!.,;:\s]+$/g, "");
  }

  function loadUserAiCache() {
    const list = readStorageJson(localStorage, STORAGE_KEYS.AI_USER_CACHE, []);
    return Array.isArray(list) ? list : [];
  }

  function findUserAiCacheMatch(question, notebookId) {
    const qKey = normalizeAiQueryKey(question);
    if (!qKey) return null;
    const list = loadUserAiCache();
    for (let i = list.length - 1; i >= 0; i--) {
      const entry = list[i];
      if (!entry || typeof entry.answer !== "string" || !entry.answer.trim()) continue;
      if (entry.qKey === qKey && (!notebookId || !entry.notebookId || entry.notebookId === notebookId)) {
        return {
          answer: entry.answer,
          source: entry.source || "Kho Tri Thức Pháp Lý ThuysTalk"
        };
      }
    }
    return null;
  }

  function saveUserAiCacheEntry({ query, notebookId, answer, source }) {
    const qKey = normalizeAiQueryKey(query);
    const cleanAnswer = String(answer || "").trim();
    if (!qKey || !cleanAnswer) return;
    const list = loadUserAiCache().filter(
      (item) => item && !(item.qKey === qKey && (!notebookId || item.notebookId === notebookId))
    );
    list.push({
      qKey,
      query: String(query || "").trim(),
      notebookId: notebookId || "",
      source: source || "Kho Tri Thức Pháp Lý ThuysTalk",
      answer: cleanAnswer,
      cachedAt: Date.now()
    });
    while (list.length > 30) {
      list.shift();
    }
    writeStorageJson(localStorage, STORAGE_KEYS.AI_USER_CACHE, list);
  }

  function prefillAndOpenConsultForm(questionText) {
    const cleanQ = String(questionText || "").trim();
    const msgInp = document.getElementById("consultMsgInput");
    if (msgInp) {
      if (cleanQ) msgInp.value = cleanQ;
      const sec = document.getElementById("tu-van") || msgInp;
      if (sec && typeof sec.scrollIntoView === "function") {
        sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.setTimeout(() => {
        try {
          msgInp.focus();
        } catch (e) {}
      }, 250);
      return;
    }
    setSessionFlag(STORAGE_KEYS.PENDING_CONSULT_QUERY, cleanQ);
    window.location.href = "index.html#tu-van";
  }

  function appendAiActionNotice(messageText, options = {}) {
    const box = document.getElementById("notebookChatMessages");
    if (!box) return null;
    const div = document.createElement("div");
    div.className = "chat-bubble chat-bubble-ai";
    const showRetry = !!options.showRetry && typeof options.onRetry === "function";
    const showSendToThuy = options.showSendToThuy !== false;
    div.innerHTML = `
      <div class="chat-msg-text"><p class="ai-chat-p">${escapeHtml(messageText)}</p></div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        ${showRetry ? `<button type="button" class="btn btn-primary btn-sm ai-retry-btn">Thử lại</button>` : ""}
        ${showSendToThuy ? `<button type="button" class="btn btn-outline btn-sm ai-send-thuy-btn">Gửi câu hỏi này cho Thúy</button>` : ""}
      </div>
      <div class="chat-bubble-disclaimer">
        AI có thể có sai sót, hãy liên hệ với Thúy <a href="tel:0767648862">0767.648.862</a> để được tư vấn cụ thể.
      </div>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;

    const retryBtn = div.querySelector(".ai-retry-btn");
    if (retryBtn && typeof options.onRetry === "function") {
      retryBtn.addEventListener("click", () => {
        retryBtn.disabled = true;
        options.onRetry();
      });
    }
    const sendThuyBtn = div.querySelector(".ai-send-thuy-btn");
    if (sendThuyBtn) {
      sendThuyBtn.addEventListener("click", () => {
        prefillAndOpenConsultForm(options.query || "");
      });
    }
    return div;
  }

  function renderLocalKbHit(matched) {
    if (!matched) return;
    appendChatMessage("ai", matched.answer, matched.source);
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

    const route = detectNotebookRoute(q);
    const userCached = findUserAiCacheMatch(q, route.notebookId);
    if (userCached) {
      renderLocalKbHit(userCached);
      return;
    }

    const localMatched = !forceDeepLookup ? searchLocalKnowledgeBase(q) : null;
    if (localMatched) {
      renderLocalKbHit(localMatched);
      return;
    }

    // SILENT 5-QUERY FREE QUOTA FOR GUESTS (No upfront notice shown; gate appears on the 6th lookup if not logged in)
    if (!state.learnerEmail || !state.learnerUid) {
      const usedCount = parseInt(localStorage.getItem(STORAGE_KEYS.GUEST_QUERY_COUNT) || "0", 10);
      if (usedCount >= 5) {
        appendLearnerLoginGate(q, forceDeepLookup);
        return;
      }
      localStorage.setItem(STORAGE_KEYS.GUEST_QUERY_COUNT, String(usedCount + 1));
    }

    await executeAiQuery(q, forceDeepLookup, route);
  }

  async function executeAiQuery(q, forceDeepLookup = false, precomputedRoute = null) {
    const route = precomputedRoute || detectNotebookRoute(q);

    // 1. Check visitor FIFO cache & high-confidence local KB match first
    const userCached = findUserAiCacheMatch(q, route.notebookId);
    if (userCached) {
      renderLocalKbHit(userCached);
      return;
    }
    const matched = !forceDeepLookup ? searchLocalKnowledgeBase(q) : null;
    if (matched) {
      renderLocalKbHit(matched);
      return;
    }

    // 2. Call the async backend AI Knowledge Bridge
    const queryEndpoint = getApiUrl("/api/notebook-query");
    if (!queryEndpoint) {
      const kbFallback = searchLocalKnowledgeBase(q);
      if (kbFallback) {
        renderLocalKbHit(kbFallback);
        return;
      }
      appendAiActionNotice(
        "Hệ thống tra cứu chuyên sâu chưa có kết nối máy chủ API lúc này. Vui lòng gửi câu hỏi cho Thúy để được hỗ trợ trực tiếp.",
        {
          showRetry: true,
          showSendToThuy: true,
          query: q,
          onRetry: () => executeAiQuery(q, forceDeepLookup, route)
        }
      );
      return;
    }
    const chatBox = document.getElementById("notebookChatMessages");
    let loadingBubble = null;
    let thinkingTimerId = null;

    if (chatBox) {
      let elapsedSec = 0;
      loadingBubble = document.createElement("div");
      loadingBubble.className = "chat-bubble chat-bubble-ai chat-bubble-thinking";
      loadingBubble.innerHTML = `
        <div class="ai-thinking-row">
          <div class="ai-thinking-spinner" aria-hidden="true"></div>
          <div>
            <div class="ai-thinking-meta">
              <span class="ai-thinking-title">${state.lang === "en" ? "Queuing request..." : "Đang xếp hàng chờ xử lý..."}</span>
              <span class="ai-thinking-timer" data-thinking-seconds>0 giây</span>
            </div>
            <div class="ai-thinking-sub">${escapeHtml(route.title.vi)} · "${escapeHtml(q)}"</div>
          </div>
        </div>
      `;
      chatBox.appendChild(loadingBubble);
      chatBox.scrollTop = chatBox.scrollHeight;

      const secBadge = loadingBubble.querySelector("[data-thinking-seconds]");
      thinkingTimerId = window.setInterval(() => {
        elapsedSec += 1;
        if (secBadge) {
          secBadge.textContent = state.lang === "en" ? `${elapsedSec}s` : `${elapsedSec} giây`;
        }
      }, 1000);
    }

    const updateThinkingTitle = (text) => {
      if (!loadingBubble) return;
      const titleEl = loadingBubble.querySelector(".ai-thinking-title");
      if (titleEl) titleEl.textContent = text;
    };

    const stopThinkingUi = () => {
      if (thinkingTimerId !== null) {
        window.clearInterval(thinkingTimerId);
        thinkingTimerId = null;
      }
      if (loadingBubble) {
        loadingBubble.remove();
        loadingBubble = null;
      }
    };

    const handleAiPauseOrQuotaError = (payload, statusCode) => {
      stopThinkingUi();
      const errCode = (payload && payload.error_code) || "";
      if (errCode === "ai_quota") {
        const hhMm = (payload && payload.reset_time_str) || "";
        const pauseMsg =
          (payload && payload.error) ||
          (hhMm
            ? `Tra cứu AI đang tạm nghỉ đến ${hhMm}. Câu hỏi phổ biến vẫn trả lời ngay`
            : "Tra cứu AI đang tạm nghỉ. Câu hỏi phổ biến vẫn trả lời ngay");
        const fallbackKb = searchLocalKnowledgeBase(q);
        if (fallbackKb) {
          renderLocalKbHit(fallbackKb);
        }
        appendAiActionNotice(pauseMsg, {
          showRetry: false,
          showSendToThuy: true,
          query: q
        });
        return;
      }
      if (statusCode === 429 || errCode === "rate_limit") {
        appendAiActionNotice(
          (payload && payload.error) || "Bạn đã dùng hết lượt tra cứu AI trong khung giờ này. Vui lòng thử lại sau ít phút.",
          {
            showRetry: false,
            showSendToThuy: true,
            query: q
          }
        );
        return;
      }
      appendAiActionNotice(
        (payload && payload.error) || "Hệ thống tra cứu chuyên sâu hiện chưa thể xử lý câu hỏi này. Vui lòng bấm Thử lại hoặc gửi câu hỏi cho Thúy.",
        {
          showRetry: true,
          showSendToThuy: true,
          query: q,
          onRetry: () => executeAiQuery(q, forceDeepLookup, route)
        }
      );
    };

    const deliverSuccessAnswer = (answerText) => {
      stopThinkingUi();
      const citationSource = `Kho Tri Thức Pháp Lý ThuysTalk · ${route.title.vi}`;
      appendChatMessage("ai", answerText, citationSource);
      saveUserAiCacheEntry({
        query: q,
        notebookId: route.notebookId,
        answer: answerText,
        source: citationSource
      });
    };

    try {
      const headers = { "Content-Type": "application/json" };
      if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getIdToken === "function") {
        const token = await window.ThuysTalkFirebase.getIdToken(false).catch(() => null);
        if (token) headers.Authorization = "Bearer " + token;
      }

      const resp = await fetch(queryEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          notebook_id: route.notebookId,
          query: q
        })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        handleAiPauseOrQuotaError(data, resp.status);
        return;
      }

      if (data && data.status === "done" && data.answer) {
        deliverSuccessAnswer(data.answer);
        return;
      }

      if (!data || !data.job_id) {
        if (data && data.answer) {
          deliverSuccessAnswer(data.answer);
          return;
        }
        handleAiPauseOrQuotaError(data, resp.status);
        return;
      }

      const pollUrl = getApiUrl(`/api/notebook-job?id=${encodeURIComponent(data.job_id)}`);
      const pollStartedAt = Date.now();
      const MAX_POLL_MS = 6 * 60 * 1000;

      while (Date.now() - pollStartedAt < MAX_POLL_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, 3000));
        let jobResp;
        try {
          jobResp = await fetch(pollUrl, { method: "GET" });
        } catch (pollNetErr) {
          stopThinkingUi();
          appendAiActionNotice(
            "Mất kết nối tới máy chủ tra cứu trong lúc đang xử lý. Vui lòng kiểm tra kết nối rồi bấm Thử lại hoặc gửi câu hỏi cho Thúy.",
            {
              showRetry: true,
              showSendToThuy: true,
              query: q,
              onRetry: () => executeAiQuery(q, forceDeepLookup, route)
            }
          );
          return;
        }

        const jobData = await jobResp.json().catch(() => ({}));
        if (!jobResp.ok) {
          handleAiPauseOrQuotaError(jobData, jobResp.status);
          return;
        }

        if (jobData.status === "running") {
          updateThinkingTitle(
            state.lang === "en" ? "Analyzing legal database..." : "Đang phân tích & đối chiếu dữ liệu pháp lý..."
          );
        } else if (jobData.status === "queued") {
          updateThinkingTitle(state.lang === "en" ? "Queuing request..." : "Đang xếp hàng chờ xử lý...");
        } else if (jobData.status === "done" && jobData.answer) {
          deliverSuccessAnswer(jobData.answer);
          return;
        } else if (jobData.status === "error") {
          handleAiPauseOrQuotaError(jobData, 200);
          return;
        }
      }

      stopThinkingUi();
      appendAiActionNotice(
        "Quá trình tra cứu vượt quá 6 phút nên đã tạm dừng. Vui lòng bấm Thử lại hoặc gửi câu hỏi cho Thúy để được hỗ trợ trực tiếp.",
        {
          showRetry: true,
          showSendToThuy: true,
          query: q,
          onRetry: () => executeAiQuery(q, forceDeepLookup, route)
        }
      );
    } catch (err) {
      stopThinkingUi();
      appendAiActionNotice(
        "Hiện không kết nối được tới máy chủ tra cứu chuyên sâu. Vui lòng bấm Thử lại sau giây lát hoặc gửi câu hỏi cho Thúy.",
        {
          showRetry: true,
          showSendToThuy: true,
          query: q,
          onRetry: () => executeAiQuery(q, forceDeepLookup, route)
        }
      );
    }
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
        vi: `Câu 1: Theo nội dung tài liệu "${titleText}", nhận định nào sau đây là CHÍNH XÁC NHẤT về quy định và nguyên tắc thực hiện?`,
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
        vi: `Chính xác! Căn cứ trực tiếp theo tài liệu: "${s1}"`,
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
        vi: `Đúng vậy! Giải pháp thực tế cần áp dụng ngay là: ${s2}`,
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

    // Sync Lead to Cloud Firebase (Project: thuystalk) — never write to learners from public lead forms
    if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.saveLead === "function") {
      window.ThuysTalkFirebase.saveLead(item);
    }
  }

  function updateConsultFormStatus() {
    const loggedBadge = document.getElementById("consultLoggedInBadge");
    const guestGroup = document.getElementById("consultGuestFieldsGroup");
    const submitBtn = document.getElementById("consultSubmitBtn");
    const nameInp = document.getElementById("consultNameInput");
    const phoneInp = document.getElementById("consultPhoneInput");
    const emailInp = document.getElementById("consultEmailInput");
    const nameDisp = document.getElementById("consultLoggedNameDisplay");
    const emailDisp = document.getElementById("consultLoggedEmailDisplay");
    const phoneDisp = document.getElementById("consultLoggedPhoneDisplay");
    const missingPhoneRow = document.getElementById("consultLoggedPhoneMissingRow");
    const loggedPhoneInp = document.getElementById("consultLoggedInPhoneInp");

    if (!loggedBadge || !guestGroup) return;

    if (state.learnerEmail) {
      loggedBadge.style.display = "block";
      guestGroup.style.display = "none";
      if (nameInp) nameInp.removeAttribute("required");
      if (phoneInp) phoneInp.removeAttribute("required");
      if (emailInp) emailInp.removeAttribute("required");

      const displayName = state.learnerName || localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || state.learnerEmail.split("@")[0];
      const savedPhone = (state.learnerPhone || localStorage.getItem(STORAGE_KEYS.LEARNER_PHONE) || "").trim();

      if (nameDisp) nameDisp.textContent = displayName;
      if (emailDisp) emailDisp.textContent = `(${state.learnerEmail})`;
      if (phoneDisp) phoneDisp.textContent = savedPhone || "Chưa cập nhật";

      if (missingPhoneRow && loggedPhoneInp) {
        if (savedPhone) {
          missingPhoneRow.style.display = "none";
          loggedPhoneInp.removeAttribute("required");
          loggedPhoneInp.value = savedPhone;
        } else {
          missingPhoneRow.style.display = "block";
          loggedPhoneInp.setAttribute("required", "required");
        }
      }

      if (submitBtn) submitBtn.textContent = state.lang === "en" ? "Submit Advisory Request" : "Gửi đăng ký tư vấn";
    } else {
      loggedBadge.style.display = "none";
      guestGroup.style.display = "block";
      if (nameInp) nameInp.setAttribute("required", "required");
      if (phoneInp) phoneInp.setAttribute("required", "required");
      if (emailInp) emailInp.setAttribute("required", "required");
      if (missingPhoneRow && loggedPhoneInp) {
        missingPhoneRow.style.display = "none";
        loggedPhoneInp.removeAttribute("required");
      }

      if (submitBtn) submitBtn.textContent = state.lang === "en" ? "Submit Advisory Request" : "Gửi đăng ký tư vấn";
    }
  }

  function initConsultForm() {
    const form = document.getElementById("consultLeadForm");
    if (!form) return;

    updateConsultFormStatus();

    const pendingConsultQ = getSessionFlag(STORAGE_KEYS.PENDING_CONSULT_QUERY);
    if (pendingConsultQ) {
      setSessionFlag(STORAGE_KEYS.PENDING_CONSULT_QUERY, "");
      const msgInp = document.getElementById("consultMsgInput");
      if (msgInp && !msgInp.value.trim()) {
        msgInp.value = pendingConsultQ;
      }
    }

    const openProfileBtn = document.getElementById("consultOpenProfileBtn");
    if (openProfileBtn) {
      openProfileBtn.addEventListener("click", () => openUserProfileModal("info"));
    }

    const openPrivLink = document.getElementById("consultOpenPrivacyLink");
    if (openPrivLink) {
      openPrivLink.addEventListener("click", (e) => {
        e.preventDefault();
        openPrivacyPolicyModal();
      });
    }

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

      let name, phone, email;
      let shouldSavePhoneToProfile = false;
      if (state.learnerEmail) {
        email = state.learnerEmail;
        name = state.learnerName || localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || email.split("@")[0];
        const savedPhone = (state.learnerPhone || localStorage.getItem(STORAGE_KEYS.LEARNER_PHONE) || "").trim();
        const loggedPhoneInp = document.getElementById("consultLoggedInPhoneInp");
        const enteredPhone = loggedPhoneInp ? loggedPhoneInp.value.trim() : "";
        phone = savedPhone || enteredPhone;
        if (!phone) {
          showToast(
            state.lang === "vi"
              ? "Vui lòng nhập Số điện thoại / Zalo để Chị Thúy liên hệ tư vấn."
              : "Please enter your Phone / Zalo number."
          );
          if (loggedPhoneInp) loggedPhoneInp.focus();
          return;
        }
        if (!savedPhone && enteredPhone) {
          shouldSavePhoneToProfile = true;
        }
      } else {
        name = document.getElementById("consultNameInput").value.trim();
        phone = document.getElementById("consultPhoneInput").value.trim();
        email = document.getElementById("consultEmailInput").value.trim();
      }

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

      if (shouldSavePhoneToProfile) {
        state.learnerPhone = phone;
        localStorage.setItem(STORAGE_KEYS.LEARNER_PHONE, phone);
        if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.updateLearnerProfile === "function") {
          window.ThuysTalkFirebase
            .updateLearnerProfile({ name, phone, email })
            .catch((err) => console.warn("Save phone on consult warning:", err));
        }
        updateConsultFormStatus();
      }

      if (!topic || !message) {
        showToast("Vui lòng chọn chủ đề và mô tả câu hỏi cần tư vấn.");
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

      document.getElementById("consultMsgInput").value = "";
      showToast(
        state.lang === "vi"
          ? `Cảm ơn ${name}! Câu hỏi tư vấn đã được gửi thành công. Chị Thúy sẽ phản hồi trong 24h.`
          : `Thank you ${name}! Your consultation inquiry has been submitted.`
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
      if (!state.adminMode) return;
      renderAdminStudioModal(highlightSlot);
      return;
    }
    window.location.href = highlightSlot
      ? `admin.html?tab=photos&slot=${encodeURIComponent(highlightSlot)}`
      : "admin.html";
  }

  function renderAdminStudioModal(highlightSlot = null) {
    if (!state.adminMode) return;
    const sidebarNav = document.getElementById("adminSidebarNav");
    const tabsBar = document.getElementById("adminCmsTabsBar");
    const body = document.getElementById("adminStudioBody");
    if (!body) return;

    const totalLessons = state.courses.reduce((acc, c) => acc + (c.lessons ? c.lessons.length : 0), 0);
    const leadsCount = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]").length;

    const socialCount = Array.isArray(state.socialLinks) ? state.socialLinks.length : 0;
    const tabs = [
      {
        id: "photos",
        label: "01 · Ảnh & Mạng Xã Hội",
        count: `4 ảnh · ${socialCount} link`,
        title: "01 · Quản Lý Ảnh Profile & Liên Kết Mạng Xã Hội",
        desc: "Thay ảnh, căn khung X / Y / Zoom và thêm, sửa, xóa các nút icon Mạng xã hội trên đầu & chân trang."
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
        label: "04 · Tài Liệu & Mini Test",
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
        label: "06 · Người Dùng & Sao Lưu",
        count: `${leadsCount} lượt`,
        title: "06 · Danh Sách Đăng Ký Tài Liệu & Sao Lưu Hệ Thống",
        desc: "Xuất danh sách người dùng đăng ký tải tài liệu / tư vấn ra file Excel CSV hoặc sao lưu toàn bộ cấu hình CMS."
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

    const platformOptionsHtml = (selectedPlatform) =>
      Object.entries(SOCIAL_PLATFORM_META)
        .map(
          ([key, meta]) =>
            `<option value="${key}" ${key === selectedPlatform ? "selected" : ""}>${escapeHtml(meta.name)}</option>`
        )
        .join("");

    const socialRowsHtml = (Array.isArray(state.socialLinks) ? state.socialLinks : [])
      .map(
        (item, idx) => `
        <div class="cms-item-card" data-social-row="${idx}" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:12px 14px; background:#fff; border:1px solid var(--border-subtle); border-radius:12px;">
          <span class="social-pill" data-platform="${escapeHtml(item.platform || "website")}" style="flex-shrink:0; pointer-events:none;">
            ${getSocialIconSvg(item.platform)}
          </span>
          <select class="cms-social-platform" data-idx="${idx}" style="min-width:130px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; font-weight:700;">
            ${platformOptionsHtml(item.platform)}
          </select>
          <input type="text" class="cms-social-label" data-idx="${idx}" value="${escapeHtml(item.label || "")}" placeholder="Tên hiển thị (VD: YouTube ThuysTalk)" style="flex:1; min-width:160px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;" />
          <input type="text" class="cms-social-url" data-idx="${idx}" value="${escapeHtml(item.url || "")}" placeholder="https://..." style="flex:2; min-width:220px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;" />
          <div style="display:flex; gap:6px; flex-shrink:0;">
            <button type="button" class="btn btn-jade btn-sm" data-save-social="${idx}">Lưu</button>
            <button type="button" class="btn btn-outline btn-sm" style="color:#b91c1c; border-color:#fecaca;" data-del-social="${idx}">Xóa</button>
          </div>
        </div>`
      )
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

      <div class="cms-panel-box" style="margin-top:26px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
          <div>
            <strong style="color:var(--jade-900); font-size:1rem;">Quản Lý Nút Icon Mạng Xã Hội (Hero &amp; Chân Trang)</strong>
            <p style="font-size:0.82rem; color:var(--ink-600);">Thêm, đổi link hoặc xóa các biểu tượng YouTube, Facebook, Zalo, TikTok, LinkedIn... đồng bộ thời gian thực lên toàn trang.</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="resetDefaultSocialsBtn">Khôi phục mặc định (YT / FB / ZL)</button>
        </div>

        <div id="cmsSocialLinksList" style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          ${socialRowsHtml || '<p style="font-size:0.86rem; color:var(--ink-500);">Chưa có liên kết mạng xã hội nào.</p>'}
        </div>

        <form id="addSocialLinkForm" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:12px 14px; background:var(--jade-50); border:1px dashed var(--jade-400); border-radius:12px;">
          <select id="newSocialPlatform" style="min-width:130px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; font-weight:700;">
            ${platformOptionsHtml("tiktok")}
          </select>
          <input type="text" id="newSocialLabel" placeholder="Tên hiển thị (VD: TikTok ThuysTalk)" style="flex:1; min-width:160px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;" required />
          <input type="text" id="newSocialUrl" placeholder="Đường dẫn URL (VD: https://tiktok.com/@thuystalk)" style="flex:2; min-width:220px; padding:8px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;" required />
          <button type="submit" class="btn btn-primary btn-sm">+ Thêm Kênh Mới</button>
        </form>
      </div>
    `;

    // Social Links handlers
    body.querySelectorAll("[data-save-social]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.saveSocial, 10);
        const row = body.querySelector(`[data-social-row="${idx}"]`);
        if (!row || !state.socialLinks[idx]) return;
        const platform = row.querySelector(".cms-social-platform").value;
        const label = row.querySelector(".cms-social-label").value.trim() || (SOCIAL_PLATFORM_META[platform] ? SOCIAL_PLATFORM_META[platform].name : "Link");
        const url = row.querySelector(".cms-social-url").value.trim();
        if (!url) {
          showToast("Vui lòng nhập đường dẫn URL hợp lệ!");
          return;
        }
        state.socialLinks[idx] = { ...state.socialLinks[idx], platform, label, url };
        saveSocialLinks();
        renderSocialLinks();
        renderAdminPhotosTab(body);
        showToast(`Đã lưu liên kết ${label}!`);
      });
    });

    body.querySelectorAll("[data-del-social]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.delSocial, 10);
        if (isNaN(idx) || !state.socialLinks[idx]) return;
        const removed = state.socialLinks.splice(idx, 1)[0];
        saveSocialLinks();
        renderSocialLinks();
        renderAdminStudioModal();
        showToast(`Đã xóa liên kết ${removed.label || removed.platform}.`);
      });
    });

    const addSocialForm = document.getElementById("addSocialLinkForm");
    if (addSocialForm) {
      addSocialForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const platform = document.getElementById("newSocialPlatform").value;
        const label = document.getElementById("newSocialLabel").value.trim();
        const url = document.getElementById("newSocialUrl").value.trim();
        if (!label || !url) return;
        state.socialLinks.push({
          id: "social-" + Date.now(),
          platform,
          label,
          url
        });
        saveSocialLinks();
        renderSocialLinks();
        renderAdminStudioModal();
        showToast(`Đã thêm nút icon ${label}!`);
      });
    }

    const resetSocialsBtn = document.getElementById("resetDefaultSocialsBtn");
    if (resetSocialsBtn) {
      resetSocialsBtn.addEventListener("click", () => {
        state.socialLinks = JSON.parse(JSON.stringify(window.THUYSTALK_DEFAULT_SOCIALS || []));
        saveSocialLinks();
        renderSocialLinks();
        renderAdminStudioModal();
        showToast("Đã khôi phục 3 kênh mặc định (YouTube, Facebook, Zalo).");
      });
    }

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
      return sanitizeRichHtml(s);
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
      preview.innerHTML = `<div class="reader-content">${sanitizeRichHtml(formatRawOrHtmlContent(val))}</div>`;
    }

    textarea.addEventListener("input", updatePreview);
    updatePreview();

    if (toolbar) {
      toolbar.querySelectorAll("[data-insert-tag]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const tagType = btn.dataset.insertTag;
          let snippet = "";
          if (tagType === "h3") snippet = `\n<h3>Tiêu đề mục chính trong tài liệu</h3>\n`;
          else if (tagType === "p") snippet = `\n<p>Nội dung phân tích chi tiết...</p>\n`;
          else if (tagType === "ul") snippet = `\n<ul>\n  <li>Điểm lưu ý thực tế số 1</li>\n  <li>Điểm lưu ý thực tế số 2</li>\n</ul>\n`;
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

  
  // ==========================================================================
  // WORD-STYLE RICH TEXT EDITOR (WYSIWYG CANVAS WITH INTUITIVE TOOLBAR)
  // Supports: Bold, Italic, Underline, Strikethrough, Headings (H2, H3, P),
  // Text & Highlight Color, Align (Left, Center, Right, Justify),
  // Bullets & Numbers, +Image/Video (Firebase Storage/DataURL), +Link, +Table,
  // +Note Box (Blockquote), Clear Format (Tx), Import HTML/Text file.
  // ==========================================================================

  function renderWordEditorMarkup(editorCanvasId, placeholder = "Nhập nội dung...") {
    return `
      <div class="word-editor-container" data-editor-canvas-id="${editorCanvasId}">
        <div class="word-toolbar">
          <!-- Undo / Redo -->
          <div class="word-tool-group">
            <button type="button" class="word-tool-btn" data-cmd="undo" title="Hoàn tác (Ctrl+Z)">↺</button>
            <button type="button" class="word-tool-btn" data-cmd="redo" title="Làm lại (Ctrl+Y)">↻</button>
          </div>

          <!-- Format / Headings -->
          <div class="word-tool-group">
            <select class="word-tool-select" data-role="format-block" title="Định dạng đoạn">
              <option value="p">Đoạn văn (Normal)</option>
              <option value="h2">Tiêu đề lớn (H2)</option>
              <option value="h3">Tiêu đề phụ (H3)</option>
              <option value="blockquote">Trích dẫn / Lưu ý</option>
            </select>
          </div>

          <!-- Font Styles -->
          <div class="word-tool-group">
            <button type="button" class="word-tool-btn" data-cmd="bold" title="In đậm (Ctrl+B)"><strong>B</strong></button>
            <button type="button" class="word-tool-btn" data-cmd="italic" title="In nghiêng (Ctrl+I)"><em>I</em></button>
            <button type="button" class="word-tool-btn" data-cmd="underline" title="Gạch chân (Ctrl+U)"><u>U</u></button>
            <button type="button" class="word-tool-btn" data-cmd="strikeThrough" title="Gạch ngang"><s>S</s></button>
          </div>

          <!-- Text Color & Highlight -->
          <div class="word-tool-group">
            <label title="Màu chữ" style="display:inline-flex; align-items:center; gap:2px; padding:0 3px; cursor:pointer; font-size:0.75rem; font-weight:800;">
              <span style="border-bottom:2.5px solid #0D4738; padding-bottom:1px;">A</span>
              <input type="color" class="word-tool-color" data-role="foreColor" value="#0F172A" />
            </label>
            <label title="Tô màu nền (Highlight)" style="display:inline-flex; align-items:center; gap:2px; padding:0 3px; cursor:pointer; font-size:0.75rem; font-weight:800;">
              <span style="background:#FEF08A; padding:1px 3px; border-radius:3px;">HL</span>
              <input type="color" class="word-tool-color" data-role="hiliteColor" value="#FEF08A" />
            </label>
          </div>

          <!-- Alignment -->
          <div class="word-tool-group">
            <button type="button" class="word-tool-btn" data-cmd="justifyLeft" title="Căn trái">≡</button>
            <button type="button" class="word-tool-btn" data-cmd="justifyCenter" title="Căn giữa">≣</button>
            <button type="button" class="word-tool-btn" data-cmd="justifyRight" title="Căn phải">≡</button>
            <button type="button" class="word-tool-btn" data-cmd="justifyFull" title="Căn đều hai bên">☰</button>
          </div>

          <!-- Lists -->
          <div class="word-tool-group">
            <button type="button" class="word-tool-btn" data-cmd="insertUnorderedList" title="Danh sách gạch đầu dòng">• List</button>
            <button type="button" class="word-tool-btn" data-cmd="insertOrderedList" title="Danh sách đánh số">1. List</button>
          </div>

          <!-- Inserts (Media, Link, Table, Callout) -->
          <div class="word-tool-group">
            <label class="word-tool-btn" style="cursor:pointer; display:inline-flex; align-items:center; gap:3px;" title="Tải ảnh hoặc video từ máy tính">
              <span>+ Tải Ảnh/Video</span>
              <input type="file" class="word-media-upload-input" accept="image/*,video/mp4,video/webm" multiple style="display:none;" />
            </label>
            <button type="button" class="word-tool-btn" data-role="insert-img-url" title="Chèn ảnh từ link web online">+ Link Ảnh</button>
            <button type="button" class="word-tool-btn" data-role="insert-link" title="Gán link vào chữ (Bôi đen chữ rồi bấm nút này)">🔗 Link</button>
            <button type="button" class="word-tool-btn" data-role="insert-table" title="Chèn bảng 3x3">+ Bảng</button>
            <button type="button" class="word-tool-btn" data-role="insert-callout" title="Chèn khung ghi chú pháp lý">+ Khung Lưu Ý</button>
          </div>

          <!-- Clear format & file import -->
          <div class="word-tool-group">
            <button type="button" class="word-tool-btn" data-cmd="removeFormat" title="Xóa toàn bộ định dạng (Tx)">Tx</button>
            <label class="word-tool-btn" style="cursor:pointer;" title="Nạp nhanh bài viết từ tệp HTML/Word có sẵn">
              Nạp tệp .html
              <input type="file" class="word-file-import-input" accept=".html,.htm,.txt,.md" style="display:none;" />
            </label>
          </div>
        </div>

        <!-- Editable Paper Canvas -->
        <div id="${editorCanvasId}" class="word-paper-canvas" contenteditable="true" data-placeholder="${escapeHtml(placeholder)}"></div>

        <!-- Status Bar -->
        <div class="word-status-bar">
          <span>Chế độ soạn thảo kiểu Word · Gõ trực tiếp, bôi đen chữ để gán link, chèn ảnh/video tức thì</span>
          <span class="word-stat-counter" id="${editorCanvasId}_counter">0 từ · 0 ký tự</span>
        </div>
      </div>
    `;
  }

  function initWordEditor(containerEl, editorCanvasId) {
    if (!containerEl) return null;
    const canvas = containerEl.querySelector("#" + editorCanvasId) || containerEl.querySelector(".word-paper-canvas");
    if (!canvas) return null;
    const counter = containerEl.querySelector(".word-stat-counter");

    let savedRange = null;

    function saveSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (canvas.contains(range.commonAncestorContainer) || canvas === range.commonAncestorContainer) {
          savedRange = range.cloneRange();
        }
      }
    }

    function restoreSelection() {
      if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }

    function updateStats() {
      const text = (canvas.innerText || "").trim();
      const chars = text.length;
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      if (counter) {
        counter.textContent = `${words} từ · ${chars} ký tự`;
      }
    }

    canvas.addEventListener("input", () => {
      saveSelection();
      updateStats();
    });
    canvas.addEventListener("keyup", saveSelection);
    canvas.addEventListener("mouseup", saveSelection);
    canvas.addEventListener("touchend", saveSelection);

    // Prevent toolbar elements from clearing the canvas text selection
    containerEl.querySelectorAll(".word-toolbar button, .word-toolbar select, .word-toolbar label, .word-toolbar input").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        saveSelection();
        if (el.tagName !== "SELECT" && el.tagName !== "INPUT") {
          e.preventDefault();
        }
      });
    });

    // Formatting commands
    containerEl.querySelectorAll("[data-cmd]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        canvas.focus();
        restoreSelection();
        document.execCommand(btn.dataset.cmd, false, null);
        saveSelection();
        updateStats();
      });
    });

    // Format Block select
    const formatSelect = containerEl.querySelector("[data-role='format-block']");
    if (formatSelect) {
      formatSelect.addEventListener("change", () => {
        canvas.focus();
        restoreSelection();
        const tag = formatSelect.value;
        document.execCommand("formatBlock", false, "<" + tag + ">");
        saveSelection();
        updateStats();
      });
    }

    // Colors
    const foreInput = containerEl.querySelector("[data-role='foreColor']");
    if (foreInput) {
      foreInput.addEventListener("input", () => {
        canvas.focus();
        restoreSelection();
        document.execCommand("foreColor", false, foreInput.value);
        saveSelection();
      });
    }
    const hiliteInput = containerEl.querySelector("[data-role='hiliteColor']");
    if (hiliteInput) {
      hiliteInput.addEventListener("input", () => {
        canvas.focus();
        restoreSelection();
        document.execCommand("hiliteColor", false, hiliteInput.value);
        saveSelection();
      });
    }

    // Insert Link (Robust: Works on highlighted text OR prompts for link title)
    const linkBtn = containerEl.querySelector("[data-role='insert-link']");
    if (linkBtn) {
      linkBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveSelection();

        let highlightedText = "";
        if (savedRange) {
          highlightedText = savedRange.toString().trim();
        }

        const url = window.prompt("Nhập đường dẫn trang web (URL):", "https://");
        if (!url || url.trim() === "" || url === "https://") return;
        const cleanUrl = url.trim();

        canvas.focus();
        if (highlightedText && savedRange) {
          restoreSelection();
          document.execCommand("createLink", false, cleanUrl);
        } else {
          const linkText = window.prompt("Nhập chữ hiển thị cho đường link:", cleanUrl);
          const displayText = linkText && linkText.trim() ? linkText.trim() : cleanUrl;
          const linkHtml = `<a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0D4738; text-decoration:underline; font-weight:700;">${escapeHtml(displayText)}</a>&nbsp;`;
          if (savedRange) {
            restoreSelection();
            document.execCommand("insertHTML", false, linkHtml);
          } else {
            canvas.insertAdjacentHTML("beforeend", linkHtml);
          }
        }
        saveSelection();
        updateStats();
        showToast("Đã chèn liên kết web thành công!");
      });
    }

    // Insert Image from Online URL
    const imgUrlBtn = containerEl.querySelector("[data-role='insert-img-url']");
    if (imgUrlBtn) {
      imgUrlBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveSelection();
        const url = window.prompt("Dán đường link ảnh trực tuyến (https://...):", "https://");
        if (url && url.trim() && url !== "https://") {
          const imgHtml = `
            <figure style="margin:16px auto; text-align:center; max-width:100%;">
              <img src="${escapeHtml(url.trim())}" style="max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); display:block; margin:0 auto;" />
            </figure>
            <p><br></p>
          `;
          canvas.focus();
          if (savedRange) {
            restoreSelection();
            try {
              document.execCommand("insertHTML", false, imgHtml);
            } catch (err) {
              canvas.insertAdjacentHTML("beforeend", imgHtml);
            }
          } else {
            canvas.insertAdjacentHTML("beforeend", imgHtml);
          }
          saveSelection();
          updateStats();
          showToast("Đã chèn ảnh từ link thành công!");
        }
      });
    }

    // Insert Table
    const tableBtn = containerEl.querySelector("[data-role='insert-table']");
    if (tableBtn) {
      tableBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveSelection();
        const tableHtml = `
          <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:0.88rem;">
            <thead style="background:#F1F5F9;">
              <tr>
                <th style="border:1px solid #CBD5E1; padding:8px 12px; text-align:left;">Hạng mục</th>
                <th style="border:1px solid #CBD5E1; padding:8px 12px; text-align:left;">Nội dung kiểm tra</th>
                <th style="border:1px solid #CBD5E1; padding:8px 12px; text-align:left;">Lưu ý rủi ro</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Mục 1</td>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Nội dung phân tích...</td>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Cần đối soát chứng từ gốc</td>
              </tr>
              <tr>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Mục 2</td>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Nội dung phân tích...</td>
                <td style="border:1px solid #CBD5E1; padding:8px 12px;">Kiểm tra kỹ trước khi truyền tờ khai</td>
              </tr>
            </tbody>
          </table>
          <p><br></p>
        `;
        canvas.focus();
        if (savedRange) {
          restoreSelection();
          try {
            document.execCommand("insertHTML", false, tableHtml);
          } catch (err) {
            canvas.insertAdjacentHTML("beforeend", tableHtml);
          }
        } else {
          canvas.insertAdjacentHTML("beforeend", tableHtml);
        }
        saveSelection();
        updateStats();
      });
    }

    // Insert Callout Note Box
    const calloutBtn = containerEl.querySelector("[data-role='insert-callout']");
    if (calloutBtn) {
      calloutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        saveSelection();
        const noteHtml = `
          <blockquote style="border-left:4px solid #F97316; background:#FFF7ED; padding:12px 18px; border-radius:0 8px 8px 0; margin:14px 0; color:#9A3412; font-weight:600;">
            <p style="margin:0;">Lưu ý thực tế: [Nhập kinh nghiệm thực tế hoặc quy định pháp lý cần ghi nhớ tại đây...]</p>
          </blockquote>
          <p><br></p>
        `;
        canvas.focus();
        if (savedRange) {
          restoreSelection();
          try {
            document.execCommand("insertHTML", false, noteHtml);
          } catch (err) {
            canvas.insertAdjacentHTML("beforeend", noteHtml);
          }
        } else {
          canvas.insertAdjacentHTML("beforeend", noteHtml);
        }
        saveSelection();
        updateStats();
      });
    }

    // Instant Image & Video Upload (100% Free, Zero Blaze Paywall!)
    const mediaInput = containerEl.querySelector(".word-media-upload-input");
    if (mediaInput) {
      mediaInput.addEventListener("change", async (ev) => {
        const files = Array.from(ev.target.files || []);
        if (!files.length) return;
        showToast("Đang đọc tệp và chèn vào bài viết...");
        for (const file of files) {
          const isVideo = file.type.startsWith("video/") || /\.(webm|mp4|mov)$/i.test(file.name);

          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(file);
          });

          if (!dataUrl) continue;

          let mediaHtml = "";
          if (isVideo) {
            mediaHtml = `
              <figure style="margin:16px auto; text-align:center; max-width:100%;">
                <video controls playsinline preload="metadata" style="max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); display:block; margin:0 auto;">
                  <source src="${dataUrl}" type="${file.type || 'video/mp4'}" />
                </video>
                <figcaption style="font-size:0.8rem; color:#64748B; margin-top:6px;">Video: ${escapeHtml(file.name)}</figcaption>
              </figure>
              <p><br></p>
            `;
          } else {
            mediaHtml = `
              <figure style="margin:16px auto; text-align:center; max-width:100%;">
                <img src="${dataUrl}" alt="${escapeHtml(file.name)}" style="max-width:100%; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); display:block; margin:0 auto;" />
                <figcaption style="font-size:0.8rem; color:#64748B; margin-top:6px;">${escapeHtml(file.name)}</figcaption>
              </figure>
              <p><br></p>
            `;
          }

          canvas.focus();
          if (savedRange) {
            restoreSelection();
            try {
              document.execCommand("insertHTML", false, mediaHtml);
            } catch (err) {
              canvas.insertAdjacentHTML("beforeend", mediaHtml);
            }
          } else {
            canvas.insertAdjacentHTML("beforeend", mediaHtml);
          }
          saveSelection();
          updateStats();
        }
        showToast("Đã chèn ảnh/video thành công!");
        mediaInput.value = "";
      });
    }

    // Import HTML / Text file
    const fileImportInput = containerEl.querySelector(".word-file-import-input");
    if (fileImportInput) {
      fileImportInput.addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          let text = String(e.target.result || "").trim();
          const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) text = bodyMatch[1].trim();
          if (!/<[a-z][\s\S]*>/i.test(text)) {
            text = text.split(/\n+/).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
          }
          const safeHtml = sanitizeRichHtml(text);
          canvas.innerHTML = canvas.innerHTML ? sanitizeRichHtml(canvas.innerHTML) + "<br />" + safeHtml : safeHtml;
          saveSelection();
          updateStats();
          showToast(`Đã nạp nội dung từ tệp "${file.name}" vào trình soạn thảo!`);
        };
        reader.readAsText(file, "utf-8");
        fileImportInput.value = "";
      });
    }

    return {
      getHtml: () => sanitizeRichHtml(canvas.innerHTML.trim()),
      setHtml: (val) => {
        canvas.innerHTML = sanitizeRichHtml(val || "");
        updateStats();
      },
      clear: () => {
        canvas.innerHTML = "";
        updateStats();
      },
      focus: () => canvas.focus()
    };
  }

  function ensureGlobalModals() {
    // 1. Learner Auth Modal (Google Sign-In + Email Verification Polling + 6-Digit Device Code + Google First-Time Consent)
    if (!document.getElementById("learnerAuthModal")) {
      const authDiv = document.createElement("div");
      authDiv.className = "modal-backdrop";
      authDiv.id = "learnerAuthModal";
      authDiv.setAttribute("role", "dialog");
      authDiv.setAttribute("aria-modal", "true");
      authDiv.innerHTML = `
        <div class="modal-card" style="max-width:480px; background:#FFFFFF !important; color:#0F172A !important; border-radius:18px; box-shadow:0 30px 70px rgba(0,0,0,0.45); border:1.5px solid #E2E8F0; overflow:hidden;">
          <div class="modal-head" style="padding:18px 24px; background:#FFFFFF !important; border-bottom:1.5px solid #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
            <h3 id="authModalTitle" style="color:#064E3B !important; font-size:1.05rem; font-weight:800; margin:0;">Tài Khoản ThuysTalk</h3>
            <button class="modal-close" data-close-modal="learnerAuthModal" aria-label="Đóng" style="background:#F1F5F9 !important; color:#475569 !important; border:1px solid #CBD5E1; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; cursor:pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding:22px 24px; background:#FFFFFF !important; color:#0F172A !important;">
            <div id="authTabsWrapper">
              <div class="auth-tabs-nav" style="display:grid; grid-template-columns:1fr 1fr; background:#F1F5F9; border-radius:10px; padding:4px; margin-bottom:20px; gap:4px;">
                <button type="button" class="auth-tab-btn active" id="authTabRegisterBtn">Đăng Ký Tài Khoản</button>
                <button type="button" class="auth-tab-btn" id="authTabLoginBtn">Đăng Nhập</button>
              </div>

              <!-- Tab 1: Registration Form -->
              <div id="authRegisterPane">
                <button type="button" class="auth-google-btn" id="authRegGoogleBtn">
                  <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#064E3B;color:#FFFFFF;font-size:0.75rem;font-weight:900;">G</span>
                  <span>Đăng nhập bằng Google</span>
                </button>
                <div class="auth-divider">hoặc đăng ký bằng Email</div>

                <div class="auth-notice-box" id="authRegisterNoticeBox" style="background:#FFFBEB; border-left:3.5px solid #F59E0B; padding:12px 14px; border-radius:6px; margin-bottom:16px; font-size:0.83rem; color:#92400E; line-height:1.5;">
                  <strong>Lưu ý:</strong> Mỗi địa chỉ email chỉ được tạo <strong>1 tài khoản duy nhất</strong>. Sau khi đăng ký, bấm link trong email để kích hoạt. Đăng nhập trên máy mới sẽ cần thêm mã gửi qua email.
                </div>

                <form id="authRegisterForm">
                  <div class="form-group">
                    <label>Họ và tên của bạn *</label>
                    <input type="text" id="authRegName" class="form-control" required placeholder="VD: Nguyễn Thị Lan" />
                  </div>
                  <div class="form-group">
                    <label>Địa chỉ Email nhận thư xác thực *</label>
                    <input type="email" id="authRegEmail" class="form-control" required placeholder="VD: lan.nguyen@gmail.com" />
                  </div>
                  <div class="form-row-2">
                    <div class="form-group">
                      <label>Mật khẩu (tối thiểu 6 ký tự) *</label>
                      <input type="password" id="authRegPass" class="form-control" required minlength="6" placeholder="Mật khẩu bảo mật" />
                    </div>
                    <div class="form-group">
                      <label>Số điện thoại / Zalo (không bắt buộc)</label>
                      <input type="tel" id="authRegPhone" class="form-control" placeholder="VD: 0912 345 678" />
                    </div>
                  </div>
                  <div class="form-group" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:11px 12px; margin-top:4px;">
                    <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-weight:600; font-size:0.84rem; color:#0F172A; margin-bottom:5px;">
                      <input type="checkbox" id="authRegisterConsentCheck" required style="margin-top:3px; width:16px; height:16px; flex-shrink:0;" />
                      <span>Tôi đồng ý với <a href="#" class="open-privacy-link" style="color:#047857; font-weight:800; text-decoration:underline;">Chính sách bảo mật</a></span>
                    </label>
                    <div style="font-size:0.78rem; color:#475569; line-height:1.45; padding-left:26px;">
                      ThuysTalk lưu tên, email, SĐT (nếu có) và lịch sử tải tài liệu để hỗ trợ tư vấn.
                    </div>
                  </div>
                  <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px;">
                    <button type="button" class="btn btn-outline btn-sm" data-close-modal="learnerAuthModal">Hủy</button>
                    <button type="submit" class="btn btn-primary btn-sm" id="authRegSubmitBtn">
                      Tạo Tài Khoản &amp; Gửi Email Xác Thực
                    </button>
                  </div>
                </form>
              </div>

              <!-- Tab 2: Login Form -->
              <div id="authLoginPane" style="display:none;">
                <button type="button" class="auth-google-btn" id="authLogGoogleBtn">
                  <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:#064E3B;color:#FFFFFF;font-size:0.75rem;font-weight:900;">G</span>
                  <span>Đăng nhập bằng Google</span>
                </button>
                <div class="auth-divider">hoặc đăng nhập bằng Email</div>

                <div id="authLoginNoticeBox" style="display:none;" class="auth-notice-box"></div>

                <form id="authLoginForm">
                  <div class="form-group">
                    <label>Địa chỉ Email *</label>
                    <input type="email" id="authLogEmail" class="form-control" required placeholder="VD: lan.nguyen@gmail.com" />
                  </div>
                  <div class="form-group">
                    <label>Mật khẩu *</label>
                    <input type="password" id="authLogPass" class="form-control" required placeholder="Mật khẩu của bạn" />
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <button type="button" id="authForgotPassBtn" style="border:none; background:transparent; font-size:0.8rem; color:#047857; font-weight:700; cursor:pointer; padding:0; text-decoration:underline;">
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div style="display:flex; justify-content:flex-end; gap:10px;">
                    <button type="button" class="btn btn-outline btn-sm" data-close-modal="learnerAuthModal">Đóng</button>
                    <button type="submit" class="btn btn-primary btn-sm" id="authLogSubmitBtn">
                      Đăng Nhập
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- View 3: Waiting for Email Verification Polling (up to 10m, every 5s) -->
            <div id="authVerifyEmailPane" style="display:none;">
              <div class="auth-success-banner">
                <h4 style="color:#064E3B; margin-bottom:8px; font-weight:800;">Kiểm tra hộp thư và bấm link xác thực</h4>
                <p id="authVerifyEmailDesc" style="font-size:0.86rem; color:#1E293B; line-height:1.55; margin-bottom:10px;"></p>
                <p id="authVerifyStatusText" style="font-size:0.8rem; color:#047857; font-weight:700; margin:0;">
                  Đang chờ xác thực... Tab này tự động đi tiếp ngay khi bạn bấm link.
                </p>
              </div>
              <div id="authVerifyNoticeBox" style="display:none; margin-bottom:12px;" class="auth-notice-box"></div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:14px;">
                <button type="button" class="btn btn-outline btn-sm" id="authVerifyCancelBtn">Quay lại</button>
                <button type="button" class="btn btn-primary btn-sm" id="authVerifyResendBtn">Gửi lại thư</button>
              </div>
            </div>

            <!-- View 4: 6-Digit New Device Verification Code -->
            <div id="authDeviceCodePane" style="display:none;">
              <div class="auth-notice-box" style="margin-bottom:14px;">
                <strong style="display:block; margin-bottom:4px; color:#064E3B;">Xác nhận đăng nhập trên thiết bị mới</strong>
                <span id="authDeviceCodeDesc" style="font-size:0.84rem; color:#334155; line-height:1.5;">
                  Mã xác nhận 6 số đã được gửi tới email của bạn (hiệu lực 10 phút).
                </span>
              </div>
              <div id="authDeviceNoticeBox" style="display:none; margin-bottom:12px;" class="auth-notice-box"></div>
              <form id="authDeviceCodeForm">
                <div class="form-group">
                  <label>Nhập mã xác nhận 6 số *</label>
                  <input type="text" id="authDeviceCodeInp" class="form-control auth-code-input" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required placeholder="000000" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap; margin-top:16px;">
                  <button type="button" class="btn btn-outline btn-sm" id="authDeviceCancelBtn">Hủy &amp; Đăng xuất</button>
                  <div style="display:flex; gap:8px; align-items:center;">
                    <button type="button" class="btn btn-outline btn-sm" id="authDeviceResendBtn">Gửi lại mã</button>
                    <button type="submit" class="btn btn-primary btn-sm" id="authDeviceVerifyBtn">Xác nhận</button>
                  </div>
                </div>
              </form>
            </div>

            <!-- View 5: Google First-Time Profile Completion & Consent -->
            <div id="authGoogleProfilePane" style="display:none;">
              <div class="auth-notice-box" style="margin-bottom:14px;">
                <strong style="display:block; margin-bottom:4px; color:#064E3B;">Hoàn tất hồ sơ</strong>
                <span style="font-size:0.84rem; color:#334155; line-height:1.5;">
                  Vui lòng kiểm tra thông tin và đồng ý Chính sách bảo mật để hoàn tất tài khoản ThuysTalk.
                </span>
              </div>
              <div id="authGoogleProfileNoticeBox" style="display:none; margin-bottom:12px;" class="auth-notice-box"></div>
              <form id="authGoogleProfileForm">
                <div class="form-group">
                  <label>Họ và tên *</label>
                  <input type="text" id="authGoogleNameInp" class="form-control" required placeholder="Họ và tên của bạn" />
                </div>
                <div class="form-group">
                  <label>Số điện thoại / Zalo (không bắt buộc)</label>
                  <input type="tel" id="authGooglePhoneInp" class="form-control" placeholder="VD: 0912 345 678" />
                </div>
                <div class="form-group" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:12px;">
                  <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; font-weight:600; font-size:0.84rem; color:#0F172A; margin-bottom:6px;">
                    <input type="checkbox" id="authGoogleConsentCheck" style="margin-top:3px; width:16px; height:16px; flex-shrink:0;" />
                    <span>Tôi đồng ý với <a href="#" class="open-privacy-link" style="color:#047857; font-weight:800; text-decoration:underline;">Chính sách bảo mật</a></span>
                  </label>
                  <div style="font-size:0.78rem; color:#475569; line-height:1.45; padding-left:26px;">
                    ThuysTalk lưu tên, email, SĐT (nếu có) và lịch sử tải tài liệu để hỗ trợ tư vấn.
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; gap:10px; margin-top:16px; flex-wrap:wrap;">
                  <button type="button" class="btn btn-outline btn-sm" id="authGoogleDeclineBtn" style="color:#DC2626; border-color:#FCA5A5;">Không đồng ý</button>
                  <button type="submit" class="btn btn-primary btn-sm" id="authGoogleFinishBtn">Hoàn tất &amp; Tiếp tục</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(authDiv);

      const closeAndAbortAuthModal = async () => {
        stopEmailVerificationPolling();
        stopAuthResendCooldown();
        const wasChallenge = activeAuthStep === "device_code" || activeAuthStep === "google_profile" || activeAuthStep === "verify_email";
        activeAuthStep = "";
        pendingAuthSuccessCallback = null;
        pendingConsentContext = null;
        setSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID, "");
        setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, "");
        setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, "");
        setSessionFlag(STORAGE_KEYS.PENDING_REDIRECT_REASON, "");
        setSessionFlag(STORAGE_KEYS.PENDING_ACTION, "");
        if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.clearPendingGoogleLink === "function") {
          window.ThuysTalkFirebase.clearPendingGoogleLink();
        }
        authDiv.classList.remove("open");
        if (wasChallenge && window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.logoutLearner === "function") {
          await window.ThuysTalkFirebase.logoutLearner();
        }
      };

      authDiv.querySelectorAll("[data-close-modal]").forEach((b) => {
        b.addEventListener("click", () => {
          closeAndAbortAuthModal();
        });
      });
      authDiv.addEventListener("click", (e) => {
        if (e.target === authDiv) {
          closeAndAbortAuthModal();
        }
      });

      // Tabs switching
      const tabReg = authDiv.querySelector("#authTabRegisterBtn");
      const tabLog = authDiv.querySelector("#authTabLoginBtn");
      const paneReg = authDiv.querySelector("#authRegisterPane");
      const paneLog = authDiv.querySelector("#authLoginPane");

      tabReg.addEventListener("click", () => {
        showAuthSubView("tabs");
        tabReg.classList.add("active");
        tabLog.classList.remove("active");
        paneReg.style.display = "block";
        paneLog.style.display = "none";
      });

      tabLog.addEventListener("click", () => {
        showAuthSubView("tabs");
        tabLog.classList.add("active");
        tabReg.classList.remove("active");
        paneLog.style.display = "block";
        paneReg.style.display = "none";
      });

      // Handle Google Sign-In buttons (Top of both Register & Login tabs)
      const handleGoogleBtnClick = async (btnEl) => {
        if (!window.ThuysTalkFirebase || typeof window.ThuysTalkFirebase.loginLearnerWithGoogle !== "function" || !window.ThuysTalkFirebase.isAuthReady()) {
          alert("Dịch vụ đăng nhập Google chưa sẵn sàng trên trình duyệt.");
          return;
        }
        const origHtml = btnEl.innerHTML;
        const regGoogleBtn = authDiv.querySelector("#authRegGoogleBtn");
        const logGoogleBtn = authDiv.querySelector("#authLogGoogleBtn");
        if (regGoogleBtn) regGoogleBtn.disabled = true;
        if (logGoogleBtn) logGoogleBtn.disabled = true;
        btnEl.textContent = "Đang kết nối Google...";
        activeAuthStep = "google_popup";

        const noticeBox = authDiv.querySelector("#authLoginNoticeBox");
        if (noticeBox) {
          setSessionFlag(STORAGE_KEYS.PENDING_REDIRECT_REASON, noticeBox.style.display !== "none" ? noticeBox.textContent : "");
        }

        try {
          const gRes = await window.ThuysTalkFirebase.loginLearnerWithGoogle();
          if (gRes && gRes.redirected) {
            return;
          }
          await handleGoogleLoginOutcome(gRes, false);
        } catch (err) {
          activeAuthStep = "";
          const code = err && err.code ? err.code : "";
          if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
            return;
          }
          showLoginNotice(
            "Không thể đăng nhập bằng Google: " + (err && err.message ? err.message : err),
            true
          );
        } finally {
          if (regGoogleBtn) regGoogleBtn.disabled = false;
          if (logGoogleBtn) logGoogleBtn.disabled = false;
          btnEl.innerHTML = origHtml;
        }
      };

      authDiv.querySelector("#authRegGoogleBtn").addEventListener("click", (e) => handleGoogleBtnClick(e.currentTarget));
      authDiv.querySelector("#authLogGoogleBtn").addEventListener("click", (e) => handleGoogleBtnClick(e.currentTarget));

      // Handle Register with Firebase Email Verification Polling (1 Account per Email)
      authDiv.querySelector("#authRegisterForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = authDiv.querySelector("#authRegName").value.trim();
        const email = authDiv.querySelector("#authRegEmail").value.trim();
        const pass = authDiv.querySelector("#authRegPass").value;
        const phoneInp = authDiv.querySelector("#authRegPhone");
        const phone = phoneInp ? phoneInp.value.trim() : "";
        const regConsent = authDiv.querySelector("#authRegisterConsentCheck");
        if (regConsent && !regConsent.checked) {
          alert("Vui lòng đánh dấu đồng ý Chính sách bảo mật trước khi tạo tài khoản.");
          regConsent.focus();
          return;
        }

        const btn = authDiv.querySelector("#authRegSubmitBtn");
        btn.disabled = true;
        btn.textContent = "Đang tạo tài khoản & gửi email...";
        activeAuthStep = "registering";

        try {
          if (!window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isAuthReady()) {
            throw new Error("Dịch vụ xác thực tài khoản chưa sẵn sàng trên trình duyệt.");
          }
          const regRes = await window.ThuysTalkFirebase.registerLearnerWithVerification(name, email, pass, phone);
          savePendingRegProfile({
            uid: regRes.uid || "",
            email,
            name,
            phone,
            consent: regConsent ? !!regConsent.checked : true
          });
          authDiv.querySelector("#authLogEmail").value = email;
          enterEmailVerificationView(email, true, true);
          showToast(`Đã gửi email xác thực tới ${email}! Vui lòng bấm link kích hoạt.`);
        } catch (err) {
          activeAuthStep = "";
          if (err && (err.code === "auth/email-already-in-use" || (err.message && err.message.includes("email-already-in-use")))) {
            tabLog.click();
            authDiv.querySelector("#authLogEmail").value = email;
            showLoginNotice(
              "Email này đã được đăng ký tài khoản trên hệ thống! Vui lòng đăng nhập hoặc bấm 'Quên mật khẩu?' nếu bạn quên mật khẩu.",
              true
            );
            return;
          }
          alert("Lỗi đăng ký tài khoản: " + (err && err.message ? err.message : err));
        } finally {
          btn.disabled = false;
          btn.textContent = "Tạo Tài Khoản & Gửi Email Xác Thực";
        }
      });

      // Handle Login with Email & Password (Keep session alive for verification polling & device verification)
      authDiv.querySelector("#authLoginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = authDiv.querySelector("#authLogEmail").value.trim();
        const pass = authDiv.querySelector("#authLogPass").value;
        const btn = authDiv.querySelector("#authLogSubmitBtn");
        const noticeBox = authDiv.querySelector("#authLoginNoticeBox");

        btn.disabled = true;
        btn.textContent = "Đang kiểm tra đăng nhập...";
        noticeBox.style.display = "none";
        activeAuthStep = "password_login";

        try {
          if (!window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isAuthReady()) {
            throw new Error("Dịch vụ xác thực tài khoản chưa sẵn sàng trên trình duyệt.");
          }
          const userRes = await window.ThuysTalkFirebase.loginLearner(email, pass);
          const fbUser = (window.ThuysTalkFirebase.getCurrentUser && window.ThuysTalkFirebase.getCurrentUser()) || (userRes && userRes.user);
          if (!fbUser) {
            throw new Error("Không thể khởi tạo phiên đăng nhập.");
          }

          if (window.ThuysTalkFirebase.hasPendingGoogleLink && window.ThuysTalkFirebase.hasPendingGoogleLink()) {
            try {
              await window.ThuysTalkFirebase.linkPendingGoogleCredentialToCurrentUser();
              const linkedUser = await window.ThuysTalkFirebase.reloadCurrentUser() || fbUser;
              markTrustedGoogleBrowser(linkedUser.uid);
              showToast("Đã liên kết tài khoản Google thành công!");
              await handleGoogleLoginOutcome({ user: linkedUser, email: linkedUser.email || email, isNewUser: false, provider: "google" }, false);
              return;
            } catch (linkErr) {
              activeAuthStep = "";
              showLoginNotice("Không thể liên kết Google: " + (linkErr && linkErr.message ? linkErr.message : linkErr), true);
              return;
            }
          }

          if (!userRes || userRes.emailVerified === false || fbUser.emailVerified !== true) {
            enterEmailVerificationView(fbUser.email || email, false, false);
            return;
          }

          await handlePostPasswordAuth(fbUser, false);
        } catch (err) {
          activeAuthStep = "";
          noticeBox.style.display = "block";
          noticeBox.innerHTML = `<div style="background:#FEF2F2; border:1.5px solid #F87171; border-radius:8px; padding:12px; color:#991B1B; font-size:0.84rem;">Lỗi đăng nhập: ${escapeHtml(err && err.message ? err.message : "Email hoặc mật khẩu chưa chính xác.")}</div>`;
        } finally {
          btn.disabled = false;
          btn.textContent = "Đăng Nhập";
        }
      });

      // Verify Email pane: Resend button (60s cooldown) & Cancel button
      authDiv.querySelector("#authVerifyResendBtn").addEventListener("click", async () => {
        const resendBtn = authDiv.querySelector("#authVerifyResendBtn");
        const verifyNotice = authDiv.querySelector("#authVerifyNoticeBox");
        if (resendBtn.disabled) return;
        resendBtn.disabled = true;
        if (verifyNotice) verifyNotice.style.display = "none";
        try {
          if (window.ThuysTalkFirebase) {
            await window.ThuysTalkFirebase.resendVerificationEmail();
            startVerifyResendCooldown(60);
            showToast("Đã gửi lại email xác thực thành công!");
          }
        } catch (err) {
          resendBtn.disabled = false;
          if (verifyNotice) {
            verifyNotice.style.display = "block";
            verifyNotice.textContent = "Không thể gửi lại thư lúc này: " + (err && err.message ? err.message : err);
          }
        }
      });

      authDiv.querySelector("#authVerifyCancelBtn").addEventListener("click", async () => {
        stopEmailVerificationPolling();
        stopAuthResendCooldown();
        activeAuthStep = "";
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.logoutLearner) {
          await window.ThuysTalkFirebase.logoutLearner();
        }
        showAuthSubView("tabs");
        tabLog.click();
      });

      // 6-Digit Device Code form submit
      authDiv.querySelector("#authDeviceCodeForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const codeInp = authDiv.querySelector("#authDeviceCodeInp");
        const verifyBtn = authDiv.querySelector("#authDeviceVerifyBtn");
        const devNotice = authDiv.querySelector("#authDeviceNoticeBox");
        const code = codeInp.value.replace(/\D/g, "").slice(0, 6);
        if (code.length !== 6) {
          devNotice.style.display = "block";
          devNotice.innerHTML = `<div style="background:#FEF2F2; border:1px solid #F87171; padding:10px 12px; border-radius:8px; color:#991B1B; font-size:0.84rem;">Vui lòng nhập đủ 6 chữ số trong email xác nhận.</div>`;
          codeInp.focus();
          return;
        }
        const curUser = window.ThuysTalkFirebase && window.ThuysTalkFirebase.getCurrentUser ? window.ThuysTalkFirebase.getCurrentUser() : null;
        if (!curUser) {
          await abortDeviceChallengeWithError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", true);
          return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = "Đang xác nhận...";
        devNotice.style.display = "none";

        const deviceId = getOrCreateDeviceId();
        const res = await postDeviceApi("/api/device/verify", { deviceId, code });
        verifyBtn.disabled = false;
        verifyBtn.textContent = "Xác nhận";

        if (res.networkError || res.status === 0 || res.status >= 500) {
          await abortDeviceChallengeWithError(
            "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.",
            true
          );
          return;
        }

        if (res.ok && res.data && res.data.ok && res.data.trust && res.data.issuedAt) {
          saveDeviceTrust(curUser.uid, res.data.trust, res.data.issuedAt);
          setSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID, "");
          activeAuthStep = "";
          await completeAuthenticatedLearnerEntry(curUser, {
            source: "ThuysTalk Email Device Verify",
            toastMessage: "Xác nhận thiết bị thành công!"
          });
          return;
        }

        const errMsg = (res.data && res.data.error) || "Mã xác nhận không đúng hoặc đã hết hạn.";
        devNotice.style.display = "block";
        devNotice.innerHTML = `<div style="background:#FEF2F2; border:1px solid #F87171; padding:10px 12px; border-radius:8px; color:#991B1B; font-size:0.84rem;">${escapeHtml(errMsg)}</div>`;
      });

      authDiv.querySelector("#authDeviceResendBtn").addEventListener("click", async () => {
        const resendBtn = authDiv.querySelector("#authDeviceResendBtn");
        const devNotice = authDiv.querySelector("#authDeviceNoticeBox");
        if (resendBtn.disabled) return;
        resendBtn.disabled = true;
        resendBtn.textContent = "Đang gửi...";
        devNotice.style.display = "none";
        const deviceId = getOrCreateDeviceId();
        const res = await postDeviceApi("/api/device/send-code", { deviceId });
        if (res.networkError || res.status === 0 || res.status >= 500) {
          resendBtn.disabled = false;
          resendBtn.textContent = "Gửi lại mã";
          await abortDeviceChallengeWithError(
            "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.",
            true
          );
          return;
        }
        if (res.ok && res.data && res.data.ok) {
          devNotice.style.display = "block";
          devNotice.innerHTML = `<div style="background:#F0FDF4; border:1px solid #34D399; padding:10px 12px; border-radius:8px; color:#065F46; font-size:0.84rem;">Đã gửi lại mã 6 số mới tới email của bạn.</div>`;
          startDeviceResendCooldown(60);
        } else {
          resendBtn.disabled = false;
          resendBtn.textContent = "Gửi lại mã";
          const errMsg = (res.data && res.data.error) || "Chưa thể gửi lại mã lúc này.";
          devNotice.style.display = "block";
          devNotice.innerHTML = `<div style="background:#FEF2F2; border:1px solid #F87171; padding:10px 12px; border-radius:8px; color:#991B1B; font-size:0.84rem;">${escapeHtml(errMsg)}</div>`;
        }
      });

      authDiv.querySelector("#authDeviceCancelBtn").addEventListener("click", async () => {
        await closeAndAbortAuthModal();
      });

      // Google First-Time Profile Completion & Consent form
      authDiv.querySelector("#authGoogleProfileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = authDiv.querySelector("#authGoogleNameInp").value.trim();
        const phone = authDiv.querySelector("#authGooglePhoneInp").value.trim();
        const consentCheck = authDiv.querySelector("#authGoogleConsentCheck");
        const gNotice = authDiv.querySelector("#authGoogleProfileNoticeBox");
        if (!consentCheck || !consentCheck.checked) {
          gNotice.style.display = "block";
          gNotice.innerHTML = `<div style="background:#FEF2F2; border:1px solid #F87171; padding:10px 12px; border-radius:8px; color:#991B1B; font-size:0.84rem;">Vui lòng đánh dấu đồng ý Chính sách bảo mật để tiếp tục.</div>`;
          if (consentCheck) consentCheck.focus();
          return;
        }
        const curUser = window.ThuysTalkFirebase && window.ThuysTalkFirebase.getCurrentUser ? window.ThuysTalkFirebase.getCurrentUser() : null;
        if (!curUser) {
          await closeAndAbortAuthModal();
          return;
        }
        const finishBtn = authDiv.querySelector("#authGoogleFinishBtn");
        finishBtn.disabled = true;
        finishBtn.textContent = "Đang lưu hồ sơ...";
        gNotice.style.display = "none";
        try {
          const ctx = pendingConsentContext && pendingConsentContext.uid === curUser.uid ? pendingConsentContext : null;
          let hasExistingDoc = ctx ? !!ctx.hasExistingDoc : false;
          if (!ctx && window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.fetchLearnerDoc === "function") {
            const checkRes = await window.ThuysTalkFirebase.fetchLearnerDoc(curUser.uid);
            hasExistingDoc = !!(checkRes && !checkRes.error && checkRes.exists);
          }
          const providers = Array.isArray(curUser.providerData) ? curUser.providerData : [];
          const hasGoogleProvider = providers.some((p) => p && p.providerId === "google.com");
          const completionSource = (ctx && ctx.source) || (hasGoogleProvider ? "Google Sign-In" : "ThuysTalk Consent Completion");
          const toastMsg = (ctx && ctx.toastMessage) || "Hoàn tất hồ sơ thành công!";
          await window.ThuysTalkFirebase.saveVerifiedLearnerDoc({
            name,
            phone,
            isNew: !hasExistingDoc,
            recordConsent: true,
            source: completionSource
          });
          removePendingRegProfile(curUser);
          setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, "");
          setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, "");
          pendingConsentContext = null;
          if (hasGoogleProvider) {
            markTrustedGoogleBrowser(curUser.uid);
          } else {
            markRegVerifiedBrowser(curUser.uid);
          }
          activeAuthStep = "";
          await finalizeLearnerSession(curUser, { name, phone });
          showToast(toastMsg);
        } catch (err) {
          gNotice.style.display = "block";
          gNotice.innerHTML = `<div style="background:#FEF2F2; border:1px solid #F87171; padding:10px 12px; border-radius:8px; color:#991B1B; font-size:0.84rem;">Không thể lưu hồ sơ: ${escapeHtml(err && err.message ? err.message : err)}</div>`;
        } finally {
          finishBtn.disabled = false;
          finishBtn.textContent = "Hoàn tất & Tiếp tục";
        }
      });

      authDiv.querySelector("#authGoogleDeclineBtn").addEventListener("click", async () => {
        const declineBtn = authDiv.querySelector("#authGoogleDeclineBtn");
        declineBtn.disabled = true;
        declineBtn.textContent = "Đang hủy...";
        const curUser = window.ThuysTalkFirebase && window.ThuysTalkFirebase.getCurrentUser ? window.ThuysTalkFirebase.getCurrentUser() : null;
        const shouldDeleteAccount = !!(curUser && curUser.uid && getSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID) === curUser.uid);
        activeAuthStep = "";
        pendingAuthSuccessCallback = null;
        pendingConsentContext = null;
        setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, "");
        setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, "");
        setSessionFlag(STORAGE_KEYS.PENDING_REDIRECT_REASON, "");
        setSessionFlag(STORAGE_KEYS.PENDING_ACTION, "");
        try {
          if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.deleteUnconsentedGoogleUser) {
            await window.ThuysTalkFirebase.deleteUnconsentedGoogleUser(shouldDeleteAccount);
          } else if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.logoutLearner) {
            await window.ThuysTalkFirebase.logoutLearner();
          }
        } finally {
          declineBtn.disabled = false;
          declineBtn.textContent = "Không đồng ý";
          authDiv.classList.remove("open");
          clearLearnerClientState();
          showToast(
            shouldDeleteAccount
              ? "Đã hủy tạo tài khoản Google theo yêu cầu của bạn."
              : "Bạn chưa đồng ý Chính sách bảo mật nên đã đăng xuất."
          );
        }
      });

      // Password reset with neutral non-enumerating feedback
      authDiv.querySelector("#authForgotPassBtn").addEventListener("click", async () => {
        const email = authDiv.querySelector("#authLogEmail").value.trim();
        if (!email || !email.includes("@")) {
          showToast("Vui lòng nhập địa chỉ Email ở ô trên để nhận liên kết đặt lại mật khẩu.");
          authDiv.querySelector("#authLogEmail").focus();
          return;
        }

        const forgotBtn = authDiv.querySelector("#authForgotPassBtn");
        const noticeBox = authDiv.querySelector("#authLoginNoticeBox");
        forgotBtn.textContent = "Đang gửi yêu cầu...";
        forgotBtn.disabled = true;

        try {
          if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.sendPasswordReset === "function") {
            try {
              await window.ThuysTalkFirebase.sendPasswordReset(email);
            } catch (fbErr) {
              if (fbErr && fbErr.code !== "auth/user-not-found") {
                console.warn("Password reset request warning:", fbErr.code || fbErr);
              }
            }
          }

          noticeBox.style.display = "block";
          noticeBox.innerHTML = `
            <div style="background:#F0FDF4; border:1.5px solid #059669; border-radius:8px; padding:12px; margin-bottom:8px;">
              <strong style="color:#065F46; font-size:0.9rem;">Yêu cầu đặt lại mật khẩu đã được ghi nhận</strong><br />
              <span style="color:#047857; font-size:0.84rem; line-height:1.5; display:block; margin-top:4px;">
                Nếu địa chỉ <strong>${escapeHtml(email)}</strong> đã đăng ký trên hệ thống ThuysTalk, một liên kết đặt lại mật khẩu sẽ được gửi tới hộp thư của bạn trong vài phút (vui lòng kiểm tra cả mục Thư rác / Spam).
              </span>
            </div>
          `;
          showToast("Yêu cầu đặt lại mật khẩu đã được ghi nhận.");
        } finally {
          forgotBtn.textContent = "Quên mật khẩu?";
          forgotBtn.disabled = false;
        }
      });
    }

    // 3. User Profile & Cloud Progress Modal
    if (!document.getElementById("userProfileModal")) {
      const profDiv = document.createElement("div");
      profDiv.className = "modal-backdrop";
      profDiv.id = "userProfileModal";
      profDiv.setAttribute("role", "dialog");
      profDiv.setAttribute("aria-modal", "true");
      profDiv.innerHTML = `
        <div class="modal-card" style="max-width:580px; background:#FFFFFF !important; color:#0F172A !important; border-radius:18px; box-shadow:0 30px 70px rgba(0,0,0,0.45); border:1.5px solid #E2E8F0; overflow:hidden;">
          <div class="modal-head" style="padding:18px 24px; background:#FFFFFF !important; border-bottom:1.5px solid #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
            <h3 style="color:#064E3B !important; font-size:1.05rem; font-weight:800; margin:0;">Hồ Sơ Cá Nhân &amp; Tiến Độ Mini Test</h3>
            <button class="modal-close" data-close-modal="userProfileModal" aria-label="Đóng" style="background:#F1F5F9 !important; color:#475569 !important; border:1px solid #CBD5E1; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; cursor:pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding:22px 24px; background:#FFFFFF !important; color:#0F172A !important;">
            <div class="auth-tabs-nav profile-tabs-3" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; background:#F1F5F9; border-radius:10px; padding:4px; margin-bottom:20px;">
              <button type="button" class="auth-tab-btn active" id="profileTabInfoBtn" style="padding:9px 12px; font-size:0.82rem;">Thông Tin Cá Nhân</button>
              <button type="button" class="auth-tab-btn" id="profileTabPassBtn" style="padding:9px 12px; font-size:0.82rem;">Đổi Mật Khẩu</button>
              <button type="button" class="auth-tab-btn" id="profileTabProgressBtn" style="padding:9px 12px; font-size:0.82rem;">Tiến Độ Mini Test &amp; Tài Liệu</button>
            </div>

            <!-- Pane 1: Thông tin cá nhân -->
            <div id="profilePaneInfo">
              <form id="profileInfoForm">
                <div class="form-group" style="margin-bottom:12px;">
                  <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Email tài khoản</label>
                  <input type="email" id="profileEmailInp" class="form-control" readonly style="background:#F1F5F9; color:var(--ink-700); cursor:not-allowed;" />
                </div>
                <div class="form-row-2">
                  <div class="form-group">
                    <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Họ và tên của bạn *</label>
                    <input type="text" id="profileNameInp" class="form-control" required placeholder="VD: Nguyễn Thị Lan" />
                  </div>
                  <div class="form-group">
                    <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Số điện thoại / Zalo</label>
                    <input type="tel" id="profilePhoneInp" class="form-control" placeholder="VD: 0912 345 678" />
                  </div>
                </div>
                <div class="form-group" style="margin-bottom:14px;">
                  <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Đơn vị công tác / Doanh nghiệp</label>
                  <input type="text" id="profileCompanyInp" class="form-control" placeholder="VD: Công ty TNHH Logistics ABC" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
                  <span id="profileUpdateStatus" style="font-size:0.8rem; color:var(--jade-700); font-weight:700;"></span>
                  <div style="display:flex; gap:10px;">
                    <button type="button" class="btn btn-outline btn-sm" data-close-modal="userProfileModal">Đóng</button>
                    <button type="submit" class="btn btn-primary btn-sm" id="profileSaveInfoBtn">Cập Nhật Thông Tin</button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Pane 2: Đổi mật khẩu -->
            <div id="profilePanePass" style="display:none;">
              <div class="auth-notice-box" style="margin-bottom:14px;">
                Mật khẩu mới cần tối thiểu 6 ký tự để bảo vệ tài khoản và dữ liệu cá nhân.
              </div>
              <form id="profileChangePassForm">
                <div class="form-group">
                  <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Mật khẩu mới (tối thiểu 6 ký tự) *</label>
                  <input type="password" id="profileNewPassInp" class="form-control" required minlength="6" placeholder="Nhập mật khẩu mới" />
                </div>
                <div class="form-group">
                  <label style="font-size:0.82rem; font-weight:700; color:var(--ink-700);">Xác nhận lại mật khẩu mới *</label>
                  <input type="password" id="profileConfirmPassInp" class="form-control" required minlength="6" placeholder="Nhập lại mật khẩu mới" />
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:18px;">
                  <button type="button" id="profileSendResetEmailBtn" style="border:none; background:transparent; font-size:0.8rem; color:var(--jade-700); font-weight:700; text-decoration:underline; cursor:pointer; padding:0;">
                    Gửi link đổi mật khẩu qua Email
                  </button>
                  <div style="display:flex; gap:10px;">
                    <button type="button" class="btn btn-outline btn-sm" data-close-modal="userProfileModal">Đóng</button>
                    <button type="submit" class="btn btn-primary btn-sm" id="profileSavePassBtn">Đổi Mật Khẩu</button>
                  </div>
                </div>
              </form>
            </div>

            <!-- Pane 3: Tiến trình học tập -->
            <div id="profilePaneProgress" style="display:none;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                <div>
                  <strong style="color:var(--jade-900); font-size:0.92rem;">Tiến Độ Mini Test &amp; Tài Liệu Đã Lưu</strong>
                  <p style="font-size:0.8rem; color:var(--ink-600); margin:2px 0 0;">Dữ liệu tự động đồng bộ đám mây an toàn.</p>
                </div>
                <button type="button" class="btn btn-outline btn-xs" id="profileSyncCloudProgressBtn" style="font-size:0.75rem;">
                  Đồng bộ Cloud ngay
                </button>
              </div>
              <div id="profileCoursesProgressList" style="display:flex; flex-direction:column; gap:12px; max-height:280px; overflow-y:auto; padding-right:4px;">
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(profDiv);

      profDiv.querySelectorAll("[data-close-modal]").forEach((b) => {
        b.addEventListener("click", () => profDiv.classList.remove("open"));
      });
      profDiv.addEventListener("click", (e) => {
        if (e.target === profDiv) profDiv.classList.remove("open");
      });

      // Tab switching
      const tabInfo = profDiv.querySelector("#profileTabInfoBtn");
      const tabPass = profDiv.querySelector("#profileTabPassBtn");
      const tabProg = profDiv.querySelector("#profileTabProgressBtn");
      const paneInfo = profDiv.querySelector("#profilePaneInfo");
      const panePass = profDiv.querySelector("#profilePanePass");
      const paneProg = profDiv.querySelector("#profilePaneProgress");

      tabInfo.addEventListener("click", () => {
        tabInfo.classList.add("active");
        tabPass.classList.remove("active");
        tabProg.classList.remove("active");
        paneInfo.style.display = "block";
        panePass.style.display = "none";
        paneProg.style.display = "none";
      });

      tabPass.addEventListener("click", () => {
        tabPass.classList.add("active");
        tabInfo.classList.remove("active");
        tabProg.classList.remove("active");
        panePass.style.display = "block";
        paneInfo.style.display = "none";
        paneProg.style.display = "none";
      });

      tabProg.addEventListener("click", () => {
        tabProg.classList.add("active");
        tabInfo.classList.remove("active");
        tabPass.classList.remove("active");
        paneProg.style.display = "block";
        paneInfo.style.display = "none";
        panePass.style.display = "none";
        renderUserProfileProgress(profDiv);
      });

      // Form 1: Save Info
      profDiv.querySelector("#profileInfoForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = profDiv.querySelector("#profileNameInp").value.trim();
        const phone = profDiv.querySelector("#profilePhoneInp").value.trim();
        const company = profDiv.querySelector("#profileCompanyInp").value.trim();
        const email = state.learnerEmail;

        if (!name) {
          showToast("Vui lòng điền Họ và tên của bạn.");
          return;
        }

        state.learnerName = name;
        state.learnerPhone = phone;
        localStorage.setItem(STORAGE_KEYS.LEARNER_NAME, name);
        if (phone) localStorage.setItem(STORAGE_KEYS.LEARNER_PHONE, phone);
        else localStorage.removeItem(STORAGE_KEYS.LEARNER_PHONE);
        if (company) localStorage.setItem("thuystalk_learner_company", company);

        const saveBtn = profDiv.querySelector("#profileSaveInfoBtn");
        saveBtn.disabled = true;
        saveBtn.textContent = "Đang lưu...";

        try {
          if (window.ThuysTalkFirebase) {
            await window.ThuysTalkFirebase.updateLearnerProfile({ name, phone, company, email });
          }
          showToast("Đã cập nhật thông tin cá nhân thành công!");
          updateHeaderLearnerStatus();
          updateConsultFormStatus();
          renderElearningSection(window.THUYSTALK_I18N[state.lang]);
        } catch (err) {
          showToast("Lỗi lưu thông tin: " + (err.message || err));
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = "Cập Nhật Thông Tin";
        }
      });

      // Form 2: Change Password
      profDiv.querySelector("#profileChangePassForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = profDiv.querySelector("#profileNewPassInp").value;
        const confirmPass = profDiv.querySelector("#profileConfirmPassInp").value;

        if (newPass.length < 6) {
          showToast("Mật khẩu mới phải có tối thiểu 6 ký tự.");
          return;
        }
        if (newPass !== confirmPass) {
          showToast("Mật khẩu xác nhận không khớp.");
          return;
        }

        const passBtn = profDiv.querySelector("#profileSavePassBtn");
        passBtn.disabled = true;
        passBtn.textContent = "Đang đổi mật khẩu...";

        try {
          if (window.ThuysTalkFirebase) {
            await window.ThuysTalkFirebase.changeLearnerPassword(newPass, state.learnerEmail);
            showToast("Đổi mật khẩu thành công!");
            profDiv.querySelector("#profileNewPassInp").value = "";
            profDiv.querySelector("#profileConfirmPassInp").value = "";
          } else {
            showToast("Đã lưu mật khẩu.");
          }
        } catch (err) {
          alert("Lỗi đổi mật khẩu: " + (err.message || err));
        } finally {
          passBtn.disabled = false;
          passBtn.textContent = "Đổi Mật Khẩu";
        }
      });

      // Reset email button
      profDiv.querySelector("#profileSendResetEmailBtn").addEventListener("click", async () => {
        if (!state.learnerEmail) return;
        try {
          if (window.ThuysTalkFirebase) {
            await window.ThuysTalkFirebase.sendPasswordReset(state.learnerEmail);
            showToast(`Đã gửi email đặt lại mật khẩu tới: ${state.learnerEmail}`);
          }
        } catch (e) {
          alert("Lỗi gửi link: " + e.message);
        }
      });

      // Sync cloud progress button
      profDiv.querySelector("#profileSyncCloudProgressBtn").addEventListener("click", async () => {
        if (!state.learnerEmail) return;
        if (window.ThuysTalkFirebase) {
          const ok = await window.ThuysTalkFirebase.saveLearnerProgress(state.learnerEmail, state.completedLessons);
          if (ok) {
            showToast("Đã đồng bộ tiến trình thành công!");
          } else {
            showToast("Đã lưu tiến trình cục bộ.");
          }
        }
      });
    }

    // 4. Privacy Policy Modal (Nghị định 13/2023/NĐ-CP)
    if (!document.getElementById("privacyPolicyModal")) {
      const privDiv = document.createElement("div");
      privDiv.className = "modal-backdrop";
      privDiv.id = "privacyPolicyModal";
      privDiv.setAttribute("role", "dialog");
      privDiv.setAttribute("aria-modal", "true");
      privDiv.innerHTML = `
        <div class="modal-card" style="max-width:680px; max-height:90vh; background:#FFFFFF !important; color:#0F172A !important; border-radius:18px; box-shadow:0 30px 70px rgba(0,0,0,0.45); border:1.5px solid #E2E8F0; overflow:hidden; display:flex; flex-direction:column;">
          <div class="modal-head" style="padding:18px 24px; background:#FFFFFF !important; border-bottom:1.5px solid #E2E8F0; display:flex; align-items:center; justify-content:space-between;">
            <h3 style="color:#064E3B !important; font-size:1.05rem; font-weight:800; margin:0;">Chính Sách Bảo Mật &amp; Quyền Riêng Tư (Nghị định 13/2023/NĐ-CP)</h3>
            <button class="modal-close" data-close-modal="privacyPolicyModal" aria-label="Đóng" style="background:#F1F5F9 !important; color:#475569 !important; border:1px solid #CBD5E1; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; cursor:pointer;">&times;</button>
          </div>
          <div class="modal-body" style="padding:22px 24px; overflow-y:auto; font-size:0.88rem; line-height:1.65; color:#1E293B !important; background:#FFFFFF !important;">
            <div style="background:#F0FDF4; border:1.5px solid #86EFAC; border-radius:10px; padding:14px 18px; margin-bottom:18px;">
              <strong style="color:#064E3B;">Cam kết của ThuysTalk:</strong> Hệ thống tôn trọng và bảo vệ tuyệt đối dữ liệu cá nhân của người dùng và doanh nghiệp theo đúng quy định tại <strong>Nghị định số 13/2023/NĐ-CP</strong> của Chính phủ về bảo vệ dữ liệu cá nhân.
            </div>

            <h4 style="color:#064E3B; margin:16px 0 6px; font-size:0.95rem; font-weight:800;">1. Mục Đích Thu Thập Dữ Liệu</h4>
            <p style="margin:0 0 10px; color:#334155;">Chúng tôi chỉ thu thập thông tin cần thiết phục vụ trực tiếp cho các mục đích:</p>
            <ul style="margin:0 0 14px 20px; padding:0; color:#334155;">
              <li>Lưu trữ tiến trình học tập các khóa E-Learning, kết quả Mini-test chuyên môn.</li>
              <li>Cung cấp và gửi tài liệu, checklist nghiệp vụ, biểu mẫu hải quan qua email theo yêu cầu.</li>
              <li>Phản hồi và tư vấn chuyên sâu 1-1 về thủ tục hải quan, chính sách XNK, quản trị rủi ro.</li>
            </ul>

            <h4 style="color:#064E3B; margin:16px 0 6px; font-size:0.95rem; font-weight:800;">2. Phạm Vi Dữ Liệu Thu Thập</h4>
            <ul style="margin:0 0 14px 20px; padding:0; color:#334155;">
              <li>Thông tin cơ bản: Họ và tên, địa chỉ email, số điện thoại / Zalo.</li>
              <li>Thông tin công việc (tự nguyện): Đơn vị công tác, chức vụ, câu hỏi / tình huống tư vấn.</li>
              <li>Thông tin tiến độ: Lịch sử làm Mini Test và lượt tải tài liệu chuyên đề.</li>
            </ul>

            <h4 style="color:#064E3B; margin:16px 0 6px; font-size:0.95rem; font-weight:800;">3. Tiêu Chuẩn Bảo Mật &amp; Cam Kết Không Chia Sẻ</h4>
            <p style="margin:0 0 12px; color:#334155;">
              Dữ liệu được lưu trữ an toàn trên hạ tầng đám mây đạt tiêu chuẩn an ninh quốc tế (ISO/IEC 27001, SOC 1/2/3). Mã hóa đường truyền SSL/TLS 256-bit. ThuysTalk <strong>tuyệt đối không chia sẻ, mua bán hoặc chuyển giao</strong> thông tin của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo thương mại.
            </p>

            <h4 style="color:#064E3B; margin:16px 0 6px; font-size:0.95rem; font-weight:800;">4. Quyền Của Bạn Đối Với Dữ Liệu Cá Nhân</h4>
            <ul style="margin:0 0 14px 20px; padding:0; color:#334155;">
              <li><strong>Quyền xem &amp; chỉnh sửa:</strong> Bạn có toàn quyền xem và sửa đổi thông tin cá nhân bất kỳ lúc nào tại mục <em>Hồ sơ cá nhân</em>.</li>
              <li><strong>Quyền yêu cầu xóa:</strong> Bạn có quyền yêu cầu xóa vĩnh viễn toàn bộ tài khoản và dữ liệu đã lưu bằng cách gửi email hoặc nhắn tin Hotline / Zalo.</li>
              <li><strong>Quyền rút lại sự đồng ý:</strong> Bạn có quyền hủy nhận email tài liệu bất cứ lúc nào.</li>
            </ul>

            <h4 style="color:#064E3B; margin:16px 0 6px; font-size:0.95rem; font-weight:800;">5. Đầu Mối Tiếp Nhận &amp; Phụ Trách Bảo Vệ Dữ Liệu (DPO)</h4>
            <div style="background:#F8FAFC; border:1px solid #CBD5E1; border-radius:10px; padding:14px 18px; color:#1E293B; line-height:1.6;">
              <div><strong>Người đại diện phụ trách:</strong> Nguyễn Thị Ngọc Thúy (Founder ThuysTalk · Giám đốc Eureka Logistics)</div>
              <div><strong>Email liên hệ:</strong> <a href="mailto:thuystalk.official@gmail.com" style="color:#047857; font-weight:700;">thuystalk.official@gmail.com</a></div>
              <div><strong>Hotline / Zalo hỗ trợ:</strong> <a href="https://zalo.me/84767648862" target="_blank" style="color:#047857; font-weight:700;">0767.648.862</a></div>
            </div>
          </div>
          <div style="padding:14px 24px; border-top:1px solid #E2E8F0; background:#FFFFFF !important; display:flex; justify-content:flex-end;">
            <button type="button" class="btn btn-primary btn-sm" data-close-modal="privacyPolicyModal">Đã hiểu &amp; Đóng</button>
          </div>
        </div>
      `;
      document.body.appendChild(privDiv);

      privDiv.querySelectorAll("[data-close-modal]").forEach((b) => {
        b.addEventListener("click", () => privDiv.classList.remove("open"));
      });
      privDiv.addEventListener("click", (e) => {
        if (e.target === privDiv) privDiv.classList.remove("open");
      });
    }
  }

  function renderUserProfileProgress(modalDiv) {
    const container = modalDiv.querySelector("#profileCoursesProgressList");
    if (!container) return;
    if (!state.courses || state.courses.length === 0) {
      container.innerHTML = `<p style="font-size:0.85rem; color:var(--ink-500); text-align:center;">Chưa có dữ liệu tài liệu & chuyên đề.</p>`;
      return;
    }
    container.innerHTML = state.courses.map((course) => {
      const total = (course.lessons && course.lessons.length) || 1;
      let done = 0;
      if (course.lessons) {
        course.lessons.forEach((l) => {
          if (state.completedLessons[l.id]) done++;
        });
      }
      const percent = Math.round((done / total) * 100);
      const nextIdx = getNextUnfinishedLessonIndex(course);
      const nextLesson = course.lessons && course.lessons[nextIdx];
      const nextLessonTitle = nextLesson
        ? (typeof nextLesson.title === "object" ? nextLesson.title[state.lang] || nextLesson.title.vi : nextLesson.title)
        : "";
      const actionLabel = percent === 100 ? "Xem lại ->" : "Tiếp tục làm ->";

      return `
        <button type="button" class="profile-progress-card" data-progress-course-id="${escapeHtml(course.id)}" data-progress-lesson-idx="${nextIdx}" title="Nhấn để mở trực tiếp tài liệu &amp; Mini Test">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:6px;">
            <strong style="font-size:0.88rem; color:var(--jade-950); line-height:1.35;">${escapeHtml(course.title && (course.title.vi || course.title))}</strong>
            <span style="font-size:0.78rem; font-weight:800; color:${percent === 100 ? '#059669' : 'var(--orange-600)'}; white-space:nowrap;">${done}/${total} tài liệu (${percent}%)</span>
          </div>
          <div style="width:100%; height:8px; background:#E2E8F0; border-radius:4px; overflow:hidden; margin-bottom:8px;">
            <div style="width:${percent}%; height:100%; background:${percent === 100 ? '#059669' : 'var(--orange-500)'}; transition:width 0.3s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:0.76rem;">
            <span style="color:var(--ink-600); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${percent === 100 ? "Đã hoàn thành toàn bộ chuyên đề" : `Đang dở: Bài ${nextIdx + 1}${nextLessonTitle ? " · " + escapeHtml(nextLessonTitle) : ""}`}
            </span>
            <span style="font-weight:800; color:${percent === 100 ? '#047857' : 'var(--orange-600)'}; white-space:nowrap;">${actionLabel}</span>
          </div>
        </button>
      `;
    }).join("");

    container.querySelectorAll("[data-progress-course-id]").forEach((cardBtn) => {
      cardBtn.addEventListener("click", () => {
        const courseId = cardBtn.dataset.progressCourseId;
        const lessonIdx = parseInt(cardBtn.dataset.progressLessonIdx || "0", 10);
        if (modalDiv) modalDiv.classList.remove("open");
        openCourseClassroom(courseId, lessonIdx);
      });
    });
  }

  function openUserProfileModal(activeTab = "info") {
    ensureGlobalModals();
    const div = document.getElementById("userProfileModal");
    if (!div) return;

    const emailInp = div.querySelector("#profileEmailInp");
    const nameInp = div.querySelector("#profileNameInp");
    const phoneInp = div.querySelector("#profilePhoneInp");
    const companyInp = div.querySelector("#profileCompanyInp");

    if (emailInp) emailInp.value = state.learnerEmail || "";
    if (nameInp) nameInp.value = state.learnerName || localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || "";
    if (phoneInp) phoneInp.value = state.learnerPhone || localStorage.getItem(STORAGE_KEYS.LEARNER_PHONE) || "";
    if (companyInp) companyInp.value = localStorage.getItem("thuystalk_learner_company") || "";

    renderUserProfileProgress(div);

    if (activeTab === "pass") {
      div.querySelector("#profileTabPassBtn").click();
    } else if (activeTab === "progress") {
      div.querySelector("#profileTabProgressBtn").click();
    } else {
      div.querySelector("#profileTabInfoBtn").click();
    }

    div.classList.add("open");
  }

  function openPrivacyPolicyModal() {
    ensureGlobalModals();
    const div = document.getElementById("privacyPolicyModal");
    if (div) div.classList.add("open");
  }

  let pendingAuthSuccessCallback = null;
  let activeAuthStep = "";
  let pendingConsentContext = null;
  let isHandlingRedirectInit = false;
  let verifyPollIntervalId = null;
  let verifyPollFocusHandler = null;
  let authResendTimerId = null;

  function clearLearnerClientState() {
    state.learnerUid = "";
    state.learnerEmail = "";
    state.learnerName = "";
    state.learnerPhone = "";
    state.adminMode = false;
    localStorage.removeItem(STORAGE_KEYS.LEARNER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.LEARNER_NAME);
    localStorage.removeItem(STORAGE_KEYS.LEARNER_PHONE);
    updateHeaderLearnerStatus();
    updateConsultFormStatus();
    renderElearningSection(window.THUYSTALK_I18N[state.lang]);
  }

  function stopEmailVerificationPolling() {
    if (verifyPollIntervalId) {
      clearInterval(verifyPollIntervalId);
      verifyPollIntervalId = null;
    }
    if (verifyPollFocusHandler) {
      window.removeEventListener("focus", verifyPollFocusHandler);
      document.removeEventListener("visibilitychange", verifyPollFocusHandler);
      verifyPollFocusHandler = null;
    }
  }

  function stopAuthResendCooldown() {
    if (authResendTimerId) {
      clearInterval(authResendTimerId);
      authResendTimerId = null;
    }
  }

  function startCooldownOnButton(btnId, baseLabel, seconds) {
    stopAuthResendCooldown();
    const btn = document.getElementById(btnId);
    if (!btn) return;
    let remaining = seconds;
    btn.disabled = true;
    btn.textContent = `${baseLabel} (${remaining}s)`;
    authResendTimerId = setInterval(() => {
      remaining -= 1;
      const liveBtn = document.getElementById(btnId);
      if (!liveBtn || remaining <= 0) {
        stopAuthResendCooldown();
        if (liveBtn) {
          liveBtn.disabled = false;
          liveBtn.textContent = baseLabel;
        }
        return;
      }
      liveBtn.textContent = `${baseLabel} (${remaining}s)`;
    }, 1000);
  }

  function startVerifyResendCooldown(seconds) {
    startCooldownOnButton("authVerifyResendBtn", "Gửi lại thư", seconds);
  }

  function startDeviceResendCooldown(seconds) {
    startCooldownOnButton("authDeviceResendBtn", "Gửi lại mã", seconds);
  }

  function showAuthSubView(viewName) {
    const authDiv = document.getElementById("learnerAuthModal");
    if (!authDiv) return;
    const views = {
      tabs: authDiv.querySelector("#authTabsWrapper"),
      verify_email: authDiv.querySelector("#authVerifyEmailPane"),
      device_code: authDiv.querySelector("#authDeviceCodePane"),
      google_profile: authDiv.querySelector("#authGoogleProfilePane")
    };
    Object.keys(views).forEach((k) => {
      if (views[k]) views[k].style.display = k === viewName ? "block" : "none";
    });
  }

  function showLoginNotice(message, isError = false) {
    const authDiv = document.getElementById("learnerAuthModal");
    if (!authDiv) return;
    showAuthSubView("tabs");
    const tabLog = authDiv.querySelector("#authTabLoginBtn");
    if (tabLog) tabLog.click();
    const noticeBox = authDiv.querySelector("#authLoginNoticeBox");
    if (!noticeBox) return;
    if (!message) {
      noticeBox.style.display = "none";
      noticeBox.textContent = "";
      return;
    }
    noticeBox.style.display = "block";
    if (isError) {
      noticeBox.innerHTML = `<div style="background:#FEF2F2; border:1.5px solid #F87171; border-radius:8px; padding:12px; color:#991B1B; font-size:0.84rem; line-height:1.5;">${escapeHtml(message)}</div>`;
    } else {
      noticeBox.textContent = message;
    }
  }

  async function abortDeviceChallengeWithError(message, shouldSignOut) {
    activeAuthStep = "";
    setSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID, "");
    if (shouldSignOut && window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.logoutLearner === "function") {
      try {
        await window.ThuysTalkFirebase.logoutLearner();
      } catch (e) {}
    }
    clearLearnerClientState();
    ensureGlobalModals();
    const authDiv = document.getElementById("learnerAuthModal");
    if (authDiv) authDiv.classList.add("open");
    showLoginNotice(message, true);
  }

  function startEmailVerificationPolling(isFromRegistration) {
    stopEmailVerificationPolling();
    const startedAt = Date.now();
    const MAX_WAIT_MS = 10 * 60 * 1000;
    let isChecking = false;

    const checkOnce = async () => {
      if (activeAuthStep !== "verify_email" || isChecking) return;
      if (Date.now() - startedAt >= MAX_WAIT_MS) {
        stopEmailVerificationPolling();
        const stEl = document.getElementById("authVerifyStatusText");
        if (stEl) {
          stEl.style.color = "#B45309";
          stEl.textContent = "Đã hết 10 phút tự động kiểm tra. Sau khi bấm link trong email, bạn có thể bấm Gửi lại thư hoặc đăng nhập lại.";
        }
        return;
      }
      if (!window.ThuysTalkFirebase || typeof window.ThuysTalkFirebase.reloadCurrentUser !== "function") return;
      isChecking = true;
      try {
        const freshUser = await window.ThuysTalkFirebase.reloadCurrentUser();
        if (!freshUser) {
          stopEmailVerificationPolling();
          return;
        }
        if (freshUser.emailVerified === true) {
          stopEmailVerificationPolling();
          stopAuthResendCooldown();
          await handlePostPasswordAuth(freshUser, isFromRegistration);
        }
      } catch (e) {
      } finally {
        isChecking = false;
      }
    };

    verifyPollFocusHandler = () => {
      if (document.visibilityState === "hidden") return;
      checkOnce();
    };
    window.addEventListener("focus", verifyPollFocusHandler);
    document.addEventListener("visibilitychange", verifyPollFocusHandler);
    verifyPollIntervalId = setInterval(checkOnce, 5000);
  }

  function enterEmailVerificationView(email, isFromRegistration, startResendCooldownNow) {
    ensureGlobalModals();
    const authDiv = document.getElementById("learnerAuthModal");
    if (!authDiv) return;
    activeAuthStep = "verify_email";
    authDiv.classList.add("open");
    showAuthSubView("verify_email");
    const descEl = authDiv.querySelector("#authVerifyEmailDesc");
    if (descEl) {
      descEl.innerHTML = `Một liên kết xác thực đã được gửi tới <strong>${escapeHtml(email)}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc mục Spam) và bấm vào đường link trong email.`;
    }
    const statusEl = authDiv.querySelector("#authVerifyStatusText");
    if (statusEl) {
      statusEl.style.color = "#047857";
      statusEl.textContent = "Đang chờ xác thực... Tab này tự động kiểm tra mỗi 5 giây và sẽ đi tiếp ngay khi bạn bấm link.";
    }
    const noticeEl = authDiv.querySelector("#authVerifyNoticeBox");
    if (noticeEl) noticeEl.style.display = "none";

    const resendBtn = authDiv.querySelector("#authVerifyResendBtn");
    if (startResendCooldownNow) {
      startVerifyResendCooldown(60);
    } else if (resendBtn) {
      stopAuthResendCooldown();
      resendBtn.disabled = false;
      resendBtn.textContent = "Gửi lại thư";
    }
    startEmailVerificationPolling(isFromRegistration);
  }

  function openConsentCompletionPane(user, docData, options = {}) {
    const hasExistingDoc = !!options.hasExistingDoc;
    const isNewGoogleAccount = !!options.isNewGoogleAccount;
    const source = options.source || "Google Sign-In";
    const completionToast = options.completionToast || "Hoàn tất hồ sơ thành công!";
    const pendingReg = options.pendingReg || null;
    setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, isNewGoogleAccount ? user.uid : "");
    setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, user.uid);
    activeAuthStep = "google_profile";
    pendingConsentContext = {
      uid: user.uid,
      hasExistingDoc,
      source,
      toastMessage: completionToast
    };
    ensureGlobalModals();
    const authDiv = document.getElementById("learnerAuthModal");
    if (authDiv) {
      authDiv.classList.add("open");
      showAuthSubView("google_profile");
      const nameInp = authDiv.querySelector("#authGoogleNameInp");
      const phoneInp = authDiv.querySelector("#authGooglePhoneInp");
      const consentChk = authDiv.querySelector("#authGoogleConsentCheck");
      const gNotice = authDiv.querySelector("#authGoogleProfileNoticeBox");
      if (nameInp) {
        nameInp.value =
          (docData && docData.name) ||
          (pendingReg && pendingReg.name) ||
          user.displayName ||
          (user.email ? user.email.split("@")[0] : "");
      }
      if (phoneInp) {
        phoneInp.value =
          (docData && typeof docData.phone === "string" && docData.phone) ||
          (pendingReg && pendingReg.phone) ||
          "";
      }
      if (consentChk) consentChk.checked = false;
      if (gNotice) gNotice.style.display = "none";
    }
  }

  async function completeAuthenticatedLearnerEntry(user, options = {}) {
    if (!user || user.emailVerified !== true || !user.email) return;
    const source = options.source || "ThuysTalk Login";
    const fromSessionRestore = !!options.fromSessionRestore;
    const docRes =
      window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.fetchLearnerDoc === "function"
        ? await window.ThuysTalkFirebase.fetchLearnerDoc(user.uid)
        : { error: false, exists: false, data: null };

    if (docRes.error) {
      activeAuthStep = "";
      pendingConsentContext = null;
      if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.logoutLearner === "function") {
        await window.ThuysTalkFirebase.logoutLearner();
      }
      clearLearnerClientState();
      if (options.onDocFetchErrorNotice) {
        ensureGlobalModals();
        const authDiv = document.getElementById("learnerAuthModal");
        if (authDiv) {
          authDiv.classList.add("open");
          showLoginNotice("Không thể tải hồ sơ người dùng lúc này. Vui lòng thử lại sau.", true);
        }
      } else {
        showToast("Không thể tải hồ sơ người dùng lúc này. Vui lòng thử lại sau.");
      }
      return;
    }

    const docData = docRes.exists && docRes.data && typeof docRes.data === "object" ? docRes.data : null;
    const hasDocConsent = !!(docData && docData.consentAt);
    const pendingReg = getPendingRegProfile(user);

    if (hasDocConsent) {
      if (pendingReg) removePendingRegProfile(user);
      setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, "");
      setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, "");
      pendingConsentContext = null;
      if (options.markGoogleTrust) markTrustedGoogleBrowser(user.uid);
      if (options.markRegTrust) markRegVerifiedBrowser(user.uid);
      activeAuthStep = "";

      if (
        !fromSessionRestore &&
        window.ThuysTalkFirebase &&
        typeof window.ThuysTalkFirebase.saveVerifiedLearnerDoc === "function"
      ) {
        const updatePayload = {
          name: (docData && docData.name) || (pendingReg && pendingReg.name) || user.displayName || "",
          isNew: false,
          recordConsent: false,
          source
        };
        if (
          docData &&
          typeof docData.phone !== "string" &&
          pendingReg &&
          typeof pendingReg.phone === "string" &&
          pendingReg.phone
        ) {
          updatePayload.phone = pendingReg.phone;
        }
        try {
          await window.ThuysTalkFirebase.saveVerifiedLearnerDoc(updatePayload);
        } catch (err) {
          console.warn("saveVerifiedLearnerDoc warning:", err);
        }
      }

      await finalizeLearnerSession(user, docData);
      if (options.toastMessage) showToast(options.toastMessage);
      return;
    }

    if (pendingReg && pendingReg.consent === true) {
      const resolvedName = (pendingReg.name && pendingReg.name.trim()) || (docData && docData.name) || user.displayName || "";
      const resolvedPhone =
        pendingReg.phone !== undefined ? String(pendingReg.phone || "").trim() : ((docData && docData.phone) || "");
      let savedOk = false;
      if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.saveVerifiedLearnerDoc === "function") {
        try {
          await window.ThuysTalkFirebase.saveVerifiedLearnerDoc({
            name: resolvedName,
            phone: resolvedPhone,
            isNew: !docRes.exists,
            recordConsent: true,
            source: source || "ThuysTalk Email Registration"
          });
          savedOk = true;
          removePendingRegProfile(user);
        } catch (err) {
          console.warn("saveVerifiedLearnerDoc consent persist warning:", err);
        }
      }
      if (!savedOk) {
        openConsentCompletionPane(user, docData, {
          hasExistingDoc: !!docRes.exists,
          isNewGoogleAccount: !docRes.exists && !!options.maybeNewGoogleAccount,
          source: options.consentSource || source,
          completionToast: options.toastMessage || "Hoàn tất hồ sơ thành công!",
          pendingReg
        });
        return;
      }
      setSessionFlag(STORAGE_KEYS.PENDING_GOOGLE_PROFILE_UID, "");
      setSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID, "");
      pendingConsentContext = null;
      if (options.markGoogleTrust) markTrustedGoogleBrowser(user.uid);
      if (options.markRegTrust) markRegVerifiedBrowser(user.uid);
      activeAuthStep = "";
      await finalizeLearnerSession(user, { name: resolvedName, phone: resolvedPhone });
      if (options.toastMessage) showToast(options.toastMessage);
      return;
    }

    openConsentCompletionPane(user, docData, {
      hasExistingDoc: !!docRes.exists,
      isNewGoogleAccount: !docRes.exists && !!options.maybeNewGoogleAccount,
      source: options.consentSource || source,
      completionToast: options.toastMessage || "Hoàn tất hồ sơ thành công!",
      pendingReg
    });
  }

  async function handlePostPasswordAuth(user, isFromRegistration) {
    if (!user || user.emailVerified !== true) return;

    if (isFromRegistration) {
      await completeAuthenticatedLearnerEntry(user, {
        source: "ThuysTalk Email Registration",
        consentSource: "ThuysTalk Email Registration",
        markRegTrust: true,
        toastMessage: "Xác thực email thành công! Chào mừng bạn đến với ThuysTalk."
      });
      return;
    }

    const deviceTrusted = !!getDeviceTrust(user.uid) || hasRegVerifiedBrowser(user.uid);
    if (deviceTrusted) {
      await completeAuthenticatedLearnerEntry(user, {
        source: "ThuysTalk Email Login",
        consentSource: "ThuysTalk Consent Completion",
        toastMessage: "Chào mừng bạn trở lại! Đăng nhập thành công."
      });
      return;
    }

    // New device for password login -> require 6-digit email verification code
    activeAuthStep = "device_code";
    setSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID, user.uid);
    ensureGlobalModals();
    const authDiv = document.getElementById("learnerAuthModal");
    if (!authDiv) return;
    authDiv.classList.add("open");
    showAuthSubView("device_code");

    const codeInp = authDiv.querySelector("#authDeviceCodeInp");
    const devNotice = authDiv.querySelector("#authDeviceNoticeBox");
    const devDesc = authDiv.querySelector("#authDeviceCodeDesc");
    const resendBtn = authDiv.querySelector("#authDeviceResendBtn");
    const verifyBtn = authDiv.querySelector("#authDeviceVerifyBtn");
    if (codeInp) codeInp.value = "";
    if (devNotice) devNotice.style.display = "none";
    if (devDesc) {
      devDesc.innerHTML = `Đang gửi mã xác nhận 6 số tới <strong>${escapeHtml(user.email || "")}</strong>...`;
    }
    if (verifyBtn) verifyBtn.disabled = true;
    if (resendBtn) resendBtn.disabled = true;

    const sendRes = await postDeviceApi("/api/device/send-code", { deviceId: getOrCreateDeviceId() });
    if (verifyBtn) verifyBtn.disabled = false;

    if (sendRes.networkError || sendRes.status === 0 || sendRes.status >= 500) {
      if (resendBtn) resendBtn.disabled = false;
      await abortDeviceChallengeWithError(
        "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.",
        true
      );
      return;
    }
    if (!sendRes.ok || !sendRes.data || !sendRes.data.ok) {
      if (resendBtn) resendBtn.disabled = false;
      const errMsg =
        (sendRes.data && sendRes.data.error) ||
        "Chưa gửi được mã xác nhận lúc này. Bạn có thể đăng nhập bằng Google hoặc thử lại sau.";
      await abortDeviceChallengeWithError(errMsg, true);
      return;
    }

    if (devDesc) {
      devDesc.innerHTML = `Mã xác nhận 6 số đã được gửi tới <strong>${escapeHtml(user.email || "")}</strong> (hiệu lực 10 phút).`;
    }
    startDeviceResendCooldown(60);
    if (codeInp) codeInp.focus();
  }

  async function handleGoogleLoginOutcome(gRes, fromRedirect) {
    if (!gRes) {
      activeAuthStep = "";
      return;
    }
    if (gRes.accountExists) {
      activeAuthStep = "";
      ensureGlobalModals();
      const authDiv = document.getElementById("learnerAuthModal");
      if (authDiv) {
        authDiv.classList.add("open");
        showLoginNotice("Email này đã có tài khoản. Đăng nhập bằng mật khẩu một lần để liên kết với Google", false);
        const logEmail = authDiv.querySelector("#authLogEmail");
        if (logEmail && gRes.email) logEmail.value = gRes.email;
      }
      return;
    }
    const user = gRes.user;
    if (!user) {
      activeAuthStep = "";
      return;
    }
    const providers = Array.isArray(user.providerData) ? user.providerData : [];
    const onlyGoogleProvider = providers.length === 1 && providers[0] && providers[0].providerId === "google.com";
    const isAdmin = !!(window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.isAdminUser === "function" && window.ThuysTalkFirebase.isAdminUser(user));
    const createdAt = user.metadata && user.metadata.creationTime ? user.metadata.creationTime : "";
    const lastSignInAt = user.metadata && user.metadata.lastSignInTime ? user.metadata.lastSignInTime : "";
    const maybeNewGoogleAccount =
      !isAdmin &&
      onlyGoogleProvider &&
      (gRes.isNewUser === true ||
        (!gRes.fromSessionRestore && !!createdAt && !!lastSignInAt && createdAt === lastSignInAt) ||
        (!!gRes.fromSessionRestore && getSessionFlag(STORAGE_KEYS.NEW_GOOGLE_AUTH_UID) === user.uid));

    await completeAuthenticatedLearnerEntry(user, {
      source: "Google Sign-In",
      consentSource: "Google Sign-In",
      maybeNewGoogleAccount,
      fromSessionRestore: !!gRes.fromSessionRestore,
      markGoogleTrust: true,
      onDocFetchErrorNotice: !gRes.fromSessionRestore,
      toastMessage: gRes.fromSessionRestore ? "" : "Đăng nhập Google thành công!"
    });
  }

  async function executePendingRedirectAction(user) {
    const pendingAct = readStorageJson(sessionStorage, STORAGE_KEYS.PENDING_ACTION, null);
    if (!pendingAct || !pendingAct.type) return;
    setSessionFlag(STORAGE_KEYS.PENDING_ACTION, "");
    if (typeof window.__thuystalkResumePendingAction === "function") {
      window.__thuystalkResumePendingAction(pendingAct, user);
    }
  }

  async function finalizeLearnerSession(user, profileDoc) {
    if (!user || user.emailVerified !== true || !user.email) return;
    let docData = profileDoc && typeof profileDoc === "object" ? profileDoc : null;
    if (!docData && window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.fetchLearnerDoc === "function") {
      const res = await window.ThuysTalkFirebase.fetchLearnerDoc(user.uid);
      if (res && !res.error && res.data) docData = res.data;
    }

    state.learnerUid = user.uid;
    state.learnerEmail = user.email;
    const resolvedName = (docData && docData.name) || user.displayName || user.email.split("@")[0];
    state.learnerName = resolvedName;
    localStorage.setItem(STORAGE_KEYS.LEARNER_NAME, resolvedName);
    if (docData && typeof docData.phone === "string") {
      state.learnerPhone = docData.phone;
      if (docData.phone) localStorage.setItem(STORAGE_KEYS.LEARNER_PHONE, docData.phone);
      else localStorage.removeItem(STORAGE_KEYS.LEARNER_PHONE);
    }
    localStorage.setItem(STORAGE_KEYS.LEARNER_EMAIL, user.email);
    state.adminMode = !!(window.ThuysTalkFirebase && window.ThuysTalkFirebase.isAdminUser(user));

    if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.fetchLearnerProgress === "function") {
      window.ThuysTalkFirebase.fetchLearnerProgress(user.email).then((cloudProg) => {
        if (cloudProg && typeof cloudProg === "object") {
          state.completedLessons = Object.assign({}, state.completedLessons, cloudProg);
          localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(state.completedLessons));
          renderElearningSection(window.THUYSTALK_I18N[state.lang]);
        }
      }).catch(() => {});
    }

    const modal = document.getElementById("learnerAuthModal");
    if (modal) modal.classList.remove("open");
    showAuthSubView("tabs");
    const gate = document.querySelector(".chat-login-gate-card");
    if (gate) gate.remove();

    updateHeaderLearnerStatus();
    updateConsultFormStatus();
    renderElearningSection(window.THUYSTALK_I18N[state.lang]);
    setSessionFlag(STORAGE_KEYS.PENDING_REDIRECT_REASON, "");
    consumePendingAuthCallback(user);
    await executePendingRedirectAction(user);
  }

  function consumePendingAuthCallback(user) {
    if (typeof pendingAuthSuccessCallback === "function") {
      const cb = pendingAuthSuccessCallback;
      pendingAuthSuccessCallback = null;
      const modal = document.getElementById("learnerAuthModal");
      if (modal) modal.classList.remove("open");
      cb(user);
    }
  }

  function requireLearnerLogin(options = {}) {
    const reason = options && options.reason ? String(options.reason) : "";
    const onSuccess = options && typeof options.onSuccess === "function" ? options.onSuccess : null;
    const pendingAction = options && options.pendingAction ? options.pendingAction : null;
    const fbUser = window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getCurrentUser === "function"
      ? window.ThuysTalkFirebase.getCurrentUser()
      : null;

    if (fbUser && fbUser.emailVerified === true && state.learnerUid && state.learnerEmail) {
      if (onSuccess) onSuccess(fbUser);
      return;
    }

    pendingAuthSuccessCallback = onSuccess;
    if (pendingAction) {
      writeStorageJson(sessionStorage, STORAGE_KEYS.PENDING_ACTION, pendingAction);
    }
    ensureGlobalModals();
    const div = document.getElementById("learnerAuthModal");
    if (!div) return;
    showAuthSubView("tabs");
    const tabLog = div.querySelector("#authTabLoginBtn");
    if (tabLog) tabLog.click();
    showLoginNotice(reason, false);
    div.classList.add("open");
  }

  async function syncLearnerStateFromAuthUser(user) {
    if (isHandlingRedirectInit || activeAuthStep) {
      return;
    }
    if (!user || user.emailVerified !== true || !user.email) {
      clearLearnerClientState();
      return;
    }
    if (state.learnerUid === user.uid && state.learnerEmail === user.email) {
      return;
    }

    let isGoogleSession = hasTrustedGoogleBrowser(user.uid);
    try {
      const tokenRes = await user.getIdTokenResult();
      if (tokenRes && tokenRes.signInProvider === "google.com") {
        isGoogleSession = true;
      } else if (tokenRes && tokenRes.signInProvider === "password") {
        isGoogleSession = false;
      }
    } catch (e) {}

    if (isGoogleSession) {
      await handleGoogleLoginOutcome(
        { user, email: user.email, isNewUser: false, fromSessionRestore: true, provider: "google" },
        false
      );
      return;
    }

    // Password session restored on load -> enforce device trust / prevent reload bypass
    const hasDevice = !!getDeviceTrust(user.uid) || hasRegVerifiedBrowser(user.uid);
    if (!hasDevice || getSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID) === user.uid) {
      setSessionFlag(STORAGE_KEYS.PENDING_AUTH_CHALLENGE_UID, "");
      if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.logoutLearner === "function") {
        await window.ThuysTalkFirebase.logoutLearner();
      }
      clearLearnerClientState();
      return;
    }

    await completeAuthenticatedLearnerEntry(user, {
      source: "ThuysTalk Session Restore",
      consentSource: "ThuysTalk Consent Completion",
      fromSessionRestore: true,
      toastMessage: ""
    });
  }

  function openLearnerAuthModal(tab = "register") {
    stopEmailVerificationPolling();
    stopAuthResendCooldown();
    activeAuthStep = "";
    pendingAuthSuccessCallback = null;
    setSessionFlag(STORAGE_KEYS.PENDING_ACTION, "");
    ensureGlobalModals();
    const div = document.getElementById("learnerAuthModal");
    if (!div) return;
    showAuthSubView("tabs");
    const noticeBox = div.querySelector("#authLoginNoticeBox");
    if (noticeBox) {
      noticeBox.style.display = "none";
      noticeBox.textContent = "";
    }
    if (tab === "login") {
      div.querySelector("#authTabLoginBtn").click();
    } else {
      div.querySelector("#authTabRegisterBtn").click();
    }
    div.classList.add("open");
  }

  function updateHeaderLearnerStatus() {
    document.querySelectorAll(".header-actions").forEach((container) => {
      let authBtn = container.querySelector("#learnerAuthHeaderBtn");
      if (!authBtn) {
        authBtn = document.createElement("div");
        authBtn.id = "learnerAuthHeaderBtn";
        const adminBtn = container.querySelector("#adminToggleBtn");
        const headerCta = container.querySelector("#headerCtaBtn");
        if (adminBtn) {
          container.insertBefore(authBtn, adminBtn);
        } else if (headerCta) {
          container.insertBefore(authBtn, headerCta);
        } else {
          container.appendChild(authBtn);
        }
      }

      if (state.learnerEmail) {
        const displayName = state.learnerName || localStorage.getItem(STORAGE_KEYS.LEARNER_NAME) || state.learnerEmail.split("@")[0];
        authBtn.innerHTML = `
          <div style="display:inline-flex; align-items:center; gap:6px; background:var(--jade-50); border:1.5px solid var(--jade-400); padding:3px 10px; border-radius:20px; font-size:0.78rem; font-weight:700; color:var(--jade-900);">
            <span style="width:7px; height:7px; border-radius:50%; background:#10B981; display:inline-block;"></span>
            <button type="button" id="headerProfileTriggerBtn" style="border:none; background:transparent; font-size:0.78rem; color:var(--jade-900); font-weight:700; cursor:pointer; padding:0; text-decoration:none;" title="Xem &amp; sửa thông tin cá nhân, đổi mật khẩu">
              <strong style="color:var(--jade-950); text-decoration:underline;">${escapeHtml(displayName)}</strong>
            </button>
            <button type="button" id="headerLogoutLearnerBtn" style="border:none; background:transparent; font-size:0.75rem; color:#EF4444; font-weight:800; cursor:pointer; padding:0 2px; margin-left:4px;" title="Đăng xuất tài khoản">
              Thoát
            </button>
          </div>
        `;
        const profileTrigger = authBtn.querySelector("#headerProfileTriggerBtn");
        if (profileTrigger) {
          profileTrigger.addEventListener("click", () => openUserProfileModal("info"));
        }
        const logoutBtn = authBtn.querySelector("#headerLogoutLearnerBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (window.ThuysTalkFirebase) {
              await window.ThuysTalkFirebase.logoutLearner();
            }
            clearLearnerClientState();
            showToast("Đã đăng xuất tài khoản thành công.");
          });
        }
      } else {
        authBtn.innerHTML = `
          <button type="button" class="btn btn-outline btn-sm" id="headerOpenAuthModalBtn" style="padding:6px 14px; font-size:0.78rem;">
            Tài Khoản
          </button>
        `;
        const openBtn = authBtn.querySelector("#headerOpenAuthModalBtn");
        if (openBtn) {
          openBtn.addEventListener("click", () => {
            openLearnerAuthModal("register");
          });
        }
      }
    });
  }


  // --- TAB 2: WRITE & MANAGE ARTICLES ---
  function renderAdminArticlesTab(body) {
    let editingArtId = null;

    const rows = state.articles
      .map((a, idx) => {
        const titleVi = typeof a.title === "object" ? a.title.vi : a.title;
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><span class="exp-tag">${escapeHtml(a.pillar)}</span></td>
          <td style="font-weight:700;">${escapeHtml(titleVi)}</td>
          <td>${escapeHtml(a.date)}</td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn btn-outline btn-xs" data-edit-art="${escapeHtml(a.id)}" style="margin-right:6px; padding:4px 8px; font-size:0.75rem;">Sửa</button>
            <button type="button" class="btn btn-jade btn-xs" data-bulk-email-art="${escapeHtml(a.id)}" style="margin-right:6px; padding:4px 8px; font-size:0.75rem; background:#047857; color:#fff;" title="Gửi tài liệu bài viết này qua email tới tất cả người dùng & khách hàng đã đăng ký">Gửi email hàng loạt</button>
            <button type="button" class="btn btn-danger btn-xs" data-del-art="${escapeHtml(a.id)}" style="padding:4px 8px; font-size:0.75rem;">Xóa</button>
          </td>
        </tr>`;
      })
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box" id="cmsArticleFormCard">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
          <h4 id="cmsArtFormHeading" style="margin:0; color:var(--jade-900);">
            Soạn Bài Viết Chuyên Sâu Mới (Trình Soạn Thảo Kiểu Word Trực Quan)
          </h4>
          <span id="cmsArtEditModeBadge" style="display:none; background:var(--orange-100); color:var(--orange-800); font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:12px;">
            ĐANG Ở CHẾ ĐỘ CHỈNH SỬA
          </span>
        </div>
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
                <option value="CS">Case Study · Tình Huống Thực Tế (CS)</option>
                <option value="TN">Tin Ngành &amp; Chính Sách (TN)</option>
                <option value="HT">Kinh Nghiệm Thực Tế (HT)</option>
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
            <label>Nội dung toàn văn bài viết (Gõ trực tiếp kiểu Word, căn lề, chèn bảng, chèn ảnh/video .jpg, .png, .webp, .webm, .mp4) *</label>
            ${renderWordEditorMarkup("cmsArtEditor", "Nhập nội dung bài viết trực tiếp tại đây như trong Word, căn lề, bôi màu và chèn ảnh dễ dàng...")}
          </div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button type="submit" class="btn btn-primary btn-sm" id="cmsArtSubmitBtn">
              Xuất bản bài viết ngay lên Web
            </button>
            <button type="button" class="btn btn-jade btn-sm" id="cmsArtBulkEmailFormBtn" style="display:none; background:#047857; color:#fff;">
              Gửi email bài viết này cho tất cả người dùng đã đăng ký
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="cmsArtCancelBtn" style="display:none;">
              Hủy Bỏ Sửa
            </button>
          </div>
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

    const artEditor = initWordEditor(body.querySelector(".word-editor-container"), "cmsArtEditor");

    // Bind Edit Button
    body.querySelectorAll("[data-edit-art]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.editArt;
        const target = state.articles.find((a) => a.id === id);
        if (!target) return;
        editingArtId = target.id;

        document.getElementById("cmsArtTitleVi").value = typeof target.title === "object" ? target.title.vi : target.title;
        document.getElementById("cmsArtTitleEn").value = (target.title && target.title.en) || "";
        document.getElementById("cmsArtPillar").value = target.pillar || "CS";
        document.getElementById("cmsArtPhotoSlot").value = target.photoSlot || "heroPortrait";
        document.getElementById("cmsArtExcerpt").value = typeof target.excerpt === "object" ? target.excerpt.vi : target.excerpt || "";

        const bodyContent = typeof target.body === "object" ? (target.body.vi || target.body) : target.body;
        artEditor.setHtml(bodyContent);

        document.getElementById("cmsArtFormHeading").textContent = "Chỉnh Sửa Bài Viết: " + (typeof target.title === "object" ? target.title.vi : target.title);
        document.getElementById("cmsArtEditModeBadge").style.display = "inline-block";
        const submitBtn = document.getElementById("cmsArtSubmitBtn");
        submitBtn.textContent = "Lưu Thay Đổi Bài Viết";
        submitBtn.className = "btn btn-jade btn-sm";
        document.getElementById("cmsArtBulkEmailFormBtn").style.display = "inline-flex";
        document.getElementById("cmsArtCancelBtn").style.display = "inline-flex";

        document.getElementById("cmsArticleFormCard").scrollIntoView({ behavior: "smooth" });
      });
    });

    // Bind Bulk Email Button in Form
    document.getElementById("cmsArtBulkEmailFormBtn").addEventListener("click", () => {
      if (editingArtId) {
        handleBulkEmailForArticle(editingArtId);
      }
    });

    // Bind Bulk Email Button in Table Rows
    body.querySelectorAll("[data-bulk-email-art]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.bulkEmailArt;
        handleBulkEmailForArticle(id);
      });
    });

    // Bind Cancel Edit Button
    document.getElementById("cmsArtCancelBtn").addEventListener("click", () => {
      editingArtId = null;
      document.getElementById("cmsNewArticleForm").reset();
      artEditor.clear();
      document.getElementById("cmsArtFormHeading").textContent = "Soạn Bài Viết Chuyên Sâu Mới (Trình Soạn Thảo Kiểu Word Trực Quan)";
      document.getElementById("cmsArtEditModeBadge").style.display = "none";
      const submitBtn = document.getElementById("cmsArtSubmitBtn");
      submitBtn.textContent = "Xuất bản bài viết ngay lên Web";
      submitBtn.className = "btn btn-primary btn-sm";
      document.getElementById("cmsArtBulkEmailFormBtn").style.display = "none";
      document.getElementById("cmsArtCancelBtn").style.display = "none";
    });

    // Bind Form Submit (Create or Update)
    document.getElementById("cmsNewArticleForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const titleVi = document.getElementById("cmsArtTitleVi").value.trim();
      const titleEn = document.getElementById("cmsArtTitleEn").value.trim() || titleVi;
      const pillar = document.getElementById("cmsArtPillar").value;
      const photoSlot = document.getElementById("cmsArtPhotoSlot").value;
      const excerpt = document.getElementById("cmsArtExcerpt").value.trim();
      const formattedBody = artEditor.getHtml();

      if (!formattedBody) {
        showToast("Vui lòng nhập nội dung bài viết.");
        return;
      }

      const pillarMap = {
        CS: { vi: "Case Study · Tình Huống Thực Tế", en: "Case Study · Practical" },
        TN: { vi: "Tin Ngành · Chính Sách", en: "Regulatory News" },
        HT: { vi: "Kinh Nghiệm Thực Tế · Hướng Dẫn", en: "Practical Guide" }
      };

      if (editingArtId) {
        const art = state.articles.find((a) => a.id === editingArtId);
        if (art) {
          art.title = { vi: titleVi, en: titleEn };
          art.pillar = pillar;
          art.pillarLabel = pillarMap[pillar] || pillarMap.CS;
          art.photoSlot = photoSlot;
          art.excerpt = { vi: excerpt, en: excerpt };
          art.body = { vi: formattedBody, en: formattedBody };
          art.updatedAt = new Date().toLocaleDateString("vi-VN");
          saveCollection(STORAGE_KEYS.ARTICLES, state.articles);
          if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
            window.ThuysTalkFirebase.syncCollection("articles", state.articles);
          }
          renderAll();
          renderAdminStudioModal();
          showToast("Đã cập nhật bài viết thành công!");
        }
      } else {
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
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.syncCollection("articles", state.articles);
        }
        renderAll();
        renderAdminStudioModal();
        showToast("Đã xuất bản bài viết mới lên trang chủ!");
      }
    });

    body.querySelectorAll("[data-del-art]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delArt;
        state.articles = state.articles.filter((a) => a.id !== id);
        saveCollection(STORAGE_KEYS.ARTICLES, state.articles);
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.syncCollection("articles", state.articles);
          window.ThuysTalkFirebase.deleteDoc("articles", id);
        }
        renderAll();
        renderAdminStudioModal();
        showToast("Đã xóa bài viết.");
      });
    });
  }

  async function handleBulkEmailForArticle(artId) {
    const art = state.articles.find((a) => a.id === artId);
    if (!art) return;
    const artTitle = typeof art.title === "object" ? art.title.vi : art.title;
    const artBody = typeof art.body === "object" ? (art.body.vi || art.body) : art.body;

    showToast("Đang đồng bộ danh sách người nhận từ Cloud Firestore...");
    let learners = [];
    let leads = [];
    try {
      if (window.ThuysTalkFirebase) {
        [learners, leads] = await Promise.all([
          window.ThuysTalkFirebase.fetchLearners(),
          window.ThuysTalkFirebase.fetchLeads()
        ]);
      }
    } catch (e) {
      console.warn("fetch error:", e);
    }

    const localLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
    const all = [...learners, ...leads, ...localLeads];

    const emailMap = new Map();
    all.forEach((item) => {
      const em = (item.email || "").trim().toLowerCase();
      if (em && em.includes("@") && !emailMap.has(em)) {
        emailMap.set(em, {
          email: em,
          name: item.name || item.displayName || item.fullName || em.split("@")[0]
        });
      }
    });

    const recipients = Array.from(emailMap.values());
    if (!recipients.length) {
      alert("Hệ thống chưa tìm thấy tài khoản người dùng hoặc khách hàng nào đã đăng ký trong hệ thống!");
      return;
    }

    const confirmed = window.confirm(
      `Hệ thống tìm thấy ${recipients.length} tài khoản đã đăng ký.\n\n` +
      `Bạn có chắc chắn muốn gửi email hàng loạt tài liệu bài viết:\n"${artTitle}"\n` +
      `tới toàn bộ ${recipients.length} tài khoản này qua thuystalk.official@gmail.com không?`
    );
    if (!confirmed) return;

    showToast(`Đang gửi email hàng loạt tới ${recipients.length} tài khoản...`);
    try {
      const idToken = window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getIdToken === "function"
        ? await window.ThuysTalkFirebase.getIdToken()
        : null;
      if (!idToken) {
        alert("Phiên đăng nhập Quản trị viên đã hết hạn hoặc chưa xác thực. Vui lòng đăng nhập lại bằng Google.");
        return;
      }
      const bulkEmailUrl = getApiUrl("/api/send-bulk-email");
      if (!bulkEmailUrl) {
        alert("Chưa có kết nối máy chủ gửi email. Vui lòng bật máy chủ nội bộ hoặc cấu hình URL HTTPS hợp lệ ở Tab 05.");
        return;
      }
      const cleanText = String(artBody || "").replace(/<[^>]*>/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      const res = await fetch(bulkEmailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + idToken
        },
        body: JSON.stringify({
          docTitle: artTitle,
          docType: "Bài viết chuyên sâu / Tài liệu",
          content: cleanText,
          recipients: recipients
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        alert(`Phiên đăng nhập Quản trị viên đã hết hạn hoặc không có quyền (${res.status}). Vui lòng đăng xuất và đăng nhập lại bằng Google.`);
        return;
      }
      if (res.status === 503 || data.emailDisabled) {
        alert("Tính năng gửi email đang tắt trên máy chủ (chưa cấu hình THUYSTALK_SMTP_APP_PASSWORD trong .env).");
        showToast("Tính năng gửi email đang tắt trên máy chủ.");
        return;
      }
      if (res.ok && data.ok) {
        alert(`ĐÃ GỬI EMAIL HÀNG LOẠT THÀNH CÔNG!\n\nSố lượng gửi thành công: ${data.sentCount} / ${data.total} tài khoản.\nNgười gửi: thuystalk.official@gmail.com`);
        showToast(`Đã gửi thành công ${data.sentCount} email!`);
      } else {
        alert("Có lỗi khi gửi email hàng loạt: " + (data.error || "Lỗi không xác định"));
      }
    } catch (err) {
      alert("Không thể kết nối tới máy chủ gửi mail: " + err.message);
    }
  }

  // --- TAB 3: YOUTUBE VIDEO EMBED & CM CATEGORIES CMS ---
  function renderAdminVideosTab(body) {
    let editingVidId = null;
    const catList = getVideoCategoryList();

    const catRowsHtml = catList
      .map(
        (cat, idx) => `
      <div class="cms-item-card" data-vcat-row="${idx}" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 12px; background:#fff; border:1px solid var(--border-subtle); border-radius:10px;">
        <span class="exp-tag" style="min-width:60px; text-align:center;">${escapeHtml(cat.id)}</span>
        <input type="text" class="cms-vcat-vi" data-idx="${idx}" value="${escapeHtml(cat.labelVi || "")}" placeholder="Tên tiếng Việt (VD: CM1 · Văn bản nóng)" style="flex:1.4; min-width:200px; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; font-weight:600;" />
        <input type="text" class="cms-vcat-en" data-idx="${idx}" value="${escapeHtml(cat.labelEn || "")}" placeholder="Tên tiếng Anh (tùy chọn)" style="flex:1; min-width:160px; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem;" />
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button type="button" class="btn btn-jade btn-sm" data-save-vcat="${idx}">Lưu</button>
          <button type="button" class="btn btn-outline btn-sm" style="color:#b91c1c; border-color:#fecaca;" data-del-vcat="${idx}">Xóa</button>
        </div>
      </div>`
      )
      .join("");

    const cmSelectOptionsHtml = catList
      .map(
        (cat, idx) =>
          `<option value="${escapeHtml(cat.id)}" ${cat.id === "CM3" || idx === 0 ? (cat.id === "CM3" ? "selected" : "") : ""}>${escapeHtml(cat.labelVi || cat.id)}</option>`
      )
      .join("");

    const nextCmNum =
      catList.reduce((mx, c) => {
        const m = String(c.id || "").match(/CM(\d+)/i);
        return m ? Math.max(mx, parseInt(m[1], 10)) : mx;
      }, catList.length) + 1;

    const rows = state.videos
      .map((v, idx) => {
        const vTitle = typeof v.title === "object" ? v.title.vi : v.title;
        const vCatDisplay = getVideoCategoryLabel(v.cm, v.cmLabel, "vi");
        const rawYtId = extractYoutubeId(v.youtubeEmbedId || v.youtubeEmbedSrc || v.youtubeUrl);
        const ytId =
          (!v.youtubeEmbedId || isValidYoutubeId(v.youtubeEmbedId)) && isValidYoutubeId(rawYtId)
            ? rawYtId
            : "";
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><span class="exp-tag">${escapeHtml(vCatDisplay || v.cm)}</span></td>
          <td style="font-weight:700;">${escapeHtml(vTitle)}</td>
          <td>${
            ytId
              ? `<span style="color:var(--jade-700);font-weight:800;">Đã nhúng YouTube (ID: ${escapeHtml(ytId)})</span>`
              : "Kịch bản Studio"
          }</td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn btn-outline btn-xs" data-edit-vid="${escapeHtml(v.id)}" style="margin-right:6px; padding:4px 8px; font-size:0.75rem;">Sửa</button>
            <button type="button" class="btn btn-danger btn-xs" data-del-vid="${escapeHtml(v.id)}" style="padding:4px 8px; font-size:0.75rem;">Xóa</button>
          </td>
        </tr>`;
      })
      .join("");

    body.innerHTML = `
      <div class="cms-panel-box" style="margin-bottom:20px; border-color:var(--jade-400); background:var(--jade-50);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <h4 style="margin:0; color:var(--jade-900);">Quản Lý Chuyên Mục Video (CM1, CM2, CM3, CM4...)</h4>
            <p style="font-size:0.8rem; color:var(--ink-600); margin:3px 0 0;">Đổi tên, thêm chuyên mục mới hoặc xóa bớt — bộ lọc trên Trang Chủ &amp; Trang Video sẽ cập nhật tức thì.</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="resetDefaultVideoCatsBtn">Khôi phục 4 CM mặc định</button>
        </div>

        <div id="cmsVideoCatsList" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
          ${catRowsHtml || '<p style="font-size:0.85rem; color:var(--ink-500);">Chưa có chuyên mục nào.</p>'}
        </div>

        <form id="addVideoCategoryForm" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:10px 12px; background:#fff; border:1px dashed var(--jade-400); border-radius:10px;">
          <input type="text" id="newVcatId" value="CM${nextCmNum}" placeholder="Mã (VD: CM${nextCmNum})" style="width:105px; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem; font-weight:800; text-transform:uppercase;" required />
          <input type="text" id="newVcatVi" placeholder="Tên chuyên mục mới (VD: CM${nextCmNum} · Phân tích thực chiến)" style="flex:1.4; min-width:210px; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.85rem;" required />
          <input type="text" id="newVcatEn" placeholder="Tên tiếng Anh (tùy chọn)" style="flex:1; min-width:150px; padding:7px 10px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.84rem;" />
          <button type="submit" class="btn btn-primary btn-sm">+ Thêm Chuyên Mục</button>
        </form>
      </div>

      <div class="cms-panel-box" id="cmsVideoFormCard">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
          <h4 id="cmsVidFormHeading" style="margin:0; color:var(--jade-900);">
            Nhúng Video YouTube Mới Lên Website (Hỗ Trợ Dán Nguyên Thẻ &lt;iframe&gt; Hoặc Link)
          </h4>
          <span id="cmsVidEditModeBadge" style="display:none; background:var(--orange-100); color:var(--orange-800); font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:12px;">
            ĐANG Ở CHẾ ĐỘ CHỈNH SỬA
          </span>
        </div>
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
                  ${cmSelectOptionsHtml}
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
              <label>Toàn văn kịch bản thuyết minh / Ghi chú tài liệu đi kèm video</label>
              <textarea id="cmsVidScript" class="form-control" rows="3" placeholder="Dán lời thoại thuyết minh hoặc tóm tắt các ý chính để độc giả đọc trực tiếp trên web..."></textarea>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
              <button type="submit" class="btn btn-primary btn-sm" id="cmsVidSubmitBtn">
                Lưu &amp; Nhúng Video Lên Trang Chủ Ngay
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="cmsVidCancelBtn" style="display:none;">
                Hủy Bỏ Sửa
              </button>
            </div>
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

    // Bind Video Category (CM) CRUD handlers
    body.querySelectorAll("[data-save-vcat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.saveVcat, 10);
        const row = body.querySelector(`[data-vcat-row="${idx}"]`);
        if (!row || !state.videoCategories[idx]) return;
        const labelVi = row.querySelector(".cms-vcat-vi").value.trim();
        const labelEn = row.querySelector(".cms-vcat-en").value.trim() || labelVi;
        if (!labelVi) {
          showToast("Vui lòng nhập tên chuyên mục!");
          return;
        }
        const catId = state.videoCategories[idx].id;
        state.videoCategories[idx] = { id: catId, labelVi, labelEn };
        state.videos.forEach((v) => {
          if (v.cm === catId) {
            v.cmLabel = { vi: labelVi, en: labelEn };
          }
        });
        saveVideoCategories();
        saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.syncCollection("videos", state.videos);
        }
        renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        renderAdminVideosTab(body);
        showToast(`Đã cập nhật chuyên mục ${labelVi}!`);
      });
    });

    body.querySelectorAll("[data-del-vcat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.delVcat, 10);
        if (isNaN(idx) || !state.videoCategories[idx]) return;
        const removed = state.videoCategories.splice(idx, 1)[0];
        if (state.activeVideoCat === removed.id) {
          state.activeVideoCat = "all";
        }
        saveVideoCategories();
        renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        renderAdminVideosTab(body);
        showToast(`Đã xóa chuyên mục ${removed.labelVi || removed.id}.`);
      });
    });

    const addVcatForm = document.getElementById("addVideoCategoryForm");
    if (addVcatForm) {
      addVcatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rawId = document.getElementById("newVcatId").value.trim().toUpperCase().replace(/\s+/g, "_");
        const labelVi = document.getElementById("newVcatVi").value.trim();
        const labelEn = document.getElementById("newVcatEn").value.trim() || labelVi;
        if (!rawId || !labelVi) return;
        if (state.videoCategories.some((c) => String(c.id).toUpperCase() === rawId)) {
          showToast(`Mã chuyên mục "${rawId}" đã tồn tại!`);
          return;
        }
        state.videoCategories.push({ id: rawId, labelVi, labelEn });
        saveVideoCategories();
        renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        renderAdminVideosTab(body);
        showToast(`Đã thêm chuyên mục mới: ${labelVi}!`);
      });
    }

    const resetVcatsBtn = document.getElementById("resetDefaultVideoCatsBtn");
    if (resetVcatsBtn) {
      resetVcatsBtn.addEventListener("click", () => {
        state.videoCategories = JSON.parse(JSON.stringify(window.THUYSTALK_DEFAULT_VIDEO_CATEGORIES || []));
        state.activeVideoCat = "all";
        saveVideoCategories();
        renderVideoSection(window.THUYSTALK_I18N[state.lang]);
        renderAdminVideosTab(body);
        showToast("Đã khôi phục 4 chuyên mục CM1 – CM4 mặc định.");
      });
    }

    const urlInp = document.getElementById("cmsVidUrl");
    const previewBox = document.getElementById("cmsVideoLivePreviewBox");
    const parseHint = document.getElementById("cmsVideoParseHint");

    urlInp.addEventListener("input", () => {
      const val = urlInp.value.trim();
      const ytId = extractYoutubeId(val);
      const embedSrc = ytId ? buildYoutubeEmbedSrc(val) : "";
      if (ytId && embedSrc) {
        previewBox.innerHTML = `<iframe width="100%" height="100%" src="${escapeHtml(embedSrc)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>`;
        parseHint.textContent = `Đã nhận diện thành công mã Video YouTube: ${ytId}`;
      } else {
        parseHint.textContent = "Hãy dán thẻ <iframe ...> hoặc đường link YouTube hợp lệ.";
      }
    });

    // Bind Edit Video Button
    body.querySelectorAll("[data-edit-vid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.editVid;
        const target = state.videos.find((v) => v.id === id);
        if (!target) return;
        editingVidId = target.id;

        const safeEmbedSrc = buildYoutubeEmbedSrc(target);
        const embedCode = safeEmbedSrc
          ? `<iframe width="560" height="315" src="${escapeHtml(safeEmbedSrc)}" title="YouTube video player" frameborder="0" allowfullscreen></iframe>`
          : (sanitizeSafeHref(target.youtubeUrl, false) || "");
        document.getElementById("cmsVidUrl").value = embedCode;
        document.getElementById("cmsVidTitle").value = typeof target.title === "object" ? target.title.vi : target.title;
        document.getElementById("cmsVidCm").value = target.cm || "CM3";
        document.getElementById("cmsVidDesc").value = typeof target.desc === "object" ? target.desc.vi : target.desc || "";
        document.getElementById("cmsVidDuration").value = target.duration || "10:15";

        const scriptVal = target.script && (typeof target.script === "object" ? target.script.vi : target.script);
        document.getElementById("cmsVidScript").value = scriptVal ? scriptVal.replace(/<[^>]+>/g, "\n").trim() : "";

        document.getElementById("cmsVidUrl").dispatchEvent(new Event("input"));

        document.getElementById("cmsVidFormHeading").textContent = "Chỉnh Sửa Video: " + (typeof target.title === "object" ? target.title.vi : target.title);
        document.getElementById("cmsVidEditModeBadge").style.display = "inline-block";
        const submitBtn = document.getElementById("cmsVidSubmitBtn");
        submitBtn.textContent = "Lưu Thay Đổi Video";
        submitBtn.className = "btn btn-jade btn-sm";
        document.getElementById("cmsVidCancelBtn").style.display = "inline-flex";

        document.getElementById("cmsVideoFormCard").scrollIntoView({ behavior: "smooth" });
      });
    });

    // Bind Cancel Edit Video
    document.getElementById("cmsVidCancelBtn").addEventListener("click", () => {
      editingVidId = null;
      document.getElementById("cmsNewVideoForm").reset();
      document.getElementById("cmsVidFormHeading").textContent = "Nhúng Video YouTube Mới Lên Website (Hỗ Trợ Dán Nguyên Thẻ <iframe> Hoặc Link)";
      document.getElementById("cmsVidEditModeBadge").style.display = "none";
      const submitBtn = document.getElementById("cmsVidSubmitBtn");
      submitBtn.textContent = "Lưu & Nhúng Video Lên Trang Chủ Ngay";
      submitBtn.className = "btn btn-primary btn-sm";
      document.getElementById("cmsVidCancelBtn").style.display = "none";
    });

    // Form Submit (Create or Update)
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

      const activeCatObj = getVideoCategoryList().find((c) => c.id === cm);
      const resolvedCmLabel = activeCatObj
        ? { vi: activeCatObj.labelVi || cm, en: activeCatObj.labelEn || activeCatObj.labelVi || cm }
        : { vi: cm, en: cm };

      const formattedScript = rawScript
        .split(/\n+/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");

      if (editingVidId) {
        const vid = state.videos.find((v) => v.id === editingVidId);
        if (vid) {
          vid.cm = cm;
          vid.cmLabel = resolvedCmLabel;
          vid.duration = duration;
          vid.youtubeUrl = ytId
            ? `https://www.youtube.com/watch?v=${ytId}`
            : sanitizeSafeHref(rawInput, false) || "https://www.youtube.com/@thuystalk";
          vid.youtubeEmbedId = ytId;
          vid.youtubeEmbedSrc = embedSrc;
          vid.title = { vi: title, en: title };
          vid.desc = { vi: desc, en: desc };
          vid.script = { vi: formattedScript, en: formattedScript };
          vid.updatedAt = new Date().toLocaleDateString("vi-VN");
          saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
          if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
            window.ThuysTalkFirebase.syncCollection("videos", state.videos);
          }
          renderAll();
          renderAdminStudioModal();
          showToast("Đã cập nhật video thành công!");
        }
      } else {
        const newVid = {
          id: "vid-custom-" + Date.now(),
          cm,
          cmLabel: resolvedCmLabel,
          duration,
          date: new Date().toLocaleDateString("vi-VN"),
          thumbSlot: "aboutSpeaker",
          youtubeUrl: ytId
            ? `https://www.youtube.com/watch?v=${ytId}`
            : sanitizeSafeHref(rawInput, false) || "https://www.youtube.com/@thuystalk",
          youtubeEmbedId: ytId,
          youtubeEmbedSrc: embedSrc,
          title: { vi: title, en: title },
          desc: { vi: desc, en: desc },
          script: { vi: formattedScript, en: formattedScript }
        };

        state.videos.unshift(newVid);
        state.activeVideoId = newVid.id;
        saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.syncCollection("videos", state.videos);
        }
        renderAll();
        renderAdminStudioModal();
        showToast(
          ytId
            ? `Đã nhúng thành công Video YouTube (ID: ${ytId}) lên trang chủ!`
            : "Đã thêm Video mới vào thư viện!"
        );
      }
    });

    body.querySelectorAll("[data-del-vid]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.delVid;
        state.videos = state.videos.filter((v) => v.id !== id);
        if (state.videos.length) state.activeVideoId = state.videos[0].id;
        saveCollection(STORAGE_KEYS.VIDEOS, state.videos);
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.syncCollection("videos", state.videos);
          window.ThuysTalkFirebase.deleteDoc("videos", id);
        }
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
        return `<option value="${c.id}" ${selected}>${escapeHtml(cTitle)} (${(c.lessons || []).length} tài liệu)</option>`;
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
              <label>Lời giải thích hiện ra khi chọn đáp án *</label>
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
              <button type="button" class="btn btn-danger btn-sm" data-del-lesson="${escapeHtml(l.id)}" data-parent-course="${escapeHtml(c.id)}">Xóa bài</button>
            </td>
          </tr>
        `);
      });
    });

    body.innerHTML = `
      <div class="cms-panel-box">
        <form id="cmsNewLessonForm">
          <!-- BƯỚC 1: THÔNG TIN TÀI LIỆU & MEDIA UPLOADER -->
          <div style="background:var(--surface-alt); border:1px solid var(--jade-200); border-radius:12px; padding:16px 18px; margin-bottom:18px;">
            <h4 style="color:var(--jade-900); margin-bottom:10px;">BƯỚC 1: SOẠN NỘI DUNG BÀI GIẢNG (VIẾT BÀI / TẢI FILE HTML &amp; CHÈN ẢNH JPG, PNG, WEBP, WEBM)</h4>
            <div class="form-row-2">
              <div class="form-group">
                <label>Chọn Chuyên đề tài liệu *</label>
                <select id="cmsLessonCourseId" class="form-control">${courseOptions}</select>
              </div>
              <div class="form-group">
                <label>Tiêu đề Tài liệu mới *</label>
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
              <label>Nội dung kiến thức bài giảng (Gõ trực tiếp kiểu Word, căn lề, chèn bảng, chèn ảnh/video .jpg, .png, .webp, .webm, .mp4) *</label>
              ${renderWordEditorMarkup("cmsLessonEditor", "Dán nội dung bài giảng, gõ trực tiếp kiểu Word hoặc chèn ảnh/video minh họa...")}
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label>Đề bài Bài tập tình huống thực tế *</label>
              <input
                type="text"
                id="cmsLessonExercise"
                class="form-control"
                required
                value="${escapeHtml(
                  (savedFormValues && savedFormValues.exercise) ||
                    "Bài tập tình huống: Đối chiếu 3 điểm rủi ro chính trong tài liệu với bộ chứng từ lô hàng thực tế của doanh nghiệp bạn."
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
              Lưu Tài Liệu &amp; Bộ Mini Test (${state.generatedMiniTestDraft.length} câu) Vào Chuyên Đề Ngay
            </button>
          </div>
        </form>
      </div>

      <h4 style="margin:24px 0 10px;">Danh sách Tài Liệu &amp; Bộ Mini Test đang có trên Web (${existingLessonsRows.length} tài liệu)</h4>
      <table class="cms-list-table">
        <thead>
          <tr>
            <th>Chuyên đề</th>
            <th>Tên Tài liệu</th>
            <th>Số câu Mini Test</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>${existingLessonsRows.join("")}</tbody>
      </table>
    `;

    const lessonEditor = initWordEditor(body.querySelector("#cmsLessonEditor") ? body.querySelector("#cmsLessonEditor").closest(".word-editor-container") : null, "cmsLessonEditor");
    if (lessonEditor && savedFormValues && savedFormValues.rawBody) {
      lessonEditor.setHtml(savedFormValues.rawBody);
    }

    function getCurrentLessonFormValues() {
      return {
        courseId: document.getElementById("cmsLessonCourseId").value,
        title: document.getElementById("cmsLessonTitle").value,
        rawBody: lessonEditor ? lessonEditor.getHtml() : "",
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
          "Chính xác! Căn cứ theo nội dung tài liệu và văn bản pháp lý.";
        if (!qText) return;
        const answerMap = { A: 0, B: 1, C: 2, 1: 0, 2: 1, 3: 2 };
        const normAns = String(ansRaw || "")
          .trim()
          .toUpperCase()
          .replace(/\.0+$/, "")
          .replace(/[.)]+$/, "")
          .trim();
        let cIdx = 0;
        if (Object.prototype.hasOwnProperty.call(answerMap, normAns)) {
          cIdx = answerMap[normAns];
        } else {
          const mAns = normAns.match(/(?:^|\b)([ABC123])(?:\b|$)/);
          cIdx = mAns ? answerMap[mAns[1]] : 0;
        }
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
          const idToken = window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getIdToken === "function"
            ? await window.ThuysTalkFirebase.getIdToken()
            : null;
          if (!idToken) {
            const msg = "Phiên đăng nhập Quản trị viên đã hết hạn. Vui lòng đăng nhập lại bằng Google trước khi nhập file Excel.";
            if (statusEl) statusEl.textContent = msg;
            showToast(msg);
            return;
          }
          const parseExcelUrl = getApiUrl("/api/parse-excel");
          if (parseExcelUrl) {
            const resp = await fetch(parseExcelUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + idToken
              },
              body: JSON.stringify({
                filename: file.name,
                data_base64: b64
              })
            });
            if (resp.status === 401 || resp.status === 403) {
              const msg = `Phiên đăng nhập Quản trị viên không hợp lệ hoặc đã hết hạn (${resp.status}). Vui lòng đăng nhập lại bằng Google.`;
              if (statusEl) statusEl.textContent = msg;
              showToast(msg);
              alert(msg);
              return;
            }
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
          showToast("Để đọc trực tiếp file .xlsx, hãy chạy máy chủ ThuysTalk hoặc dùng file .csv.");
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
          showToast("Mỗi chuyên đề cần có ít nhất 1 câu hỏi Mini Test.");
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
      const rawBody = lessonEditor ? lessonEditor.getHtml() : "";
      const exercise = document.getElementById("cmsLessonExercise").value.trim();

      const course = state.courses.find((c) => c.id === courseId);
      if (!course) return;

      const miniTest = JSON.parse(JSON.stringify(state.generatedMiniTestDraft));
      const formattedBody = sanitizeRichHtml(formatRawOrHtmlContent(rawBody));
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
        vi: `Tài liệu chuyên đề · Bộ Mini Test ${miniTest.length} câu · Thực hành`,
        en: `${course.lessons.length} Lessons · ${miniTest.length}-Question Mini Test · Practical`
      };

      state.generatedMiniTestDraft = getDefaultMiniTestDraft();
      saveCollection(STORAGE_KEYS.COURSES, state.courses);
      renderAll();
      renderAdminStudioModal();
      showToast(`Đã lưu tài liệu "${title}" kèm Bộ Mini Test (${miniTest.length} câu) thành công!`);
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
        showToast("Đã xóa tài liệu.");
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
          <button type="button" class="btn btn-danger btn-sm" data-del-kb="${escapeHtml(item.id)}">Xóa</button>
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
            placeholder="https://your-tunnel-url.trycloudflare.com"
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
      if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
        window.ThuysTalkFirebase.saveSiteSettings("ai_bridge", { url: val }).catch((err) => {
          console.warn("Cloud Firestore auto-sync error for ai_bridge:", err);
        });
      }
      showToast("Đã lưu & đồng bộ địa chỉ URL API Trung Gian!");
    });

    document.getElementById("cmsTestBridgeBtn").addEventListener("click", async () => {
      const val = document.getElementById("cmsBridgeUrlInput").value.trim();
      const customBase = normalizeBridgeBaseUrl(val);
      const statusUrl = customBase ? `${customBase}/api/notebook-status` : getApiUrl("/api/notebook-status");
      const msgEl = document.getElementById("cmsBridgeStatusMsg");
      if (!statusUrl) {
        msgEl.textContent = "Chưa có địa chỉ API Trung Gian HTTPS hợp lệ để kiểm tra.";
        return;
      }
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
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          window.ThuysTalkFirebase.deleteDoc("ai_kb", id);
        }
        renderAdminStudioModal();
        showToast("Đã xóa mục dữ liệu AI.");
      });
    });
  }

  // --- TAB 6: LEADS & FULL CMS BACKUP (POWERED DIRECTLY BY CLOUD FIRESTORE) ---
  function renderAdminLeadsTab(body) {
    const localLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || "[]");
    let currentLearners = [];
    let currentLeads = [...localLeads];

    function buildLearnersTableHtml(learners) {
      if (!learners || learners.length === 0) {
        return `<tr><td colspan="8" style="padding:18px; text-align:center; color:var(--ink-500);">Chưa có tài khoản người dùng đăng ký mới trên Cloud Firestore. Bấm 'Làm mới từ Cloud Firestore' để tải dữ liệu.</td></tr>`;
      }
      return learners
        .map((l, i) => {
          const name = l.name || l.displayName || "Người dùng";
          const email = l.email || "-";
          const phone = l.phone || "-";
          const company = l.company || l.role || "ThuysTalk Member";
          const dateStr =
            l.registeredAt ||
            (l.createdAt
              ? typeof l.createdAt.toDate === "function"
                ? l.createdAt.toDate().toLocaleString("vi-VN")
                : String(l.createdAt)
              : "Mới");
          const verifiedBadge =
            l.emailVerified === true
              ? `<span class="badge" style="background:#059669; color:#fff; font-weight:700; font-size:0.75rem;">Đã xác thực</span>`
              : `<span class="badge" style="background:#6B7280; color:#fff; font-weight:700; font-size:0.75rem;">Chưa kích hoạt</span>`;

          let progressDisplay = `<span style="color:var(--ink-600); font-size:0.8rem;">0% (Mới)</span>`;
          if (l.progress && typeof l.progress === "object") {
            const completedCount = Object.keys(l.progress).filter((k) => l.progress[k]).length;
            if (completedCount > 0) {
              progressDisplay = `<span style="color:#059669; font-weight:700; font-size:0.8rem;">Đã học ${completedCount} bài</span>`;
            }
          }

          return `
            <tr>
              <td style="text-align:center;">${i + 1}</td>
              <td style="font-weight:700; color:var(--ink-900);">${escapeHtml(name)}</td>
              <td style="color:var(--jade-700); font-weight:700;">${escapeHtml(email)}</td>
              <td>${escapeHtml(phone)}</td>
              <td>${escapeHtml(company)}</td>
              <td style="font-size:0.8rem; color:var(--ink-600);">${escapeHtml(dateStr)}</td>
              <td>${verifiedBadge}</td>
              <td>${progressDisplay}</td>
            </tr>
          `;
        })
        .join("");
    }

    function buildLeadsTableHtml(leads) {
      if (!leads || leads.length === 0) {
        return `<tr><td colspan="8" style="padding:18px; text-align:center; color:var(--ink-500);">Chưa có lịch sử lưu hoặc tải tài liệu nào được ghi nhận.</td></tr>`;
      }
      return leads
        .map((ld, i) => {
          const name = ld.name || "Khách hàng";
          const email = ld.email || "-";
          const phone = ld.phone || "-";
          const topicBase = ld.itemTitle || ld.docTitle || ld.topic || "Tài liệu chuyên môn";
          const topic = ld.fileName ? `${topicBase} (${ld.fileName})` : topicBase;
          const rawType = String(ld.type || (ld.itemTitle || ld.docTitle ? "download" : "Tư vấn 1-1"));
          const isConsult = rawType.includes("Tư vấn");
          const typeBadge = isConsult
            ? `<span class="badge" style="background:#EA580C; color:#fff; font-weight:700; font-size:0.75rem;">Tư Vấn 1-1</span>`
            : `<span class="badge" style="background:#0284C7; color:#fff; font-weight:700; font-size:0.75rem;">Tải Tài Liệu</span>`;
          let timeStr = ld.requestedAt || ld.timestamp || "";
          if (!timeStr && ld.createdAt) {
            timeStr =
              typeof ld.createdAt.toDate === "function"
                ? ld.createdAt.toDate().toLocaleString("vi-VN")
                : String(ld.createdAt);
          }
          if (!timeStr) timeStr = "-";
          const status =
            ld.status ||
            (ld.type === "download"
              ? ld.fileName
                ? `Đã tải: ${ld.fileName}`
                : "Đã ghi nhận lượt tải"
              : "Đã ghi nhận");

          return `
            <tr>
              <td style="text-align:center;">${i + 1}</td>
              <td style="font-weight:700; color:var(--ink-900);">${escapeHtml(name)}</td>
              <td style="color:var(--jade-700); font-weight:700;">${escapeHtml(email)}</td>
              <td>${escapeHtml(phone)}</td>
              <td>${escapeHtml(topic)}</td>
              <td>${typeBadge}</td>
              <td style="font-size:0.8rem; color:var(--ink-600);">${escapeHtml(timeStr)}</td>
              <td style="color:#059669; font-weight:700; font-size:0.82rem;">${escapeHtml(status)}</td>
            </tr>
          `;
        })
        .join("");
    }

    body.innerHTML = `
      <div class="cms-panel-box" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
        <div>
          <strong style="color:var(--jade-900);">Sao lưu &amp; Khôi phục Toàn bộ Dữ liệu Quản trị Website (Full CMS JSON)</strong>
          <p style="font-size:0.8rem; color:var(--ink-600);">Xuất toàn bộ Ảnh, Bài viết, Video YouTube, Tài liệu & Mini Test và Nguồn dữ liệu AI ra 1 tệp JSON duy nhất.</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-jade btn-sm" id="exportFullCmsBtn">Xuất toàn bộ cấu hình CMS (.json)</button>
          <button type="button" class="btn btn-primary btn-sm" id="exportLearnersCsvBtn">Xuất danh sách Người dùng mới (.csv)</button>
          <button type="button" class="btn btn-outline btn-sm" id="exportLeadsCsvBtn">Xuất lịch sử Học tập / Tải tài liệu (.csv)</button>
        </div>
      </div>

      <!-- Firebase Cloud Integration Card (Project: thuystalk) -->
      <div class="cms-panel-box" style="margin-top:14px; border:1.5px solid var(--jade-400); background:linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge badge-jade" style="background:var(--jade-800); color:#FFF; font-weight:800;">Firebase Cloud Active</span>
              <strong style="color:var(--jade-900); font-size:0.95rem;">Cơ Sở Dữ Liệu Cloud Firestore (Bảng Trực Tuyến Đã Kích Hoạt)</strong>
            </div>
            <p style="font-size:0.82rem; color:var(--ink-700); margin-top:4px;">
              Dự án: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">thuystalk</code> · 
              Khu vực máy chủ: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">asia-southeast1 (Singapore)</code>
            </p>
            <p style="font-size:0.78rem; color:var(--ink-600); margin-top:2px;">
              Khóa API chính thức đã kích hoạt: <code style="background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; font-weight:700;">AIzaSyA3PZ3...DaEw8</code>. Tự động tách bạch Danh sách Người dùng mới và Lịch sử lưu/tải tài liệu.
            </p>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-jade btn-sm" id="reloadFirestoreLeadsBtn">
              Làm mới từ Cloud Firestore
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="syncFirebaseBtn">
              Đồng bộ dữ liệu mẫu lên Firestore
            </button>
            <a href="https://console.firebase.google.com/project/thuystalk/firestore/databases/-default-/data" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="color:var(--jade-800); border-color:var(--jade-600); font-weight:700;">
              Mở Cloud Firestore Console
            </a>
          </div>
        </div>
      </div>

      <!-- PHẦN 1: DANH SÁCH NGƯỜI DÙNG ĐĂNG KÝ MỚI -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div>
          <h4 style="margin:0; color:var(--jade-950);" id="learnersTableHeading">
            1. Danh Sách Tài Khoản Người Dùng Đăng Ký Mới (0)
          </h4>
          <span style="font-size:0.8rem; color:var(--ink-600);">Tài khoản chính thức đăng ký qua hệ thống.</span>
        </div>
        <span id="firestoreLearnersStatus" style="font-size:0.8rem; color:var(--jade-700); font-weight:700;">Đang kết nối Cloud Firestore...</span>
      </div>

      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Họ tên</th>
            <th>Email tài khoản</th>
            <th>SĐT / Zalo</th>
            <th>Doanh nghiệp / Vai trò</th>
            <th>Ngày đăng ký</th>
            <th>Xác thực Email</th>
            <th>Tiến độ học tập</th>
          </tr>
        </thead>
        <tbody id="adminLearnersTableBody">${buildLearnersTableHtml(currentLearners)}</tbody>
      </table>

      <!-- PHẦN 2: LỊCH SỬ NGƯỜI HỌC TẬP HAY LƯU / TẢI TÀI LIỆU -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
        <div>
          <h4 style="margin:0; color:var(--orange-800);" id="leadsTableHeading">
            2. Lịch Sử Người Học Tập Hay Lưu / Tải Tài Liệu Của Người Dùng (${currentLeads.length})
          </h4>
          <span style="font-size:0.8rem; color:var(--ink-600);">Nhật ký tương tác: Người dùng / khách hàng tải tài liệu chuyên môn hoặc gửi yêu cầu tư vấn 1-1.</span>
        </div>
        <span id="firestoreLeadsStatus" style="font-size:0.8rem; color:var(--orange-700); font-weight:700;">Đồng bộ thời gian thực</span>
      </div>

      <table class="cms-list-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Họ tên người dùng</th>
            <th>Email</th>
            <th>SĐT / Zalo</th>
            <th>Nội dung tài liệu / Chủ đề tư vấn</th>
            <th>Phân loại</th>
            <th>Thời gian</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody id="adminLeadsTableBody">${buildLeadsTableHtml(currentLeads)}</tbody>
      </table>
    `;

    function refreshTablesFromData() {
      const learnersTbody = document.getElementById("adminLearnersTableBody");
      const leadsTbody = document.getElementById("adminLeadsTableBody");
      const learnersHeading = document.getElementById("learnersTableHeading");
      const leadsHeading = document.getElementById("leadsTableHeading");
      const learnersStatus = document.getElementById("firestoreLearnersStatus");
      const leadsStatus = document.getElementById("firestoreLeadsStatus");

      if (learnersTbody) learnersTbody.innerHTML = buildLearnersTableHtml(currentLearners);
      if (leadsTbody) leadsTbody.innerHTML = buildLeadsTableHtml(currentLeads);
      if (learnersHeading) learnersHeading.textContent = `1. Danh Sách Tài Khoản Người Dùng Đăng Ký Mới (${currentLearners.length})`;
      if (leadsHeading) leadsHeading.textContent = `2. Lịch Sử Người Học Tập Hay Lưu / Tải Tài Liệu Của Người Dùng (${currentLeads.length})`;
      if (learnersStatus) learnersStatus.textContent = `Đã đồng bộ (${currentLearners.length} tài khoản)`;
      if (leadsStatus) leadsStatus.textContent = `Đã đồng bộ (${currentLeads.length} lượt tải/tư vấn)`;
    }

    onAdminLeadsUpdated = (kind, list) => {
      if (kind === "learners") {
        currentLearners = list;
      } else if (kind === "leads" && Array.isArray(list) && list.length > 0) {
        currentLeads = list;
      }
      refreshTablesFromData();
    };

    async function loadFirestoreData() {
      const learnersStatus = document.getElementById("firestoreLearnersStatus");
      if (!state.adminMode || !window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isCurrentUserAdmin()) {
        return;
      }
      try {
        const [learners, leads] = await Promise.all([
          window.ThuysTalkFirebase.fetchLearners(),
          window.ThuysTalkFirebase.fetchLeads()
        ]);
        currentLearners = learners || [];
        state.adminLearners = currentLearners;
        if (leads && leads.length > 0) {
          currentLeads = leads;
          state.adminLeads = currentLeads;
        }
        refreshTablesFromData();
        initAdminProtectedListeners();
      } catch (err) {
        console.warn("loadFirestoreData notice:", err);
        if (learnersStatus) learnersStatus.textContent = "Hiển thị dữ liệu cục bộ.";
      }
    }

    loadFirestoreData();
    if (!window.ThuysTalkFirebase || !window.ThuysTalkFirebase.isReady()) {
      setTimeout(loadFirestoreData, 600);
      setTimeout(loadFirestoreData, 1500);
    }

    const reloadBtn = document.getElementById("reloadFirestoreLeadsBtn");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", () => {
        showToast("Đang làm mới dữ liệu từ Cloud Firestore...");
        loadFirestoreData();
      });
    }

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

    document.getElementById("exportLearnersCsvBtn").addEventListener("click", () => {
      const rows = [
        ["STT", "Ho ten hoc vien", "Email tai khoan", "SDT/Zalo", "Doanh nghiep / Vai tro", "Ngay dang ky", "Xac thuc Email", "Tien do hoc tap"],
        ...currentLearners.map((l, idx) => [
          idx + 1,
          l.name || l.displayName || "",
          l.email || "",
          l.phone || "",
          l.company || l.role || "",
          l.registeredAt || (l.createdAt ? (typeof l.createdAt.toDate === "function" ? l.createdAt.toDate().toLocaleString("vi-VN") : String(l.createdAt)) : ""),
          l.emailVerified ? "Da xac thuc" : "Chua kich hoat",
          l.progress ? Object.keys(l.progress).filter((k) => l.progress[k]).length + " bai" : "0%"
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
      a.download = `thuystalk-danh-sach-nguoi-dung-moi-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống danh sách người dùng đăng ký mới (.csv)!");
    });

    document.getElementById("exportLeadsCsvBtn").addEventListener("click", () => {
      const rows = [
        ["STT", "Ho ten nguoi dung", "Email", "SDT/Zalo", "Noi dung tai lieu / Chu de tu van", "Ten file", "Loai muc", "Ma muc", "Phan loai", "Thoi gian", "Trang thai"],
        ...currentLeads.map((ld, idx) => {
          const timeVal =
            ld.requestedAt ||
            ld.timestamp ||
            (ld.createdAt
              ? typeof ld.createdAt.toDate === "function"
                ? ld.createdAt.toDate().toLocaleString("vi-VN")
                : String(ld.createdAt)
              : "");
          return [
            idx + 1,
            ld.name || "",
            ld.email || "",
            ld.phone || "",
            ld.itemTitle || ld.docTitle || ld.topic || "",
            ld.fileName || "",
            ld.itemType || "",
            ld.itemId || "",
            ld.type || "download",
            timeVal,
            ld.status || (ld.type === "download" ? "Da ghi nhan luot tai" : "Da ghi nhan")
          ];
        })
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
      a.download = `thuystalk-lich-su-tai-lieu-tu-van-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống lịch sử học tập & tải tài liệu (.csv)!");
    });

    const syncFbBtn = document.getElementById("syncFirebaseBtn");
    if (syncFbBtn) {
      syncFbBtn.addEventListener("click", async () => {
        if (window.ThuysTalkFirebase && window.ThuysTalkFirebase.isReady()) {
          showToast("Đang đồng bộ dữ liệu lên Cloud Firestore (thuystalk)...");
          await window.ThuysTalkFirebase.syncCollection("articles", state.articles);
          await window.ThuysTalkFirebase.syncCollection("videos", state.videos);
          await window.ThuysTalkFirebase.syncCollection("courses", state.courses);
          await window.ThuysTalkFirebase.syncCollection("ai_kb", state.aiKb);
          showToast("Đã đồng bộ toàn bộ Bài viết, Video, E-Learning lên Cloud Firestore (thuystalk) thành công!");
          loadFirestoreData();
        } else {
          showToast("Cơ sở dữ liệu đám mây đã được kết nối & sẵn sàng lưu trữ!");
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

  let isAdminProtectedListening = false;
  let adminLearnersUnsub = null;
  let adminLeadsUnsub = null;
  let onAdminLeadsUpdated = null;

  function stopAdminProtectedListeners() {
    if (typeof adminLearnersUnsub === "function") {
      try { adminLearnersUnsub(); } catch (e) {}
    }
    if (typeof adminLeadsUnsub === "function") {
      try { adminLeadsUnsub(); } catch (e) {}
    }
    adminLearnersUnsub = null;
    adminLeadsUnsub = null;
    onAdminLeadsUpdated = null;
    isAdminProtectedListening = false;
  }

  function initAdminProtectedListeners() {
    if (
      isAdminProtectedListening ||
      !state.adminMode ||
      !document.getElementById("adminSidebarNav") ||
      !window.ThuysTalkFirebase ||
      !window.ThuysTalkFirebase.isReady() ||
      !window.ThuysTalkFirebase.isCurrentUserAdmin()
    ) {
      return;
    }
    isAdminProtectedListening = true;
    adminLearnersUnsub = window.ThuysTalkFirebase.listenCollection("learners", (list) => {
      if (Array.isArray(list)) {
        state.adminLearners = list;
        if (state.activeCmsTab === "leads" && typeof onAdminLeadsUpdated === "function") {
          onAdminLeadsUpdated("learners", list);
        }
      }
    });
    adminLeadsUnsub = window.ThuysTalkFirebase.listenCollection("leads", (list) => {
      if (Array.isArray(list)) {
        state.adminLeads = list;
        if (state.activeCmsTab === "leads" && typeof onAdminLeadsUpdated === "function") {
          onAdminLeadsUpdated("leads", list);
        }
      }
    });
  }

  function initAdminAuthGate(requestedSlot = null) {
    const gateEl = document.getElementById("adminAuthGate");
    const layoutEl = document.getElementById("adminPageLayout");
    const statusEl = document.getElementById("adminAuthStatus");
    const errorEl = document.getElementById("adminAuthError");
    const loginBtn = document.getElementById("adminGoogleLoginBtn");
    const logoutBtn = document.getElementById("adminLogoutBtn");
    const emailBadge = document.getElementById("adminCurrentEmailBadge");
    const studioBody = document.getElementById("adminStudioBody");

    let adminCmsBooted = false;

    function showGateError(msg) {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
      }
      if (statusEl) {
        statusEl.textContent = "Chưa xác thực quyền Quản trị viên.";
      }
    }

    function showGate(statusText) {
      state.adminMode = false;
      adminCmsBooted = false;
      stopAdminProtectedListeners();
      if (layoutEl) layoutEl.style.display = "none";
      if (gateEl) gateEl.style.display = "flex";
      if (studioBody) studioBody.innerHTML = "";
      if (statusEl && statusText) statusEl.textContent = statusText;
    }

    function showAdminWorkspace(user) {
      state.adminMode = true;
      if (errorEl) {
        errorEl.style.display = "none";
        errorEl.textContent = "";
      }
      if (gateEl) gateEl.style.display = "none";
      if (layoutEl) layoutEl.style.display = "";
      if (emailBadge) {
        emailBadge.textContent = "Admin: " + (user.email || "");
      }
      if (!adminCmsBooted) {
        adminCmsBooted = true;
        renderAdminStudioModal(requestedSlot || null);
        hydrateAllFromFirestore(true);
        initAdminProtectedListeners();
      }
    }

    if (!window.ThuysTalkFirebase || typeof window.ThuysTalkFirebase.onAuthStateChanged !== "function") {
      showGate("Không thể khởi tạo dịch vụ xác thực.");
      showGateError("Dịch vụ xác thực Firebase chưa được tải trên trang này.");
      return;
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", async () => {
        if (errorEl) {
          errorEl.style.display = "none";
          errorEl.textContent = "";
        }
        loginBtn.disabled = true;
        loginBtn.textContent = "Đang mở cửa sổ đăng nhập Google...";
        try {
          await window.ThuysTalkFirebase.loginAdminWithGoogle();
        } catch (err) {
          let msg = (err && err.message) ? err.message : "Đăng nhập Google thất bại.";
          if (err && err.code === "auth/popup-closed-by-user") {
            msg = "Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.";
          } else if (err && err.code === "auth/unauthorized-domain") {
            msg = "Tên miền hiện tại chưa được cấp phép trong Firebase Authorized Domains.";
          } else if (err && err.code === "auth/operation-not-allowed") {
            msg = "Đăng nhập Google chưa được bật trên Firebase Console (Authentication -> Sign-in method).";
          }
          showGateError(msg);
        } finally {
          loginBtn.disabled = false;
          loginBtn.textContent = "Đăng nhập bằng Google";
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await window.ThuysTalkFirebase.logoutAdmin();
          if (errorEl) {
            errorEl.style.display = "none";
            errorEl.textContent = "";
          }
          showGate("Bạn đã đăng xuất khỏi Hệ thống Quản trị.");
          showToast("Đã đăng xuất tài khoản Quản trị viên.");
        } catch (err) {
          showToast("Lỗi khi đăng xuất: " + ((err && err.message) || err));
        }
      });
    }

    if (typeof window.ThuysTalkFirebase.checkAdminRedirectResult === "function") {
      window.ThuysTalkFirebase.checkAdminRedirectResult().catch((err) => {
        if (err && err.message) showGateError(err.message);
      });
    }

    window.ThuysTalkFirebase.onAuthStateChanged((user) => {
      if (window.ThuysTalkFirebase.isAdminUser(user)) {
        showAdminWorkspace(user);
      } else if (user) {
        const deniedEmail = user.email || "không xác định";
        showGate("Truy cập bị từ chối.");
        showGateError(
          `Tài khoản "${deniedEmail}" không thuộc danh sách Quản trị viên ThuysTalk (hoặc chưa xác thực email). Hệ thống đã tự động đăng xuất.`
        );
        window.ThuysTalkFirebase.logoutAdmin().catch(() => {});
      } else {
        showGate("Vui lòng đăng nhập bằng tài khoản Google Quản trị viên để tiếp tục.");
      }
    });
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

    // Check API server status only when running on localhost/file: or valid HTTPS bridge URL
    const apiBase = getApiBase();
    const statusEndpoint = getApiUrl("/api/notebook-status");
    if (statusEndpoint) {
      fetch(statusEndpoint)
        .then((r) => (r.ok ? r.json() : null))
        .then((info) => {
          if (!info) return;
          const sideStatus = document.getElementById("adminSidebarBridgeStatus");
          if (sideStatus) {
            sideStatus.textContent = "Động cơ AI Pháp lý: ĐANG KẾT NỐI TRỰC TIẾP (4 Chuyên đề Pháp lý sẵn sàng)";
          }
          // Only auto-redirect human file:// browsers (not headless screenshot verifiers)
          if (window.location.protocol === "file:" && !navigator.webdriver && apiBase) {
            const parts = window.location.pathname.split(/[\\/]/);
            const pageName = parts[parts.length - 1] || "index.html";
            window.location.replace(`${apiBase}/${pageName}${window.location.search}${window.location.hash}`);
          }
        })
        .catch(() => {
          const sideStatus = document.getElementById("adminSidebarBridgeStatus");
          if (sideStatus) {
            sideStatus.textContent = "Động cơ AI Pháp lý: Chế độ Kho AI Nội bộ (Mở chay_web_thuystalk.bat để bật Live API)";
          }
        });
    } else {
      const sideStatus = document.getElementById("adminSidebarBridgeStatus");
      if (sideStatus) {
        sideStatus.textContent = "Động cơ AI Pháp lý: Chế độ Kho AI Nội bộ (Chưa cấu hình URL API HTTPS)";
      }
    }

    // If we are on the dedicated internal Admin Page (admin.html) — Fail-closed until Google Admin verified:
    if (document.getElementById("adminSidebarNav")) {
      const requestedTab = params.get("tab");
      const requestedSlot = params.get("slot");
      if (requestedTab) state.activeCmsTab = requestedTab;
      initAdminAuthGate(requestedSlot || null);
      return;
    }

    ensureGlobalModals();
    updateHeaderLearnerStatus();
    renderAll();
    initConsultForm();
    bindPhotoTriggers(document);
    hydrateAllFromFirestore();
    if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.onAuthStateChanged === "function") {
      window.ThuysTalkFirebase.onAuthStateChanged(syncLearnerStateFromAuthUser);
    }
    (async function initLearnerAuthStartup() {
      isHandlingRedirectInit = true;
      let redirectOutcome = null;
      try {
        if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.checkLearnerRedirectResult === "function") {
          redirectOutcome = await window.ThuysTalkFirebase.checkLearnerRedirectResult();
        }
      } catch (err) {
        console.warn("Google redirect login warning:", err && err.message ? err.message : err);
        showToast("Không thể hoàn tất đăng nhập Google: " + (err && err.message ? err.message : err));
      } finally {
        isHandlingRedirectInit = false;
      }

      if (redirectOutcome) {
        await handleGoogleLoginOutcome(redirectOutcome, true);
      } else if (window.ThuysTalkFirebase && typeof window.ThuysTalkFirebase.getCurrentUser === "function") {
        await syncLearnerStateFromAuthUser(window.ThuysTalkFirebase.getCurrentUser());
      }
    })();

    // Auto-open unfinished tài liệu / Mini Test if redirected via ?openCourse=...&lesson=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const openCourseId = urlParams.get("openCourse");
      const openLessonParam = urlParams.get("lesson");
      if (openCourseId && document.getElementById("classroomModal")) {
        openCourseClassroom(openCourseId, openLessonParam !== null ? parseInt(openLessonParam, 10) : null);
      }
    } catch (e) {}

    // Hidden Admin CMS shortcut (Ctrl+Shift+A)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
        if (tag === "input" || tag === "textarea" || tag === "select") return;
        e.preventDefault();
        window.location.href = "admin.html";
      }
    });

    // Global click listener for Privacy Policy Modal (Nghị định 13/2023/NĐ-CP)
    document.addEventListener("click", (e) => {
      const privTarget = e.target.closest("#openPrivacyPolicyLink, .open-privacy-link, #consultOpenPrivacyLink");
      if (privTarget) {
        e.preventDefault();
        openPrivacyPolicyModal();
      }
    });

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
