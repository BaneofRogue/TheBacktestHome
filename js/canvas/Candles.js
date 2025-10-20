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

  draw(ctx, offsetX, offsetY, canvasWidth, canvasHeight, minPrice, maxPrice) {
    if (!this.data || this.data.length === 0) return;

    const priceRange = maxPrice - minPrice;
    const scaleY = canvasHeight / priceRange;
    const totalCandleWidth = this.candleWidth + this.candleSpacing;

    // calculate first/last visible index
    const firstIndex = Math.max(0, Math.floor(-offsetX / totalCandleWidth));
    const lastIndex = Math.min(this.data.length - 1, Math.ceil((canvasWidth - offsetX) / totalCandleWidth));

    for (let i = firstIndex; i <= lastIndex; i++) {
        const candle = this.data[i];
        const x = i * totalCandleWidth + offsetX;

        const openY = canvasHeight - (candle.open - minPrice) * scaleY + offsetY;
        const closeY = canvasHeight - (candle.close - minPrice) * scaleY + offsetY;
        const highY = canvasHeight - (candle.high - minPrice) * scaleY + offsetY;
        const lowY = canvasHeight - (candle.low - minPrice) * scaleY + offsetY;

        const color = candle.close >= candle.open ? this.upColor : this.downColor;

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // draw wick
        ctx.beginPath();
        ctx.moveTo(x + this.candleWidth / 2, highY);
        ctx.lineTo(x + this.candleWidth / 2, lowY);
        ctx.stroke();

        // draw body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(1, Math.abs(openY - closeY));
        ctx.fillRect(x, bodyTop, this.candleWidth, bodyHeight);
    }
  }
}
