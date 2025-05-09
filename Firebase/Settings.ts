// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbB6rRODB0txennMzTHWwEibZPjJVoEQM",
  authDomain: "tactical-pt.firebaseapp.com",
  projectId: "tactical-pt",
  storageBucket: "tactical-pt.firebasestorage.app",
  messagingSenderId: "565483164663",
  appId: "1:565483164663:web:2074b0d60e5a47f59a54f2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);