import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// WICHTIG: Füge hier deine echten Firebase Credentials ein!
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT_ID.appspot.com",
  messagingSenderId: "DEIN_MESSAGING_SENDER_ID",
  appId: "DEIN_APP_ID"
};

let app, db, auth;
let isFirebaseValid = false;

try {
  if (firebaseConfig.apiKey !== "DEIN_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseValid = true;
    console.log("Firebase Live initialized.");
  } else {
    console.warn("Firebase Config fehlt! Nutze Offline/Mock-Fallback.");
  }
} catch (e) {
  console.error("Firebase init failed:", e);
}

window.firebaseMock = {
  auth: {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      if (isFirebaseValid) {
        onAuthStateChanged(auth, (user) => {
          window.firebaseMock.auth.currentUser = user;
          callback(user);
        });
      } else {
        // Fallback Mock
        setTimeout(() => {
          const isLogged = localStorage.getItem('mock_fb_auth');
          if (isLogged) {
            window.firebaseMock.auth.currentUser = { uid: 'mock-user-123', email: 'test@offline.local' };
            callback(window.firebaseMock.auth.currentUser);
          } else {
            window.firebaseMock.auth.currentUser = null;
            callback(null);
          }
        }, 500);
      }
    },
    signInWithEmailAndPassword: async (email, password) => {
      if (isFirebaseValid) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        window.firebaseMock.auth.currentUser = cred.user;
        return cred;
      } else {
        localStorage.setItem('mock_fb_auth', 'true');
        window.firebaseMock.auth.currentUser = { uid: 'mock-user-123', email };
        return { user: window.firebaseMock.auth.currentUser };
      }
    },
    signOut: async () => {
      if (isFirebaseValid) {
        await signOut(auth);
        window.firebaseMock.auth.currentUser = null;
      } else {
        localStorage.removeItem('mock_fb_auth');
        window.firebaseMock.auth.currentUser = null;
      }
    }
  },
  firestore: {
    async syncData(data) {
      if (isFirebaseValid && window.firebaseMock.auth.currentUser) {
        try {
          const uid = window.firebaseMock.auth.currentUser.uid;
          await setDoc(doc(db, "users", uid), data);
          console.log("Cloud Sync success!");
        } catch (e) {
          console.error("Cloud Sync failed", e);
        }
      } else {
        console.log("Mock Sync success!");
      }
    },
    async loadData() {
      if (isFirebaseValid && window.firebaseMock.auth.currentUser) {
        try {
          const uid = window.firebaseMock.auth.currentUser.uid;
          const docSnap = await getDoc(doc(db, "users", uid));
          if (docSnap.exists()) {
            return docSnap.data();
          }
        } catch (e) {
          console.error("Cloud Load failed", e);
        }
      }
      return null;
    }
  }
};
