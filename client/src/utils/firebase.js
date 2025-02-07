// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "taskman-546e9.firebaseapp.com",

  projectId: "taskman-546e9",

  storageBucket: "taskman-546e9.firebasestorage.app",

  messagingSenderId: "349160948484",

  appId: "1:349160948484:web:f542d20e1bc767dfe10651"

};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);