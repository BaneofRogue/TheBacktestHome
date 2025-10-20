import Crosshair from './canvas/Crosshair.js';

export default class ChartCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this._resizeCanvas();

    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };

    // modular components
    this.crosshair = new Crosshair();

    this._bindEvents();
    this._drawLoop();
  }

  _resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  _bindEvents() {
    window.addEventListener('resize', () => this._resizeCanvas());

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

  _drawLoop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    // placeholder for future chart/drawing logic
    ctx.fillStyle = '#ddd';
    ctx.fillRect(50, 50, 100, 100);

    ctx.restore();

    // draw modular components
    this.crosshair.draw(ctx, this.mousePos, this.width, this.height);

    requestAnimationFrame(() => this._drawLoop());
  }
}
