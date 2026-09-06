import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBm-fj46eARiZcBEzQ4TQxgboyfYKJUXkU",
  authDomain: "project-29c01.firebaseapp.com",
  projectId: "project-29c01",
  storageBucket: "project-29c01.firebasestorage.app",
  messagingSenderId: "521147568836",
  appId: "1:521147568836:web:fe43779c1158609d176f91",
  measurementId: "G-CFGLGW4SKJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
