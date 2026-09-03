import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { firebaseConfig } from "./firebaseconfig.js";


// ========================================
// FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);


// ========================================
// GET ELEMENTS
// ========================================

const loginForm =
    document.querySelector("#admin-login-form");

const emailInput =
    document.querySelector("#admin-email");

const passwordInput =
    document.querySelector("#admin-password");

const passwordToggle =
    document.querySelector("#password-toggle");

const loginError =
    document.querySelector("#login-error");


// TEST
console.log("ADMIN LOGIN JS IS WORKING");
console.log("LOGIN FORM:", loginForm);
console.log("PASSWORD TOGGLE:", passwordToggle);


// ========================================
// PASSWORD SHOW / HIDE
// ========================================

passwordToggle.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        passwordToggle.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        passwordToggle.innerHTML =
            '<i class="fa-solid fa-eye"></i>';

    }

});


// ========================================
// ADMIN LOGIN
// ========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    loginError.textContent = "";


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


        console.log("LOGIN SUCCESSFUL");


        window.location.href =
            "/html/admindashboard.html";


    } 
    catch (error) {

    console.error("LOGIN ERROR:", error);


    if (error.code === "auth/invalid-credential") {

        loginError.textContent =
            "Invalid email or password.";

    } else if (error.code === "auth/network-request-failed") {

        loginError.textContent =
            "Network error. Please check your internet connection and try again.";

    } else {

        loginError.textContent =
            "Something went wrong. Please try again.";

    }

}

});