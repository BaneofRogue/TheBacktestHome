export default class Crosshair {
  constructor(color = '#888888', dash = [5,5]) {
    this.color = color;
    this.dash = dash;
  }

  draw(ctx, mousePos, canvasWidth, canvasHeight) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.setLineDash(this.dash);

    // vertical
    ctx.beginPath();
    ctx.moveTo(mousePos.x, 0);
    ctx.lineTo(mousePos.x, canvasHeight);
    ctx.stroke();

    // horizontal
    ctx.beginPath();
    ctx.moveTo(0, mousePos.y);
    ctx.lineTo(canvasWidth, mousePos.y);
    ctx.stroke();

    ctx.restore();
  }
}
