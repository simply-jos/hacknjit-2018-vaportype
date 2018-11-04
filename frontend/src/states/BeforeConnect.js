const BeforeConnect = class extends State {
  constructor(game) {
    super(game);
  }

  Init() {
    this.playerLabels = [];

    for (let i=0;i<4;++i) {
      const x = 120 + ((1280 - 120) / 4) * i;
      const y = 720 / 2;

      const label = this.game.game.add.text(
        x, y, "", { font: "vcr", fill: "#fff", boundsAlignH: "center", boundsAlignV: "center" }
      );

      label.setTextBounds(x, y - 100, 200, 200);

      this.playerLabels.push(label);
    }
  }

  Start() {
  }

  End() {
    for (const label of this.playerLabels) {
      label.destroy();
    }
  }

  Tick() {
    for (let i=0;i<4;++i) {
      this.playerLabels[i].text = `PLAYER ${i}/nthis.game.players[i].username`;
    }
  }
}