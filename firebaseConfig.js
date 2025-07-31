// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqdcv_LEGiqvJrxomoHMO902Cx8zmiiVY",
  authDomain: "zeeliasbookings.firebaseapp.com",
  databaseURL: "https://zeeliasbookings-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zeeliasbookings",
  storageBucket: "zeeliasbookings.appspot.com",
  messagingSenderId: "551591035341",
  appId: "1:551591035341:web:4814897183d43f39b40484",
  measurementId: "G-VH4ER6881J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export Firestore instance
export { db };
