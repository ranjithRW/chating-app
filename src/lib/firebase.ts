import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
 apiKey: "AIzaSyDKT8deRqEm_QmgQl0Fc-HWR354i1P5Z8Y",
  authDomain: "quickchat-22e31.firebaseapp.com",
  projectId: "quickchat-22e31",
  storageBucket: "quickchat-22e31.firebasestorage.app",
  messagingSenderId: "943061215165",
  appId: "1:943061215165:web:f2d7dd056a0a6b975bd4d4",
  measurementId: "G-3LW4GM9YG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);