export default class ChartCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };

    this._bindEvents();
    this._drawLoop();
  }

  _bindEvents() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    });

    this.canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.isDragging = true;
        this.dragStart.x = e.clientX - this.offsetX;
        this.dragStart.y = e.clientY - this.offsetY;
      }
    });

    this.canvas.addEventListener('mouseup', () => this.isDragging = false);
    this.canvas.addEventListener('mouseleave', () => this.isDragging = false);

    this.canvas.addEventListener('mousemove', e => {
      this.mousePos.x = e.offsetX;
      this.mousePos.y = e.offsetY;
      if (this.isDragging) {
        this.offsetX = e.clientX - this.dragStart.x;
        this.offsetY = e.clientY - this.dragStart.y;
      }
    });
  }

  _drawCrosshair() {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = '#888';
    ctx.setLineDash([5, 5]);
    // vertical
    ctx.beginPath();
    ctx.moveTo(this.mousePos.x, 0);
    ctx.lineTo(this.mousePos.x, this.height);
    ctx.stroke();
    // horizontal
    ctx.beginPath();
    ctx.moveTo(0, this.mousePos.y);
    ctx.lineTo(this.width, this.mousePos.y);
    ctx.stroke();
    ctx.restore();
  }

  _drawLoop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    // placeholder for future chart/drawing
    ctx.fillStyle = '#444';
    ctx.fillRect(50, 50, 100, 100);
    ctx.restore();

    this._drawCrosshair();
    requestAnimationFrame(() => this._drawLoop());
  }
}
