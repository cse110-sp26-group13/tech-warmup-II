class SlotMachine {
  constructor({ initialBalance, fixedBet, columnCount, rowCount, symbols }) {
    this.balance = initialBalance;
    this.fixedBet = fixedBet;
    this.columnCount = columnCount;
    this.rowCount = rowCount;
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
    return Array.from({ length: this.rowCount }, () =>
      Array.from({ length: this.columnCount }, () => this.getRandomSymbol())
    );
  }

  getLongestRun(line) {
    let bestRun = { symbol: null, length: 0 };
    let currentSymbol = null;
    let currentLength = 0;

    line.forEach((symbol) => {
      if (symbol === currentSymbol) {
        currentLength += 1;
      } else {
        currentSymbol = symbol;
        currentLength = 1;
      }

      if (currentLength > bestRun.length) {
        bestRun = { symbol: currentSymbol, length: currentLength };
      }
    });

    return bestRun;
  }

  evaluateBestLine(board) {
    const bestLine = {
      symbol: null,
      length: 0,
      direction: null,
      index: -1,
    };

    board.forEach((row, rowIndex) => {
      const rowRun = this.getLongestRun(row);

      if (rowRun.length > bestLine.length) {
        Object.assign(bestLine, rowRun, { direction: "row", index: rowIndex });
      }
    });

    for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex += 1) {
      const column = board.map((row) => row[columnIndex]);
      const columnRun = this.getLongestRun(column);

      if (columnRun.length > bestLine.length) {
        Object.assign(bestLine, columnRun, { direction: "column", index: columnIndex });
      }
    }

    return bestLine;
  }

  calculatePayout(board) {
    const bestLine = this.evaluateBestLine(board);
    let payout = 0;

    if (bestLine.length >= 6) {
      payout = this.fixedBet * 12;
    } else if (bestLine.length === 5) {
      payout = this.fixedBet * 8;
    } else if (bestLine.length === 4) {
      payout = this.fixedBet * 4;
    }

    return {
      payout,
      bestLine: payout > 0 ? bestLine : null,
    };
  }

  async spin(durationMs) {
    if (!this.canSpin()) {
      throw new Error("Cannot spin: insufficient balance or already spinning.");
    }

    this.isSpinning = true;
    this.balance -= this.fixedBet;

    await new Promise((resolve) => setTimeout(resolve, durationMs));

    const reels = this.buildRandomReels();
    const { payout, bestLine } = this.calculatePayout(reels);
    this.balance += payout;
    this.isSpinning = false;

    return {
      reels,
      payout,
      bestLine,
      didWin: payout > 0,
      netChange: payout - this.fixedBet,
      balance: this.balance,
    };
  }
}

window.SlotMachine = SlotMachine;
