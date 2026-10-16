
const FRIEND_ACTIONS = [
  {
    name: "View Profile",
    description: "View this player's public QuestBlox profile."
  },
  {
    name: "Message",
    description: "Open a private conversation with this friend."
  },
  {
    name: "Join Game",
    description: "Join a supported multiplayer session."
  },
  {
    name: "Set Nickname",
    description: "Choose a private nickname for this friend."
  },
  {
    name: "Donate Bucks",
    description: "Send a confirmed amount of Bucks to a friend."
  },
  {
    name: "Mute",
    description: "Mute this player's messages."
  },
  {
    name: "Block",
    description: "Prevent this player from contacting you."
  },
  {
    name: "Report",
    description: "Report inappropriate player activity."
  }
];

const friendActions = document.getElementById("friendActions");
const friendNotice = document.getElementById("friendNotice");

friendActions.replaceChildren();

FRIEND_ACTIONS.forEach(action => {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = action.name;
  button.title = action.description;
  button.disabled = true;

  friendActions.appendChild(button);
});

friendNotice.textContent =
  "Friend actions are a preview. Real player search, messaging, " +
  "blocking, reporting and Bucks transfers will be activated " +
  "after the secure friends backend is implemented.";
