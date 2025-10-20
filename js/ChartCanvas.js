import Crosshair from './canvas/Crosshair.js';
import PriceRange from './canvas/PriceRange.js';
import Candles from './canvas/Candles.js';

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

    this.needsRedraw = true;

    // modular components
    this.crosshair = new Crosshair();
    this.priceRange = new PriceRange(this.priceCanvas, this);
    this.candles = new Candles();

    this._bindEvents();
    this._drawLoop();
  }

  _resizeCanvas() {
    // main canvas
    const mainWrapper = this.mainCanvas.parentElement;
    this.mainCanvas.width = mainWrapper.clientWidth;
    this.mainCanvas.height = mainWrapper.clientHeight;
    this.mainWidth = this.mainCanvas.width;
    this.mainHeight = this.mainCanvas.height;

    // price canvas
    const priceWrapper = this.priceCanvas.parentElement;
    this.priceCanvas.width = priceWrapper.clientWidth;
    this.priceCanvas.height = priceWrapper.clientHeight;
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
      this.needsRedraw = true;
    });
  }

  loadCandles(data) {
    this.candles.setData(data);

    let min = Infinity, max = -Infinity;
    for (const c of data) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
    }
    this.priceRange.setRange(min, max);
    this.needsRedraw = true;

  }

  _drawLoop() {
    if (this.needsRedraw) {
        const ctx = this.mainCtx;
        ctx.clearRect(0, 0, this.mainWidth, this.mainHeight);

        this.candles.draw(
            ctx,
            this.offsetX,
            this.offsetY,
            this.mainWidth,
            this.mainHeight,
            this.priceRange // pass entire object
            );


        // draw price panel
        this.priceRange.draw();

        // draw crosshair
        this.crosshair.draw(ctx, this.mousePos, this.mainWidth, this.mainHeight);

        // draw price panel
        this.priceRange.draw();

        this.needsRedraw = false;
    }

    requestAnimationFrame(() => this._drawLoop());
  }
}
