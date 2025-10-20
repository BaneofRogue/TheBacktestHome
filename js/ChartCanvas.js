import Crosshair from './canvas/Crosshair.js';
import PriceRange from './canvas/PriceRange.js';

export default class ChartCanvas {
  constructor(mainId, priceId) {
    this.mainCanvas = document.getElementById(mainId);
    this.priceCanvas = document.getElementById(priceId);

    this.mainCtx = this.mainCanvas.getContext('2d');
    this.priceCtx = this.priceCanvas.getContext('2d');

    this._resizeCanvas();

    this.offsetX = 0;
    this.offsetY = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.mousePos = { x: 0, y: 0 };

    // modular components
    this.crosshair = new Crosshair();
    this.priceRange = new PriceRange();
    this.priceRange.attach(this.priceCanvas, () => this.offsetY);

    this._bindEvents();
    this._drawLoop();
  }

  _resizeCanvas() {
    // main canvas
    this.mainCanvas.width = this.mainCanvas.clientWidth;
    this.mainCanvas.height = this.mainCanvas.clientHeight;
    this.mainWidth = this.mainCanvas.width;
    this.mainHeight = this.mainCanvas.height;

    // price canvas
    this.priceCanvas.width = this.priceCanvas.clientWidth;
    this.priceCanvas.height = this.priceCanvas.clientHeight;
    }


  _bindEvents() {
    window.addEventListener('resize', () => this._resizeCanvas());

    this.mainCanvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.isDragging = true;
        this.dragStart.x = e.clientX - this.offsetX;
        this.dragStart.y = e.clientY - this.offsetY;
      }
    });

    this.mainCanvas.addEventListener('mouseup', () => this.isDragging = false);
    this.mainCanvas.addEventListener('mouseleave', () => this.isDragging = false);

    this.mainCanvas.addEventListener('mousemove', e => {
      const rect = this.mainCanvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;

      if (this.isDragging) {
        this.offsetX = e.clientX - this.dragStart.x;
        this.offsetY = e.clientY - this.dragStart.y;
      }
    });
  }

  _drawLoop() {
    const ctx = this.mainCtx;
    ctx.clearRect(0, 0, this.mainWidth, this.mainHeight);

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    // placeholder chart/drawing
    ctx.fillStyle = '#ddd';
    ctx.fillRect(50, 50, 100, 100);

    ctx.restore();

    // draw crosshair on main canvas
    this.crosshair.draw(ctx, this.mousePos, this.mainWidth, this.mainHeight);

    // draw price panel (separate canvas)
    this.priceRange.draw();

    requestAnimationFrame(() => this._drawLoop());
  }
}
