
/*
  QUESTBLOX APP.JS — GAME RENDERING FIX

  Uses the actual IDs from your index.html:
  gameGrid, gameSearch, noGames, games

  Featured Games come from QUESTBLOX_GAMES.
  Quick Playable Games come from QPG_GAMES
  and the renderer in games.js.
*/

(function () {
  "use strict";

  const gameGrid = document.getElementById("gameGrid");
  const gameSearch = document.getElementById("gameSearch");
  const noGames = document.getElementById("noGames");
  const gamesSection = document.getElementById("games");

  let activeCategory = "all";

  const categoryNames = {
    action: "Action",
    puzzle: "Puzzle",
    adventure: "Adventure",
    sports: "Sports",
    racing: "Racing",
    multiplayer: "Multiplayer",
    "3d": "3D Games"
  };

  // =========================================
  // CHECK REQUIRED ELEMENTS
  // =========================================

  if (!gameGrid || !gameSearch || !noGames || !gamesSection) {
    console.error(
      "[QuestBlox] Game rendering failed: one or more game elements are missing.",
      {
        gameGrid: !!gameGrid,
        gameSearch: !!gameSearch,
        noGames: !!noGames,
        gamesSection: !!gamesSection
      }
    );

    return;
  }

  // =========================================
  // OPEN A GAME
  // =========================================

  function launchGame(game) {
    const siteShell = document.getElementById("siteShell");

    if (siteShell && siteShell.hidden) {
      return;
    }

    try {
      const url = new URL(game.url);

      if (url.protocol !== "https:") {
        throw new Error("Only HTTPS game links are supported.");
      }

      const newWindow = window.open(
        url.href,
        "_blank",
        "noopener,noreferrer"
      );

      if (!newWindow) {
        console.info(
          "[QuestBlox] Browser may have blocked the new game tab."
        );
      }
    } catch (error) {
      console.error(
        "[QuestBlox] Unable to launch game:",
        error
      );

      alert("This game link is currently unavailable.");
    }
  }

  // =========================================
  // CREATE A FEATURED GAME CARD
  // =========================================

  function createGameCard(game) {
    const card = document.createElement("article");
    card.className = "game-card";

    const icon = document.createElement("div");
    icon.className = "game-icon";
    icon.textContent = game.icon || "🎮";

    const category = document.createElement("span");
    category.className = "game-category";

    category.textContent =
      categoryNames[game.category] ||
      game.category ||
      "Game";

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description;

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "play-btn";
    playButton.textContent = "Play Now";

    playButton.addEventListener("click", function () {
      launchGame(game);
    });

    card.append(
      icon,
      category,
      title,
      description,
      playButton
    );

    return card;
  }

  // =========================================
  // RENDER FEATURED GAMES
  // =========================================

  function renderGames() {
    if (
      typeof QUESTBLOX_GAMES === "undefined" ||
      !Array.isArray(QUESTBLOX_GAMES)
    ) {
      console.error(
        "[QuestBlox] QUESTBLOX_GAMES is missing. Check games.js."
      );

      gameGrid.replaceChildren();

      noGames.hidden = false;
      noGames.textContent =
        "Games could not load. Please refresh the page.";

      return;
    }

    const query = gameSearch.value
      .trim()
      .toLowerCase();

    const filtered = QUESTBLOX_GAMES.filter(function (game) {
      const categoryMatch =
        activeCategory === "all" ||
        game.category === activeCategory;

      const searchableText = [
        game.title,
        game.description,
        game.category
      ]
        .join(" ")
        .toLowerCase();

      return (
        categoryMatch &&
        searchableText.includes(query)
      );
    });

    const fragment = document.createDocumentFragment();

    filtered.forEach(function (game) {
      fragment.appendChild(createGameCard(game));
    });

    gameGrid.replaceChildren(fragment);

    noGames.hidden = filtered.length > 0;

    if (filtered.length === 0) {
      noGames.textContent =
        "No featured games found. Try another search or category.";
    }

    console.info(
      "[QuestBlox] Featured games displayed:",
      filtered.length
    );
  }

  // =========================================
  // FEATURED GAME CATEGORY FILTERS
  // =========================================

  document
    .querySelectorAll("[data-filter]")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        activeCategory = button.dataset.filter || "all";

        document
          .querySelectorAll("[data-filter]")
          .forEach(function (other) {
            other.classList.toggle(
              "active",
              other === button
            );
          });

        renderGames();

        if (typeof window.qbOpenPage === "function") {
          window.qbOpenPage("games");
        } else {
          gamesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });

  // =========================================
  // FEATURED GAME LIVE SEARCH
  // =========================================

  gameSearch.addEventListener("input", renderGames);

  // =========================================
  // INITIAL RENDER
  // =========================================

  renderGames();

  // Keep compatibility with any other
  // QuestBlox scripts that call these functions.

  window.renderGames = renderGames;
  window.launchGame = launchGame;

  console.info(
    "[QuestBlox] Games app initialized successfully."
  );
})();
