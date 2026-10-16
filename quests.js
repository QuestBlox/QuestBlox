
const QUESTBLOX_QUESTS = [
  {
    id: "first_game",
    title: "First Adventure",
    description: "Play your first QuestBlox game.",
    xp: 50,
    category: "Games"
  },
  {
    id: "explorer",
    title: "Game Explorer",
    description: "Play five different games.",
    xp: 150,
    category: "Games"
  },
  {
    id: "daily",
    title: "Daily Explorer",
    description: "Complete a verified daily challenge.",
    xp: 75,
    category: "Daily"
  },
  {
    id: "friend_one",
    title: "New Connection",
    description: "Become friends with another player.",
    xp: 60,
    category: "Social"
  },
  {
    id: "friend_five",
    title: "Friendly Five",
    description: "Have five accepted friends.",
    xp: 125,
    category: "Social"
  },
  {
    id: "conversation",
    title: "Say Hello",
    description: "Participate in a friend conversation.",
    xp: 50,
    category: "Social"
  },
  {
    id: "bucks",
    title: "Bucks Collector",
    description: "Earn 500 Bucks through verified activities.",
    xp: 150,
    category: "Bucks"
  },
  {
    id: "champion",
    title: "Game Champion",
    description: "Finish a supported in-game challenge.",
    xp: 200,
    category: "Games"
  },
  {
    id: "weekend",
    title: "Weekend Explorer",
    description: "Complete a weekend event challenge.",
    xp: 100,
    category: "Events"
  },
  {
    id: "quest_master",
    title: "Quest Master",
    description: "Complete five different verified quests.",
    xp: 250,
    category: "Achievements"
  }
];

const questGrid = document.getElementById("questGrid");

function renderQuests() {
  questGrid.replaceChildren();

  QUESTBLOX_QUESTS.forEach(quest => {
    const card = document.createElement("article");
    card.className = "quest-card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = quest.category;

    const title = document.createElement("h3");
    title.textContent = quest.title;

    const description = document.createElement("p");
    description.textContent = quest.description;

    const reward = document.createElement("strong");
    reward.className = "quest-reward";
    reward.textContent = `+${quest.xp} XP`;

    const status = document.createElement("span");
    status.className = "quest-status";
    status.textContent = "Awaiting secure quest verification";

    card.append(tag, title, description, reward, status);
    questGrid.appendChild(card);
  });
}

renderQuests();

document.getElementById("playerXP").textContent =
  "XP: Not activated";

document.getElementById("leaderboard").textContent =
  "Global rankings will appear here after verified XP " +
  "rewards and player statistics are connected.";
