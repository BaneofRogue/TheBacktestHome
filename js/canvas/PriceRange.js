export default class PriceRange {
  constructor(canvas, chart = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.chart = chart;

    // Y-axis scale
    this.pxPerPrice = 10;
    this.topPrice = 100;
    this.bottomLimit = -100;
    this.tickPx = 50;
    this.zoomFactor = 1.2;

    // Drag zoom
    this.dragging = false;
    this.dragStartY = 0;
    this.pxPerPriceStart = 0;

    // Bind events
    this.canvas.style.cursor = 'ns-resize';
    this.canvas.addEventListener('wheel', e => this._onWheel(e));
    this.canvas.addEventListener('mousedown', e => this._startDrag(e));
    this.canvas.addEventListener('mousemove', e => this._onDrag(e));
    this.canvas.addEventListener('mouseup', () => this._endDrag());
    this.canvas.addEventListener('mouseleave', () => this._endDrag());
  }

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
    this.pxPerPriceStart = this.pxPerPrice;
    this.canvas.style.cursor = 'grabbing';
  }

  _onDrag(e) {
    if (!this.dragging) {
      this.canvas.style.cursor = 'ns-resize';
      return;
    }

    const deltaY = e.clientY - this.dragStartY;

    // Smaller sensitivity
    let zoomFactor = 1 + deltaY * 0.001; // less aggressive
    zoomFactor = Math.max(0.1, Math.min(1.0, zoomFactor)); // clamp zoom factor

    this.pxPerPrice = Math.max(0.1, this.pxPerPriceStart * zoomFactor);

    // Keep scaling around the center
    const centerPrice = this.topPrice - (this.canvas.height / 2) / this.pxPerPriceStart;
    this.topPrice = centerPrice + (this.canvas.height / 2) / this.pxPerPrice;

    if (this.chart) this.chart.needsRedraw = true;
  }


  _endDrag() {
    this.dragging = false;
    this.canvas.style.cursor = 'ns-resize';
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
