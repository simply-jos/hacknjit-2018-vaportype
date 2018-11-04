function MoveTextScaled(text, x, y, w, h, scale) {
  text.style.font = '14px vcr';
  scale *= 0.6;
  text.scale = new Phaser.Point(scale, scale);
  text.setTextBounds(x / scale, y / scale, w / scale, h / scale);
}