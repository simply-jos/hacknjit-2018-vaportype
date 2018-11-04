function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

const Player = class {
  constructor(username, sock, game) {
    this.username = username;
    this.sock = sock;
    this.game = game;

    this.alive = true;
    this.strikes = 0;
    this.minigameState = {};
  }

  Hurt() {
    this.strikes++;

    this.game.Send('NotifyHurt', {
      playerName: this.username
    });

    if (this.strikes >= 3) {
      this.alive = false;

      this.sock.emit('YouAreDead', {});
    }
    
    this.game.SendGameState();
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

    this.minigameResolver = null;
  }

  StartGame() {
    this.Send('SetMetaState', {
      stateName: 'BeforeMinigame'
    });

    this.GameLoop();
  }

  SetCurrentMinigame(metadata) {
    this.minigameMetadata = metadata;
    this.Send('SetMinigame', metadata);
  }

  MinigameWinConditionMet() {
    if (this.minigameMetadata.minigameName == 'ReactionMinigame') {
      // last player to react gets hit, all players who guess wrong get hit
      const slowboys = [];
      for (const player of this.players) {
        if (!player.minigameState.guess && player.alive) {
          slowboys.push(player);
        }
      }

      if (slowboys.length == 1) {
        slowboys[0].Hurt();

        return true;
      }
    } else if (this.minigameMetadata.minigameName == 'TyperaceMinigame') {
      // last player to finish gets hit
      const unfinished = [];
      for (const player of this.players) {
        if (player.minigameState.progress != 1 && player.alive) {
          unfinished.push(player);
        }
      }

      // this guy sucked
      if (unfinished.length == 1) {
        unfinished[0].Hurt();

        return true;
      }
      
      // nobody sucked?? wtf
      if (unfinished.length == 0) {
        return true;
      }
    } else if (this.minigameMetadata.minigameName == 'MathMinigame') {
      // last player to finish gets hit
      const unfinished = [];
      for (const player of this.players) {
        if (!player.minigameState.correct && player.alive) {
          unfinished.push(player);
        }
      }

      // this guy sucked
      if (unfinished.length == 1) {
        unfinished[0].Hurt();

        return true;
      }
      
      // nobody sucked?? wtf
      if (unfinished.length == 0) {
        return true;
      }
    } else if (this.minigameMetadata.minigameName == 'GuitarHeroMinigame') {
      // if all players are done
      const unfinished = [];
      for (const player of this.players) {
        if (!player.minigameState.finished && player.alive) {
          unfinished.push(player);
        }
      }

      if (unfinished.length == 0) {
        // Hurt everyone except the best player
        let highestScore = -999;
        for (const player of this.players) {
          const score = player.minigameState.hits - player.minigameState.mistakes;
          if (score > highestScore) {
            highestScore = score;
          }
        }

        for (const player of this.players) {
          const score = player.minigameState.hits - player.minigameState.mistakes;
          if (score < highestScore) {
            player.Hurt();
          }
        }

        return true;
      }
    }

    return false;
  }

  async PlayRandomMinigame() {
    const random = randomIntFromInterval(0, 4);

    // Reset all players minigame state
    for (const player of this.players) {
      player.minigameState = {};
    }

    this.SendGameState();

    if (random == 0) {
      const randLetter = () => {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        const letter = letters[Math.floor(Math.random() * letters.length)];

        return letter;
      };

      this.SetCurrentMinigame({
        roundNumber: this.roundNumber,
        minigameName: 'ReactionMinigame',
        letter: randLetter(),
        revealFrame: randomIntFromInterval(150, 400)
      })
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

      this.SetCurrentMinigame({
        roundNumber: this.roundNumber,
        minigameName: 'TyperaceMinigame',
        text: phrase
      });
    } else if (random == 2) {
      const random = randomIntFromInterval(0, 1);
      const operations = ['-', '+'];
      const op = operations[random];

      let a = 0;
      let b = 0;
      let result = 0;
      if (op == '-') {
        // force a higher
        a = randomIntFromInterval(25, 50);
        b = randomIntFromInterval(1, 24);

        result = a - b;
      } else {
        a = randomIntFromInterval(1, 25);
        b = randomIntFromInterval(1, 25);
        
        result = a + b;
      }

      this.SetCurrentMinigame({
        roundNumber: this.roundNumber,
        minigameName: 'MathMinigame',
        a, b, op, result
      });
    } else if (random == 3) {
      const phrases = [
        `cat`,
        `cargo`,
        `keyboard`,
        `paper`,
        `office`,
        `cheese`,
        `wheels`,
        `assignment`
      ];

      const phrase = phrases[randomIntFromInterval(0, 7)];

      this.SetCurrentMinigame({
        roundNumber: this.roundNumber,
        minigameName: 'TyperaceMinigame',
        text: phrase
      });
    } else if (random == 4) {
      let letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
      let keys = [];
      while (keys.length < 4) {
        let idx = Math.floor(Math.random() * letters.length);
        keys.push(letters[idx]);
        letters.splice(idx, 1);
      }

      let sequence = [];
      for (let i=0;i<4;++i) sequence.push([]);

      let numNotes = 50;
      let x = 0;
      while (numNotes > 0) {
        x += 5 + Math.random() * 20;
        sequence[Math.floor(Math.random() * 4)].push(x);

        numNotes--;
      }

      this.SetCurrentMinigame({
        roundNumber: this.roundNumber,
        minigameName: 'GuitarHeroMinigame',
        keys,
        sequence
      });
    }
  }

  async GameLoop() {
    while (true) {
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Select a new minigame
      const minigamePromise = new Promise(resolve => { this.minigameResolver = resolve; });
      await this.PlayRandomMinigame();

      // Increment round number
      this.roundNumber++;

      // Wait until minigame is finished
      await minigamePromise;

      // Display results
      this.Send('SetMetaState', {
        stateName: 'AfterMinigame'
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if only one player left, if so, congrats bro
      let numPlayersAlive = 0;
      for (const player of this.players) {
        if (player.alive) {
          numPlayersAlive++;
        }
      }

      if (numPlayersAlive <= 1) {
        break;
      }
    }

    for (const player of this.players) {
      if (player.alive) {
        player.sock.emit('NotifyWin', {});
      }
    }
  }

  AddPlayer(username, sock) {
    if (this.players.find(p => p.username == username)) return;
    if (this.players.length >= 4) return;

    const player = new Player(username, sock, this);
    this.players.push(player);

    console.log(`${username} joined`);

    player.sock.on('SetMinigameState', minigameState => {
      player.minigameState = minigameState;

      // edge case for wrong guess in reaction
      if (this.minigameMetadata.minigameName == 'ReactionMinigame') {
        if (this.minigameMetadata.letter != minigameState.guess) {
          player.Hurt();
        }
      }

      this.SendGameState();

      if (this.minigameResolver) {
        if (this.MinigameWinConditionMet()) {
          this.minigameResolver();
          this.minigameResolver = null;
        }
      }
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