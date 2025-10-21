export default class TimeRange {
  constructor(canvas, chart = null, candles = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;
    this.candles = candles;

    // X-axis scale
    this.pxPerTime = 10; // pixels per second
    this.leftTime = 0;   // timestamp at left edge
    this.rightLimit = Infinity;
    this.tickPx = 100;
    this.zoomFactor = 1.2;

    this.canvas.style.cursor = 'ew-resize';
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
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
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#888';
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.setLineDash([2, 2]);

    if (!this.candles || this.candles.data.length === 0) return;

    const minTime = this.leftTime;
    const maxTime = this.leftTime + width / this.pxPerTime;
    const tickStep = this._getTickStep(minTime, maxTime);

    const startTime = Math.floor(minTime / tickStep) * tickStep;
    for (let t = startTime; t <= maxTime; t += tickStep) {
      const x = (t - this.leftTime) * this.pxPerTime;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const date = new Date(t * 1000);
      const label = `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
      ctx.fillText(label, x, 0);
    }

    ctx.restore();
  }

  _getTickStep(minTime, maxTime) {
    const approxTicks = this.canvas.width / this.tickPx;
    const roughStep = (maxTime - minTime) / approxTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;
    let nice;
    if (residual < 1.5) nice = 1;
    else if (residual < 3) nice = 2;
    else if (residual < 7) nice = 5;
    else nice = 10;
    return nice * magnitude;
  }
}
