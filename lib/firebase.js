import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCuFPaxrvQH8_29xS32GjdW7mn7niXxAm8",
  authDomain: "agenda-aulas-696c9.firebaseapp.com",
  projectId: "agenda-aulas-696c9",
  storageBucket: "agenda-aulas-696c9.firebasestorage.app",
  messagingSenderId: "452838038714",
  appId: "1:452838038714:web:9b2aaae4c7f8c465fbb683"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); 