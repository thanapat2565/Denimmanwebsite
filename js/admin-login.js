// ==========================================
// DENIMMAN - ADMIN LOGIN
// ==========================================

import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("admin-login-form");

const errorMessage =
    document.getElementById("admin-login-error");

const loginButton =
    document.querySelector(".admin-login-button");


loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("admin-email").value.trim();

    const password =
        document.getElementById("admin-password").value;


    errorMessage.textContent = "";

    loginButton.disabled = true;
    loginButton.textContent = "LOGGING IN...";


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Login สำเร็จ
        window.location.href = "admin.html";

    } catch (error) {

        console.error("Login error:", error);

        errorMessage.textContent =
            error.code + " : " + error.message;

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN";

    }

});