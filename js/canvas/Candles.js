export default class Candles {
  constructor(data = [], options = {}) {
    this.data = data;
    this.candleWidth = options.candleWidth || 8;
    this.candleSpacing = options.candleSpacing || 2;
    this.upColor = options.upColor || '#4caf50';
    this.downColor = options.downColor || '#f44336';
  }

  setData(data) {
    this.data = data;
  }

  draw(ctx, offsetX, offsetY, canvasWidth, canvasHeight, priceRange, mousePos = null, timeRange = null) {
  if (!this.data || this.data.length === 0 || !timeRange) return;

  let hoveredCandle = null;

  for (const candle of this.data) {
    const x = (candle.timestamp - timeRange.leftTime) * timeRange.pxPerTime;

    if (x < -this.candleWidth || x > canvasWidth) continue; // skip offscreen

    const openY  = (priceRange.topPrice - candle.open) * priceRange.pxPerPrice;
    const closeY = (priceRange.topPrice - candle.close) * priceRange.pxPerPrice;
    const highY  = (priceRange.topPrice - candle.high) * priceRange.pxPerPrice;
    const lowY   = (priceRange.topPrice - candle.low) * priceRange.pxPerPrice;

    const color = candle.close >= candle.open ? this.upColor : this.downColor;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // wick
    ctx.beginPath();
    ctx.moveTo(x + this.candleWidth/2, highY);
    ctx.lineTo(x + this.candleWidth/2, lowY);
    ctx.stroke();

    // body
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(1, Math.abs(openY - closeY));
    ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight);

    if (mousePos && mousePos.x >= x && mousePos.x <= x + this.candleWidth) {
      hoveredCandle = candle;
    }
  }

  if (hoveredCandle) {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `O: ${hoveredCandle.open}  H: ${hoveredCandle.high}  L: ${hoveredCandle.low}  C: ${hoveredCandle.close}`,
      10, 15
    );
    ctx.restore();
  }
}
}
