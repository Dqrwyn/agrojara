// js/firebase-config.js

// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail // Útil para futuras funcionalidades de recuperación de contraseña
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

// Tu configuración de Firebase
// ¡Estos son tus valores específicos que has proporcionado!
const firebaseConfig = {
  apiKey: "AIzaSyAPDfJ8W3W3JPgpJn_CT3oDsPusbfkoD80",
  authDomain: "registrojara.firebaseapp.com",
  projectId: "registrojara",
  storageBucket: "registrojara.firebasestorage.app",
  messagingSenderId: "606891423938",
  appId: "1:606891423938:web:1a43d89b1277b5b0abe35b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta las instancias de los servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Exporta también las funciones de autenticación y firestore que usarás comúnmente
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setDoc,
  doc,
  sendPasswordResetEmail
};