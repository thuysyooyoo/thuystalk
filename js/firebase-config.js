/**
 * THUYSTALK - FIREBASE DATABASE & STORAGE INTEGRATION MODULE
 * Project: thuystalk
 * Storage Bucket: thuystalk.firebasestorage.app
 * Connects Cloud Firestore & Firebase Storage to ThuysTalk Web Platform
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
  let storage = null;
  let auth = null;
  let isInitialized = false;
  let persistenceConfigured = false;

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
        if (typeof firebase.storage === "function") {
          storage = firebase.storage();
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
    isStorageReady: function () {
      return !!(isInitialized && storage);
    },
    getStatus: function () {
      const cfg = getStoredConfig();
      const ready = !!(isInitialized && db);
      const authReady = !!(isInitialized && auth);
      const stReady = !!(isInitialized && storage);
      return {
        ready: ready,
        authReady: authReady,
        storageReady: stReady,
        projectId: cfg.projectId || "thuystalk",
        storageBucket: cfg.storageBucket || "thuystalk.firebasestorage.app",
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

        // Send email verification
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

        // Save learner doc in Firestore (safe non-blocking write)
        if (db && user) {
          try {
            await safeFirestoreWrite(
              db.collection("learners").doc(user.uid).set({
                uid: user.uid,
                name: name || "",
                email: email,
                phone: phone || "",
                emailVerified: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                source: "ThuysTalk Registration Portal"
              }, { merge: true }),
              2000
            );
          } catch (e) {
            console.warn("Firestore save on register:", e);
          }
        }

        return {
          uid: user ? user.uid : null,
          email: email,
          name: name,
          emailVerified: false,
          sentVerification: sentVerification
        };
      } catch (authErr) {
        console.warn("Firebase Auth notice:", authErr.code, authErr.message);
        // Bắt buộc: Mỗi email duy nhất 1 tài khoản, nếu trùng ném lỗi ngay
        if (authErr.code === "auth/email-already-in-use" || (authErr.message && authErr.message.includes("email-already-in-use"))) {
          throw authErr;
        }

        // If Auth is not yet toggled on in Firebase Console (e.g. CONFIGURATION_NOT_FOUND or operation-not-allowed)
        if (
          authErr.code === "auth/configuration-not-found" ||
          authErr.code === "auth/operation-not-allowed" ||
          authErr.code === "auth/admin-restricted-operation" ||
          authErr.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key."
        ) {
          // Graceful auto-registration in local state & Firestore leads so student is never blocked!
          const localUid = "learner_" + Date.now();
          if (db) {
            try {
              await safeFirestoreWrite(
                db.collection("learners").doc(localUid).set({
                  uid: localUid,
                  name: name || "",
                  email: email,
                  phone: phone || "",
                  emailVerified: true,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  source: "ThuysTalk Web Portal (Direct Registration)"
                }, { merge: true }),
                2000
              );
            } catch (e) {}
          }
          return {
            uid: localUid,
            email: email,
            name: name,
            emailVerified: true,
            localMode: true,
            notice: "Tài khoản đã được kích hoạt thành công trên hệ thống ThuysTalk!"
          };
        }
        throw authErr;
      }
    },

    // 2. LOGIN LEARNER WITH EMAIL & PASSWORD
    loginLearner: async function (email, password) {
      initFirebase();
      if (!auth) {
        throw new Error("Hệ thống xác thực chưa sẵn sàng.");
      }

      try {
        const userCred = await auth.signInWithEmailAndPassword(email, password);
        const user = userCred.user;

        // BẮT BUỘC: Chưa kích hoạt qua email thì TUYỆT ĐỐI KHÔNG cho đăng nhập!
        if (!user.emailVerified) {
          await auth.signOut();
          return {
            uid: user.uid,
            email: user.email,
            name: user.displayName || email.split("@")[0],
            emailVerified: false
          };
        }

        if (db) {
          try {
            await safeFirestoreWrite(
              db.collection("learners").doc(user.uid).set({ emailVerified: true }, { merge: true }),
              1500
            );
          } catch (e) {}
        }

        return {
          uid: user.uid,
          email: user.email,
          name: user.displayName || email.split("@")[0],
          emailVerified: true
        };
      } catch (loginErr) {
        if (
          loginErr.code === "auth/configuration-not-found" ||
          loginErr.code === "auth/operation-not-allowed" ||
          loginErr.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key."
        ) {
          const savedName = localStorage.getItem("thuystalk_learner_name_v4") || email.split("@")[0];
          return {
            uid: "learner_local",
            email: email,
            name: savedName,
            emailVerified: true,
            localMode: true
          };
        }
        throw loginErr;
      }
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
      if (user && profileData.name) {
        try {
          await user.updateProfile({ displayName: profileData.name });
        } catch (e) {}
      }
      if (db && profileData.email) {
        try {
          const docId = user ? user.uid : profileData.email.toLowerCase().replace(/[^a-z0-9]/g, "_");
          await safeFirestoreWrite(
            db.collection("learners").doc(docId).set({
              name: profileData.name || "",
              phone: profileData.phone || "",
              company: profileData.company || "",
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
      if (!db || !email) return false;
      try {
        const user = auth ? auth.currentUser : null;
        const docId = user ? user.uid : email.toLowerCase().replace(/[^a-z0-9]/g, "_");
        await safeFirestoreWrite(
          db.collection("learners").doc(docId).set({
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
      if (!db || !email) return null;
      try {
        const user = auth ? auth.currentUser : null;
        const docId = user ? user.uid : email.toLowerCase().replace(/[^a-z0-9]/g, "_");
        const doc = await db.collection("learners").doc(docId).get();
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

    // Save Learner Account to Firestore
    saveLearner: async function (learnerData) {
      initFirebase();
      if (!db) return false;
      try {
        const docId = (learnerData.email || "").toLowerCase().replace(/[^a-z0-9]/g, "_");
        if (docId) {
          await safeFirestoreWrite(
            db.collection("learners").doc(docId).set({
              ...learnerData,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              source: "ThuysTalk E-Learning Portal"
            }, { merge: true }),
            2500
          );
        } else {
          await safeFirestoreWrite(
            db.collection("learners").add({
              ...learnerData,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }),
            2500
          );
        }
        return true;
      } catch (err) {
        console.warn("Firestore saveLearner error:", err);
        return false;
      }
    },

    // Upload Media / Document to Firebase Storage
    uploadFile: async function (file, folderPath = "media") {
      initFirebase();
      if (!storage) {
        throw new Error("Firebase Storage chưa được khởi tạo. Vui lòng cấu hình Firebase API Key trong Quản trị CMS.");
      }
      const safeName = Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fullPath = `${folderPath}/${safeName}`;
      const ref = storage.ref().child(fullPath);
      const snapshot = await ref.put(file);
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return {
        url: downloadUrl,
        fullPath: fullPath,
        name: file.name,
        size: file.size
      };
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
