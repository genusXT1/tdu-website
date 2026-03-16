
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAXpr_cA_eWmfepYunKfWEBBzpRUa7kicM",
  authDomain: "tdu-tr.firebaseapp.com",
  projectId: "tdu-tr",
  storageBucket: "tdu-tr.firebasestorage.app",
  messagingSenderId: "1040987079395",
  appId: "1:1040987079395:web:e15615b6061d626a4e7bd6",
  measurementId: "G-XEY7F0YCZW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export { onAuthStateChanged, signInWithEmailAndPassword, signOut };
