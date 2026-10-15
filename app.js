
const gameGrid = document.getElementById("gameGrid");
const gameSearch = document.getElementById("gameSearch");
const noGames = document.getElementById("noGames");

const gameDialog = document.getElementById("gameDialog");
const gameTitle = document.getElementById("gameTitle");
const gameContent = document.getElementById("gameContent");
const closeGame = document.getElementById("closeGame");

let activeCategory = "all";

function renderGames() {
  const query = gameSearch.value.trim().toLowerCase();

  const filtered = QUESTBLOX_GAMES.filter(game => {
    const categoryMatch =
      activeCategory === "all" ||
      game.category === activeCategory;

    const searchMatch =
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.category.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  gameGrid.replaceChildren();

  filtered.forEach(game => {
    const card = document.createElement("article");
    card.className = "game-card";

    const icon = document.createElement("div");
    icon.className = "game-icon";
    icon.textContent = game.icon;

    const category = document.createElement("span");
    category.className = "game-category";
    category.textContent = game.category.toUpperCase();

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    const playButton = document.createElement("button");
    playButton.className = "play-btn";
    playButton.textContent = "Play Now";
    playButton.onclick = () => launchGame(game);

    card.append(
      icon,
      category,
      title,
      description,
      playButton
    );

    gameGrid.appendChild(card);
  });

  noGames.hidden = filtered.length !== 0;
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderGames();

    document.getElementById("games").scrollIntoView({
      behavior: "smooth"
    });
  });
});

gameSearch.addEventListener("input", renderGames);

function launchGame(game) {
  if (document.getElementById("siteShell").hidden) return;

  // Open the original game URL.
  // Some external websites do not allow iframe embedding.
  const url = new URL(game.url);

  if (url.protocol !== "https:") return;

  window.open(url.href, "_blank", "noopener,noreferrer");
}

closeGame.onclick = () => {
  gameDialog.close();
  gameContent.replaceChildren();
};

gameDialog.addEventListener("close", () => {
  gameContent.replaceChildren();
});

renderGames();

// Share QuestBlox using a QR code.
function renderQRCode() {
  const container = document.getElementById("qrCode");

  const img = document.createElement("img");
  const websiteURL = window.location.href.split("#")[0];

  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
    encodeURIComponent(websiteURL);

  img.alt = "QuestBlox website QR code";
  img.width = 150;
  img.height = 150;

  container.replaceChildren(img);
}

renderQRCode();

// Friends will be connected to Firestore in the social update.
document.getElementById("friendsContainer").textContent =
  "Friends and live activity are coming in the next update.";
