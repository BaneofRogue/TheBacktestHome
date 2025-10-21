export default class TimeRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;
    this.candles = chart?.candles || null;

    this.pxPerTime = 0.05;  // pixels per second
    this.leftTime = 0;
    this.zoomFactor = 1.2;

    this.canvas.style.cursor = 'ew-resize';
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
  }

  _onWheel(e) {
    e.preventDefault();
    const mouseX = e.offsetX;
    const timeAtMouse = this.leftTime + mouseX / this.pxPerTime;

    if (e.deltaY < 0) this.pxPerTime *= this.zoomFactor;
    else this.pxPerTime /= this.zoomFactor;

    this.leftTime = timeAtMouse - mouseX / this.pxPerTime;

    if (this.chart) {
        // Sync chart.offsetX in index → pixels units
        const firstCandle = this.candles.data[0];
        const candleWidth = this.chart.candles.candleWidth + this.chart.candles.candleSpacing;
        let leftIndex = this.candles.data.findIndex(c => c.timestamp >= this.leftTime);
        if (leftIndex === -1) leftIndex = 0;
        this.chart.offsetX = -leftIndex * candleWidth;
        this.chart.needsRedraw = true;
    }
}


  setRange(minTime, maxTime) {
    this.leftTime = minTime;
    this.pxPerTime = this.canvas.width / (maxTime - minTime);
    if (this.chart) this.chart.needsRedraw = true;
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

    const leftTime = this.leftTime;
    const rightTime = leftTime + width / this.pxPerTime;

    const tickStep = this._getTickStep(leftTime, rightTime);
    const startTick = Math.ceil(leftTime / tickStep) * tickStep;

    for (let t = startTick; t <= rightTime; t += tickStep) {
      const x = (t - leftTime) * this.pxPerTime;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const date = new Date(t * 1000);
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      ctx.fillText(`${h}:${m}`, x, 0);
    }

    ctx.restore();
  }

  _getTickStep(minTime, maxTime) {
    const approxTicks = this.canvas.width / 100;
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
