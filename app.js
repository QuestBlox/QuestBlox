
const gameGrid = document.getElementById("gameGrid");
const gameSearch = document.getElementById("gameSearch");
const noGames = document.getElementById("noGames");

let activeCategory = "all";

function renderGames() {
  const query = gameSearch.value.trim().toLowerCase();

  const filtered = QUESTBLOX_GAMES.filter(game => {
    const categoryMatch =
      activeCategory === "all" ||
      game.category === activeCategory;

    const searchableText = [
      game.title,
      game.description,
      game.category
    ].join(" ").toLowerCase();

    return categoryMatch && searchableText.includes(query);
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
    playButton.type = "button";
    playButton.className = "play-btn";
    playButton.textContent = "Play Now";

    playButton.addEventListener("click", () => launchGame(game));

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

// Category filters
document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach(other => {
      other.classList.toggle("active", other === button);
    });

    renderGames();

    document.getElementById("games").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// Live search
gameSearch.addEventListener("input", renderGames);

// Open games in a new tab
function launchGame(game) {
  if (document.getElementById("siteShell").hidden) return;

  try {
    const url = new URL(game.url);

    if (url.protocol !== "https:") {
      throw new Error("Only HTTPS game links are supported.");
    }

    window.open(url.href, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Unable to launch game:", error);
    alert("This game link is currently unavailable.");
  }
}

renderGames();
