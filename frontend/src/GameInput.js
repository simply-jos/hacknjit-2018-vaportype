const GameInput = class {
  constructor(game) {
    this.inputStringAccumulator = '';
    this.inputString = '';

    document.addEventListener("keydown", e => {
      if (e.keyCode == 8) {
        e.preventDefault()

        this.inputStringAccumulator += '\b';
      }
    });

    game.input.keyboard.addCallbacks(this, null, null, c => {
      this.inputStringAccumulator += c;
    });
  }

  CalculateInputString() {
    this.inputString = this.inputStringAccumulator;
    this.inputStringAccumulator = '';
  }

  GetInputString() {
    return this.inputString;
  }
}