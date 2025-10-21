export default class TimeRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;
    this.candles = chart?.candles || null;

    this.pxPerTime = 10;
    this.leftTime = 0;
    this.tickPx = 100;
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

    // sync ChartCanvas offsetX
    if (this.chart) {
        this.chart.offsetX = (this.leftTime - this.candles.data[0].timestamp) * this.pxPerTime;
        this.chart.needsRedraw = true;
    }
  }

  setRange(min, max) {
    this.leftTime = min;
    this.pxPerTime = this.canvas.width / (max - min);
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
    ctx.setLineDash([2,2]);

    if (!this.candles || this.candles.data.length === 0) return;

    const offsetX = this.chart ? this.chart.offsetX : 0;
    const leftTime = this.leftTime - offsetX / this.pxPerTime;
    const rightTime = leftTime + width / this.pxPerTime;

    const tickStep = this._getTickStep(leftTime, rightTime);

    // start drawing from first tick >= leftTime
    const startTick = Math.ceil(leftTime / tickStep) * tickStep;

    for (let t = startTick; t <= rightTime; t += tickStep) {
        const x = (t - leftTime) * this.pxPerTime;

        // vertical grid line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        // timestamp label
        const date = new Date(t * 1000);
        const h = String(date.getHours()).padStart(2,'0');
        const m = String(date.getMinutes()).padStart(2,'0');
        ctx.fillText(`${h}:${m}`, x, 0);
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
