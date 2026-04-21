const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();
const THEME_STORAGE_KEY = "slot-machine-theme";
const COLUMN_START_DELAY_MS = 70;
const COLUMN_STOP_DELAY_MS = 85;
let spinInteractionLocked = false;

function updateSpinAvailability() {
  const { balance, fixedBet, isSpinning } = machine.getState();

  ui.setSpinButtonState({
    canSpin: machine.canSpin() && !spinInteractionLocked,
    isSpinning,
    noBalance: balance < fixedBet,
  });
}

function initialize() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme;

  ui.setTheme(initialTheme);
  ui.buildBoard({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    symbols: machine.buildRandomReels().flat(),
  });
  const state = machine.getState();
  ui.renderBalance(state.balance);
  ui.renderBet(state.fixedBet);
  updateSpinAvailability();
}

function handleThemeToggle() {
  const nextTheme = ui.getTheme() === "dark" ? "light" : "dark";
  ui.setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function getColumnCellIndexes(columnIndex) {
  return Array.from({ length: GAME_CONFIG.rowCount }, (_, rowIndex) => {
    return rowIndex * GAME_CONFIG.columnCount + columnIndex;
  });
}

function startReelAnimation(activeCellIndexes) {
  return setInterval(() => {
    activeCellIndexes.forEach((cellIndex) => {
      const symbol =
        GAME_CONFIG.symbols[Math.floor(Math.random() * GAME_CONFIG.symbols.length)];
      ui.renderSingleReel(cellIndex, symbol);
    });
  }, GAME_CONFIG.animationTickMs);
}

async function startColumnsLeftToRight(activeCellIndexes) {
  for (let columnIndex = 0; columnIndex < GAME_CONFIG.columnCount; columnIndex += 1) {
    const cellIndexes = getColumnCellIndexes(columnIndex);

    cellIndexes.forEach((cellIndex) => {
      activeCellIndexes.add(cellIndex);
      ui.startSingleReel(cellIndex);
    });

    await sleep(COLUMN_START_DELAY_MS);
  }
}

async function revealFinalReels(outcomeReels) {
  const flattenedReels = outcomeReels.flat();

  for (let columnIndex = 0; columnIndex < GAME_CONFIG.columnCount; columnIndex += 1) {
    await sleep(COLUMN_STOP_DELAY_MS);
    const cellIndexes = getColumnCellIndexes(columnIndex);

    cellIndexes.forEach((cellIndex) => {
      ui.stopSingleReel(cellIndex);
      ui.renderSingleReel(cellIndex, flattenedReels[cellIndex]);
    });
  }
}

function formatWinningLine(bestLine) {
  if (!bestLine) {
    return "";
  }

  const lineType = bestLine.direction === "column" ? "column" : "row";
  return ` ${bestLine.length} matching ${bestLine.symbol} in ${lineType} ${bestLine.index + 1}.`;
}

async function handleSpin() {
  if (spinInteractionLocked) {
    return;
  }

  spinInteractionLocked = true;
  updateSpinAvailability();
  let animation = null;

  try {
    if (!machine.canSpin()) {
      const { balance, fixedBet, isSpinning } = machine.getState();

      if (isSpinning) {
        ui.showResult("Spin already in progress.", "loss");
        return;
      }

      if (balance < fixedBet) {
        ui.showResult("Not enough balance to spin.", "loss");
        return;
      }
    }

    updateSpinAvailability();

    const activeCellIndexes = new Set();
    animation = startReelAnimation(activeCellIndexes);
    await startColumnsLeftToRight(activeCellIndexes);
    ui.syncSpinningReels(Array.from(activeCellIndexes));
    const spinPromise = machine.spin(GAME_CONFIG.spinDurationMs);

    // Bet is deducted immediately when spin starts.
    ui.renderBalance(machine.getState().balance);
    ui.showResult("Spinning cylinders...", "neutral");

    const outcome = await spinPromise;

    clearInterval(animation);
    animation = null;
    await revealFinalReels(outcome.reels);

    ui.renderBalance(outcome.balance);

    if (outcome.didWin) {
      ui.showResult(
        `WIN! Payout: $${outcome.payout} (Net: ${outcome.netChange >= 0 ? "+" : ""}$${outcome.netChange}).${formatWinningLine(outcome.bestLine)}`,
        "win"
      );
    } else {
      ui.showResult("LOSS. Need 4+ matching symbols in a row or column to win.", "loss");
    }
  } catch (error) {
    if (animation) {
      clearInterval(animation);
    }
    ui.stopSpinning();
    ui.showResult(error.message, "loss");
  } finally {
    if (animation) {
      clearInterval(animation);
    }
    spinInteractionLocked = false;
    ui.stopSpinning();
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < GAME_CONFIG.fixedBet) {
      ui.showResult("Game over: balance too low for next spin.", "loss");
    }
  }
}

ui.spinButton.addEventListener("click", handleSpin);
if (ui.themeToggleButton) {
  ui.themeToggleButton.addEventListener("click", handleThemeToggle);
}
initialize();
