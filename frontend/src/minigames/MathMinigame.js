const MathMinigame = class extends Minigame {
  constructor(game, a, b, op, result) {
    super(game);

    this.a = a;
    this.b = b;
    this.op = op;
    this.result = result;

    this.frame = 0;

    this.localFinished = false;
    this.localTypedText = '';
  }

  Init() {
    this.instructionsLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.instructionsLabel, 0, 200, 1000, 100, 4);
    this.instructionsLabel.text = ">> DO MATH >>"
    this.instructionsLabel.mask = this.game.invertedBackgroundMask;

    this.questionLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.questionLabel, 0, 300, 1000, 100, 6);
    this.questionLabel.text = `${this.a} ${this.op} ${this.b} = ___`;
    this.questionLabel.mask = this.game.invertedBackgroundMask;

    this.playerProgressLabels = [];

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

  Deinit() {
    for (const label of this.playerProgressLabels) {
      label.destroy();
    }

    this.instructionsLabel.destroy();
    this.questionLabel.destroy();
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

    // Add to the locally typed text
    if (!this.localFinished) {
      for (const c of this.game.input.GetInputString()) {
        if (c == '\b')
          this.localTypedText = this.localTypedText.substring(0, this.localTypedText.length - 1);
        else
          this.localTypedText += c;
      }
    }

    if (this.localTypedText.length > 3) {
      this.localTypedText = this.localTypedText.substring(0, 3);
    }

    this.questionLabel.text = `${this.a} ${this.op} ${this.b} = `;
    let i = 0;
    for (i=0;i<this.localTypedText.length;++i) {
      this.questionLabel.text += this.localTypedText[i];
    }

    for (;i<3;++i) {
      this.questionLabel.text += '_';
    }

    // check if result matches guess
    if (this.localTypedText == this.result) {
      this.localFinished = true;

      this.game.SetMinigameState({ correct: true });
    }

    for (let i=0;i<4;++i) {
      if (!this.game.gamestate.players[i].alive) continue;

      const minigameState = this.game.gamestate.players[i].minigameState;
      let text = `${this.game.gamestate.players[i].username}: `;

      const offset = text.length;
      if (minigameState.correct) {
        text += ' O ';
      } else {
        text += '...';
      }

      this.playerProgressLabels[i].text = text;

      if (minigameState.correct) {
        this.playerProgressLabels[i].addColor('#0f0', offset);
      }
    }
  }
}