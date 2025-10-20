export default class PriceRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;

    // Y-axis scale
    this.pxPerPrice = 10; // pixels per 1 unit of price
    this.topPrice = 100;  // top of the chart price
    this.tickPx = 50;     // pixel spacing between ticks

    // Zoom
    this.zoomFactor = 1.2;

    // Bind events
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
    this.canvas.addEventListener('mousedown', e => this._startDrag(e));
    this.canvas.addEventListener('mousemove', e => this._onDrag(e));
    this.canvas.addEventListener('mouseup', e => this._endDrag(e));
    this.canvas.addEventListener('mouseleave', e => this._endDrag(e));
    this.dragging = false;
    this.dragStartY = 0;
    this.topPriceStart = 0;
  }

  _onWheel(e) {
    e.preventDefault();
    const mouseY = e.offsetY;

    // zoom relative to mouse
    const priceAtMouse = this.topPrice - mouseY / this.pxPerPrice;
    if (e.deltaY < 0) {
      this.pxPerPrice *= this.zoomFactor; // zoom in
    } else {
      this.pxPerPrice /= this.zoomFactor; // zoom out
    }
    // maintain the price under mouse position
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
    if (this.chart) this.chart.needsRedraw = true;
  }

  _endDrag(e) {
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

    // dynamic tick interval in price units
    const tickPrice = this._getTickStep();
    const startPrice = Math.floor(this.topPrice / tickPrice) * tickPrice;

    for (let price = startPrice; price > this.topPrice - height / this.pxPerPrice; price -= tickPrice) {
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
    // Adjust tick step depending on zoom
    const approxTicks = this.canvas.height / this.tickPx;
    const priceRange = this.canvas.height / this.pxPerPrice;
    const roughStep = priceRange / approxTicks;

    // Round to nice numbers: 0.5, 1, 2, 5, 10, 50, 100, etc
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
