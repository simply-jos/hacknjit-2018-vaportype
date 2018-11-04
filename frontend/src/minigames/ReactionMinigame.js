const ReactionMinigame = class extends Minigame {
  constructor(game, key, revealFrame) {
    super(game);

    this.frame = 0;
    this.key = key;
    this.revealFrame = revealFrame;

    this.localTried = false;
    this.localState = '';
  }

  CoolGuyFlip() {
    const random = Math.floor(Math.random() * (4 - 0)); 

    this.coolGuyLabel.text = [
      '(-,-)\n /|\\\n / \\',
      '(>.>)\n /|\\\n / \\',
      '(<.<)\n /|\\\n / \\',
      '(-_-)\n ~|~\n / \\'
    ][random];
  }

  Init() {
    this.instructionsLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.instructionsLabel, 0, 200, 1000, 100, 4);
    this.instructionsLabel.text = ">> REACTION TEST >>"
    this.instructionsLabel.mask = this.game.invertedBackgroundMask;

    this.coolGuyLabel = this.game.game.add.text(
      0, 0, "", { fill: "#fff", boundsAlignH: "center" }
    );
    MoveTextScaled(this.coolGuyLabel, 0, 350, 1000, 100, 5);
    this.CoolGuyFlip();
    this.nextFlip = Math.random() * 60 + 20;

    this.coolGuyLabel.mask = this.game.invertedBackgroundMask;

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
    this.textLabel.destroy();
  }

  Start() {
  }

  End() {
  }

  Tick() {
    this.frame++;

    if (this.frame < 80) {
      if (this.frame % 70 < 35) {
        this.instructionsLabel.alpha = 0;
      } else {
        this.instructionsLabel.alpha = 1;
      }
    } else {
      this.instructionsLabel.alpha = 1;
    }

    if (this.frame > this.nextFlip) {
      this.CoolGuyFlip();
      this.nextFlip = this.frame + Math.random() * 60 + 20;
    }

    if (this.frame > this.revealFrame) {
      this.coolGuyLabel.text = `\nPRESS ${this.key.toUpperCase()} !`
    }

    const input = this.game.input.GetInputString();
    if (!this.localTried) {
      if (input.length > 0) {
        this.localTried = true;

        this.localState = input[0];
      }
    }
    
    for (let i=0;i<4;++i) {
      let text = `${this.game.players[i].username}: `;

      const offset = text.length;
      if (this.localTried) {
        text += ` ${this.localState} `;
      }  else {
        text += '...';
      }

      this.playerProgressLabels[i].text = text;

      if (this.localTried) {
        if (this.localState == this.key) {
          this.playerProgressLabels[i].addColor('#0f0', offset);
        } else {
          this.playerProgressLabels[i].addColor('#f00', offset);
        }
      }
    }
  }
}