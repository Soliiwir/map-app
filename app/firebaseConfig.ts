// Import the functions you need from the SDKs you need
import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const GOOGLE_API_KEY = Constants.expoConfig?.extra?.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error("Missing Firebase API key");
}

const firebaseConfig = {
  apiKey: GOOGLE_API_KEY,
  authDomain: "map-app-f5a32.firebaseapp.com",
  projectId: "map-app-f5a32",
  storageBucket: "map-app-f5a32.firebasestorage.app",
  messagingSenderId: "673655423752",
  appId: "1:673655423752:web:5ae95dcbaf531488c7e2bd",
  measurementId: "G-TYZPE7762Y"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database instance
export const db = getFirestore(app);

// Firebase Auth instance (if you plan to use authentication)
export const auth = getAuth(app);

export default app;