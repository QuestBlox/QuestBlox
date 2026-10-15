
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

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
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const $ = id => document.getElementById(id);

let creatingAccount = false;

setPersistence(auth, browserLocalPersistence).catch(error => {
  $("authMessage").textContent =
    "Persistent login is unavailable in this browser.";
  console.error(error);
});

function switchMode(signup) {
  creatingAccount = signup;

  $("usernameField").hidden = !signup;
  $("confirmField").hidden = !signup;

  $("authUsername").required = signup;
  $("authConfirm").required = signup;

  $("authSubmit").textContent =
    signup ? "Create Account" : "Sign In";

  $("tabLogin").classList.toggle("selected", !signup);
  $("tabSignup").classList.toggle("selected", signup);

  $("resetPassword").hidden = signup;

  $("authPassword").autocomplete =
    signup ? "new-password" : "current-password";

  $("authMessage").textContent = "";
}

$("tabLogin").onclick = () => switchMode(false);
$("tabSignup").onclick = () => switchMode(true);

onAuthStateChanged(auth, user => {
  $("authGate").hidden = Boolean(user);
  $("siteShell").hidden = !user;

  if (user) {
    $("accountName").textContent =
      user.displayName || user.email;
  } else {
    $("accountName").textContent = "";
  }
});

$("authForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("authEmail").value.trim();
  const password = $("authPassword").value;

  $("authSubmit").disabled = true;
  $("authMessage").textContent = "Please wait...";

  try {
    if (creatingAccount) {
      const username = $("authUsername").value.trim();
      const confirmation = $("authConfirm").value;

      if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
        throw new Error(
          "Username must contain 3–20 letters, numbers or underscores."
        );
      }

      if (password !== confirmation) {
        throw new Error("Passwords do not match.");
      }

      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: username
      });

      $("accountName").textContent = username;

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
    console.error(error.code || error.message);

    const messages = {
      "auth/email-already-in-use":
        "An account already exists with this email.",

      "auth/invalid-email":
        "Enter a valid email address.",

      "auth/invalid-credential":
        "Incorrect email or password.",

      "auth/weak-password":
        "Please choose a stronger password.",

      "auth/too-many-requests":
        "Too many attempts. Please try again later."
    };

    $("authMessage").textContent =
      messages[error.code] ||
      error.message ||
      "Something went wrong. Please try again.";

  } finally {
    $("authSubmit").disabled = false;
  }
});

$("resetPassword").onclick = async () => {
  const email = $("authEmail").value.trim();

  if (!email) {
    $("authMessage").textContent =
      "Enter your email address first.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    $("authMessage").textContent =
      "If an account exists, a reset email will be sent.";

  } catch {
    $("authMessage").textContent =
      "Unable to send reset email. Please try again.";
  }
};

$("signOut").onclick = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
    alert("Unable to sign out. Please try again.");
  }
};
