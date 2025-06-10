  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
  import {getAuth, createUserWithEmailPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js"
  import {getFirestore, setDoc, doc} from "http://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js"
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAPDfJ8W3W3JPgpJn_CT3oDsPusbfkoD80",
    authDomain: "registrojara.firebaseapp.com",
    projectId: "registrojara",
    storageBucket: "registrojara.firebasestorage.app",
    messagingSenderId: "606891423938",
    appId: "1:606891423938:web:1a43d89b1277b5b0abe35b"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  const signUp=document.getElementById("submitSignUp");
  signUp.addEventListener("click", (event)=>){
    event.preventDefault();
    const email=document.getElementById("rEmail").value;
    const password=document.getElementById("rPassword").value;
    const firstName=document.getElementById("fName").value;
    const lastName=document.getElementById("lName").value;

    const auth=getAuth();
    const db=getFirestore();

    createUserWithEmailPassword(auth, email, password)
    .then(userCredential)=>{
        const user=userCredential.user;
        const userData={
            email: email,
            firstName: firstName,
            lastname: lastName
        };
    }
  }
