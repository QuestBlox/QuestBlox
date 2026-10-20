
/*
  QUESTBLOX TASK 4 — FRIENDS SYSTEM

  Works with the existing classic social.js script tag.
  Firebase Spark / Browser SDK 12.4.0

  Features:
  - Case-insensitive exact username search
  - Send friend requests
  - Receive requests
  - Accept or decline requests
  - Cancel outgoing requests
  - Remove friends
  - Live Firestore updates

  Does NOT award XP.
*/

(async function () {
  "use strict";

  // ==========================================
  // FIREBASE IMPORTS
  // ==========================================

  const [
    firebaseApp,
    firebaseAuth,
    firestore
  ] = await Promise.all([
    import(
      "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js"
    ),

    import(
      "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
    ),

    import(
      "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
    )
  ]);

  const { firebaseConfig } =
    await import("./firebase-config.js");

  const app = firebaseApp.getApps().length
    ? firebaseApp.getApp()
    : firebaseApp.initializeApp(firebaseConfig);

  const auth = firebaseAuth.getAuth(app);
  const db = firestore.getFirestore(app);

  const {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
  } = firestore;

  // ==========================================
  // EXISTING HTML ELEMENTS
  // ==========================================

  const $ = id => document.getElementById(id);

  const searchInput = $("friendSearch");
  const searchButton = $("friendSearchBtn");
  const searchResults = $("friendSearchResults");

  const friendsList = $("friendsList");

  const incomingList = $(
    "receivedFriendRequests"
  );

  const outgoingList = $(
    "sentFriendRequests"
  );

  const requestCount = $("friendRequestCount");
  const friendTotal = $("friendTotal");
  const notice = $("friendNotice");

  // ==========================================
  // STATE
  // ==========================================

  let currentUser = null;
  let relationships = [];

  let unsubscribeFriends = null;

  let authVersion = 0;
  let actionBusy = false;

  // ==========================================
  // HELPERS
  // ==========================================

  function notify(text) {
    if (notice) {
      notice.textContent = text;
    }
  }

  function make(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function showEmpty(container, text) {
    if (!container) return;

    container.replaceChildren(
      make("p", "friends-muted", text)
    );
  }

  function sortedMembers(uidA, uidB) {
    return [uidA, uidB].sort();
  }

  function friendshipID(uidA, uidB) {
    return sortedMembers(
      uidA,
      uidB
    ).join("_");
  }

  function friendshipRef(uidA, uidB) {
    return doc(
      db,
      "friendships",
      friendshipID(uidA, uidB)
    );
  }

  function otherPerson(item) {
    if (!currentUser) return null;

    if (item.senderUid === currentUser.uid) {
      return {
        uid: item.receiverUid,
        username: item.receiverUsername
      };
    }

    return {
      uid: item.senderUid,
      username: item.senderUsername
    };
  }

  function findRelationship(uid) {
    return relationships.find(
      item =>
        Array.isArray(item.members) &&
        item.members.includes(uid)
    ) || null;
  }

  function makeButton(label, callback) {
    const button = make(
      "button",
      "friends-home-btn",
      label
    );

    button.type = "button";

    button.addEventListener(
      "click",
      async () => {
        if (actionBusy) return;

        actionBusy = true;
        button.disabled = true;

        try {
          await callback();

        } catch (error) {
          console.error(
            "QuestBlox Friends:",
            error
          );

          notify(
            error.code === "permission-denied"
              ? "The database rejected this action. Refresh and try again."
              : "This action could not be completed. Try again."
          );

        } finally {
          actionBusy = false;
          button.disabled = false;
        }
      }
    );

    return button;
  }

  function playerCard(
    username,
    subtitle,
    buttons = []
  ) {
    const card = make(
      "div",
      "friends-player"
    );

    const avatar = make(
      "div",
      "friends-avatar",
      (username || "?").charAt(0).toUpperCase()
    );

    const info = make(
      "div",
      "friends-player-info"
    );

    const name = make(
      "strong",
      "",
      username || "Player"
    );

    const detail = make(
      "small",
      "",
      subtitle
    );

    info.append(name, detail);

    card.append(
      avatar,
      info,
      ...buttons
    );

    return card;
  }

  // ==========================================
  // SEND FRIEND REQUEST
  // ==========================================

  async function sendRequest(player) {
    const user = currentUser;

    if (!user) {
      notify("Sign in first.");
      return;
    }

    if (user.uid === player.uid) {
      notify("You cannot add yourself.");
      return;
    }

    const profileSnapshot = await getDoc(
      doc(db, "users", user.uid)
    );

    if (!profileSnapshot.exists()) {
      notify(
        "Your QuestBlox profile is not ready."
      );

      return;
    }

    const profile = profileSnapshot.data();

    if (currentUser?.uid !== user.uid) {
      return;
    }

    const reference = friendshipRef(
      user.uid,
      player.uid
    );

    // A relationship uses one deterministic
    // document ID per pair of players.

    await setDoc(reference, {
      members: sortedMembers(
        user.uid,
        player.uid
      ),

      senderUid: user.uid,
      receiverUid: player.uid,

      senderUsername: profile.username,
      receiverUsername: player.username,

      status: "pending",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    notify(
      `Friend request sent to ${player.username}.`
    );

    if (searchInput) {
      searchInput.value = "";
    }

    showEmpty(
      searchResults,
      "Request sent. Check your Sent tab."
    );
  }

  // ==========================================
  // ACCEPT REQUEST
  // ==========================================

  async function acceptRequest(item) {
    if (
      !currentUser ||
      item.receiverUid !== currentUser.uid ||
      item.status !== "pending"
    ) return;

    await updateDoc(
      doc(db, "friendships", item.id),
      {
        status: "accepted",
        updatedAt: serverTimestamp()
      }
    );

    notify("Friend request accepted.");
  }

  // ==========================================
  // REMOVE / DECLINE / CANCEL
  // ==========================================

  async function removeRelationship(item) {
    if (
      !currentUser ||
      !item.members.includes(currentUser.uid)
    ) return;

    await deleteDoc(
      doc(db, "friendships", item.id)
    );

    notify("Friend relationship updated.");
  }

  // ==========================================
  // SEARCH PLAYER
  // ==========================================

  async function searchPlayer() {
    const user = currentUser;

    if (!user) {
      notify("Sign in to search for players.");
      return;
    }

    const username = (
      searchInput?.value || ""
    ).trim();

    if (
      !/^[A-Za-z0-9_]{3,20}$/.test(username)
    ) {
      notify(
        "Enter a valid username (3–20 letters, numbers or underscores)."
      );

      return;
    }

    const version = authVersion;

    searchButton.disabled = true;

    notify("");

    showEmpty(
      searchResults,
      "Searching..."
    );

    try {
      const usernameKey = username.toLowerCase();

      const snapshot = await getDoc(
        doc(
          db,
          "usernames",
          usernameKey
        )
      );

      if (
        version !== authVersion ||
        currentUser?.uid !== user.uid
      ) return;

      if (!snapshot.exists()) {
        showEmpty(
          searchResults,
          "No player found."
        );

        return;
      }

      const player = snapshot.data();

      if (
        typeof player.uid !== "string" ||
        typeof player.username !== "string"
      ) {
        showEmpty(
          searchResults,
          "Player information unavailable."
        );

        return;
      }

      if (player.uid === user.uid) {
        showEmpty(
          searchResults,
          "That's your own QuestBlox account."
        );

        return;
      }

      // Check the current document directly,
      // rather than relying on a potentially
      // delayed live-listener snapshot.

      const relationshipSnapshot =
        await getDoc(
          friendshipRef(
            user.uid,
            player.uid
          )
        );

      if (
        version !== authVersion ||
        currentUser?.uid !== user.uid
      ) return;

      let subtitle = "QuestBlox player";
      let buttons = [];

      if (relationshipSnapshot.exists()) {
        const relationship =
          relationshipSnapshot.data();

        if (relationship.status === "accepted") {
          subtitle = "Already friends";

        } else if (
          relationship.senderUid === user.uid
        ) {
          subtitle = "Request already sent";

        } else {
          subtitle =
            "This player has sent you a request";
        }

      } else {
        buttons.push(
          makeButton(
            "Add Friend",
            () => sendRequest(player)
          )
        );
      }

      searchResults.replaceChildren(
        playerCard(
          player.username,
          subtitle,
          buttons
        )
      );

    } catch (error) {
      console.error(
        "QuestBlox player search:",
        error
      );

      showEmpty(
        searchResults,
        "Unable to search right now."
      );

      notify(
        "Player search failed. Check your Firestore permissions."
      );

    } finally {
      searchButton.disabled = false;
    }
  }

  // ==========================================
  // RENDER FRIENDS DASHBOARD
  // ==========================================

  function renderFriends() {
    if (!currentUser) return;

    const accepted = relationships.filter(
      item => item.status === "accepted"
    );

    const incoming = relationships.filter(
      item =>
        item.status === "pending" &&
        item.receiverUid === currentUser.uid
    );

    const outgoing = relationships.filter(
      item =>
        item.status === "pending" &&
        item.senderUid === currentUser.uid
    );

    if (friendTotal) {
      friendTotal.textContent =
        `${accepted.length} friend${accepted.length === 1 ? "" : "s"}`;
    }

    if (requestCount) {
      requestCount.textContent = String(
        incoming.length
      );
    }

    // MY FRIENDS

    if (friendsList) {
      friendsList.replaceChildren();

      if (!accepted.length) {
        showEmpty(
          friendsList,
          "You haven't added any friends yet."
        );
      }

      for (const item of accepted) {
        const player = otherPerson(item);

        friendsList.appendChild(
          playerCard(
            player.username,
            "QuestBlox friend",
            [
              makeButton(
                "Remove",
                () => removeRelationship(item)
              )
            ]
          )
        );
      }
    }

    // RECEIVED REQUESTS

    if (incomingList) {
      incomingList.replaceChildren();

      if (!incoming.length) {
        showEmpty(
          incomingList,
          "No incoming requests."
        );
      }

      for (const item of incoming) {
        incomingList.appendChild(
          playerCard(
            item.senderUsername,
            "Sent you a friend request",
            [
              makeButton(
                "Accept",
                () => acceptRequest(item)
              ),

              makeButton(
                "Decline",
                () => removeRelationship(item)
              )
            ]
          )
        );
      }
    }

    // SENT REQUESTS

    if (outgoingList) {
      outgoingList.replaceChildren();

      if (!outgoing.length) {
        showEmpty(
          outgoingList,
          "No pending requests."
        );
      }

      for (const item of outgoing) {
        outgoingList.appendChild(
          playerCard(
            item.receiverUsername,
            "Awaiting response",
            [
              makeButton(
                "Cancel",
                () => removeRelationship(item)
              )
            ]
          )
        );
      }
    }
  }

  // ==========================================
  // LIVE FRIENDSHIP LISTENER
  // ==========================================

  function watchFriends(user) {
    const version = authVersion;

    const friendsQuery = query(
      collection(db, "friendships"),
      where(
        "members",
        "array-contains",
        user.uid
      )
    );

    unsubscribeFriends = onSnapshot(
      friendsQuery,

      snapshot => {
        if (
          version !== authVersion ||
          currentUser?.uid !== user.uid
        ) return;

        relationships = snapshot.docs.map(
          item => ({
            id: item.id,
            ...item.data()
          })
        );

        renderFriends();
      },

      error => {
        console.error(
          "Friends listener failed:",
          error
        );

        notify(
          "Unable to load friends. Check Firestore rules."
        );
      }
    );
  }

  // ==========================================
  // SEARCH EVENTS
  // ==========================================

  /*
    Your existing index.html contains an older
    placeholder search handler registered later.

    Capture-phase listeners prevent that old
    handler from overwriting real search results.

    This lets us preserve index.html unchanged.
  */

  searchButton?.addEventListener(
    "click",
    event => {
      event.stopImmediatePropagation();
      searchPlayer();
    },
    true
  );

  searchInput?.addEventListener(
    "keydown",
    event => {
      if (event.key !== "Enter") return;

      event.preventDefault();
      event.stopImmediatePropagation();

      searchPlayer();
    },
    true
  );

  // ==========================================
  // AUTH STATE
  // ==========================================

  firebaseAuth.onAuthStateChanged(
    auth,
    user => {
      authVersion++;

      if (unsubscribeFriends) {
        unsubscribeFriends();
        unsubscribeFriends = null;
      }

      currentUser = user;
      relationships = [];

      if (!user) {
        if (friendTotal) {
          friendTotal.textContent = "0 friends";
        }

        if (requestCount) {
          requestCount.textContent = "0";
        }

        showEmpty(
          friendsList,
          "Sign in to see your friends."
        );

        showEmpty(
          incomingList,
          "Sign in to see requests."
        );

        showEmpty(
          outgoingList,
          "Sign in to see sent requests."
        );

        showEmpty(
          searchResults,
          "Sign in to search for players."
        );

        notify("");
        return;
      }

      showEmpty(
        friendsList,
        "Loading friends..."
      );

      showEmpty(
        incomingList,
        "Loading requests..."
      );

      showEmpty(
        outgoingList,
        "Loading sent requests..."
      );

      watchFriends(user);
    }
  );

})().catch(error => {
  console.error(
    "QuestBlox social.js failed to initialize:",
    error
  );

  const notice = document.getElementById(
    "friendNotice"
  );

  if (notice) {
    notice.textContent =
      "The Friends system could not start. Check your connection and Firebase configuration.";
  }
});
