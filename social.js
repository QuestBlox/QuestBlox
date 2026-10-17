
/*
  QUESTBLOX FRIENDS SYSTEM
  Uses existing Firebase Authentication.
  No URL changes. No separate website.
*/

(async function () {
  "use strict";

  const VERSION = "12.4.0";
  const BASE = `https://www.gstatic.com/firebasejs/${VERSION}`;

  const { initializeApp, getApps, getApp } =
    await import(`${BASE}/firebase-app.js`);

  const { getAuth, onAuthStateChanged } =
    await import(`${BASE}/firebase-auth.js`);

  const {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    onSnapshot,
    serverTimestamp
  } = await import(`${BASE}/firebase-firestore.js`);

  const { firebaseConfig } =
    await import("./firebase-config.js");

  const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const db = getFirestore(app);

  const $ = id => document.getElementById(id);

  const players = collection(db, "qbPlayers");
  const friendships = collection(db, "qbFriendships");

  let currentUser = null;
  let currentRelations = [];
  let unsubscribeFriends = null;
  let searchTimer = null;

  const searchInput = $("friendSearch");
  const searchButton = $("friendSearchBtn");
  const searchResults = $("friendSearchResults");
  const notice = $("friendNotice");

  function notify(message) {
    if (notice) notice.textContent = message;
  }

  function empty(container, message) {
    if (!container) return;

    container.replaceChildren();

    const p = document.createElement("p");
    p.className = "friends-muted";
    p.textContent = message;

    container.appendChild(p);
  }

  function makeButton(label, handler, danger = false) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;

    Object.assign(button.style, {
      padding: "9px 12px",
      border: "0",
      borderRadius: "9px",
      background: danger ? "#fee2e2" : "#6954ed",
      color: danger ? "#991b1b" : "#ffffff",
      cursor: "pointer",
      fontWeight: "700"
    });

    button.addEventListener("click", async () => {
      button.disabled = true;

      try {
        await handler();
      } catch (error) {
        console.error("Friends action:", error);
        notify("Action failed. Please try again.");
      } finally {
        button.disabled = false;
      }
    });

    return button;
  }

  function playerCard(name, subtitle, actions = []) {
    const card = document.createElement("div");
    card.className = "friends-player";

    const avatar = document.createElement("div");
    avatar.className = "friends-avatar";
    avatar.textContent = (name || "?")
      .slice(0, 2)
      .toUpperCase();

    const info = document.createElement("div");
    info.className = "friends-player-info";

    const strong = document.createElement("strong");
    strong.textContent = name || "Player";

    const small = document.createElement("small");
    small.textContent = subtitle;

    info.append(strong, small);
    card.append(avatar, info);

    for (const action of actions) {
      card.appendChild(action);
    }

    return card;
  }

  function relationId(a, b) {
    return [a, b].sort().join("_");
  }

  function relationWith(uid) {
    return currentRelations.find(
      r => r.participants.includes(uid)
    );
  }

  async function playerName(uid) {
    try {
      const snap = await getDoc(doc(players, uid));

      return snap.exists()
        ? snap.data().username || "Player"
        : "Player";
    } catch {
      return "Player";
    }
  }

  /*
    Create a public player directory entry.
    Only UID and username are published.
    Email addresses are NOT stored here.
  */

  async function syncMyProfile(user) {
    const username = (
      user.displayName ||
      `Player_${user.uid.slice(0, 8)}`
    ).trim();

    await setDoc(doc(players, user.uid), {
      uid: user.uid,
      username,
      usernameKey: username.toLowerCase(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  /*
    SEARCH PLAYERS
    Current Firebase display names are not guaranteed unique.
    Multiple matching accounts can therefore appear.
  */

  async function searchPlayers() {
    if (!currentUser) {
      notify("Sign in to search for friends.");
      return;
    }

    const username = searchInput.value.trim();

    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      notify(
        "Enter 3–20 letters, numbers or underscores."
      );
      return;
    }

    searchButton.disabled = true;
    notify("Searching...");
    empty(searchResults, "Searching players...");

    try {
      const q = query(
        players,
        where("usernameKey", "==", username.toLowerCase()),
        limit(10)
      );

      const results = await getDocs(q);

      searchResults.replaceChildren();

      let count = 0;

      for (const result of results.docs) {
        const player = result.data();

        if (player.uid === currentUser.uid) continue;

        count++;

        const relation = relationWith(player.uid);

        let actions = [];
        let subtitle = "QuestBlox player";

        if (!relation) {
          actions = [
            makeButton("Add Friend", () =>
              sendRequest(player.uid)
            )
          ];
        } else if (relation.status === "accepted") {
          subtitle = "Already friends";
        } else if (relation.status === "pending") {
          subtitle =
            relation.senderId === currentUser.uid
              ? "Request sent"
              : "Sent you a friend request";
        }

        searchResults.appendChild(
          playerCard(
            player.username,
            subtitle,
            actions
          )
        );
      }

      if (!count) {
        empty(searchResults, "No matching players found.");
      }

      notify(
        count
          ? `${count} matching player(s) found.`
          : "No players found with that username."
      );

    } catch (error) {
      console.error("Player search:", error);

      empty(
        searchResults,
        "Unable to search players. Check database permissions."
      );

      notify("Player search failed.");
    } finally {
      searchButton.disabled = false;
    }
  }

  /*
    SEND FRIEND REQUEST
  */

  async function sendRequest(targetUid) {
    if (!currentUser) throw Error("Not signed in");

    if (targetUid === currentUser.uid) {
      notify("You cannot add yourself.");
      return;
    }

    const target = await getDoc(doc(players, targetUid));

    if (!target.exists()) {
      notify("That player is no longer available.");
      return;
    }

    const id = relationId(currentUser.uid, targetUid);
    const ref = doc(friendships, id);

    const existing = await getDoc(ref);

    if (existing.exists()) {
      notify("A friend request or friendship already exists.");
      return;
    }

    await setDoc(ref, {
      participants: [currentUser.uid, targetUid].sort(),
      senderId: currentUser.uid,
      receiverId: targetUid,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    notify("Friend request sent!");

    await searchPlayers();
  }

  /*
    ACCEPT / DECLINE / CANCEL / REMOVE
  */

  async function acceptRequest(relation) {
    if (
      !currentUser ||
      relation.receiverId !== currentUser.uid ||
      relation.status !== "pending"
    ) return;

    await updateDoc(
      doc(friendships, relation.id),
      {
        status: "accepted",
        updatedAt: serverTimestamp()
      }
    );

    notify("Friend request accepted!");
  }

  async function declineRequest(relation) {
    if (
      !currentUser ||
      relation.receiverId !== currentUser.uid ||
      relation.status !== "pending"
    ) return;

    await deleteDoc(doc(friendships, relation.id));

    notify("Friend request declined.");
  }

  async function cancelRequest(relation) {
    if (
      !currentUser ||
      relation.senderId !== currentUser.uid ||
      relation.status !== "pending"
    ) return;

    await deleteDoc(doc(friendships, relation.id));

    notify("Friend request cancelled.");
  }

  async function removeFriend(relation) {
    if (
      !currentUser ||
      relation.status !== "accepted" ||
      !relation.participants.includes(currentUser.uid)
    ) return;

    if (!confirm("Remove this player from your friends?")) {
      return;
    }

    await deleteDoc(doc(friendships, relation.id));

    notify("Friend removed.");
  }

  /*
    LIVE FRIENDS DASHBOARD
  */

  async function renderFriends() {
    if (!currentUser) return;

    const myUid = currentUser.uid;

    const accepted = currentRelations.filter(
      r => r.status === "accepted"
    );

    const incoming = currentRelations.filter(
      r =>
        r.status === "pending" &&
        r.receiverId === myUid
    );

    const outgoing = currentRelations.filter(
      r =>
        r.status === "pending" &&
        r.senderId === myUid
    );

    $("friendTotal").textContent =
      `${accepted.length} friend(s)`;

    $("friendRequestCount").textContent =
      String(incoming.length);

    const friendsList = $("friendsList");
    const receivedList = $("receivedFriendRequests");
    const sentList = $("sentFriendRequests");

    friendsList.replaceChildren();
    receivedList.replaceChildren();
    sentList.replaceChildren();

    for (const relation of accepted) {
      const otherUid = relation.participants.find(
        uid => uid !== myUid
      );

      const name = await playerName(otherUid);

      if (currentUser?.uid !== myUid) return;

      friendsList.appendChild(
        playerCard(name, "Friend", [
          makeButton(
            "Remove",
            () => removeFriend(relation),
            true
          )
        ])
      );
    }

    for (const relation of incoming) {
      const name = await playerName(relation.senderId);

      if (currentUser?.uid !== myUid) return;

      receivedList.appendChild(
        playerCard(name, "Incoming request", [
          makeButton(
            "Accept",
            () => acceptRequest(relation)
          ),
          makeButton(
            "Decline",
            () => declineRequest(relation),
            true
          )
        ])
      );
    }

    for (const relation of outgoing) {
      const name = await playerName(relation.receiverId);

      if (currentUser?.uid !== myUid) return;

      sentList.appendChild(
        playerCard(name, "Awaiting response", [
          makeButton(
            "Cancel",
            () => cancelRequest(relation),
            true
          )
        ])
      );
    }

    if (!accepted.length) {
      empty(friendsList, "You haven't added any friends yet.");
    }

    if (!incoming.length) {
      empty(receivedList, "No incoming friend requests.");
    }

    if (!outgoing.length) {
      empty(sentList, "No pending sent requests.");
    }
  }

  /*
    FRIENDS TABS
  */

  const tabs = {
    all: "friendsAll",
    requests: "friendsRequests",
    sent: "friendsSent"
  };

  document.querySelectorAll("[data-friend-tab]")
    .forEach(button => {
      button.addEventListener("click", () => {
        const selected = button.dataset.friendTab;

        document.querySelectorAll("[data-friend-tab]")
          .forEach(tab => {
            tab.classList.toggle(
              "active",
              tab.dataset.friendTab === selected
            );
          });

        Object.entries(tabs).forEach(([key, id]) => {
          const panel = $(id);

          if (panel) panel.hidden = key !== selected;
        });
      });
    });

  /*
    SEARCH BUTTON
  */

  if (searchButton && searchInput) {
    searchButton.addEventListener("click", searchPlayers);

    searchInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        searchPlayers();
      }
    });
  }

  /*
    AUTHENTICATION CONNECTION
  */

  onAuthStateChanged(auth, async user => {
    if (unsubscribeFriends) {
      unsubscribeFriends();
      unsubscribeFriends = null;
    }

    currentUser = user;
    currentRelations = [];

    if (!user) {
      empty($("friendsList"), "Sign in to view friends.");
      empty($("receivedFriendRequests"), "Sign in first.");
      empty($("sentFriendRequests"), "Sign in first.");

      $("friendTotal").textContent = "0 friends";
      $("friendRequestCount").textContent = "0";

      return;
    }

    try {
      await syncMyProfile(user);
    } catch (error) {
      console.error("Player profile:", error);
      notify(
        "Unable to create player profile. Check Firestore rules."
      );
    }

    const friendsQuery = query(
      friendships,
      where("participants", "array-contains", user.uid)
    );

    unsubscribeFriends = onSnapshot(
      friendsQuery,

      snapshot => {
        currentRelations = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

        renderFriends().catch(console.error);
      },

      error => {
        console.error("Friends listener:", error);

        notify(
          "Unable to load friends. Check Firestore permissions."
        );
      }
    );
  });

})();
