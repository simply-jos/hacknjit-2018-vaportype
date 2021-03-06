// const io = require('socket.io')(80);

function ResizeHandler() {
  // Scale to fit window, maintain aspect ratio
  // to smallest dimension
  let menu = document.getElementById("game_holder");

  if (!menu) {
    return;
  }

  const extraMargin = 100;
  const innerHeight = window.innerHeight - extraMargin * 2;
  const innerWidth = window.innerWidth - extraMargin * 2;

  let scale = 0;
  if (innerWidth < innerHeight) {
    scale = innerWidth / 1000;
  } else {
    scale = innerHeight / 1000;
  }

  menu.style.zoom = `${scale * 100}%`;
}

window.onresize = ResizeHandler;

ResizeHandler();

const Game = class {
  constructor(localUsername, socket) {
    this.socket = socket;
    this.localUsername = localUsername;
    this.dead = false;
    this.isWinner = false;
    this.nextHighlightHurt = [];

    this.gamestate = {
      players: []
    };

    this.socket.on('NotifyWin', data => {
      this.isWinner = true;
    });

    this.socket.on('NotifyHurt', data => {
      this.nextHighlightHurt.push(data.playerName);
    });

    this.socket.on('YouAreDead', () => {
      this.dead = true;
    })

    this.socket.on('SetGameState', state => {
      this.gamestate = state;
    });

    this.socket.on('SetMetaState', data => {
      const stateName = data.stateName;

      if (stateName == 'AfterMinigame') {
        this.SetState(new AfterMinigame(this));
      } else if (stateName == 'BeforeMinigame') {
        this.SetState(new BeforeMinigame(this));
      }
    });

    this.socket.on('SetMinigame', data => {
      // reset all players minigame state
      for (const player of this.gamestate.players) {
        player.minigameState = {};
      }

      let minigame = null;
      if (data.minigameName == 'ReactionMinigame') {
        minigame = new ReactionMinigame(this, data.letter, data.revealFrame);
      } else if (data.minigameName == 'TyperaceMinigame') {
        minigame = new TyperaceMinigame(this, data.text);
      } else if (data.minigameName == 'MathMinigame') {
        minigame = new MathMinigame(this, data.a, data.b, data.op, data.result);
      } else if (data.minigameName == 'SpeedWordMinigame') {
        minigame = new SpeedWordMinigame(this, data.text);
      } else if (data.minigameName == 'GuitarHeroMinigame') {
        minigame = new GuitarHeroMinigame(this, data.keys, data.sequence);
      }

      this.SetState(
        new EnteringMinigame(this, data.roundNumber, minigame)
      );
    });
  }

  Start() {
    this.game = new Phaser.Game(1000, 1000, Phaser.CANVAS, 'game_holder', {
      preload: () => {
        this.game.load.video('background_vid', '/assets/videos/background.mp4');
      },

      create: () => {
        this.PrepareStage();

        this.input = new GameInput(this.game);

        this.frame = 0;
        this.minigameTransitProgress = 0;
        this.minigame = null;
        this.SetState(new BeforeConnect(this));

        this.game.stage.disableVisibilityChange = true;
      },

      update: () => {
        this.Tick();
      }
    });
  }

  IsLocalPlayerWinner() {
    return this.isWinner;
  }

  IsLocalPlayerDead() {
    return this.dead;
  }

  SetMinigameState(minigameState) {
    // insert into our own player
    for (const player of this.gamestate.players) {
      if (player.username == this.localUsername) {
        player.minigameState = minigameState;
      }
    }

    this.socket.emit('SetMinigameState', minigameState);
  }

  PrepareStage() {
    // bg
    this.backgroundVideo = this.game.add.video('background_vid');

    this.backgroundVideo.alpha = 0;
    this.backgroundVideo.mute = true;
    this.backgroundVideo.play(true);

    this.backgroundSprite = this.game.add.sprite(-250, 135);
    this.backgroundSprite.scale = new Phaser.Point(1.2, 1.2);
    this.backgroundVideo.add(this.backgroundSprite);

    this.backgroundSprite.alpha = 0;
    this.game.add.tween(this.backgroundSprite)
      .to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);
  }

  SetState(newState) {
    if (this.state) {
      this.state.End();
    }

    this.state = newState;
    this.state.Init();
    this.state.Start();
  }

  Tick() {
    if (this.dead) return;
    if (!this.state) return;
    this.backgroundVideo.mute = true;

    this.input.CalculateInputString();
    this.DrawMinigameTransition();

    this.state.Tick();

    this.frame++;
  }

  DrawMinigameTransition() {
    if (!this.transitioning) {
      this.transitioning = true;
    }

    let transitDirection = 1;
    if (!(this.state instanceof DuringMinigame)) {
      transitDirection = -1;
    }

    const midPoint = [
      1000 / 2,
      1000 / 2
    ];

    this.minigameTransitProgress += 0.025 * transitDirection;
    this.minigameTransitProgress = Math.max(
      Math.min(1, this.minigameTransitProgress), 0
    );
    const transitProgress = Math.ceil(this.minigameTransitProgress * 8) / 8;

    const width = transitProgress * 1000;
    const height = transitProgress * 1000;

    const topLeft = [ midPoint[0] - width / 2, midPoint[1] - height / 2 ];
    const bottomRight = [ midPoint[0] + width / 2, midPoint[1] + height / 2 ];

    this.backgroundMask = this.backgroundMask || this.game.add.graphics(0, 0);
    this.backgroundMask.clear();

    this.invertedBackgroundMask = this.invertedBackgroundMask || this.game.add.graphics(0, 0);
    this.invertedBackgroundMask.clear();
    
    // Inverted mask is just the rect from the center
    this.invertedBackgroundMask.drawRect(
      topLeft[0], topLeft[1],
      bottomRight[0], bottomRight[1]
    );

    // Top
    this.backgroundMask.drawRect(
      0, 0,
      1000, topLeft[1]
    );

    // Bottom
    this.backgroundMask.drawRect(
      0, bottomRight[1],
      1000, 9999
    );

    // Left
    this.backgroundMask.drawRect(
      0, 0,
      topLeft[0], 1000
    );

    // Right
    this.backgroundMask.drawRect(
      bottomRight[0], 0,
      9999, 1000
    );

    this.backgroundSprite.mask = this.backgroundMask;
  }
};

// connect to the server with the game id
(() => {
  const socket = io.connect(`http://${window.location.hostname}:8000/`);

  var p = new URLSearchParams(document.location.search);
  const username = p.get('username');
  const gameId = p.get('gameId');
  
  socket.on('connect', () => {
    if (username && gameId) {
      socket.emit('joinGame', { username, gameId });
    }
  });

  socket.on('JoinedGame', () => {
    window.game = new Game(username, socket);
    window.game.Start();
  });
})();
