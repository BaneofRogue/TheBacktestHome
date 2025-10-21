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

    this.mainCanvas.addEventListener('mousemove', e => {
        const rect = this.mainCanvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;

        if (this.isDragging) {
            this.offsetX = e.clientX - this.dragStart.x;

            // vertical drag adjusts topPrice proportionally
            const deltaY = e.clientY - this.dragStart.y;
            const priceDelta = deltaY / this.priceRange.pxPerPrice;
            this.priceRange.topPrice = this.priceRange.topPriceStart + priceDelta;
        }
        this.needsRedraw = true;
    });

    this.mainCanvas.addEventListener('mousedown', e => {
        if (e.button === 0) {
            this.isDragging = true;
            this.dragStart.x = e.clientX - this.offsetX;
            this.dragStart.y = e.clientY;
            this.priceRange.topPriceStart = this.priceRange.topPrice; // store initial top
        }
    });

    this.mainCanvas.addEventListener('mouseup', () => this.isDragging = false);
    this.mainCanvas.addEventListener('mouseleave', () => this.isDragging = false);
  }

  // Aggregate and load candles
  loadCandles(data, timeframe) {
    const aggregated = aggregateCandles(data, timeframe);
    this.candles.setData(aggregated);

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
            this.priceRange, // pass entire object
            this.mousePos
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

/**
 * Aggregates 1m candles into higher timeframe candles
 * @param {Array} data - array of 1m candles {timestamp, open, high, low, close}
 * @param {number} minutes - timeframe in minutes (5, 15, 60)
 * @returns {Array} aggregated candles
 */
function aggregateCandles(data, minutes) {
    if (!data || data.length === 0) return [];

    const msPerMinute = 60 * 1000;
    const interval = minutes * msPerMinute;
    const result = [];

    let currentCandle = null;
    for (const c of data) {
        // find the aligned timestamp for this timeframe
        const ts = c.timestamp * 1000; // convert to ms if timestamp is in seconds
        const aligned = Math.floor(ts / interval) * interval;

        if (!currentCandle || currentCandle.timestamp !== aligned) {
            // push the previous candle
            if (currentCandle) result.push(currentCandle);

            // start a new candle
            currentCandle = {
                timestamp: aligned / 1000, // convert back to seconds
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close
            };
        } else {
            // aggregate into current candle
            currentCandle.high = Math.max(currentCandle.high, c.high);
            currentCandle.low = Math.min(currentCandle.low, c.low);
            currentCandle.close = c.close;
        }
    }

    if (currentCandle) result.push(currentCandle);
    return result;
}
