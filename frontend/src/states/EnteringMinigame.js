const EnteringMinigame = class extends State {
  constructor(game) {
    super(game);

    this.frame = 0;
  }

  Init() {
    this.roundLabel = this.game.game.add.text(
      0, 0, "ROUND 1", { font: "vcr", fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.roundLabel, 0, 200, 1000, 100, 4);
    this.roundLabel.alpha = 0;

    this.playLabel = this.game.game.add.text(
      0, 0, "PLAY >>", { font: "vcr", fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.playLabel, 0, 260, 1000, 100, 3.5);
    this.playLabel.alpha = 0;
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

    if (this.frame == 230) {
      this.game.SetState(new DuringMinigame(this.game));
    }
  }
}