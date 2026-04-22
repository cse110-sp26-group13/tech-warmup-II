class SlotMachine {
  constructor({ initialBalance, fixedBet, columnCount, rowCount, symbols }) {
    this.balance = initialBalance;
    this.fixedBet = fixedBet;
    this.columnCount = columnCount;
    this.rowCount = rowCount;
    this.symbols = symbols;
    this.totalSymbolWeight = symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
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

  roundMoney(value) {
    return Math.round(value * 100) / 100;
  }

  cloneBoard(board) {
    return board.map((row) => [...row]);
  }

  getRandomSymbol() {
    let remainingWeight = Math.random() * this.totalSymbolWeight;

    for (const symbol of this.symbols) {
      remainingWeight -= symbol.weight;

      if (remainingWeight <= 0) {
        return symbol.id;
      }
    }

    return this.symbols[this.symbols.length - 1].id;
  }

  buildRandomReels() {
    return Array.from({ length: this.rowCount }, () =>
      Array.from({ length: this.columnCount }, () => this.getRandomSymbol())
    );
  }

  getWinningGroups(board) {
    const positionsBySymbol = new Map();

    board.forEach((row, rowIndex) => {
      row.forEach((symbolId, columnIndex) => {
        const cellIndex = rowIndex * this.columnCount + columnIndex;

        if (!positionsBySymbol.has(symbolId)) {
          positionsBySymbol.set(symbolId, []);
        }

        positionsBySymbol.get(symbolId).push(cellIndex);
      });
    });

    return this.symbols
      .map((symbol) => {
        const matchedIndexes = positionsBySymbol.get(symbol.id) || [];

        if (matchedIndexes.length < symbol.minCount) {
          return null;
        }

        const extraCount = matchedIndexes.length - symbol.minCount;
        const payout = this.roundMoney(
          this.fixedBet * (symbol.baseMultiplier + extraCount * symbol.extraMultiplier)
        );

        return {
          symbolId: symbol.id,
          icon: symbol.icon,
          count: matchedIndexes.length,
          extraCount,
          payout,
          matchedIndexes,
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.payout - left.payout || right.count - left.count);
  }

  tumbleBoard(board, matchedIndexes) {
    const nextBoard = this.cloneBoard(board);
    const matchedIndexSet = new Set(matchedIndexes);

    for (let columnIndex = 0; columnIndex < this.columnCount; columnIndex += 1) {
      const remainingSymbols = [];

      for (let rowIndex = this.rowCount - 1; rowIndex >= 0; rowIndex -= 1) {
        const cellIndex = rowIndex * this.columnCount + columnIndex;

        if (!matchedIndexSet.has(cellIndex)) {
          remainingSymbols.push(board[rowIndex][columnIndex]);
        }
      }

      const refillCount = this.rowCount - remainingSymbols.length;
      const refillSymbols = Array.from({ length: refillCount }, () => this.getRandomSymbol());
      const finalColumnBottomUp = [...remainingSymbols, ...refillSymbols];

      for (
        let rowIndex = this.rowCount - 1, writeIndex = 0;
        rowIndex >= 0;
        rowIndex -= 1, writeIndex += 1
      ) {
        nextBoard[rowIndex][columnIndex] = finalColumnBottomUp[writeIndex];
      }
    }

    const droppedIndexes = [];
    nextBoard.forEach((row, rowIndex) => {
      row.forEach((symbolId, columnIndex) => {
        if (symbolId !== board[rowIndex][columnIndex]) {
          droppedIndexes.push(rowIndex * this.columnCount + columnIndex);
        }
      });
    });

    return {
      board: nextBoard,
      droppedIndexes,
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
    let board = this.cloneBoard(reels);
    let totalPayout = 0;
    let cascadeIndex = 0;
    const cascades = [];

    while (cascadeIndex < 20) {
      const wins = this.getWinningGroups(board);

      if (wins.length === 0) {
        break;
      }

      const matchedIndexes = Array.from(
        new Set(wins.flatMap((winGroup) => winGroup.matchedIndexes))
      );
      const cascadePayout = this.roundMoney(
        wins.reduce((sum, winGroup) => sum + winGroup.payout, 0)
      );
      totalPayout = this.roundMoney(totalPayout + cascadePayout);

      const { board: tumbledBoard, droppedIndexes } = this.tumbleBoard(board, matchedIndexes);
      cascades.push({
        index: cascadeIndex + 1,
        wins,
        matchedIndexes,
        cascadePayout,
        totalPayout,
        boardAfterTumble: this.cloneBoard(tumbledBoard),
        droppedIndexes,
        balanceAfterCascade: this.roundMoney(this.balance + totalPayout),
      });

      board = tumbledBoard;
      cascadeIndex += 1;
    }

    this.balance += totalPayout;
    this.isSpinning = false;

    return {
      reels,
      cascades,
      totalPayout,
      didWin: totalPayout > 0,
      netChange: this.roundMoney(totalPayout - this.fixedBet),
      balance: this.balance,
    };
  }
}

window.SlotMachine = SlotMachine;
