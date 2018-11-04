const DuringMinigame = class extends State {
  constructor(game, minigame) {
    super(game);

    this.minigame = minigame;
  }

  Start() {
    this.minigame.Init();
    this.minigame.Start();
  }

  End() {
    this.minigame.End();

    setTimeout(() => {
      this.minigame.Deinit();
    }, 1000);
  }

  Tick() {
    this.minigame.Tick();
  }
}