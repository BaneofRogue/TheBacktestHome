// DrawingManager.js
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
    this.canvas.addEventListener('mouseleave', () => this.cancelDraw());
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
    if (!this.isDrawing || !this.active) return;
    this.drawings.push(this.active);
    this.active = null;
    this.isDrawing = false;
    this.render();
  }

  cancelDraw() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.active = null;
      this.render();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // existing drawings
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    for (const d of this.drawings) {
      this.drawLine(d.start, d.end);
    }

    // active (in-progress) drawing
    if (this.active) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 0.6)';
      this.drawLine(this.active.start, this.active.end);
    }
  }

  drawLine(a, b) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  clear() {
    this.drawings = [];
    this.render();
  }
}
