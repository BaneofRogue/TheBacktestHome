export default class Candles {
  constructor(data = [], options = {}) {
    this.data = data;
    this.defaultCandleWidth = options.candleWidth || 8;
    this.candleSpacing = options.candleSpacing || 2;
    this.upColor = options.upColor || '#4caf50';
    this.downColor = options.downColor || '#f44336';
  }

  setData(data) {
    this.data = data;
  }

  draw(ctx, offsetX, offsetY, canvasWidth, canvasHeight, priceRange, mousePos = null, timeRange = null) {
    if (!this.data || this.data.length === 0) return;

    let hoveredCandle = null;

    for (let i = 0; i < this.data.length; i++) {
      const candle = this.data[i];

      // Use timeRange.pxPerTime if provided
      let x;
      let candleWidth;
      if (timeRange) {
        const t0 = this.data[0].timestamp;
        const t = candle.timestamp;
        x = (t - t0) * timeRange.pxPerTime + offsetX;
        // dynamically scale candle width proportional to pxPerTime
        candleWidth = timeRange.pxPerTime * 60 * 0.9; // 60 seconds per 1m candle, adjust 0.9 for spacing
      } else {
        const totalCandleWidth = this.defaultCandleWidth + this.candleSpacing;
        x = i * totalCandleWidth + offsetX;
        candleWidth = this.defaultCandleWidth;
      }

      const openY = (priceRange.topPrice - candle.open) * priceRange.pxPerPrice;
      const closeY = (priceRange.topPrice - candle.close) * priceRange.pxPerPrice;
      const highY = (priceRange.topPrice - candle.high) * priceRange.pxPerPrice;
      const lowY = (priceRange.topPrice - candle.low) * priceRange.pxPerPrice;

      const color = candle.close >= candle.open ? this.upColor : this.downColor;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // draw wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(openY - closeY));
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);

      // hover
      if (mousePos && mousePos.x >= x && mousePos.x <= x + candleWidth) {
        hoveredCandle = candle;
      }
    }

    if (hoveredCandle) {
      ctx.save();
      ctx.fillStyle = 'black';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `O: ${hoveredCandle.open}  H: ${hoveredCandle.high}  L: ${hoveredCandle.low}  C: ${hoveredCandle.close}`,
        10,
        15
      );
      ctx.restore();
    }
  }
}
