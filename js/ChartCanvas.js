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

    // modular components
    this.crosshair = new Crosshair();
    this.priceRange = new PriceRange();
    this.priceRange.attach(this.priceCanvas, () => this.offsetY);
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
    });
  }

  loadCandles(data) {
    this.candles.setData(data);

    // determine price range dynamically
    const prices = data.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    this.priceRange.min = minPrice;
    this.priceRange.max = maxPrice;
  }

  _drawLoop() {
    const ctx = this.mainCtx;
    ctx.clearRect(0, 0, this.mainWidth, this.mainHeight);

    // draw candles
    this.candles.draw(
      ctx,
      this.offsetX,
      this.offsetY,
      this.mainWidth,
      this.mainHeight,
      this.priceRange.min,
      this.priceRange.max
    );

    // draw crosshair
    this.crosshair.draw(ctx, this.mousePos, this.mainWidth, this.mainHeight);

    // draw price panel
    this.priceRange.draw();

    requestAnimationFrame(() => this._drawLoop());
  }
}
