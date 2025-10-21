export default class TimeRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;

    this.pxPerTime = 2; // pixels per second
    this.startTime = 0; // timestamp of left edge
    this.tickPx = 50;
    this.zoomFactor = 1.2;

    this.offsetX = 0; // horizontal offset for panning
    this.startTimeStart = 0;

    this.canvas.style.cursor = 'ew-resize';
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
  }

  setRange(start, end) {
    this.startTime = start;
    this.endTime = end;
    const totalSeconds = end - start;
    this.pxPerTime = this.canvas.width / totalSeconds;
    if (this.chart) this.chart.needsRedraw = true;
  }

  _onWheel(e) {
    e.preventDefault();
    const mouseX = e.offsetX;
    const timeAtMouse = this.startTime + mouseX / this.pxPerTime;

    if (e.deltaY < 0) this.pxPerTime *= this.zoomFactor;
    else this.pxPerTime /= this.zoomFactor;

    // update startTime based on mouse position to zoom around cursor
    this.startTime = timeAtMouse - mouseX / this.pxPerTime;
    this.endTime = this.startTime + this.canvas.width / this.pxPerTime;

    if (this.chart) {
      this.chart.offsetX = -this.startTime * this.pxPerTime; // sync with main chart
      this.chart.needsRedraw = true;
    }
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

    const tickSeconds = this._getTickStep();
    const startTick = Math.floor(this.startTime / tickSeconds) * tickSeconds;

    for (let t = startTick; t <= this.startTime + width / this.pxPerTime; t += tickSeconds) {
      const x = (t - this.startTime) * this.pxPerTime;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      const date = new Date(t * 1000);
      const label = `${date.getUTCHours().toString().padStart(2,'0')}:${date.getUTCMinutes().toString().padStart(2,'0')}`;
      ctx.fillText(label, x, 2);
    }

    ctx.restore();
  }

  _getTickStep() {
    const approxTicks = this.canvas.width / this.tickPx;
    const timeRange = this.canvas.width / this.pxPerTime;
    const roughStep = timeRange / approxTicks;

    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;
    let nice;
    if (residual < 1.5) nice = 1;
    else if (residual < 3) nice = 2;
    else if (residual < 7) nice = 5;
    else nice = 10;
    return nice * magnitude;
  }

  resetScale() {
    this.pxPerTime = 2;
    this.startTime = 0;
    if (this.chart) this.chart.needsRedraw = true;
  }
}
