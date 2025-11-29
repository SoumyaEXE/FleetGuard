import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDDcfMDHJihtSOWtR0_5tvOcfrHM4meKVg",
  authDomain: "fleetguard-afd56.firebaseapp.com",
  projectId: "fleetguard-afd56",
  storageBucket: "fleetguard-afd56.firebasestorage.app",
  messagingSenderId: "183217584134",
  appId: "1:183217584134:web:7948017495c3969d4deb87",
  measurementId: "G-030H14JYX1"
};

// Initialize Firebase
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
