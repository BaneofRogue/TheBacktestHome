// ChartRenderer.js
export class ChartRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.data = [];
    this.offsetX = 0;           // pixels, positive moves chart to the right
    this.scaleX = 5;           // pixels per candle (will be clamped)
    this.minScaleX = 1;        // 1 pixel min
    this.maxScaleX = null;     // computed per-render as 10% of canvas width

    // padding for top/bottom in pixels for price scaling
    this.paddingTop = 20;
    this.paddingBottom = 20;
  }

  setData(data) {
    this.data = data || [];
    // reset offsets/scale if needed (optional)
    // this.offsetX = 0;
    // this.scaleX = 5;
  }

  // safe setter that enforces min/max for scaleX
  setScaleX(value) {
    const max = Math.max(1, Math.floor(this.canvas.width * 0.1));
    this.maxScaleX = max;
    this.scaleX = Math.max(this.minScaleX, Math.min(value, this.maxScaleX));
  }

  // zoom in/out centered on a pixel position (clientX relative to canvas)
  zoomAt(factor, clientX) {
    // factor > 1 zoom in, < 1 zoom out
    const oldScale = this.scaleX;
    const newScale = oldScale * factor;
    this.setScaleX(newScale);

    // keep the point under cursor fixed:
    // screenX = dataIndex*oldScale + offsetX
    // dataIndex = (screenX - offsetX) / oldScale
    // newOffsetX = screenX - dataIndex*newScale
    const screenX = clientX;
    const dataIndex = (screenX - this.offsetX) / oldScale;
    this.offsetX = screenX - dataIndex * this.scaleX;

    this.clampOffset();
    this.render();
  }

  // keep offsetX in reasonable bounds so user can't pan infinitely into blank space
  clampOffset() {
    const visibleCandles = Math.max(1, Math.floor(this.canvas.width / this.scaleX));
    const maxOffset = this.scaleX * (this.data.length - 1) - this.canvas.width + this.scaleX; // allow last candle to sit on right
    // If data shorter than canvas, center it
    if (this.data.length * this.scaleX <= this.canvas.width) {
      // center data
      this.offsetX = (this.canvas.width - this.data.length * this.scaleX) / 2;
    } else {
      // clamp to bounds
      if (this.offsetX > this.scaleX) this.offsetX = this.scaleX; // do not pan too far right
      if (this.offsetX < -maxOffset) this.offsetX = -maxOffset;
    }
  }

  // set offset directly (e.g., from drag), then clamp
  setOffsetX(x) {
    this.offsetX = x;
    this.clampOffset();
    this.render();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    if (!this.data || this.data.length === 0) {
      this.clear();
      return;
    }

    // enforce scale clamping each render (in case canvas size changed)
    this.setScaleX(this.scaleX);

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.clear();

    // determine visible indices to render (performance)
    const firstVisible = Math.max(0, Math.floor((-this.offsetX) / this.scaleX));
    const lastVisible = Math.min(
      this.data.length - 1,
      Math.ceil((w - this.offsetX) / this.scaleX)
    );

    // compute price scaling (scaleY) from visible window to avoid huge values
    let visibleHigh = -Infinity;
    let visibleLow = Infinity;
    for (let i = firstVisible; i <= lastVisible; i++) {
      const c = this.data[i];
      if (!c) continue;
      if (c.high > visibleHigh) visibleHigh = c.high;
      if (c.low < visibleLow) visibleLow = c.low;
    }
    // fallback if something weird
    if (!isFinite(visibleHigh) || !isFinite(visibleLow)) {
      visibleHigh = Math.max(...this.data.map(d => d.high));
      visibleLow = Math.min(...this.data.map(d => d.low));
    }

    // add small padding so candles don't sit flush at edges
    const priceRange = Math.max(1e-8, visibleHigh - visibleLow);
    const usableHeight = h - this.paddingTop - this.paddingBottom;
    const scaleY = usableHeight / priceRange;

    // optional: draw grid / background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    // vertical grid every 100 px
    for (let x = 0; x < w; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }

    // horizontal price grid
    for (let y = this.paddingTop; y < h - this.paddingBottom; y += Math.floor(usableHeight / 6)) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // draw candles only in visible range
    const halfBar = Math.max(1, Math.floor(this.scaleX / 2));
    for (let i = firstVisible; i <= lastVisible; i++) {
      const c = this.data[i];
      if (!c) continue;
      const x = Math.round(i * this.scaleX + this.offsetX);

      const yHigh = Math.round(this.paddingTop + (visibleHigh - c.high) * scaleY);
      const yLow = Math.round(this.paddingTop + (visibleHigh - c.low) * scaleY);
      const yOpen = Math.round(this.paddingTop + (visibleHigh - c.open) * scaleY);
      const yClose = Math.round(this.paddingTop + (visibleHigh - c.close) * scaleY);

      const color = c.close >= c.open ? '#26a69a' : '#ef5350';

      // wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, yHigh + 0.5);
      ctx.lineTo(x + 0.5, yLow + 0.5);
      ctx.stroke();

      // body
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      // when scaleX is small, draw vertical rectangle of width 1 or 2 pixels
      const bodyWidth = Math.max(1, Math.min(Math.floor(this.scaleX * 0.8), Math.floor(w * 0.1)));
      ctx.fillRect(x - Math.floor(bodyWidth / 2), bodyTop, bodyWidth, bodyHeight);
    }
  }
}
