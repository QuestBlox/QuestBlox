
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
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// ===============================================
// FIREBASE
// ===============================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);

let creatingAccount = false;
let busy = false;

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

// ===============================================
// USERNAME HELPERS
// ===============================================

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function validateUsername(username) {
  return USERNAME_PATTERN.test(username);
}

function usernameReference(username) {
  return doc(
    db,
    "usernames",
    normalizeUsername(username)
  );
}

function profileReference(uid) {
  return doc(db, "users", uid);
}

function readableError(error) {
  const messages = {
    "auth/email-already-in-use":
      "That email address is already registered.",

    "auth/invalid-email":
      "Please enter a valid email address.",

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/weak-password":
      "Please choose a stronger password.",

    "auth/too-many-requests":
      "Too many attempts. Try again later.",

    "auth/network-request-failed":
      "Network error. Check your internet connection.",

    "permission-denied":
      "That username may already be taken, or your account setup was rejected. Try another username.",

    "unavailable":
      "The database is temporarily unavailable. Try again."
  };

  return (
    messages[error.code] ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

// ===============================================
// PASSWORD SHOW / HIDE
// ===============================================

document.querySelectorAll(
  "[data-toggle-password]"
).forEach(button => {

  button.addEventListener("click", () => {
    const input = $(button.dataset.togglePassword);

    if (!input) return;

    const show = input.type === "password";

    input.type = show ? "text" : "password";

    button.textContent = show ? "Hide" : "Show";

    button.setAttribute(
      "aria-pressed",
      String(show)
    );

    const label = input.id === "authConfirm"
      ? "confirmation password"
      : "password";

    button.setAttribute(
      "aria-label",
      `${show ? "Hide" : "Show"} ${label}`
    );
  });

});

// ===============================================
// LOGIN / REGISTRATION TABS
// ===============================================

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

  // Reset password visibility whenever tabs change.

  for (const id of ["authPassword", "authConfirm"]) {
    const input = $(id);

    if (!input) continue;

    input.type = "password";

    const button = document.querySelector(
      `[data-toggle-password="${id}"]`
    );

    if (!button) continue;

    button.textContent = "Show";
    button.setAttribute("aria-pressed", "false");

    button.setAttribute(
      "aria-label",
      id === "authConfirm"
        ? "Show confirmation password"
        : "Show password"
    );
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

// ===============================================
// FIRESTORE USERNAME RESERVATION
// ===============================================

// Creates BOTH records in a single atomic batch.
//
// usernames/{lowercaseUsername}
// users/{firebaseAuthUID}
//
// Firestore rules enforce that neither record can
// be created alone and that both match the same UID.

async function reserveUsername(user, username) {
  const cleanUsername = username.trim();

  if (!validateUsername(cleanUsername)) {
    throw new Error(
      "Username must contain 3–20 letters, numbers or underscores."
    );
  }

  const usernameKey = normalizeUsername(cleanUsername);

  const usernameRef = usernameReference(cleanUsername);
  const profileRef = profileReference(user.uid);

  // This is only an early user-friendly check.
  // The security rules enforce uniqueness during commit.
  const existing = await getDoc(usernameRef);

  if (existing.exists()) {
    throw new Error(
      "That username is already taken. Please choose another."
    );
  }

  const batch = writeBatch(db);

  batch.set(usernameRef, {
    uid: user.uid,
    username: cleanUsername,
    usernameKey,
    createdAt: serverTimestamp()
  });

  batch.set(profileRef, {
    uid: user.uid,
    username: cleanUsername,
    usernameKey,
    createdAt: serverTimestamp()
  });

  await batch.commit();

  return cleanUsername;
}

// ===============================================
// EXISTING ACCOUNT MIGRATION
// ===============================================

// Older QuestBlox accounts may have a Firebase Auth
// displayName but no Firestore username reservation.
//
// This attempts to reserve their existing name.
// It never changes or overwrites another player's
// username reservation.

async function ensureExistingProfile(user) {
  const profileRef = profileReference(user.uid);

  const profile = await getDoc(profileRef);

  if (profile.exists()) {
    return profile.data().username;
  }

  const oldUsername = (user.displayName || "").trim();

  if (!validateUsername(oldUsername)) {
    throw new Error(
      "Your older account needs a valid username. Contact the QuestBlox administrator before continuing."
    );
  }

  try {
    return await reserveUsername(user, oldUsername);

  } catch (error) {
    if (
      error.code === "permission-denied" ||
      error.message?.includes("already taken")
    ) {
      throw new Error(
        "Your existing username could not be reserved. It may already belong to another account. Contact the QuestBlox administrator."
      );
    }

    throw error;
  }
}

// ===============================================
// PERSISTENT LOGIN
// ===============================================

const persistenceReady = setPersistence(
  auth,
  browserLocalPersistence
).catch(error => {
  console.error("Persistence error:", error);
  throw error;
});

// ===============================================
// AUTHENTICATION STATE
// ===============================================

onAuthStateChanged(auth, async user => {
  if (!user) {
    $("authGate").hidden = false;
    $("siteShell").hidden = true;
    $("accountName").textContent = "";
    return;
  }

  $("accountName").textContent =
    user.displayName || user.email || "Player";

  $("authGate").hidden = true;
  $("siteShell").hidden = false;

  // Existing-account migration is attempted only
  // after a player has authenticated successfully.

  try {
    const username = await ensureExistingProfile(user);

    if (auth.currentUser?.uid === user.uid) {
      $("accountName").textContent = username;
    }

  } catch (error) {
    console.error(
      "Profile reservation issue:",
      error
    );

    if (auth.currentUser?.uid === user.uid) {
      $("accountName").textContent =
        user.displayName || "Player";

      // Do not sign the player out or delete an
      // existing account because of a migration issue.
      alert(error.message);
    }
  }
});

// ===============================================
// REGISTER / SIGN IN
// ===============================================

$("authForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    if (busy) return;

    busy = true;

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;

    $("authSubmit").disabled = true;
    $("authMessage").textContent = "Please wait...";

    try {
      await persistenceReady;

      if (creatingAccount) {
        const username = $("authUsername").value.trim();
        const confirmation = $("authConfirm").value;

        if (!validateUsername(username)) {
          throw new Error(
            "Username must contain 3–20 letters, numbers or underscores."
          );
        }

        if (password !== confirmation) {
          throw new Error("Passwords do not match.");
        }

        // Early check before creating an Auth account.

        const usernameDoc = await getDoc(
          usernameReference(username)
        );

        if (usernameDoc.exists()) {
          throw new Error(
            "That username is already taken. Choose another."
          );
        }

        // Firebase Auth enforces email uniqueness.

        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        // A newly created Firebase Auth account is
        // now available. Reserve the username securely.

        try {
          const reservedUsername =
            await reserveUsername(
              result.user,
              username
            );

          await updateProfile(result.user, {
            displayName: reservedUsername
          });

          $("accountName").textContent =
            reservedUsername;

        } catch (reservationError) {
          console.error(
            "Username reservation error:",
            reservationError
          );

          // Do not delete a newly created account
          // automatically: a network interruption may
          // leave the outcome of the Firestore commit
          // uncertain. Keep the account recoverable.

          throw new Error(
            "Your authentication account was created, but username setup could not be completed. Sign in again with the same email and password. If the problem continues, contact the QuestBlox administrator."
          );
        }

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

      $("authMessage").textContent =
        readableError(error);

    } finally {
      busy = false;
      $("authSubmit").disabled = false;
    }
  }
);

// ===============================================
// PASSWORD RESET
// ===============================================

$("resetPassword").addEventListener(
  "click",
  async () => {
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

    } catch (error) {
      console.error(error);

      $("authMessage").textContent =
        "Unable to send a reset email. Please try again.";
    }
  }
);

// ===============================================
// SIGN OUT
// ===============================================

$("signOut").addEventListener(
  "click",
  async () => {
    try {
      await signOut(auth);

    } catch (error) {
      console.error(error);

      alert(
        "Unable to sign out. Please try again."
      );
    }
  }
);

// ===============================================
// INITIAL MODE
// ===============================================

switchMode(false);
