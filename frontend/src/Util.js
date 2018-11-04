function MoveTextScaled(text, x, y, w, h, scale) {
  text.scale = new Phaser.Point(scale, scale);
  text.setTextBounds(x / scale, y / scale, w / scale, h / scale);
}