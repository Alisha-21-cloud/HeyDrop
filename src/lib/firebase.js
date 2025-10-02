import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAXFb-q6mLws4EiKsBPsrMukhXvpUlloOs",
  authDomain: "open-room-dc091.firebaseapp.com",
  projectId: "open-room-dc091",
  storageBucket: "open-room-dc091.firebasestorage.app",
  messagingSenderId: "732826545733",
  appId: "1:732826545733:web:9d8a082b0a2d75e9ffbd2c",
  measurementId: "G-FPQ8P0X6FV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }

