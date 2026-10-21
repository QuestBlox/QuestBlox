
/*
  QUESTBLOX — GAMES V5

  Featured Games: 3
  Quick Playable Games: 51

  No Firebase changes.
  No HTML replacement needed.
  No duplicate featured games.
  No CalcTick or CodeLab.
*/

// ============================================
// EXISTING QUESTBLOX FEATURED GAMES
// ============================================

const QUESTBLOX_GAMES = [
  {
    id: "blockcraft",
    title: "BlockCraft",
    description:
      "Explore a blocky world, build structures and discover new adventures.",
    category: "3d",
    icon: "🧱",
    url: "https://devaniviaan-cell.github.io/BlockCraft/"
  },
  {
    id: "password",
    title: "Crack the Password",
    description:
      "Use clever hints to discover the hidden password in minimum tries!",
    category: "puzzle",
    icon: "🔐",
    url: "https://qpg-quick-playable-games.github.io/Crack-the-Password/"
  },
  {
    id: "foodtruck",
    title: "Curbside Food Truck Tycoon",
    description:
      "Manage your own food truck and grow your business!",
    category: "adventure",
    icon: "🚚",
    url: "https://devaniviaan-cell.github.io/Curbside-Food-Truck-Tycoon/"
  }
];

// ============================================
// QUICK PLAYABLE GAMES
// ============================================

const QPG_BASE =
  "https://qpg-quick-playable-games.github.io/";

const QPG_GAMES = [
  {
    title: "Asteroid Dodger — NightFall!",
    description: "Dodge the incoming intergalactic skyscrapers!",
    category: "action",
    icon: "🏙️",
    path: "Astroid-dodger/"
  },
  {
    title: "Sky Coin Collector",
    description: "Collect coins and avoid bombs!",
    category: "action",
    icon: "🪂",
    path: "Sky-coin-collector/"
  },
  {
    title: "Lane Racer",
    description: "Switch lanes and avoid traffic!",
    category: "racing",
    icon: "🚗",
    path: "Lane-Racer/"
  },
  {
    title: "Robot Runner",
    description: "Jump over electric barriers and survive as long as you can!",
    category: "action",
    icon: "🤖",
    path: "Robot-runner/"
  },
  {
    title: "Ninja Climber",
    description: "Run up walls, switch sides and dodge obstacles!",
    category: "action",
    icon: "🥷",
    path: "Ninja-Climber/"
  },
  {
    title: "Colour Match",
    description: "Find the tile that matches the target colour as the grids become harder.",
    category: "puzzle",
    icon: "🎨",
    path: "Colour-Match/"
  },
  {
    title: "Shape Sprint",
    description: "Race to match shapes quickly. Fast reflexes win!",
    category: "action",
    icon: "⚡",
    path: "Shape-Sprint/"
  },
  {
    title: "Pulse Arm",
    description: "Pump up the rhythm and keep the beat!",
    category: "action",
    icon: "💓",
    path: "Pulse-Arm/"
  },
  {
    title: "Neon Jumper",
    description: "Leap between glowing platforms and climb as high as you can.",
    category: "action",
    icon: "🕹️",
    path: "Gammm/"
  },
  {
    title: "PulseKeeper",
    description: "Keep your pulse steady and survive the rhythm challenge!",
    category: "action",
    icon: "💓",
    path: "PULSEKEEPER/"
  },
  {
    title: "Shape Shooter",
    description: "Dodge other shapes and shoot them down!",
    category: "action",
    icon: "🔺",
    path: "Shape-Shooter/"
  },
  {
    title: "Guess the Flags — Nightmare!",
    description: "Guess impossible flags in impossible times!",
    category: "puzzle",
    icon: "🚩",
    path: "Guess-the-Flags-Nightmare/"
  },
  {
    title: "Combo Cascade",
    description: "Build massive combos and cascade through levels!",
    category: "puzzle",
    icon: "🎯",
    path: "Combo-Cascade/"
  },
  {
    title: "Beat the Line",
    description: "Follow the beat and stay on the line!",
    category: "action",
    icon: "🎵",
    path: "Beat-The-line/"
  },
  {
    title: "Like Clockwork",
    description: "Change time periods to access new platforms and beat the levels.",
    category: "puzzle",
    icon: "⏰",
    path: "Like-Clockwork/"
  },
  {
    title: "Vibe Call",
    description: "Play trivia, rock-paper-scissors and other games with friends.",
    category: "multiplayer",
    icon: "📞",
    path: "VibeCall/"
  },
  {
    title: "The Red Button",
    description: "Let the red button decide which game you play!",
    category: "adventure",
    icon: "🔴",
    path: "The-red-button/"
  },
  {
    title: "Orbit Dodge",
    description: "Change a UFO's orbit and destroy incoming asteroids!",
    category: "action",
    icon: "🛸",
    path: "Orbit-Dodge/"
  },
  {
    title: "Neon Assault",
    description: "Destroy alien invaders and survive increasingly challenging waves.",
    category: "action",
    icon: "👾",
    path: "Neon-Assault/"
  },
  {
    title: "Guess the Football Legend",
    description: "Guess legendary football players using clues.",
    category: "puzzle",
    icon: "⚽",
    path: "Guess-the-Football-Legend-Quiz/"
  },
  {
    title: "Roll 'N' Leap",
    description: "Time your jumps and leap over obstacles for a high score!",
    category: "action",
    icon: "🎱",
    path: "Roll-N-Leap/"
  },
  {
    title: "Evolution Arena",
    description: "Collect DNA, unlock mutations and evolve your creature.",
    category: "adventure",
    icon: "🧬",
    path: "-Evolution-Arena/"
  },
  {
    title: "Mutation Lab",
    description: "Combine creatures, elements and mutations to discover unique creations.",
    category: "puzzle",
    icon: "🧬",
    path: "Mutation-Lab/"
  },
  {
    title: "Tiny Kingdom",
    description: "Gather resources, build structures and grow your kingdom!",
    category: "adventure",
    icon: "🏰",
    path: "Tiny-kingdom/"
  },
  {
    title: "Star Defender",
    description: "Dodge enemies, shoot and challenge powerful bosses!",
    category: "action",
    icon: "💫",
    path: "Star-Defender/"
  },
  {
    title: "Shooter Memo",
    description: "Survive robotic enemies across three maps in single-player or multiplayer.",
    category: "3d",
    icon: "🦿",
    path: "ShooterMemo/"
  },
  {
    title: "Subway Jumper",
    description: "Dash through tracks and jump over obstacles!",
    category: "action",
    icon: "🏃",
    path: "Subway-Jumper/"
  },
  {
    title: "Chess Master",
    description: "Test your chess strategy and challenge your opponent.",
    category: "puzzle",
    icon: "♟️",
    path: "Chess-Arena/"
  },
  {
    title: "Password Panic",
    description: "Create a strong password using the hints in this puzzle game.",
    category: "puzzle",
    icon: "🔑",
    path: "Generate-the-Password/"
  },
  {
    title: "Parkour Obby 3D",
    description: "Master parkour, overcome obstacles and reach the finish line.",
    category: "3d",
    icon: "🏃‍♂️",
    path: "Parkour-Obby-3D/"
  },
  {
    title: "UNO Card Battle",
    description: "Battle friends or bots with numbers, Wild cards and special cards.",
    category: "multiplayer",
    icon: "🃏",
    path: "UNO-Challenge/"
  },
  {
    title: "Board Blast",
    description: "Play Ludo and Snakes & Ladders. Roll, race, climb and conquer!",
    category: "multiplayer",
    icon: "🎲",
    path: "Board-Blast/"
  },
  {
    title: "Plane Landing Challenge",
    description: "Land planes safely and taxi them to the gate.",
    category: "adventure",
    icon: "🛬",
    path: "Plane-landing-challenge/"
  },
  {
    title: "Plane Dodging Challenge",
    description: "Dodge buildings while flying through the city.",
    category: "action",
    icon: "✈️",
    path: "Plane-Game/"
  },
  {
    title: "Zombie Apocalypse",
    description: "Survive a zombie apocalypse in the middle of the night.",
    category: "action",
    icon: "🧟",
    path: "Dead_Hour/"
  },
  {
    title: "Cyber Rivals",
    description: "Dash and use shockwave abilities against endless bot waves.",
    category: "action",
    icon: "🔫",
    path: "CYBER-RIVALS/"
  },
  {
    title: "Aim Trainer",
    description: "Test your speed, accuracy and reflexes against difficult targets.",
    category: "action",
    icon: "🎯",
    path: "Aim-Trainer/"
  },
  {
    title: "Who Am I?",
    description: "Read the clues and guess the famous person!",
    category: "puzzle",
    icon: "🧠",
    path: "Guess-who-I-am-/"
  },
  {
    title: "Trivia Rush",
    description: "Answer questions, build streaks and beat your high score!",
    category: "puzzle",
    icon: "❓",
    path: "Trivia-Rush/"
  },
  {
    title: "Geo Hunter",
    description: "Take on geography challenges and prove you know the world!",
    category: "puzzle",
    icon: "🌍",
    path: "geo-hunter/"
  },
  {
    title: "Flag Guess",
    description: "Identify flags from around the world and build your streak.",
    category: "puzzle",
    icon: "🏳️",
    path: "Flag-guessing-game-/"
  },
  {
    title: "Void Runner",
    description: "Dodge obstacles, collect coins, grab shields and survive!",
    category: "3d",
    icon: "🚀",
    path: "VOID-RUNNER-/"
  },
  {
    title: "Guess Who?",
    description: "Guess the secret person using clues and detective skills.",
    category: "puzzle",
    icon: "🕵️",
    path: "Guess-Who/"
  },
  {
    title: "Reflex Rush 3D",
    description: "Aim, jump, dodge, catch and react before time runs out!",
    category: "3d",
    icon: "⚡",
    path: "Reflex-Rush-3D/"
  },
  {
    title: "TapStorm 3D",
    description: "Tap, swipe, hold and react through an intense reflex storm!",
    category: "3d",
    icon: "🌩️",
    path: "Tap-Storm-3D/"
  },
  {
    title: "Dash Break 3D",
    description: "Dodge barriers, collect energy coins and survive!",
    category: "3d",
    icon: "💨",
    path: "Dash-Break-3D/"
  },
  {
    title: "Rift Runner 3D",
    description: "Dodge the void, collect shards and build your FLOW combo.",
    category: "3d",
    icon: "🌌",
    path: "RIFT-RUNNER-3D/"
  },
  {
    title: "Rail City Escape",
    description: "Race through the city, dodge trains and collect coins!",
    category: "3d",
    icon: "🚄",
    path: "Neon-Rail-Rush-3D/"
  },
  {
    title: "Neon Heist",
    description: "Collect loot, avoid guards and reach the exit!",
    category: "action",
    icon: "💰",
    path: "Neon-heist/"
  },
  {
    title: "Sports Mayhem",
    description: "Jump into chaotic sports challenges and test your skills!",
    category: "sports",
    icon: "🏏",
    path: "Sports-Mayhem/"
  },
  {
    title: "Race and Cook",
    description: "Race wild tracks, drift, use nitro and upgrade your ride!",
    category: "racing",
    icon: "🚗",
    path: "Race-and-Cook/"
  }
];

// ============================================
// QPG SECTION RENDERER
// ============================================

function initializeQPGSection() {
  const gamesSection =
    document.getElementById("games");

  if (!gamesSection) return;

  // Avoid inserting the section twice.
  if (document.getElementById("qpgSection")) {
    return;
  }

  const qpgSection =
    document.createElement("div");

  qpgSection.id = "qpgSection";

  qpgSection.style.marginTop = "55px";

  // HEADING

  const heading =
    document.createElement("div");

  heading.className =
    "section-heading heading-with-search";

  const headingText =
    document.createElement("div");

  const title =
    document.createElement("h2");

  title.textContent =
    "Quick Playable Games";

  const description =
    document.createElement("p");

  description.textContent =
    `${QPG_GAMES.length} more playable games from QPG Arcade. No utilities or duplicate featured games.`;

  headingText.append(
    title,
    description
  );

  // INDEPENDENT QPG SEARCH

  const search =
    document.createElement("input");

  search.id = "qpgSearch";
  search.type = "search";

  search.placeholder =
    "Search Quick Playable Games...";

  search.setAttribute(
    "aria-label",
    "Search Quick Playable Games"
  );

  heading.append(
    headingText,
    search
  );

  // CATEGORY FILTERS

  const filters =
    document.createElement("div");

  filters.className = "category-buttons";
  filters.style.marginBottom = "22px";

  const categories = [
    ["all", "All"],
    ["action", "Action"],
    ["puzzle", "Puzzle"],
    ["adventure", "Adventure"],
    ["sports", "Sports"],
    ["racing", "Racing"],
    ["multiplayer", "Multiplayer"],
    ["3d", "3D Games"]
  ];

  let activeCategory = "all";

  categories.forEach(([value, label]) => {
    const button =
      document.createElement("button");

    button.type = "button";
    button.textContent = label;

    button.dataset.qpgFilter = value;

    if (value === "all") {
      button.classList.add("active");
    }

    button.addEventListener(
      "click",
      () => {
        activeCategory = value;

        filters.querySelectorAll(
          "button"
        ).forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        renderQPGGames();
      }
    );

    filters.appendChild(button);
  });

  // GRID

  const grid =
    document.createElement("div");

  grid.id = "qpgGameGrid";
  grid.className = "game-grid";

  // EMPTY STATE

  const noResults =
    document.createElement("p");

  noResults.id = "qpgNoGames";
  noResults.className = "empty-message";

  noResults.textContent =
    "No Quick Playable Games found. Try another search or category.";

  noResults.hidden = true;

  // GAME CARDS

  function createQPGCard(game) {
    const card =
      document.createElement("a");

    card.className = "game-card";

    card.href = QPG_BASE + game.path;

    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const icon =
      document.createElement("div");

    icon.className = "game-icon";
    icon.textContent = game.icon;

    const category =
      document.createElement("span");

    category.className = "tag";

    const categoryNames = {
      action: "Action",
      puzzle: "Puzzle",
      adventure: "Adventure",
      sports: "Sports",
      racing: "Racing",
      multiplayer: "Multiplayer",
      "3d": "3D Games"
    };

    category.textContent =
      categoryNames[game.category] ||
      game.category;

    const title =
      document.createElement("h3");

    title.textContent = game.title;

    const description =
      document.createElement("p");

    description.textContent =
      game.description;

    const play =
      document.createElement("span");

    play.className = "play-btn";
    play.textContent = "Play Game →";

    card.append(
      icon,
      category,
      title,
      description,
      play
    );

    return card;
  }

  // FILTERING AND SEARCH

  function renderQPGGames() {
    const term =
      search.value.trim().toLowerCase();

    const matches = QPG_GAMES.filter(
      game => {
        const categoryMatches =
          activeCategory === "all" ||
          game.category === activeCategory;

        const searchMatches =
          !term ||
          (
            game.title + " " +
            game.description + " " +
            game.category
          ).toLowerCase().includes(term);

        return (
          categoryMatches &&
          searchMatches
        );
      }
    );

    const fragment =
      document.createDocumentFragment();

    matches.forEach(game => {
      fragment.appendChild(
        createQPGCard(game)
      );
    });

    grid.replaceChildren(fragment);

    noResults.hidden =
      matches.length > 0;
  }

  search.addEventListener(
    "input",
    renderQPGGames
  );

  qpgSection.append(
    heading,
    filters,
    grid,
    noResults
  );

  gamesSection.appendChild(qpgSection);

  renderQPGGames();
}

// ============================================
// INITIALIZE AFTER THE EXISTING APP
// ============================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeQPGSection
  );
} else {
  initializeQPGSection();
}
