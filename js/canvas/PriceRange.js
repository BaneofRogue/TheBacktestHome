export default class PriceRange {
  constructor(min = 0, max = 100, width = 60, tickCount = 10) {
    this.min = min;
    this.max = max;
    this.width = width;
    this.tickCount = tickCount;
    this.zoomFactor = 1.2;
    this.chart = null;
  }

  attach(canvas, getOffsetY) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.getOffsetY = getOffsetY;

    canvas.addEventListener('wheel', e => this._onWheel(e));
  }

  _onWheel(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < this.canvas.width - this.width) return;

    e.preventDefault();
    const mouseY = e.clientY - rect.top;
    const range = this.max - this.min;
    const zoomCenter = this.max - (mouseY / this.canvas.height) * range;

    if (e.deltaY < 0) { // zoom in
        const newRange = range / this.zoomFactor;
        this.min = zoomCenter - (zoomCenter - this.min) / this.zoomFactor;
        this.max = this.min + newRange;
    } else { // zoom out
        const newRange = range * this.zoomFactor;
        this.min = zoomCenter - (zoomCenter - this.min) * this.zoomFactor;
        this.max = this.min + newRange;
    }

    // mark chart for redraw
    if (this.chart) this.chart.needsRedraw = true;
  }

  updateFromCandles(candles, offsetY, height) {
    if (!candles || candles.length === 0) return;

    // compute min/max of visible candles
    const totalCandleWidth = candles.candleWidth + candles.candleSpacing;
    const firstIndex = Math.max(0, Math.floor(-candles.offsetX / totalCandleWidth));
    const lastIndex = Math.min(candles.data.length - 1, Math.ceil((candles.offsetX + this.canvas.width) / totalCandleWidth));

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    for (let i = firstIndex; i <= lastIndex; i++) {
        const c = candles.data[i];
        if (!c) continue;
        if (c.low < minPrice) minPrice = c.low;
        if (c.high > maxPrice) maxPrice = c.high;
    }

    // never go below -100
    this.min = Math.max(minPrice, -100);
    this.max = maxPrice;

    // mark chart for redraw
    if (this.chart) this.chart.needsRedraw = true;
}


  draw() {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const offsetY = this.getOffsetY();
    const width = this.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(this.canvas.width - width, 0, width, height);

    const range = this.max - this.min;
    for (let i = 0; i <= this.tickCount; i++) {
      const y = (i / this.tickCount) * height + offsetY;
      const price = this.max - (i / this.tickCount) * range;

      if (y >= 0 && y <= height) {
        ctx.strokeStyle = '#888';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(this.canvas.width - width, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(price.toFixed(2), this.canvas.width - 5, y);
      }
    }

    ctx.restore();
  }
}
