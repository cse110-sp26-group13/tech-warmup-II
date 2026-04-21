class SlotMachineUI {
  constructor() {
    this.reelElements = Array.from(document.querySelectorAll(".reel"));
    this.balanceElement = document.getElementById("balance");
    this.betElement = document.getElementById("bet");
    this.resultElement = document.getElementById("result");
    this.spinButton = document.getElementById("spinButton");
  }

  formatMoney(value) {
    return `$${value}`;
  }

  renderReels(reels) {
    this.reelElements.forEach((reelElement, index) => {
      reelElement.textContent = reels[index] || "❔";
    });
  }

  renderBalance(balance) {
    this.balanceElement.textContent = this.formatMoney(balance);
  }

  renderBet(fixedBet) {
    this.betElement.textContent = this.formatMoney(fixedBet);
  }

  setSpinButtonState({ canSpin, isSpinning, noBalance }) {
    this.spinButton.disabled = !canSpin;

    if (isSpinning) {
      this.spinButton.textContent = "Spinning...";
      return;
    }

    if (noBalance) {
      this.spinButton.textContent = "No Balance";
      return;
    }

    this.spinButton.textContent = "Spin";
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
}

window.SlotMachineUI = SlotMachineUI;
