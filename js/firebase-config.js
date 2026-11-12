/**
 * THUYSTALK - FIREBASE DATABASE & STORAGE INTEGRATION MODULE
 * Project: thuystalk
 * Storage Bucket: thuystalk.firebasestorage.app
 * Connects Cloud Firestore & Firebase Storage to ThuysTalk Web Platform
 */

(function () {
  const STORAGE_KEY_FIREBASE = "thuystalk_firebase_custom_config";

  // Official Firebase Project Configuration for thuystalk (From Firebase Console)
  const OFFICIAL_FIREBASE_CONFIG = {
    apiKey: "AIzaSyA3PZ3oRrPzEJCVIVLF6sQpbY3OuFDaEw8",
    authDomain: "thuystalk.firebaseapp.com",
    projectId: "thuystalk",
    storageBucket: "thuystalk.firebasestorage.app",
    messagingSenderId: "767228711805",
    appId: "1:767228711805:web:1e25ade86083436aeef214",
    measurementId: "G-8HZEVN52VD"
  };

  let db = null;
  let storage = null;
  let isInitialized = false;

  function getStoredConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
      if (raw) return { ...OFFICIAL_FIREBASE_CONFIG, ...JSON.parse(raw) };
    } catch (e) {
      // Ignore
    }
    return OFFICIAL_FIREBASE_CONFIG;
  }

  function saveStoredConfig(cfg) {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(cfg));
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
    isStorageReady: function () {
      return !!(isInitialized && storage);
    },
    getStatus: function () {
      const cfg = getStoredConfig();
      const ready = !!(isInitialized && db);
      const stReady = !!(isInitialized && storage);
      return {
        ready: ready,
        storageReady: stReady,
        projectId: cfg.projectId || "thuystalk",
        storageBucket: cfg.storageBucket || "thuystalk.firebasestorage.app",
        hasApiKey: !!cfg.apiKey
      };
    },

    // Save Consultation Inquiry (Lead) to Firestore
    saveLead: async function (leadData) {
      initFirebase();
      if (!db) return false;
      try {
        await db.collection("leads").add({
          ...leadData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          source: "ThuysTalk Web Platform"
        });
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
          await db.collection("learners").doc(docId).set({
            ...learnerData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            source: "ThuysTalk E-Learning Portal"
          }, { merge: true });
        } else {
          await db.collection("learners").add({
            ...learnerData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
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
    }
  };
})();
