/**
 * THUYSTALK - FIREBASE AUTH & FIRESTORE INTEGRATION MODULE
 * Project: thuystalk
 * Connects Cloud Firestore & Firebase Authentication to ThuysTalk Web Platform
 */

(function () {
  const STORAGE_KEY_FIREBASE = "thuystalk_firebase_custom_config";

  // Authorized Admin Emails for CMS & Backend privileged actions (R1-02 / R7-03)
  const ADMIN_EMAILS = ["thuystalk.official@gmail.com", "thuyn.bic@gmail.com"];

  const DEFAULT_AUTH_DOMAIN =
    typeof window !== "undefined" && window.location && window.location.hostname === "thuystalk.web.app"
      ? "thuystalk.web.app"
      : "thuystalk.firebaseapp.com";

  // Official Firebase Project Configuration for thuystalk (From Firebase Console)
  const OFFICIAL_FIREBASE_CONFIG = {
    apiKey: "AIzaSyA3PZ3oRrPzEJCVIvLF6sQpbY3OuFDaEw8",
    authDomain: DEFAULT_AUTH_DOMAIN,
    projectId: "thuystalk",
    storageBucket: "thuystalk.firebasestorage.app",
    messagingSenderId: "767228711805",
    appId: "1:767228711805:web:1e25ade86083436aeef214",
    measurementId: "G-8HZEVN52VD"
  };

  let db = null;
  let auth = null;
  let isInitialized = false;
  let persistenceConfigured = false;
  let pendingLinkCredential = null;

  function isAdminUserObj(user) {
    if (!user || user.emailVerified !== true || !user.email) return false;
    return ADMIN_EMAILS.includes(String(user.email).trim().toLowerCase());
  }

  function getStoredConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...OFFICIAL_FIREBASE_CONFIG, ...parsed, authDomain: DEFAULT_AUTH_DOMAIN };
      }
    } catch (e) {
      // Ignore
    }
    return OFFICIAL_FIREBASE_CONFIG;
  }

  function saveStoredConfig(cfg) {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(cfg));
  }

  function safeFirestoreWrite(promise, timeoutMs = 2000) {
    if (!promise || typeof promise.then !== "function") return Promise.resolve(null);
    return Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))
    ]);
  }

  function initFirebase() {
    if (isInitialized) return true;
    if (typeof firebase === "undefined") {
      return false;
    }

    const cfg = getStoredConfig();
    try {
      if (!firebase.apps || !firebase.apps.length) {
        // Only initialize if we have at least projectId
        if (cfg && cfg.projectId) {
          firebase.initializeApp(cfg);
        }
      }

      if (firebase.apps && firebase.apps.length) {
        const app = firebase.apps[0];
        if (typeof firebase.auth === "function") {
          auth = firebase.auth();
          if (!persistenceConfigured && firebase.auth.Auth && firebase.auth.Auth.Persistence) {
            persistenceConfigured = true;
            auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
              console.warn("Auth setPersistence LOCAL notice:", err && err.message ? err.message : err);
            });
          }
        }
        if (typeof firebase.firestore === "function") {
          db = firebase.firestore();
        }
        isInitialized = true;
        console.log("ThuysTalk Firebase Initialized: project =", cfg.projectId);
        return true;
      }
    } catch (err) {
      console.warn("Firebase Init notice:", err.message);
    }
    return false;
  }

  // Auto-init if SDK available
  if (typeof window !== "undefined") {
    if (typeof firebase !== "undefined") {
      initFirebase();
    }
    window.addEventListener("DOMContentLoaded", () => {
      initFirebase();
    });
  }

  window.ThuysTalkFirebase = {
    init: initFirebase,
    getConfig: getStoredConfig,
    saveConfig: saveStoredConfig,
    isReady: function () {
      return !!(isInitialized && db);
    },
    isAuthReady: function () {
      return !!(isInitialized && auth);
    },
    getStatus: function () {
      const cfg = getStoredConfig();
      const ready = !!(isInitialized && db);
      const authReady = !!(isInitialized && auth);
      return {
        ready: ready,
        authReady: authReady,
        projectId: cfg.projectId || "thuystalk",
        hasApiKey: !!cfg.apiKey
      };
    },

    // 1. REGISTER NEW LEARNER WITH EMAIL & PASSWORD + SEND VERIFICATION EMAIL
    registerLearnerWithVerification: async function (name, email, password, phone) {
      initFirebase();
      if (!auth) {
        throw new Error("Dịch vụ Firebase Auth chưa sẵn sàng trên trình duyệt.");
      }

      try {
        // Create user with email and password in Firebase
        const userCred = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCred.user;

        // Update displayName
        if (user && name) {
          try {
            await user.updateProfile({ displayName: name });
          } catch (e) {}
        }

        // Send email verification (never write learners/{uid} before email_verified == true)
        let sentVerification = false;
        if (user && typeof user.sendEmailVerification === "function") {
          try {
            await user.sendEmailVerification({
              url: window.location.origin + window.location.pathname,
              handleCodeInApp: false
            });
            sentVerification = true;
          } catch (e) {
            console.warn("sendEmailVerification notice:", e);
          }
        }

        return {
          uid: user ? user.uid : null,
          email: (user && user.email) || email,
          name: name || "",
          phone: phone || "",
          emailVerified: !!(user && user.emailVerified),
          sentVerification: sentVerification
        };
      } catch (authErr) {
        console.warn("Firebase Auth notice:", authErr.code, authErr.message);
        throw authErr;
      }
    },

    // 2. LOGIN LEARNER WITH EMAIL & PASSWORD (keep session on unverified user so polling/resend can run)
    loginLearner: async function (email, password) {
      initFirebase();
      if (!auth) {
        throw new Error("Hệ thống xác thực chưa sẵn sàng.");
      }

      const userCred = await auth.signInWithEmailAndPassword(email, password);
      const user = userCred.user;

      if (!user || !user.emailVerified) {
        return {
          uid: user ? user.uid : "",
          email: (user && user.email) || email,
          name: (user && user.displayName) || email.split("@")[0],
          emailVerified: false
        };
      }

      try {
        await user.getIdToken(false);
      } catch (e) {}

      return {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
        emailVerified: true,
        user: user
      };
    },

    // 2b. LEARNER GOOGLE SIGN-IN (Popup with Redirect fallback & single-account linking)
    hasPendingGoogleLink: function () {
      return !!pendingLinkCredential;
    },
    clearPendingGoogleLink: function () {
      pendingLinkCredential = null;
    },
    loginLearnerWithGoogle: async function () {
      initFirebase();
      if (!auth || typeof firebase.auth.GoogleAuthProvider !== "function") {
        throw new Error("Dịch vụ xác thực Google chưa sẵn sàng trên trình duyệt.");
      }
      if (firebase.auth.Auth && firebase.auth.Auth.Persistence) {
        try {
          await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch (e) {}
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        const result = await auth.signInWithPopup(provider);
        const user = result && result.user;
        pendingLinkCredential = null;
        return {
          user: user,
          email: user ? user.email : "",
          isNewUser: !!(result && result.additionalUserInfo && result.additionalUserInfo.isNewUser),
          provider: "google"
        };
      } catch (err) {
        if (err && err.code === "auth/popup-blocked") {
          await auth.signInWithRedirect(provider);
          return { redirected: true };
        }
        if (err && err.code === "auth/account-exists-with-different-credential") {
          const cred =
            (firebase.auth.GoogleAuthProvider.credentialFromError
              ? firebase.auth.GoogleAuthProvider.credentialFromError(err)
              : err.credential) || null;
          pendingLinkCredential = cred;
          const existingEmail = err.email || (err.customData && err.customData.email) || "";
          return {
            accountExists: true,
            email: existingEmail,
            hasCredential: !!cred
          };
        }
        throw err;
      }
    },
    checkLearnerRedirectResult: async function () {
      initFirebase();
      if (!auth) return null;
      try {
        const res = await auth.getRedirectResult();
        if (res && res.user) {
          pendingLinkCredential = null;
          return {
            user: res.user,
            email: res.user.email || "",
            isNewUser: !!(res.additionalUserInfo && res.additionalUserInfo.isNewUser),
            provider: "google"
          };
        }
        return null;
      } catch (err) {
        if (err && err.code === "auth/account-exists-with-different-credential") {
          const cred =
            (firebase.auth.GoogleAuthProvider.credentialFromError
              ? firebase.auth.GoogleAuthProvider.credentialFromError(err)
              : err.credential) || null;
          pendingLinkCredential = cred;
          const existingEmail = err.email || (err.customData && err.customData.email) || "";
          return {
            accountExists: true,
            email: existingEmail,
            hasCredential: !!cred
          };
        }
        throw err;
      }
    },
    linkPendingGoogleCredentialToCurrentUser: async function () {
      initFirebase();
      if (!auth || !auth.currentUser || !pendingLinkCredential) return false;
      const cred = pendingLinkCredential;
      try {
        await auth.currentUser.linkWithCredential(cred);
        pendingLinkCredential = null;
        return true;
      } catch (err) {
        if (err && err.code === "auth/provider-already-linked") {
          pendingLinkCredential = null;
          return true;
        }
        pendingLinkCredential = null;
        throw err;
      }
    },
    reloadCurrentUser: async function () {
      initFirebase();
      if (!auth || !auth.currentUser) return null;
      await auth.currentUser.reload();
      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch (e) {}
      }
      return auth.currentUser;
    },
    fetchLearnerDoc: async function (uidOverride) {
      initFirebase();
      const targetUid = uidOverride || (auth && auth.currentUser ? auth.currentUser.uid : "");
      if (!db || !targetUid) return { error: true, exists: false, data: null };
      try {
        const snap = await db.collection("learners").doc(targetUid).get();
        return {
          error: false,
          exists: snap.exists,
          data: snap.exists ? snap.data() : null
        };
      } catch (err) {
        console.warn("fetchLearnerDoc error:", err);
        return { error: true, exists: false, data: null };
      }
    },
    saveVerifiedLearnerDoc: async function (profileData = {}) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!user || user.emailVerified !== true) {
        throw new Error("Tài khoản chưa xác thực email.");
      }
      if (profileData.name) {
        try {
          await user.updateProfile({ displayName: profileData.name });
        } catch (e) {}
      }
      if (!db) return false;
      const payload = {
        uid: user.uid,
        email: user.email || profileData.email || "",
        name: profileData.name || user.displayName || (user.email ? user.email.split("@")[0] : ""),
        emailVerified: true,
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        source: profileData.source || "ThuysTalk Registration Portal"
      };
      if (profileData.phone !== undefined) {
        payload.phone = profileData.phone || "";
      }
      if (profileData.isNew) {
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      if (profileData.recordConsent) {
        payload.consentAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      await db.collection("learners").doc(user.uid).set(payload, { merge: true });
      return true;
    },
    deleteUnconsentedGoogleUser: async function () {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (user) {
        try {
          await user.delete();
        } catch (err) {
          console.warn("deleteUnconsentedGoogleUser notice:", err && err.code ? err.code : err);
        }
      }
      if (auth) {
        try {
          await auth.signOut();
        } catch (e) {}
      }
      return true;
    },

    // 3. RESEND VERIFICATION EMAIL
    resendVerificationEmail: async function () {
      initFirebase();
      if (auth && auth.currentUser) {
        await auth.currentUser.sendEmailVerification({
          url: window.location.origin + window.location.pathname,
          handleCodeInApp: false
        });
        return true;
      }
      return false;
    },

    // 4. PASSWORD RESET EMAIL
    sendPasswordReset: async function (email) {
      initFirebase();
      if (!auth) throw new Error("Hệ thống xác thực chưa sẵn sàng.");
      await auth.sendPasswordResetEmail(email);
      return true;
    },

    // 5. CURRENT LEARNER / AUTH STATE & ADMIN GOOGLE LOGIN (R1-02 / R4-03 / R7-03)
    getCurrentUser: function () {
      initFirebase();
      return auth ? auth.currentUser : null;
    },
    getIdToken: async function (forceRefresh = false) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!user) return null;
      return await user.getIdToken(!!forceRefresh);
    },
    isAdminUser: function (user) {
      return isAdminUserObj(user);
    },
    isCurrentUserAdmin: function () {
      initFirebase();
      return isAdminUserObj(auth ? auth.currentUser : null);
    },
    onAuthStateChanged: function (callback) {
      initFirebase();
      if (typeof callback !== "function") return function () {};
      if (!auth) {
        setTimeout(() => callback(null), 0);
        return function () {};
      }
      return auth.onAuthStateChanged(callback);
    },
    loginAdminWithGoogle: async function () {
      initFirebase();
      if (!auth || typeof firebase.auth.GoogleAuthProvider !== "function") {
        throw new Error("Dịch vụ xác thực Google chưa sẵn sàng trên trình duyệt.");
      }
      if (firebase.auth.Auth && firebase.auth.Auth.Persistence) {
        try {
          await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch (e) {}
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        const result = await auth.signInWithPopup(provider);
        const user = result && result.user;
        if (!isAdminUserObj(user)) {
          const deniedEmail = user && user.email ? user.email : "Tài khoản này";
          await auth.signOut();
          const deniedErr = new Error(
            `Tài khoản "${deniedEmail}" không có quyền Quản trị viên ThuysTalk.`
          );
          deniedErr.code = "auth/not-admin";
          throw deniedErr;
        }
        return { user: user, email: user.email };
      } catch (err) {
        if (err && err.code === "auth/popup-blocked") {
          await auth.signInWithRedirect(provider);
          return { redirected: true };
        }
        throw err;
      }
    },
    checkAdminRedirectResult: async function () {
      initFirebase();
      if (!auth) return null;
      const res = await auth.getRedirectResult();
      if (res && res.user) {
        if (!isAdminUserObj(res.user)) {
          const deniedEmail = res.user.email || "Tài khoản này";
          await auth.signOut();
          const deniedErr = new Error(
            `Tài khoản "${deniedEmail}" không có quyền Quản trị viên ThuysTalk.`
          );
          deniedErr.code = "auth/not-admin";
          throw deniedErr;
        }
        return res.user;
      }
      return null;
    },
    logoutAdmin: async function () {
      initFirebase();
      if (auth) {
        await auth.signOut();
      }
    },

    // 5b. UPDATE LEARNER PROFILE
    updateLearnerProfile: async function (profileData) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!user || !user.emailVerified) {
        throw new Error("Vui lòng đăng nhập tài khoản đã xác thực để cập nhật hồ sơ.");
      }
      if (profileData.name) {
        try {
          await user.updateProfile({ displayName: profileData.name });
        } catch (e) {}
      }
      if (db) {
        try {
          await safeFirestoreWrite(
            db.collection("learners").doc(user.uid).set({
              uid: user.uid,
              email: user.email || profileData.email || "",
              name: profileData.name || "",
              phone: profileData.phone || "",
              company: profileData.company || "",
              emailVerified: true,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }),
            2500
          );
          return true;
        } catch (err) {
          console.warn("updateLearnerProfile error:", err);
        }
      }
      return false;
    },

    // 5c. CHANGE LEARNER PASSWORD
    changeLearnerPassword: async function (newPassword, emailOverride) {
      initFirebase();
      if (auth && auth.currentUser) {
        await auth.currentUser.updatePassword(newPassword);
        return true;
      }
      throw new Error("Vui lòng đăng nhập lại để thay đổi mật khẩu.");
    },

    // 5d. SAVE & FETCH LEARNER PROGRESS (CLOUD SYNC)
    saveLearnerProgress: async function (email, progressData) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!db || !user || !user.emailVerified) return false;
      try {
        await safeFirestoreWrite(
          db.collection("learners").doc(user.uid).set({
            progress: progressData,
            lastStudiedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }),
          2000
        );
        return true;
      } catch (e) {
        console.warn("saveLearnerProgress error:", e);
        return false;
      }
    },

    fetchLearnerProgress: async function (email) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!db || !user || !user.emailVerified) return null;
      try {
        const doc = await db.collection("learners").doc(user.uid).get();
        if (doc.exists && doc.data().progress) {
          return doc.data().progress;
        }
      } catch (e) {
        console.warn("fetchLearnerProgress error:", e);
      }
      return null;
    },

    // 6. LOGOUT
    logoutLearner: async function () {
      if (auth) {
        await auth.signOut();
      }
    },

    // Save Consultation Inquiry (Lead) to Firestore
    saveLead: async function (leadData) {
      initFirebase();
      if (!db) return false;
      try {
        await safeFirestoreWrite(
          db.collection("leads").add({
            ...leadData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: "ThuysTalk Web Platform"
          }),
          2500
        );
        return true;
      } catch (err) {
        console.warn("Firestore saveLead error:", err);
        return false;
      }
    },

    // Record Verified Material Download Lead (Strictly matches isValidDownloadLead rules)
    recordDownloadLead: async function (downloadInfo = {}) {
      initFirebase();
      const user = auth ? auth.currentUser : null;
      if (!db || !user || !user.emailVerified || !user.email) return false;
      try {
        const displayName = String(
          downloadInfo.name || user.displayName || user.email.split("@")[0] || "Hoc vien"
        ).slice(0, 120);
        await safeFirestoreWrite(
          db.collection("leads").add({
            type: "download",
            uid: user.uid,
            email: user.email,
            name: displayName,
            itemType: String(downloadInfo.itemType || "resource").slice(0, 40) || "resource",
            itemId: String(downloadInfo.itemId || "item").slice(0, 120) || "item",
            itemTitle: String(downloadInfo.itemTitle || "Tai lieu ThuysTalk").slice(0, 300) || "Tai lieu ThuysTalk",
            fileName: String(downloadInfo.fileName || "ThuysTalk_Tai_Lieu.txt").slice(0, 260) || "ThuysTalk_Tai_Lieu.txt",
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }),
          2500
        );
        return true;
      } catch (err) {
        console.warn("Firestore recordDownloadLead error:", err);
        return false;
      }
    },

    // Sync Collection (Articles, Videos, Mini-Test Courses) to Firestore
    syncCollection: async function (collName, items) {
      initFirebase();
      if (!db || !Array.isArray(items)) return false;
      try {
        const batch = db.batch();
        items.forEach((item) => {
          const id = item.id ? String(item.id) : "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
          const docRef = db.collection(collName).doc(id);
          batch.set(docRef, { ...item, syncedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
        });
        await batch.commit();
        return true;
      } catch (err) {
        console.warn("Firestore syncCollection error:", err);
        return false;
      }
    },

    // 7. FETCH ALL LEARNERS FROM FIRESTORE
    fetchLearners: async function () {
      initFirebase();
      if (!db) return [];
      try {
        const snap = await db.collection("learners").get();
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (err) {
        console.warn("fetchLearners error:", err);
        return [];
      }
    },

    // 8. FETCH ALL LEADS FROM FIRESTORE
    fetchLeads: async function () {
      initFirebase();
      if (!db) return [];
      try {
        const snap = await db.collection("leads").get();
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (err) {
        console.warn("fetchLeads error:", err);
        return [];
      }
    },

    // 9. GENERIC CRUD OPERATIONS FOR SINGLE SOURCE OF TRUTH (SSoT)
    saveDoc: async function (collName, docId, data) {
      initFirebase();
      if (!db || !collName || !docId) return false;
      try {
        await safeFirestoreWrite(
          db.collection(collName).doc(String(docId)).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }),
          2500
        );
        return true;
      } catch (err) {
        console.warn(`saveDoc error (${collName}/${docId}):`, err);
        return false;
      }
    },

    deleteDoc: async function (collName, docId) {
      initFirebase();
      if (!db || !collName || !docId) return false;
      try {
        await safeFirestoreWrite(
          db.collection(collName).doc(String(docId)).delete(),
          2500
        );
        return true;
      } catch (err) {
        console.warn(`deleteDoc error (${collName}/${docId}):`, err);
        return false;
      }
    },

    fetchCollection: async function (collName) {
      initFirebase();
      if (!db || !collName) return [];
      try {
        const snap = await db.collection(collName).get();
        const list = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return list;
      } catch (err) {
        console.warn(`fetchCollection error (${collName}):`, err);
        return [];
      }
    },

    saveSiteSettings: async function (settingKey, data) {
      initFirebase();
      if (!db || !settingKey) return false;
      try {
        await safeFirestoreWrite(
          db.collection("site_settings").doc(String(settingKey)).set({
            data: data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true }),
          2500
        );
        return true;
      } catch (err) {
        console.warn(`saveSiteSettings error (${settingKey}):`, err);
        return false;
      }
    },

    fetchSiteSettings: async function (settingKey) {
      initFirebase();
      if (!db || !settingKey) return null;
      try {
        const snap = await db.collection("site_settings").doc(String(settingKey)).get();
        if (snap.exists) {
          const val = snap.data();
          return val.data !== undefined ? val.data : val;
        }
        return null;
      } catch (err) {
        console.warn(`fetchSiteSettings error (${settingKey}):`, err);
        return null;
      }
    },

    // 10. REAL-TIME LISTENER FOR INSTANT CROSS-BROWSER SYNCHRONIZATION
    listenCollection: function (collName, callback) {
      initFirebase();
      if (!db || !collName || typeof callback !== "function") return null;
      try {
        return db.collection(collName).onSnapshot(
          (snapshot) => {
            const list = [];
            snapshot.forEach((doc) => {
              list.push({ id: doc.id, ...doc.data() });
            });
            callback(list);
          },
          (err) => {
            console.warn(`Firestore onSnapshot error (${collName}):`, err);
          }
        );
      } catch (e) {
        console.warn(`listenCollection error (${collName}):`, e);
        return null;
      }
    },

    listenSiteSettings: function (settingKey, callback) {
      initFirebase();
      if (!db || !settingKey || typeof callback !== "function") return null;
      try {
        return db.collection("site_settings").doc(String(settingKey)).onSnapshot(
          (doc) => {
            if (doc.exists) {
              const val = doc.data();
              callback(val.data !== undefined ? val.data : val);
            }
          },
          (err) => {
            console.warn(`Firestore onSnapshot error (site_settings/${settingKey}):`, err);
          }
        );
      } catch (e) {
        console.warn(`listenSiteSettings error (${settingKey}):`, e);
        return null;
      }
    }
  };
})();
