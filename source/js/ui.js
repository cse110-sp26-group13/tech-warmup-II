class SlotMachineUI {
  constructor() {
    this.reelsContainer = document.getElementById("reels");
    this.reelElements = [];
    this.reelSymbolElements = [];
    this.balanceElement = document.getElementById("balance");
    this.betElement = document.getElementById("bet");
    this.boardSizeElement = document.getElementById("boardSize");
    this.resultElement = document.getElementById("result");
    this.spinButton = document.getElementById("spinButton");
    this.spinControlLabel = document.getElementById("spinControlLabel");
    this.themeToggleButton = document.getElementById("themeToggle");
    this.currentTheme = "dark";
  }

  formatMoney(value) {
    return `$${value}`;
  }

  buildBoard({ columnCount, rowCount, symbols = [] }) {
    if (!this.reelsContainer) {
      return;
    }

    this.reelsContainer.style.setProperty("--grid-columns", String(columnCount));
    this.reelsContainer.innerHTML = "";

    const totalCells = columnCount * rowCount;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
      const reelElement = document.createElement("div");
      reelElement.className = "reel";
      reelElement.dataset.reel = String(cellIndex);

      const reelCylinder = document.createElement("div");
      reelCylinder.className = "reel-cylinder";

      const reelSymbol = document.createElement("span");
      reelSymbol.className = "reel-symbol";
      reelSymbol.textContent = symbols[cellIndex] || "❔";

      reelCylinder.append(reelSymbol);
      reelElement.append(reelCylinder);
      this.reelsContainer.append(reelElement);
    }

    this.reelElements = Array.from(this.reelsContainer.querySelectorAll(".reel"));
    this.reelSymbolElements = this.reelElements.map((reel) => reel.querySelector(".reel-symbol"));
    this.renderBoardSize(columnCount, rowCount);
  }

  normalizeSymbols(reels) {
    if (!Array.isArray(reels)) {
      return [];
    }

    if (Array.isArray(reels[0])) {
      return reels.flat();
    }

    return reels;
  }

  renderReels(reels) {
    const normalizedReels = this.normalizeSymbols(reels);

    this.reelSymbolElements.forEach((reelSymbolElement, index) => {
      if (reelSymbolElement) {
        reelSymbolElement.textContent = normalizedReels[index] || "❔";
      }
    });
  }

  renderSingleReel(index, symbol) {
    const reelSymbolElement = this.reelSymbolElements[index];

    if (reelSymbolElement) {
      reelSymbolElement.textContent = symbol || "❔";
    }
  }

  startSpinning() {
    this.reelElements.forEach((reelElement) => {
      reelElement.classList.add("is-spinning");
    });
  }

  startSingleReel(index) {
    const reelElement = this.reelElements[index];

    if (reelElement) {
      reelElement.classList.add("is-spinning");
    }
  }

  syncSpinningReels(indexes) {
    const spinningReels = indexes
      .map((index) => this.reelElements[index])
      .filter(Boolean);

    spinningReels.forEach((reelElement) => {
      reelElement.classList.remove("is-spinning");
    });

    if (this.reelsContainer) {
      void this.reelsContainer.offsetWidth;
    }

    spinningReels.forEach((reelElement) => {
      reelElement.classList.add("is-spinning");
    });
  }

  stopSpinning() {
    this.reelElements.forEach((reelElement) => {
      reelElement.classList.remove("is-spinning");
    });
  }

  stopSingleReel(index) {
    const reelElement = this.reelElements[index];

    if (reelElement) {
      reelElement.classList.remove("is-spinning");
    }
  }

  renderBalance(balance) {
    this.balanceElement.textContent = this.formatMoney(balance);
  }

  renderBet(fixedBet) {
    this.betElement.textContent = this.formatMoney(fixedBet);
  }

  renderBoardSize(columnCount, rowCount) {
    if (this.boardSizeElement) {
      this.boardSizeElement.textContent = `${columnCount} x ${rowCount}`;
    }
  }

  setSpinButtonState({ canSpin, isSpinning, noBalance }) {
    this.spinButton.disabled = !canSpin;
    this.spinButton.classList.toggle("is-spinning", isSpinning);
    this.spinButton.classList.toggle("is-disabled", !canSpin);

    const setLabel = (value) => {
      if (this.spinControlLabel) {
        this.spinControlLabel.textContent = value;
      } else {
        this.spinButton.textContent = value;
      }
    };

    if (isSpinning) {
      this.spinButton.setAttribute("aria-label", "Spin in progress");
      setLabel("Spinning...");
      return;
    }

    if (noBalance) {
      this.spinButton.setAttribute("aria-label", "No balance");
      setLabel("No Balance");
      return;
    }

    this.spinButton.setAttribute("aria-label", "Spin");
    setLabel("Spin");
  }

  showResult(message, type = "neutral") {
    this.resultElement.textContent = message;
    this.resultElement.classList.remove("win", "loss");

    if (type === "win") {
      this.resultElement.classList.add("win");
    }

    if (type === "loss") {
      this.resultElement.classList.add("loss");
    }
  }

  setTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    this.currentTheme = nextTheme;
    document.body.dataset.theme = nextTheme;

    if (this.themeToggleButton) {
      this.themeToggleButton.textContent =
        nextTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
      this.themeToggleButton.setAttribute("aria-pressed", String(nextTheme === "dark"));
    }
  }

  getTheme() {
    return this.currentTheme;
  }
}

window.SlotMachineUI = SlotMachineUI;
