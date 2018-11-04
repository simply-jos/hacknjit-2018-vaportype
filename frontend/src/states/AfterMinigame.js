const AfterMinigame = class extends State {
  constructor(game) {
    super(game);

    this.frame = 0;
  }

  Init() {
    this.resultsLabel = this.game.game.add.text(
      0, 0, '', { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.resultsLabel, 0, 200, 1000, 100, 4);
    this.resultsLabel.text = 'RESULTS';

    this.playerLabels = [];
    this.scoreLabels = [];

    const margin = 125;
    const fullWidth = 1000 - margin * 2;
    const textWidth = fullWidth / 4;
    for (let i=0;i<4;++i) {
      const x = margin + textWidth * i;
      const y = 275;

      {
        const label = this.game.game.add.text(
          0, 0, "", { fill: "#fff", boundsAlignH: "center" }
        );
        MoveTextScaled(label, x, y, textWidth, 100, 3);
        this.playerLabels.push(label);
      }

      {
        const label = this.game.game.add.text(
          0, 0, "", { fill: "#f00", boundsAlignH: "center" }
        );
        MoveTextScaled(label, x, y + 35, textWidth, 100, 3);
        this.scoreLabels.push(label);
      }
    }
  }

  Start() {
  }

  End() {
    for (const label of this.playerLabels) {
      label.destroy();
    }

    for (const label of this.scoreLabels) {
      label.destroy();
    }

    this.resultsLabel.destroy();
  }

  Tick() {
    this.frame++;

    if (this.frame % 70 < 35) {
      this.resultsLabel.alpha = 0;
    } else {
      this.resultsLabel.alpha = 1;
    }

    for (let i=0;i<4;++i) {
      this.playerLabels[i].text = `${this.game.gamestate.players[i].username}`;
      this.playerLabels[i].mask = this.game.backgroundMask;

      this.scoreLabels[i].text += '';
      for (let j=0;j<this.game.gamestate.players[i].strikes;++j) {
        this.scoreLabels[i].text += 'X';
      }
      this.scoreLabels[i].mask = this.game.backgroundMask;
    }

    this.resultsLabel.mask = this.game.backgroundMask;

    if (this.frame == 200) {
      this.game.SetState(new BeforeMinigame(this.game));
    }
  }
}