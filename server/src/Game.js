function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

const Player = class {
  constructor(username, sock) {
    this.username = username;
    this.sock = sock;

    this.alive = true;
    this.strikes = 0;
    this.minigameState = {};
  }

  GetState() {
    return {
      username: this.username,
      alive: this.alive,
      strikes: this.strikes,
      minigameState: this.minigameState
    };
  }
}

exports.Game = class {
  constructor() {
    this.players = [];
    this.roundNumber = 1;
  }

  StartGame() {
    this.Send('SetMetaState', {
      stateName: 'BeforeMinigame'
    });

    this.GameLoop();
  }

  async PlayRandomMinigame() {
    const random = randomIntFromInterval(0, 1);

    // Reset all players minigame state
    for (const player of this.players) {
      player.mnigameState = {};
    }

    this.SendGameState();

    if (random == 0) {
      function randLetter() {
        var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        var letter = letters[Math.floor(Math.random() * letters.length)];
        return letter
      }

      this.Send('SetMinigame', {
        roundNumber: this.roundNumber,
        minigameName: 'ReactionMinigame',
        key: randLetter(),
        revealFrame: randomIntFromInterval(250, 600)
      });
    } else if (random == 1) {
      const phrases = [
        `After you've done a thing the same way for two years, look it over carefully.`,
        `Throw it out and start all over.`,
        `The best way to break a habit is to drop it.`,
        `I haven't failed. I've just found 10,000 ways that won't work.`,
        `When nobody around you seems to measure up, it's time to check your yardstick.`,
        `The farther a man knows himself to be from perfection, the nearer he is to it.`,
        `Morale is when your hands and feet keep on working when your head says it can't be done.`,
        `Courage is the first of human qualities because it is the quality which guarantees all the others.`
      ];

      const phrase = phrases[randomIntFromInterval(0, 7)];

      this.Send('SetMinigame', {
        roundNumber: this.roundNumber,
        minigameName: 'TyperaceMinigame',
        text: phrase
      });
    }
  }

  async GameLoop() {
    while (true) {
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Select a new minigame
      await this.PlayRandomMinigame();

      // Increment round number
      this.roundNumber++;

      // Wait a bit
      await new Promise(resolve => {});
    }
  }

  AddPlayer(username, sock) {
    if (this.players.find(p => p.username == username)) return;
    if (this.players.length >= 4) return;

    const player = new Player(username, sock);
    this.players.push(player);

    console.log(`${username} joined`);

    player.sock.on('SetMinigameState', minigameState => {
      player.minigameState = minigameState;
      this.SendGameState();
    });

    player.sock.emit('JoinedGame', {});
    this.SendGameState();

    if (this.players.length == 4) {
      console.log(`4 players, starting game`);
      setTimeout(() => {
        this.StartGame();
      }, 2500);
    }
  }

  SendGameState() {
    const gameState = {
      players: this.players.map(player => player.GetState())
    };

    this.Send('SetGameState', gameState);
  }

  Send(action, data) {
    for (const player of this.players) {
      player.sock.emit(action, data);
    }
  }
}