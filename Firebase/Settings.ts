// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbZiHMxiGbOdlOhzymBtZagkuNFkLHz8o",
  authDomain: "tactixfit-app.firebaseapp.com",
  projectId: "tactixfit-app",
  storageBucket: "tactixfit-app.firebasestorage.app",
  messagingSenderId: "317606084434",
  appId: "1:317606084434:web:1718f04fef52646974848b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export { auth }