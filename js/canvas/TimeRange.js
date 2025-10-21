export default class TimeRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;

    this.tickPx = 80;   // approx pixel distance between labels
    this.font = '12px Arial';
  }

  setRange(min, max) {
    this.leftTime = min;
    this.pxPerTime = this.canvas.width / (max - min);
    if (this.chart) this.chart.needsRedraw = true;
  }

  _onWheel(e) {
    e.preventDefault();
    const mouseX = e.offsetX;

    const timeAtMouse = this.leftTime + mouseX / this.pxPerTime;
    if (e.deltaY < 0) this.pxPerTime *= this.zoomFactor; // zoom in
    else this.pxPerTime /= this.zoomFactor;              // zoom out

    this.leftTime = timeAtMouse - mouseX / this.pxPerTime;
    if (this.chart) this.chart.needsRedraw = true;
  }

  resetScale() {
    if (!this.candles || this.candles.data.length === 0) return;
    const first = this.candles.data[0].timestamp;
    const last = this.candles.data[this.candles.data.length - 1].timestamp;
    this.setRange(first, last);
  }

  draw() {
    if (!this.chart || !this.chart.candles) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#888';
    ctx.fillStyle = '#000';
    ctx.font = this.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.setLineDash([2, 2]);

    const candles = this.chart.candles.data;
    if (!candles || candles.length === 0) {
      ctx.restore();
      return;
    }

    const totalCandleWidth = this.chart.candles.candleWidth + this.chart.candles.candleSpacing;

    // determine first/last visible index based on offsetX
    const firstIndex = Math.max(0, Math.floor(-this.chart.offsetX / totalCandleWidth));
    const lastIndex = Math.min(candles.length - 1, Math.ceil((width - this.chart.offsetX) / totalCandleWidth));

    for (let i = firstIndex; i <= lastIndex; i++) {
      const x = i * totalCandleWidth + this.chart.offsetX + totalCandleWidth / 2;
      const ts = new Date(candles[i].timestamp * 1000);
      if ((i - firstIndex) % Math.ceil(this.tickPx / totalCandleWidth) === 0) { // spacing
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const label = `${ts.getHours()}:${String(ts.getMinutes()).padStart(2, '0')}`;
        ctx.fillText(label, x, 0);
      }
    }

    ctx.restore();
  }
}
