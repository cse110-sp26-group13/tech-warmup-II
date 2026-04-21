class SlotMachine {
  constructor({ initialBalance, fixedBet, reelCount, symbols }) {
    this.balance = initialBalance;
    this.fixedBet = fixedBet;
    this.reelCount = reelCount;
    this.symbols = symbols;
    this.isSpinning = false;
  }

  getState() {
    return {
      balance: this.balance,
      fixedBet: this.fixedBet,
      isSpinning: this.isSpinning,
    };
  }

  canSpin() {
    return !this.isSpinning && this.balance >= this.fixedBet;
  }

  getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * this.symbols.length);
    return this.symbols[randomIndex];
  }

  buildRandomReels() {
    return Array.from({ length: this.reelCount }, () => this.getRandomSymbol());
  }

  calculatePayout(reels) {
    const counts = reels.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {});

    const maxMatch = Math.max(...Object.values(counts));

    if (maxMatch === 3) {
      return this.fixedBet * 5;
    }

    if (maxMatch === 2) {
      return this.fixedBet * 2;
    }

    return 0;
  }

  async spin(durationMs) {
    if (!this.canSpin()) {
      throw new Error("Cannot spin: insufficient balance or already spinning.");
    }

    this.isSpinning = true;
    this.balance -= this.fixedBet;

    await new Promise((resolve) => setTimeout(resolve, durationMs));

    const reels = this.buildRandomReels();
    const payout = this.calculatePayout(reels);
    this.balance += payout;
    this.isSpinning = false;

    return {
      reels,
      payout,
      didWin: payout > 0,
      netChange: payout - this.fixedBet,
      balance: this.balance,
    };
  }
}

window.SlotMachine = SlotMachine;
