export class DrawingManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.drawings = [];
    this.active = null;
    this.isDrawing = false;

    this.canvas.addEventListener('mousedown', e => this.startDraw(e));
    this.canvas.addEventListener('mousemove', e => this.moveDraw(e));
    this.canvas.addEventListener('mouseup', e => this.endDraw(e));
  }

  startDraw(e) {
    const { offsetX, offsetY } = e;
    this.isDrawing = true;
    this.active = { type: 'line', start: { x: offsetX, y: offsetY }, end: { x: offsetX, y: offsetY } };
  }

  moveDraw(e) {
    if (!this.isDrawing || !this.active) return;
    const { offsetX, offsetY } = e;
    this.active.end = { x: offsetX, y: offsetY };
    this.render();
  }

  endDraw(e) {
    if (!this.active) return;
    this.drawings.push(this.active);
    this.active = null;
    this.isDrawing = false;
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    for (const d of this.drawings) {
      this.drawLine(d.start, d.end);
    }
    if (this.active) this.drawLine(this.active.start, this.active.end);
  }

  drawLine(a, b) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}
