import Crosshair from './canvas/Crosshair.js';
import PriceRange from './canvas/PriceRange.js';
import Candles from './canvas/Candles.js';
import TimeRange from './canvas/TimeRange.js';

export default class ChartCanvas {
  constructor(mainId, priceId, timeId) {
    this.mainCanvas = document.getElementById(mainId);
    this.priceCanvas = document.getElementById(priceId);
    this.timeCanvas = document.getElementById(timeId);

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
    this.timeRange = new TimeRange(this.timeCanvas, this);
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

    const timeWrapper = this.timeCanvas.parentElement;
    this.timeCanvas.width = timeWrapper.clientWidth;
    this.timeCanvas.height = timeWrapper.clientHeight;
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
    for (const c of aggregated) { // compute min/max from aggregated
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

        // draw time panel
        this.timeRange.draw();

        // draw crosshair
        this.crosshair.draw(ctx, this.mousePos, this.mainWidth, this.mainHeight);

        // draw price panel
        this.priceRange.draw();

        this.needsRedraw = false;
    }

    requestAnimationFrame(() => this._drawLoop());
  }
}

function aggregateCandles(data, minutes) {
    if (!data || data.length === 0) return [];

    const msPerMinute = 60 * 1000;
    const interval = minutes * msPerMinute;
    const result = [];

    let currentCandle = null;

    for (const c of data) {
        const ts = c.timestamp * 1000; // seconds → ms
        // align timestamp to start of interval
        const aligned = Math.floor(ts / interval) * interval;

        if (!currentCandle || currentCandle.timestamp !== aligned / 1000) {
            if (currentCandle) result.push(currentCandle);

            currentCandle = {
                timestamp: aligned / 1000,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close
            };
        } else {
            currentCandle.high = Math.max(currentCandle.high, c.high);
            currentCandle.low = Math.min(currentCandle.low, c.low);
            currentCandle.close = c.close;
        }
    }

    if (currentCandle) result.push(currentCandle);
    return result;
}
