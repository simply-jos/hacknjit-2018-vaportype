const EnteringMinigame = class extends State {
  constructor(game, roundNumber, minigame) {
    super(game);

    this.roundNumber = roundNumber;
    this.minigame = minigame;
    this.frame = 0;
  }

  Init() {
    this.roundLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.roundLabel, 0, 200, 1000, 100, 4);
    this.roundLabel.alpha = 0;
    this.roundLabel.text = `ROUND ${this.roundNumber}`;

    this.playLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.playLabel, 0, 260, 1000, 100, 3.5);
    this.playLabel.alpha = 0;
    this.playLabel.text = '>> PLAY >>';
  }

  Start() {
  }

  End() {
    // delay destroying so we can see them be cropped by the mask
    setTimeout(() => {
      this.roundLabel.destroy();
      this.playLabel.destroy();
    }, 1000);
  }

  Tick() {
    this.frame++;

    if (this.frame > 25) {
      const relFrame = this.frame - 25;

      if (relFrame < 90) {
        if (relFrame%60 > 30) {
          this.roundLabel.alpha = 0;
        } else {
          this.roundLabel.alpha = 1;
        }
      } else {
        this.roundLabel.alpha = 1;
      }
    }

    if (this.frame > 100) {
      this.playLabel.alpha = 1;

      if (this.frame%60 > 30) {
        this.playLabel.alpha = 0;
      } else {
        this.playLabel.alpha = 1;
      }
    }

    this.playLabel.mask = this.game.backgroundMask;
    this.roundLabel.mask = this.game.backgroundMask;

    // TODO: fast test
    if (this.frame == 230) {
      this.game.SetState(new DuringMinigame(this.game, this.minigame));
    }
  }
}