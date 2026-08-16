// Firebase Auth & Cloud Sync Abstraction layer with Offline Fallback

export const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJECT_ID.firebaseapp.com",
  projectId: "DEIN_PROJECT_ID",
  storageBucket: "DEIN_PROJECT_ID.appspot.com",
  messagingSenderId: "DEIN_MESSAGING_SENDER_ID",
  appId: "DEIN_APP_ID",
};

const win = window as any;

win.firebaseMock = {
  auth: {
    currentUser: null as any,
    onAuthStateChanged: (callback: (user: any) => void) => {
      setTimeout(() => {
        const isLogged = localStorage.getItem("mock_fb_auth");
        if (isLogged) {
          win.firebaseMock.auth.currentUser = {
            uid: "mock-user-123",
            email: "test@offline.local",
          };
          callback(win.firebaseMock.auth.currentUser);
        } else {
          win.firebaseMock.auth.currentUser = null;
          callback(null);
        }
      }, 300);
    },
    signInWithEmailAndPassword: async (email: string, _password: string) => {
      localStorage.setItem("mock_fb_auth", "true");
      win.firebaseMock.auth.currentUser = { uid: "mock-user-123", email };
      return { user: win.firebaseMock.auth.currentUser };
    },
    signOut: async () => {
      localStorage.removeItem("mock_fb_auth");
      win.firebaseMock.auth.currentUser = null;
    },
  },
  firestore: {
    async syncData(data: any) {
      console.log("Mock Sync success!", data);
    },
    async loadData() {
      return null;
    },
  },
};

export const firebaseMock = win.firebaseMock;
