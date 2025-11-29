import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDcfMDHJihtSOWtR0_5tvOcfrHM4meKVg",
  authDomain: "fleetguard-afd56.firebaseapp.com",
  projectId: "fleetguard-afd56",
  storageBucket: "fleetguard-afd56.firebasestorage.app",
  messagingSenderId: "183217584134",
  appId: "1:183217584134:web:7948017495c3969d4deb87",
  measurementId: "G-030H14JYX1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
