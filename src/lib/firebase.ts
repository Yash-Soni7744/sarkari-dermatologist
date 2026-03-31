import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Export initialized services with safety check
let auth: any = null;
let db: any = null;

if (firebaseConfig.apiKey) {
    try {
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        console.error("Firebase services failed to initialize:", e);
    }
} else {
    // This warning helps you know why features aren't working
    console.warn("Firebase: NEXT_PUBLIC_FIREBASE_API_KEY is missing. Auth and Database will be disabled.");
}

export { auth, db };
