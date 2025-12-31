// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLDD9LjnxZwKcMLJ2NBsAmUuT6J_1G1BY",
  authDomain: "gen-lang-client-0109190819.firebaseapp.com",
  projectId: "gen-lang-client-0109190819",
  storageBucket: "gen-lang-client-0109190819.firebasestorage.app",
  messagingSenderId: "221277743612",
  appId: "1:221277743612:web:520f7ed157f2aa393bea79",
  measurementId: "G-43CQMLH0LJ"
};

// Next.jsでは複数回初期化を防ぐ
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export { app, db }