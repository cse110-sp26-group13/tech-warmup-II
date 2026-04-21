const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();

function updateSpinAvailability() {
  const { balance, fixedBet, isSpinning } = machine.getState();

  ui.setSpinButtonState({
    canSpin: machine.canSpin(),
    isSpinning,
    noBalance: balance < fixedBet,
  });
}

function initialize() {
  ui.renderReels(GAME_CONFIG.symbols.slice(0, GAME_CONFIG.reelCount));
  const state = machine.getState();
  ui.renderBalance(state.balance);
  ui.renderBet(state.fixedBet);
  updateSpinAvailability();
}

function startReelAnimation() {
  return setInterval(() => {
    const rollingReels = Array.from(
      { length: GAME_CONFIG.reelCount },
      () => GAME_CONFIG.symbols[Math.floor(Math.random() * GAME_CONFIG.symbols.length)]
    );

    ui.renderReels(rollingReels);
  }, GAME_CONFIG.animationTickMs);
}

async function handleSpin() {
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

  const animation = startReelAnimation();
  const spinPromise = machine.spin(GAME_CONFIG.spinDurationMs);

  // Bet is deducted immediately when spin starts.
  ui.renderBalance(machine.getState().balance);
  ui.showResult("Spinning...", "neutral");

  try {
    const outcome = await spinPromise;

    clearInterval(animation);
    ui.renderReels(outcome.reels);
    ui.renderBalance(outcome.balance);

    if (outcome.didWin) {
      ui.showResult(
        `WIN! Payout: $${outcome.payout} (Net: ${outcome.netChange >= 0 ? "+" : ""}$${outcome.netChange})`,
        "win"
      );
    } else {
      ui.showResult(`LOSS. Net: -$${GAME_CONFIG.fixedBet}`, "loss");
    }
  } catch (error) {
    clearInterval(animation);
    ui.showResult(error.message, "loss");
  } finally {
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < GAME_CONFIG.fixedBet) {
      ui.showResult("Game over: balance too low for next spin.", "loss");
    }
  }
}

ui.spinButton.addEventListener("click", handleSpin);
initialize();
