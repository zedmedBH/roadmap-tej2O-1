// scripts/auth.js
import { auth, provider } from './firebase-config.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { syncUser } from './db.js';

export function initAuth(onLoginSuccess, onLogout) {
    const loginBtn = document.getElementById('google-login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch(err => alert(err.message));
    });

    logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Sync user to DB and get role/team info
            const userData = await syncUser(user);
            onLoginSuccess(user, userData);
        } else {
            onLogout();
        }
    });
}