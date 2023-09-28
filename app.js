class Card {
  constructor(id, cardBackgroundColor, cardTextColor) {
    this.id = id;
    this.cardBackgroundColor = cardBackgroundColor;
    this.cardTextColor = cardTextColor;
    this.cardElement = this.createCardElement();
  }

  createCardElement() {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = this.id;
    card.style.backgroundColor = this.cardBackgroundColor;
    card.style.color = this.cardTextColor;
    return card;
  }

  onCardClick() {
    this.cardElement.classList.add('flipped');

    anime({
      targets: this.cardElement,
      scale: [{value: 1}, {value: 1.1}, {value: 1}],
      rotateY: '0deg',
      duration: 200,
      easing: 'linear',
    });
  }
}

class MatchGrid {
  constructor(args) {
    this.width = args.width;
    this.height = args.height;
    this.columnNumber = args.columnNumber;
    this.rowNumber = args.rowNumber;
    this.timeLimit = args.timeLimit;
    this.theme = args.theme;

    this.cardsNumber = this.columnNumber * this.rowNumber;
    this.cards = [];
    this.grid = document.getElementById('grid');
    this.gameContainer = document.getElementById('game-container');

    document.body.style.backgroundColor = this.theme.backgroundColor;
    document.body.style.fontFamily = this.theme.font;

    this.remainingTime = this.timeLimit;
    this.timerInterval = null;
    this.timer = document.getElementById('timer');
    this.timer.innerHTML = `Time Left: ${this.timeLimit}`;

    this.startButton = document.getElementById('start-button');
    this.startButton.addEventListener('click', () => this.startGame());

    this.restartButton = document.getElementById('restart-button');
    this.restartButton.disabled = true;
    this.restartButton.addEventListener('click', () => this.restartGame());

    this.isGamePaused = false;
    this.mouseEnterListener = () => this.resumeGame();
    this.mouseLeaveListener = () => this.pauseGame();
  }

  startGame() {
    this.cards = [];
    this.createGameGrid();
    this.startTimer();

    this.startButton.disabled = true;
    this.restartButton.disabled = true;
    this.gameContainer.addEventListener('mouseenter', this.mouseEnterListener);
    this.gameContainer.addEventListener('mouseleave', this.mouseLeaveListener);

    this.gameContainer.style.width = `${this.width}px`;
    this.gameContainer.style.height = `${this.height}px`;
  }

  startTimer() {
    let timeLeft = this.remainingTime;

    this.timerInterval = setInterval(() => {
      timeLeft--;
      this.timer.textContent = `Time Left: ${timeLeft}`;

      if (timeLeft === 0) {
        this.endGame(false);
      }
    }, 1000);
  }

  createCard(id) {
    const card = new Card( id, this.theme.cardBackgroundColor, this.theme.cardTextColor);
    card.cardElement.addEventListener('click', () => this.handleCardClick(card));
    this.grid.appendChild(card.cardElement);
    this.cards.push(card);
  }

  createGameGrid() {
    this.grid.innerHTML = '';
    this.grid.style.setProperty('grid-template-columns', `repeat(${this.columnNumber}, 1fr)`);

    for (let i = 0; i < this.cardsNumber / 2; i++) {
      let cardId = i + 1;
      this.createCard(cardId);
      this.createCard(cardId);
    }

    this.shuffleCards();
  }

  shuffleCards() {
    let cardIds = this.cards.map(card => card.id);
    cardIds = cardIds.sort(() => Math.random() - 0.5);

    this.cards.map((card, index) => {
      card.id = cardIds[index];
      card.cardElement.textContent = card.id;
    });
  }

  handleCardClick(card) {
    if (card.cardElement.classList.contains('flipped')) return;

    card.onCardClick();
    let selectedCards = this.cards.filter(card => card.cardElement.classList.contains('flipped'));

    if (selectedCards.length === 2) {
      this.checkCardMatch(selectedCards);
      selectedCards = [];
    }
  }

  checkCardMatch(selectedCards) {
    const [card1, card2] = selectedCards;
    this.cards.forEach(card => card.cardElement.classList.add('disabled'));

    setTimeout(() => {
      if (card1.id === card2.id) {
        card1.cardElement.style.visibility = 'hidden';
        card2.cardElement.style.visibility = 'hidden';
        this.checkForWin();
      }
      anime({
        targets: [card1.cardElement, card2.cardElement],
        scale: [{value: 1}, {value: 1.1}, {value: 1}],
        rotateY: '180',
        duration: 200,
        easing: 'linear',
      });

      card1.cardElement.classList.remove('flipped');
      card2.cardElement.classList.remove('flipped');

      this.cards.forEach(card => card.cardElement.classList.remove('disabled'));
    }, 1000);
  }

  checkForWin() {
    if (this.cards.every(card => card.cardElement.style.visibility === 'hidden')) {
      this.endGame(true);
    }
  }

  pauseGame() {
    if (!this.isGamePaused) {
      this.remainingTime = parseInt(this.timer.textContent.split(' ')[2]);
      this.timer.textContent = `Game paused!`;
      clearInterval(this.timerInterval);
      this.isGamePaused = true;
    }
  }

  resumeGame() {
    if (this.isGamePaused) {
      this.timer.textContent = `Time Left: ${this.remainingTime}`;
      this.startTimer();
      this.isGamePaused = false;
    }
  }

  restartGame() {
    const restart = confirm('Do you want to play again?');

    if (restart) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.remainingTime = this.timeLimit;
      this.timer.textContent = `Time Left: ${this.timeLimit}`;
      this.startGame();
    }
  }
  
  endGame(isWinner) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.gameContainer.removeEventListener('mouseenter', this.mouseEnterListener);
    this.gameContainer.removeEventListener('mouseleave', this.mouseLeaveListener);

    this.restartButton.disabled = false;
    this.cards.forEach(card => card.cardElement.classList.add('disabled'));

    if (isWinner) {
      alert('Congratulations! You won! :)');
    } else {
      alert('Time is up. You lost :(');
    }
  }
}

const gameArgs = {
  width: 500,
  height: 400,
  rowNumber: 4,
  columnNumber: 4,
  timeLimit: 60,
  theme: {
    backgroundColor: "#f0f0f0",
    cardBackgroundColor: "#ccc",
    cardTextColor: "black",
    font: "Arial, sans-serif",
  },
}

const game = new MatchGrid(gameArgs);
