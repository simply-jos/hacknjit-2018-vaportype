const game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'game_div', {
  preload: () => {
    game.load.image('background', 'assets/test.png');
  },
  create: () => {
    const c = game.add.sprite(0, 0, 'background');

    c.rotation = 0;
  }
});

window.game = game;
