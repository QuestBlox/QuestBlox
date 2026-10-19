
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

// ==================================================
// FIREBASE INITIALIZATION
// ==================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = id => document.getElementById(id);

let creatingAccount = false;

// ==================================================
// PASSWORD SHOW / HIDE
// ==================================================

document.querySelectorAll("[data-toggle-password]").forEach(button => {

  button.addEventListener("click", () => {

    const input = $(button.dataset.togglePassword);

    if (!input) return;

    const isCurrentlyHidden = input.type === "password";

    input.type = isCurrentlyHidden
      ? "text"
      : "password";

    button.textContent = isCurrentlyHidden
      ? "Hide"
      : "Show";

    button.setAttribute(
      "aria-pressed",
      String(isCurrentlyHidden)
    );

    const isConfirmation =
      input.id === "authConfirm";

    button.setAttribute(
      "aria-label",
      `${isCurrentlyHidden ? "Hide" : "Show"} ${
        isConfirmation ? "confirmation password" : "password"
      }`
    );

  });

});

// ==================================================
// LOGIN / REGISTRATION TABS
// ==================================================

function switchMode(signup) {

  creatingAccount = signup;

  $("usernameField").hidden = !signup;
  $("confirmField").hidden = !signup;

  $("authUsername").required = signup;
  $("authConfirm").required = signup;

  $("authSubmit").textContent = signup
    ? "Create Account"
    : "Sign In";

  $("tabLogin").classList.toggle(
    "selected",
    !signup
  );

  $("tabSignup").classList.toggle(
    "selected",
    signup
  );

  $("resetPassword").hidden = signup;

  $("authPassword").autocomplete = signup
    ? "new-password"
    : "current-password";

  // Always conceal passwords when switching tabs.

  for (const id of ["authPassword", "authConfirm"]) {

    const input = $(id);

    if (!input) continue;

    input.type = "password";

    const button = document.querySelector(
      `[data-toggle-password="${id}"]`
    );

    if (button) {

      button.textContent = "Show";

      button.setAttribute(
        "aria-pressed",
        "false"
      );

      button.setAttribute(
        "aria-label",
        id === "authConfirm"
          ? "Show confirmation password"
          : "Show password"
      );

    }

  }

  $("authMessage").textContent = "";

}

$("tabLogin").addEventListener(
  "click",
  () => switchMode(false)
);

$("tabSignup").addEventListener(
  "click",
  () => switchMode(true)
);

// ==================================================
// KEEP PLAYERS SIGNED IN
// ==================================================

const persistenceReady = setPersistence(
  auth,
  browserLocalPersistence
).catch(error => {

  console.error(
    "Firebase persistence error:",
    error
  );

  throw error;

});

// ==================================================
// AUTHENTICATION STATE
// ==================================================

onAuthStateChanged(auth, user => {

  $("authGate").hidden = Boolean(user);

  $("siteShell").hidden = !user;

  $("accountName").textContent = user
    ? (
        user.displayName ||
        user.email ||
        "Player"
      )
    : "";

});

// ==================================================
// REGISTER / SIGN IN
// ==================================================

$("authForm").addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email = $("authEmail").value.trim();

    const password = $("authPassword").value;

    $("authSubmit").disabled = true;

    $("authMessage").textContent =
      "Please wait...";

    try {

      await persistenceReady;

      if (creatingAccount) {

        const username =
          $("authUsername").value.trim();

        const confirmation =
          $("authConfirm").value;

        if (
          !/^[A-Za-z0-9_]{3,20}$/.test(username)
        ) {

          throw new Error(
            "Username must have 3–20 letters, numbers or underscores."
          );

        }

        if (password !== confirmation) {

          throw new Error(
            "Passwords do not match."
          );

        }

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        await updateProfile(result.user, {
          displayName: username
        });

        $("accountName").textContent =
          username;

      } else {

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      }

      $("authForm").reset();

      $("authMessage").textContent = "";

    } catch (error) {

      console.error(
        "Authentication error:",
        error
      );

      const messages = {

        "auth/email-already-in-use":
          "That email is already registered.",

        "auth/invalid-email":
          "Please enter a valid email address.",

        "auth/invalid-credential":
          "Incorrect email or password.",

        "auth/weak-password":
          "Please choose a stronger password.",

        "auth/too-many-requests":
          "Too many attempts. Try again later.",

        "auth/network-request-failed":
          "Network error. Check your internet connection."

      };

      $("authMessage").textContent =
        messages[error.code] ||
        error.message ||
        "Something went wrong. Please try again.";

    } finally {

      $("authSubmit").disabled = false;

    }

  }
);

// ==================================================
// PASSWORD RESET
// ==================================================

$("resetPassword").addEventListener(
  "click",
  async () => {

    const email =
      $("authEmail").value.trim();

    if (!email) {

      $("authMessage").textContent =
        "Enter your email address first.";

      return;

    }

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      $("authMessage").textContent =
        "If an account exists, a reset email will be sent.";

    } catch (error) {

      console.error(
        "Password reset error:",
        error
      );

      $("authMessage").textContent =
        "Unable to send a reset email. Please try again.";

    }

  }
);

// ==================================================
// SIGN OUT
// ==================================================

$("signOut").addEventListener(
  "click",
  async () => {

    try {

      await signOut(auth);

    } catch (error) {

      console.error(
        "Sign out error:",
        error
      );

      alert(
        "Unable to sign out. Please try again."
      );

    }

  }
);

// ==================================================
// INITIAL SCREEN
// ==================================================

switchMode(false);
