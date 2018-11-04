const BeforeConnect = class extends State {
  constructor(game) {
    super(game);

    this.frame = 0;
  }

  Init() {
    this.waitingLabel = this.game.game.add.text(
      0, 0, '', { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.waitingLabel, 0, 200, 1000, 100, 4);
    this.waitingLabel.text = 'WAITING FOR PLAYERS';

    this.playerLabels = [];

    const margin = 125;
    const fullWidth = 1000 - margin * 2;
    const textWidth = fullWidth / 4;
    for (let i=0;i<4;++i) {
      const x = margin + textWidth * i;
      const y = 275;

      const label = this.game.game.add.text(
        0, 0, "", { fill: "#fff", boundsAlignH: "center" }
      );
      MoveTextScaled(label, x, y, textWidth, 100, 3);

      this.playerLabels.push(label);
    }
  }

  Start() {
  }

  End() {
    for (const label of this.playerLabels) {
      label.destroy();
    }

    this.waitingLabel.destroy();
  }

  Tick() {
    this.frame++;

    if (this.frame % 70 < 35) {
      this.waitingLabel.alpha = 0;
    } else {
      this.waitingLabel.alpha = 1;
    }

    for (let i=0;i<4;++i) {
      if (i < this.game.gamestate.players.length && this.game.gamestate.players[i])
        this.playerLabels[i].text = `${this.game.gamestate.players[i].username}`;
      else
        this.playerLabels[i].text = `-`;
    }
  }
}