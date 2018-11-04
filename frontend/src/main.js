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

  let scale = innerHeight / 720;
  if (1280 * scale > innerWidth) {
    scale = innerWidth / 1280;
  }

  menu.style.zoom = `${scale * 100}%`;

  if (innerWidth > 1280 * scale) {
    menu.style.left = `${(innerWidth - 1280 * scale) / 2}px`;
    menu.style.top = '0px';
  } else if (innerHeight > 720 * scale) {
    menu.style.left = '0px';
    menu.style.top = `${(innerHeight - 720 * scale) / 2}px`;
  }
}

window.onresize = ResizeHandler;

ResizeHandler();

const State = {
  BEFORE_CONNECT: 0,

  BEFORE_MINIGAME: 1,
  ENTERING_MINIGAME: 2,
  IN_MINIGAME: 3,
  AFTER_MINIGAME: 4
};

const Game = class {
  constructor() {
    this.players = [
      new Player('jos'),
      new Player('toaster'),
      new Player('otters'),
      new Player('puke')
    ];
  }

  Start() {
    this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game_div', {
      preload: () => {
        this.game.load.video('background_vid', '/assets/videos/background.mp4');
      },

      create: () => {
        this.PrepareStage();

        this.input = new GameInput(this.game);

        this.frame = 0;
        this.stateFrame = 0;
        this.minigameTransitProgress = 0;
        this.state = State.BEFORE_MINIGAME;
        this.minigame = null;
      },

      update: () => {
        this.Tick();
      }
    });
  }

  PrepareStage() {
    // bg
    this.backgroundVideo = this.game.add.video('background_vid');

    this.backgroundVideo.alpha = 0;
    this.backgroundVideo.play(true);

    this.backgroundSprite = this.game.add.sprite(0, 0);
    this.backgroundVideo.add(this.backgroundSprite);

    this.backgroundSprite.alpha = 0;
    this.game.add.tween(this.backgroundSprite)
      .to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true);

    this.playText = this.game.add.text(80, 65, "PLAY >>", { font: "vcr", fill: "#fff"});
    this.playText.scale = new Phaser.Point(5.0, 5.0);
  }

  SetState(newState) {
    this.stateFrame = 0;
    this.state = newState;
  }

  Tick() {
    this.input.CalculateInputString();
    this.DrawMinigameTransition();

    if (this.state == State.BEFORE_CONNECT) {
      // Not connected
    } else if (this.state == State.BEFORE_MINIGAME) {
    } else if (this.state == State.ENTERING_MINIGAME) {
    } else if (this.state == State.IN_MINIGAME) {
      if (this.minigame) {
        this.minigame.Tick();
      }
    } else if (this.state == State.AFTER_MINIGAME) {
    }

    this.frame++;
    this.stateFrame++;

    // Draw the PLAY icon
    if (this.state == State.ENTERING_MINIGAME || this.state == State.IN_MINIGAME) {
      if (this.stateFrame % 70 < 35) {
        this.playText.alpha = 0;
      } else {
        this.playText.alpha = 1;
      }
    } else {
      this.playText.alpha = 0;
    }
  }

  DrawMinigameTransition() {
    if (!this.transitioning) {
      this.transitioning = true;
    }

    let transitDirection = 1;
    if (!this.minigame) {
      transitDirection = -1;
    }

    const midPoint = [
      1280 / 2,
      720 / 2
    ];

    this.minigameTransitProgress += 0.025 * transitDirection;
    const transitProgress = Math.ceil(this.minigameTransitProgress * 8) / 8;

    const width = transitProgress * 1280;
    const height = transitProgress * 720;

    const topLeft = [ midPoint[0] - width / 2, midPoint[1] - height / 2 ];
    const bottomRight = [ midPoint[0] + width / 2, midPoint[1] + height / 2 ];

    this.backgroundMask = this.backgroundMask || this.game.add.graphics(0, 0);
    this.backgroundMask.clear();

    // Top
    this.backgroundMask.drawRect(
      0, 0,
      1280, topLeft[1]
    );

    // Bottom
    this.backgroundMask.drawRect(
      0, bottomRight[1],
      1280, 9999
    );

    // Left
    this.backgroundMask.drawRect(
      0, 0,
      topLeft[0], 720
    );

    // Right
    this.backgroundMask.drawRect(
      bottomRight[0], 0,
      9999, 720
    );

    this.backgroundSprite.mask = this.backgroundMask;
    this.playText.mask = this.backgroundMask;
  }
};

window.game = new Game();
window.game.Start();