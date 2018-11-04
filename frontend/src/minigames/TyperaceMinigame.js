const TyperaceMinigame = class extends Minigame {
  constructor(game, text) {
    super(game);

    this.frame = 0;
    this.text = text;
    this.localTypedText = '';
  }

  Init() {
    this.instructionsLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.instructionsLabel, 0, 200, 1000, 100, 4);
    this.instructionsLabel.text = ">> TYPERACE >>"
    this.instructionsLabel.mask = this.game.invertedBackgroundMask;

    this.playerProgressLabels = [];

    const heightOffset = 450;
    const margin = 200;
    const fullHeight = (1000 - heightOffset) - margin * 2;
    const textHeight = fullHeight / 4;
    for (let i=0;i<4;++i) {
      const x = 325;
      const y = heightOffset + margin + textHeight * i;
      const label = this.game.game.add.text(
        0, 0, "", { fill: "#fff", align: "right", boundsAlignH: "right" }
      );
      MoveTextScaled(label, x, y, 500, textHeight, 3.5);
      label.mask = this.game.invertedBackgroundMask;

      this.playerProgressLabels.push(label);
    }
  }

  Deinit() {
    for (const label of this.playerProgressLabels) {
      label.destroy();
    }

    this.instructionsLabel.destroy();
    this.textLabel.destroy();
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
    for (const c of this.game.input.GetInputString()) {
      if (c == '\b')
        this.localTypedText = this.localTypedText.substring(0, this.localTypedText.length - 1);
      else
        this.localTypedText += c;
    }



    // Get the number of matching characters in the locally typed text
    let matchingEndPos = 0;
    let numMatching = 0;
    let nonMatchingStartPos = -1;
    let nonMatchingEndPos = -1;
    for (let i=0;i<this.localTypedText.length;++i) {
      let localChar = this.localTypedText[i];
      let realChar = this.text[i];

      if (localChar != realChar) {
        break;
      }

      numMatching++;
      matchingEndPos = i + 1;
    }
    
    const charsWrong = this.localTypedText.length - matchingEndPos;
    if (charsWrong > 0) {
      nonMatchingStartPos = matchingEndPos;
      nonMatchingEndPos = matchingEndPos + charsWrong;
    }


    if (this.textLabel) this.textLabel.destroy();

    this.textLabel = this.game.game.add.text(
      0, 0, this.text, { fill: "#fff", boundsAlignH: "ceter", wordWrap: true, wordWrapWidth: 800 }
    );
    MoveTextScaled(this.textLabel, 100, 300, 800, 300, 5);
    this.textLabel.lineSpacing = -5;

    this.textLabel.addColor('#0f0', 0);
    this.textLabel.addColor('#fff', matchingEndPos);

    if (nonMatchingStartPos > -1) {
      this.textLabel.addColor('#f00', nonMatchingStartPos);
      this.textLabel.addColor('#fff', nonMatchingEndPos);
    }

    this.textLabel.mask = this.game.invertedBackgroundMask;

    // We typed something, notify server of our progress and inject into our own
    if (this.game.input.GetInputString().length > 0) {
      this.game.SetMinigameState({
        progress: numMatching / this.text.length
      });
    }

    for (let i=0;i<4;++i) {
      const alive = this.game.gamestate.players[i].alive;
      let minigameState = this.game.gamestate.players[i].minigameState;
      let playerProgress = minigameState.progress || 0;

      let progressText = `${this.game.gamestate.players[i].username}: `; //[`;

      if (alive) {
        progressText += '[';
        for (let j = 0; j < 25; ++j) {
          if (j < playerProgress * 25) {
            progressText += '=';
          } else {
            progressText += ' ';
          }
        }

        progressText += ']';

        this.playerProgressLabels[i].text = progressText;
        this.playerProgressLabels[i].mask = this.game.invertedBackgroundMask;
      } else {
        progressText += '*ELIM*';
        this.playerProgressLabels[i].setColor('#f00', 0);
      }
    }
  }
}