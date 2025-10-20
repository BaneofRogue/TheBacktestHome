export class ChartRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.data = [];
    this.offsetX = 0;
    this.scaleX = 5; // pixels per candle
  }

  setData(data) {
    this.data = data;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render() {
    if (!this.data || this.data.length === 0) return;
    const ctx = this.ctx;
    const h = this.canvas.height;
    const w = this.canvas.width;

    this.clear();

    // grid
    ctx.strokeStyle = '#ddd';
    for (let x = 0; x < w; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // candles
    for (let i = 0; i < this.data.length; i++) {
      const c = this.data[i];
      const x = i * this.scaleX + this.offsetX;
      const color = c.close >= c.open ? '#26a69a' : '#ef5350';
      this.drawCandle(x, c.open, c.high, c.low, c.close, color);
    }
  }

  drawCandle(x, open, high, low, close, color) {
    const ctx = this.ctx;
    const h = this.canvas.height;
    const scaleY = h / Math.max(...this.data.map(c => c.high)); // simple normalize

    const yOpen = h - open * scaleY;
    const yClose = h - close * scaleY;
    const yHigh = h - high * scaleY;
    const yLow = h - low * scaleY;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(x - 2, yOpen, 4, yClose - yOpen);
  }
}
