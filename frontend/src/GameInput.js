const GameInput = class {
  constructor(game) {
    this.inputStringAccumulator = '';
    this.inputString = '';

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