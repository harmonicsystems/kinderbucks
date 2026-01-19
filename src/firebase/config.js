import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCf4uRHqqZtYR3ZvlbHF9w59qGuEjlXcW4",
  authDomain: "kinderbucks-e3e8c.firebaseapp.com",
  projectId: "kinderbucks-e3e8c",
  storageBucket: "kinderbucks-e3e8c.firebasestorage.app",
  messagingSenderId: "18326874439",
  appId: "1:18326874439:web:ad902e6a1c794b2b3c4462",
  measurementId: "G-3JMD9HSMC3"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
