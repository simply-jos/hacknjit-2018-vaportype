const GuitarHeroMinigame = class extends Minigame {
  constructor(game, keys, sequence) {
    super(game);

    this.frame = 0;

    this.keys = keys;
    this.keyLabels = [];

    this.sequence = sequence;
    this.sequenceLabels = [];

    this.localHits = 0;
    this.localMistakes = 0;

    this.alreadyFinished = false;
  }

  Init() {
    this.instructionsLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.instructionsLabel, 0, 200, 1000, 100, 4);
    this.instructionsLabel.text = ">> GUITAR HERO >>"
    this.instructionsLabel.mask = this.game.invertedBackgroundMask;

    {
      const heightOffset = -125;
      const margin = 400;
      const fullHeight = (1000 - heightOffset) - margin * 2;
      const textHeight = fullHeight / 4;
      for (let i=0;i<4;++i) {
        const x = 125;
        const y = heightOffset + margin + textHeight * i;
        const label = this.game.game.add.text(
          0, 0, "", { fill: "#fff", align: "left", boundsAlignH: "left" }
        );
        MoveTextScaled(label, x, y, 80, textHeight, 6);
        label.mask = this.game.invertedBackgroundMask;
        label.text = this.keys[i];

        this.keyLabels.push(label);
      }
    }

    {
      const heightOffset = -125;
      const margin = 400;
      const fullHeight = (1000 - heightOffset) - margin * 2;
      const textHeight = fullHeight / 4;
      for (let i=0;i<4;++i) {
        for (let j=0;j<this.sequence[i].length;++j) {
          const x = 700 + this.sequence[i][j] * 7.5;
          const y = heightOffset + margin + textHeight * i;
          const label = this.game.game.add.text(
            0, 0, "", { fill: "#fff", align: "left", boundsAlignH: "left" }
          );
          MoveTextScaled(label, x, y, 80, textHeight, 6);
          label.mask = this.game.invertedBackgroundMask;
          label.text = this.keys[i];

          this.sequenceLabels.push(label);
        }
      }
    }

    this.playerProgressLabels = [];
    {
      const heightOffset = 450;
      const margin = 200;
      const fullHeight = (1000 - heightOffset) - margin * 2;
      const textHeight = fullHeight / 4;
      for (let i=0;i<4;++i) {
        const x = 225;
        const y = heightOffset + margin + textHeight * i;
        const label = this.game.game.add.text(
          0, 0, "", { fill: "#fff", align: "right", boundsAlignH: "right" }
        );
        MoveTextScaled(label, x, y, 350, textHeight, 3.5);
        label.mask = this.game.invertedBackgroundMask;

        this.playerProgressLabels.push(label);
      }
    }
  }

  Deinit() {
    for (const label of this.keyLabels) {
      label.destroy();
    }

    for (const label of this.sequenceLabels) {
      label.destroy();
    }

    for (const label of this.playerProgressLabels) {
      label.destroy();
    }

    this.instructionsLabel.destroy();
  }

  Start() {
  }

  End() {
  }

  Tick() {
    this.frame++;

    if (this.frame < 105) {
      if (this.frame % 70 < 35) {
        this.instructionsLabel.alpha = 0;
      } else {
        this.instructionsLabel.alpha = 1;
      }
    } else {
      this.instructionsLabel.alpha = 1;
    }

    for (let label of this.sequenceLabels) {
      label.x -= 5;
    }

    let someChange = false;

    const input = this.game.input.GetInputString();
    for (const c of input) {
      let hx = 0;
      let hy = 0;

      const keyIndex = this.keys.findIndex(k => k == c);
      if (keyIndex != -1) {
        const heightOffset = -125;
        const margin = 400;
        const fullHeight = (1000 - heightOffset) - margin * 2;
        const textHeight = fullHeight / 4;
        hx = 125;
        hy = heightOffset + margin + textHeight * keyIndex;

        let hitSomething = false;
        for (let label of this.sequenceLabels) {
          if (label.alpha == 0) continue;

          if (Math.abs(label.worldPosition.x - hx) < 30 && Math.abs(label.worldPosition.y - hy) < 10) {
            this.localHits++;
            label.alpha = 0;
            hitSomething = true;
            someChange = true;
          }
        }

        if (!hitSomething) {
          this.localMistakes++;
          someChange = true;
        }
      }
    }

    let finished = true;
    for (let label of this.sequenceLabels) {
      if (label.worldPosition.x < 0 && label.alpha > 0) {
        label.alpha = 0;
        this.localMistakes++;
        someChange = true;
      } 

      if (label.alpha > 0) {
        finished = false;
      }
    }

    if (finished && !this.alreadyFinished) {
      this.game.SetMinigameState({
        hits: this.localHits,
        mistakes: this.localMistakes,
        finished
      });

      this.alreadyFinished = true;
    } else {
      if (someChange) {
        this.game.SetMinigameState({
          hits: this.localHits,
          mistakes: this.localMistakes,
          finished
        });
      }
    }
        
    for (let i=0;i<this.game.gamestate.players.length;++i) {
      if (!this.game.gamestate.players[i].alive) continue;

      const minigameState = this.game.gamestate.players[i].minigameState;
      let text = `${this.game.gamestate.players[i].username}: `;

      const greenOffset = text.length;
      text += `${minigameState.hits || 0}`;
      const whiteOffset = text.length + 1;
      text += ' / ';
      const redOffset = text.length;
      text += `${minigameState.mistakes || 0}`;

      this.playerProgressLabels[i].text = text;
      this.playerProgressLabels[i].addColor('#0f0', greenOffset);
      this.playerProgressLabels[i].addColor('#fff', whiteOffset);
      this.playerProgressLabels[i].addColor('#f00', redOffset);
    }
  }
}