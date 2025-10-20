export default class PriceRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;

    // Default scale
    this.pxPerPrice = 10;
    this.topPrice = 100;
    this.bottomLimit = -100;
    this.tickPx = 50;
    this.zoomFactor = 1.2;

    // Interaction
    this.dragging = false;
    this.dragStartY = 0;
    this.topPriceStart = 0;

    // Bind events
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
    this.canvas.addEventListener('mousedown', e => this._startDrag(e));
    this.canvas.addEventListener('mousemove', e => this._onDrag(e));
    this.canvas.addEventListener('mouseup', () => this._endDrag());
    this.canvas.addEventListener('mouseleave', () => this._endDrag());
  }

  /** Dynamically set range from candle data */
  setRange(min, max) {
    this.topPrice = max;
    this.pxPerPrice = this.canvas.height / (max - Math.max(min, this.bottomLimit));
    if (this.chart) this.chart.needsRedraw = true;
  }

  _onWheel(e) {
    e.preventDefault();
    const mouseY = e.offsetY;

    const priceAtMouse = this.topPrice - mouseY / this.pxPerPrice;
    if (e.deltaY < 0) this.pxPerPrice *= this.zoomFactor; // zoom in
    else this.pxPerPrice /= this.zoomFactor;              // zoom out

    this.topPrice = priceAtMouse + mouseY / this.pxPerPrice;
    if (this.chart) this.chart.needsRedraw = true;
  }

  _startDrag(e) {
    if (e.button !== 0) return;
    this.dragging = true;
    this.dragStartY = e.clientY;
    this.topPriceStart = this.topPrice;
  }

  _onDrag(e) {
    if (!this.dragging) return;
    const delta = e.clientY - this.dragStartY;
    this.topPrice = this.topPriceStart - delta / this.pxPerPrice;
    if (this.topPrice - this.canvas.height / this.pxPerPrice < this.bottomLimit)
      this.topPrice = this.bottomLimit + this.canvas.height / this.pxPerPrice;
    if (this.chart) this.chart.needsRedraw = true;
  }

  _endDrag() {
    this.dragging = false;
  }

  resetScale() {
    this.pxPerPrice = 10;
    this.topPrice = 100;
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
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.setLineDash([2, 2]);

    const tickPrice = this._getTickStep();
    const startPrice = Math.floor(this.topPrice / tickPrice) * tickPrice;
    const bottomPrice = this.topPrice - height / this.pxPerPrice;

    for (let price = startPrice; price > bottomPrice; price -= tickPrice) {
      const y = (this.topPrice - price) * this.pxPerPrice;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(price.toFixed(2), width - 5, y);
    }

    ctx.restore();
  }

  _getTickStep() {
    const approxTicks = this.canvas.height / this.tickPx;
    const priceRange = this.canvas.height / this.pxPerPrice;
    const roughStep = priceRange / approxTicks;

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
