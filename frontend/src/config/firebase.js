// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBixj1a6BGJ-qVNl5avwPaYw1S_TvRpj1M",
  authDomain: "mindverse-69a67.firebaseapp.com",
  projectId: "mindverse-69a67",
  // Correct storage bucket domain for Firebase Storage
  storageBucket: "mindverse-69a67.appspot.com",
  messagingSenderId: "879915568168",
  appId: "1:879915568168:web:e10133902f9112d06cb91d",
  measurementId: "G-9HD6ZYX9RL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;
