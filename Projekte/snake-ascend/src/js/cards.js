const CARD_TYPES = {
  // Tetris Blocks
  I_BLOCK: {
    id: 'i_block',
    name: 'I-Block',
    icon: '➖',
    cost: 3,
    type: 'block',
    shape: [
      [1, 1, 1, 1]
    ]
  },
  O_BLOCK: {
    id: 'o_block',
    name: 'O-Block',
    icon: '⬛',
    cost: 4,
    type: 'block',
    shape: [
      [1, 1],
      [1, 1]
    ]
  },
  T_BLOCK: {
    id: 't_block',
    name: 'T-Block',
    icon: '🔺',
    cost: 3,
    type: 'block',
    shape: [
      [1, 1, 1],
      [0, 1, 0]
    ]
  },
  L_BLOCK: {
    id: 'l_block',
    name: 'L-Block',
    icon: '📐',
    cost: 3,
    type: 'block',
    shape: [
      [1, 0],
      [1, 0],
      [1, 1]
    ]
  },
  // Specials
  SPRING: {
    id: 'spring',
    name: 'Feder',
    icon: '🌀',
    cost: 4,
    type: 'special',
    specialType: 'spring',
    shape: [[1]]
  },
  FOOD: {
    id: 'food',
    name: 'Apfel',
    icon: '🍎',
    cost: 2,
    type: 'special',
    specialType: 'food',
    shape: [[1]]
  },
  FREEZE: {
    id: 'freeze',
    name: 'Frost',
    icon: '❄️',
    cost: 3,
    type: 'special',
    specialType: 'freeze'
  },
  SHIELD: {
    id: 'shield',
    name: 'Schild',
    icon: '🛡️',
    cost: 3,
    type: 'special',
    specialType: 'shield'
  },
  CANNON: {
    id: 'cannon',
    name: 'Kanone',
    icon: '🔫',
    cost: 4,
    type: 'special',
    specialType: 'cannon',
    shape: [[1]]
  },
  BOMB: {
    id: 'bomb',
    name: 'Bombe',
    icon: '💣',
    cost: 4,
    type: 'special',
    specialType: 'bomb',
    shape: [[1]]
  },
  MAGNET: {
    id: 'magnet',
    name: 'Magnet',
    icon: '🧲',
    cost: 3,
    type: 'special',
    specialType: 'magnet'
  },
  ACCELERATOR: {
    id: 'accel',
    name: 'Boost',
    icon: '⚡',
    cost: 3,
    type: 'special',
    specialType: 'accel',
    shape: [[1]]
  }
};

class CardSystem {
  constructor() {
    this.deckPool = [
      CARD_TYPES.I_BLOCK,
      CARD_TYPES.O_BLOCK,
      CARD_TYPES.T_BLOCK,
      CARD_TYPES.L_BLOCK,
      CARD_TYPES.SPRING,
      CARD_TYPES.FOOD,
      CARD_TYPES.FREEZE,
      CARD_TYPES.SHIELD,
      CARD_TYPES.CANNON,
      CARD_TYPES.BOMB,
      CARD_TYPES.MAGNET,
      CARD_TYPES.ACCELERATOR
    ];
    // User configured deck, default to first 5 cards
    this.playerDeck = [
      CARD_TYPES.I_BLOCK,
      CARD_TYPES.O_BLOCK,
      CARD_TYPES.T_BLOCK,
      CARD_TYPES.SPRING,
      CARD_TYPES.FOOD
    ];
    this.hand = [];
    this.selectedCardIndex = -1;
    this.elixir = 4;
    this.maxElixir = 10;
    this.elixirRegenAccumulator = 0;
    // NEU: Cooldown-Variablen für den Redraw-Button
    this.redrawCooldown = 0; // aktueller Timer
    this.redrawMaxCooldown = 10000; // 10 Sekunden in Millisekunden
  }

  setPlayerDeck(cardIds) {
    this.playerDeck = cardIds.map(id => {
      return Object.values(CARD_TYPES).find(c => c.id === id);
    }).filter(Boolean);
  }

  reset() {
    this.elixir = 4;
    this.hand = [];
    this.selectedCardIndex = -1;
    this.elixirRegenAccumulator = 0;

    // Fill initial hand from the configured player deck
    for (let i = 0; i < 4; i++) {
      this.drawCard();
    }
    this.renderHand();
  }

  drawCard() {
    const randomIndex = Math.floor(Math.random() * this.playerDeck.length);
    const original = this.playerDeck[randomIndex];
    const card = JSON.parse(JSON.stringify(original));
    card.instanceId = Math.random();
    this.hand.push(card);
  }

  rotateSelectedCard() {
    if (this.selectedCardIndex < 0 || this.selectedCardIndex >= this.hand.length) return;
    const card = this.hand[this.selectedCardIndex];
    if (!card.shape) return;

    // Rotate matrix 90 degrees clockwise
    const N = card.shape.length;
    const M = card.shape[0].length;
    const rotated = Array.from({ length: M }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < M; c++) {
        rotated[c][N - 1 - r] = card.shape[r][c];
      }
    }
    card.shape = rotated;
    if (window.gameAudio) window.gameAudio.playPlace();
  }

  updateElixir(deltaTime, snakeLength) {
    const baseRegenRate = 1 / 1.3;
    const bonusMultiplier = 1 + Math.max(0, snakeLength - 3) * 0.08;

    if (this.elixir < this.maxElixir) {
      this.elixirRegenAccumulator += baseRegenRate * bonusMultiplier * (deltaTime / 1000);
      if (this.elixirRegenAccumulator >= 1) {
        this.elixir = Math.min(this.maxElixir, this.elixir + 1);
        this.elixirRegenAccumulator = 0;
      }
    } else {
      this.elixirRegenAccumulator = 0;
    }
    this.updateElixirUI();

    // NEU: Redraw Cooldown herunterzählen und Button aktualisieren
    if (this.redrawCooldown > 0) {
      this.redrawCooldown -= deltaTime;
      this.updateRedrawUI();
    }
  }

  updateElixirUI() {
    const fillPercent = (this.elixir / this.maxElixir) * 100;
    const fillElement = document.getElementById('elixir-bar-fill');
    const valElement = document.getElementById('elixir-val');

    if (fillElement) fillElement.style.width = `${fillPercent}%`;
    if (valElement) valElement.textContent = Math.floor(this.elixir);

    this.hand.forEach((card, idx) => {
      const cardEl = document.getElementById(`card-${idx}`);
      if (cardEl) {
        if (this.elixir < card.cost) {
          cardEl.classList.add('disabled');
        } else {
          cardEl.classList.remove('disabled');
        }
      }
    });
  }

  // Zieht 4 komplett neue Karten
  redrawHand() {
    // Verhindern, dass gedrückt wird, wenn der Cooldown noch läuft
    if (this.redrawCooldown > 0) return;

    // Hand leeren und neu ziehen
    this.hand = [];
    this.selectedCardIndex = -1;
    for (let i = 0; i < 4; i++) {
      this.drawCard();
    }
    this.renderHand();

    // Cooldown auf 10 Sekunden setzen
    this.redrawCooldown = this.redrawMaxCooldown;
    this.updateRedrawUI();
  }

  // Steuert, wie der Button aussieht (ausgegraut mit Sekunden oder klickbar)
  updateRedrawUI() {
    const btn = document.getElementById('redraw-btn');
    if (!btn) return;

    if (this.redrawCooldown > 0) {
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      // Verbleibende Sekunden anzeigen
      const seconds = Math.ceil(this.redrawCooldown / 1000);
      btn.textContent = `⏳ ${seconds}s`;
    } else {
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.textContent = `🔄`;
    }
  }

  renderHand() {
    const handContainer = document.getElementById('card-hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';

    this.hand.forEach((card, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${this.selectedCardIndex === index ? 'selected' : ''}`;
      cardEl.id = `card-${index}`;

      cardEl.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-icon">${card.icon}</div>
        <div class="card-name">${card.name}</div>
      `;

      cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectCard(index);
      });

      handContainer.appendChild(cardEl);
    });
  }

  selectCard(index) {
    if (this.hand[index].cost > this.elixir) {
      return;
    }

    if (this.selectedCardIndex === index) {
      this.selectedCardIndex = -1;
    } else {
      this.selectedCardIndex = index;
    }
    this.renderHand();
  }

  getSelectedCard() {
    if (this.selectedCardIndex >= 0 && this.selectedCardIndex < this.hand.length) {
      return this.hand[this.selectedCardIndex];
    }
    return null;
  }

  useSelectedCard() {
    if (this.selectedCardIndex >= 0 && this.selectedCardIndex < this.hand.length) {
      const card = this.hand[this.selectedCardIndex];
      this.elixir -= card.cost;
      this.hand.splice(this.selectedCardIndex, 1);
      this.selectedCardIndex = -1;
      this.drawCard();
      this.renderHand();
      this.updateElixirUI();
    }
  }
}

window.cardSystem = new CardSystem();
