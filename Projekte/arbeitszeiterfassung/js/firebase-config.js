// Local / Offline Firebase Architecture Configuration
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT_ID.appspot.com",
  messagingSenderId: "DEIN_MESSAGING_SENDER_ID",
  appId: "DEIN_APP_ID"
};

let app = null, db = null, auth = null;
let isFirebaseValid = false;

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
