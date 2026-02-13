// scripts/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBprGqy0WYVzIrL8XR163kWb2EcGm9ns-s",
    authDomain: "roadmap-tej2o-1.firebaseapp.com",
    projectId: "roadmap-tej2o-1",
    storageBucket: "roadmap-tej2o-1.firebasestorage.app",
    messagingSenderId: "655591889925",
    appId: "1:655591889925:web:b356cde80a5c087a26506c",
    measurementId: "G-D5NK61R1X6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ 'hd': 'branksome.on.ca' }); // Restrict to school domain