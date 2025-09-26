
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBRjW6e778eGj8EQs9sgqEELDArAuzqr7M",
  authDomain: "compass-e5f7b.firebaseapp.com",
  projectId: "compass-e5f7b",
  storageBucket: "compass-e5f7b.appspot.com",
  messagingSenderId: "608907439549",
  appId: "1:608907439549:web:ed203437b22779f21c76d4",
  measurementId: "G-G2H7RRLKB7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
