
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

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

import {
  getFirestore,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// ============================================
// FIREBASE
// ============================================

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);

const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;

let creatingAccount = false;
let busy = false;
let registrationInProgress = false;
let authStateVersion = 0;

// ============================================
// HELPERS
// ============================================

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function validUsername(username) {
  return USERNAME_PATTERN.test(username);
}

function usernameRef(username) {
  return doc(
    db,
    "usernames",
    normalizeUsername(username)
  );
}

function profileRef(uid) {
  return doc(db, "users", uid);
}

function message(text) {
  $("authMessage").textContent = text;
}

function showWebsite(username) {
  $("accountName").textContent = username || "Player";
  $("authGate").hidden = true;
  $("siteShell").hidden = false;
}

function showLogin() {
  $("authGate").hidden = false;
  $("siteShell").hidden = true;
  $("accountName").textContent = "";
}

function readableError(error) {
  const messages = {
    "auth/email-already-in-use":
      "That email address is already registered.",

    "auth/invalid-email":
      "Enter a valid email address.",

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/weak-password":
      "Choose a stronger password.",

    "auth/too-many-requests":
      "Too many attempts. Try again later.",

    "auth/network-request-failed":
      "Network error. Check your connection.",

    "permission-denied":
      "The database rejected account setup. Check the published Firestore rules.",

    "unavailable":
      "The database is temporarily unavailable."
  };

  return messages[error.code] ||
    error.message ||
    "Something went wrong. Please try again.";
}

// ============================================
// PASSWORD SHOW / HIDE
// ============================================

function resetPasswordVisibility() {
  for (const id of ["authPassword", "authConfirm"]) {
    const input = $(id);

    const button = document.querySelector(
      `[data-toggle-password="${id}"]`
    );

    if (!input || !button) continue;

    input.type = "password";
    button.textContent = "Show";

    button.setAttribute("aria-pressed", "false");

    button.setAttribute(
      "aria-label",
      id === "authConfirm"
        ? "Show confirmation password"
        : "Show password"
    );
  }
}

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

// ============================================
// LOGIN / SIGNUP TABS
// ============================================

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

  resetPasswordVisibility();
  message("");
}

$("tabLogin").addEventListener(
  "click",
  () => switchMode(false)
);

$("tabSignup").addEventListener(
  "click",
  () => switchMode(true)
);

// ============================================
// ATOMIC USERNAME RESERVATION
// ============================================

async function reserveUsername(user, username) {
  const clean = username.trim();

  if (!validUsername(clean)) {
    throw new Error(
      "Username must contain 3–20 letters, numbers or underscores."
    );
  }

  const key = normalizeUsername(clean);

  const nameDocument = usernameRef(clean);
  const userDocument = profileRef(user.uid);

  const existing = await getDoc(nameDocument);

  if (existing.exists()) {
    throw new Error(
      "That username is already taken."
    );
  }

  const batch = writeBatch(db);

  batch.set(nameDocument, {
    uid: user.uid,
    username: clean,
    usernameKey: key,
    createdAt: serverTimestamp()
  });

  batch.set(userDocument, {
    uid: user.uid,
    username: clean,
    usernameKey: key,
    createdAt: serverTimestamp()
  });

  await batch.commit();

  return clean;
}

// ============================================
// EXISTING ACCOUNT SUPPORT
// ============================================

async function ensureProfile(user) {
  const existing = await getDoc(
    profileRef(user.uid)
  );

  if (existing.exists()) {
    return existing.data().username;
  }

  const oldUsername = (
    user.displayName || ""
  ).trim();

  if (!validUsername(oldUsername)) {
    throw new Error(
      "Your account does not have a completed QuestBlox username profile. Contact the QuestBlox administrator."
    );
  }

  // Only older accounts with a valid displayName
  // are eligible for this migration.

  return await reserveUsername(
    user,
    oldUsername
  );
}

// ============================================
// PERSISTENT LOGIN
// ============================================

const persistenceReady = setPersistence(
  auth,
  browserLocalPersistence
);

// ============================================
// AUTH STATE
// ============================================

onAuthStateChanged(auth, async user => {
  const version = ++authStateVersion;

  if (!user) {
    showLogin();
    return;
  }

  // Firebase Auth can emit its first signup event
  // before the Firestore batch has completed.
  // The registration handler finishes that work.

  if (registrationInProgress) {
    return;
  }

  try {
    const username = await ensureProfile(user);

    if (
      version !== authStateVersion ||
      auth.currentUser?.uid !== user.uid
    ) return;

    showWebsite(username);

  } catch (error) {
    console.error(
      "QuestBlox profile error:",
      error
    );

    if (
      version !== authStateVersion ||
      auth.currentUser?.uid !== user.uid
    ) return;

    // Keep the account recoverable rather than
    // automatically deleting its Auth record.

    showWebsite(
      user.displayName || "Player"
    );

    alert(error.message);
  }
});

// ============================================
// REGISTER / SIGN IN
// ============================================

$("authForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    if (busy) return;

    busy = true;

    const signup = creatingAccount;

    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;

    $("authSubmit").disabled = true;
    message("Please wait...");

    try {
      await persistenceReady;

      if (signup) {
        const username = $("authUsername").value.trim();

        const confirmation =
          $("authConfirm").value;

        if (!validUsername(username)) {
          throw new Error(
            "Username must contain 3–20 letters, numbers or underscores."
          );
        }

        if (password !== confirmation) {
          throw new Error(
            "Passwords do not match."
          );
        }

        // Availability check before creating
        // the Firebase Auth account.

        const nameSnapshot = await getDoc(
          usernameRef(username)
        );

        if (nameSnapshot.exists()) {
          throw new Error(
            "That username is already taken."
          );
        }

        registrationInProgress = true;

        let createdUser = null;

        try {
          const credential =
            await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

          createdUser = credential.user;

          const reservedName =
            await reserveUsername(
              createdUser,
              username
            );

          await updateProfile(createdUser, {
            displayName: reservedName
          });

          showWebsite(reservedName);

        } catch (error) {
          if (createdUser) {
            // Never automatically delete the account:
            // an interrupted Firestore commit can
            // leave an uncertain outcome.

            throw new Error(
              "Your authentication account was created, but profile setup may be incomplete. Sign in again using the same email and password. If this continues, contact the QuestBlox administrator."
            );
          }

          throw error;

        } finally {
          registrationInProgress = false;
        }

      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      }

      $("authForm").reset();
      message("");

    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      message(readableError(error));

    } finally {
      registrationInProgress = false;
      busy = false;
      $("authSubmit").disabled = false;
    }
  }
);

// ============================================
// PASSWORD RESET
// ============================================

$("resetPassword").addEventListener(
  "click",
  async () => {
    const email = $("authEmail").value.trim();

    if (!email) {
      message("Enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      message(
        "If an account exists, a reset email will be sent."
      );

    } catch (error) {
      console.error(error);

      message(
        "Unable to send a reset email. Try again."
      );
    }
  }
);

// ============================================
// SIGN OUT
// ============================================

$("signOut").addEventListener(
  "click",
  async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to sign out. Try again."
      );
    }
  }
);

// ============================================
// INITIAL MODE
// ============================================

switchMode(false);
