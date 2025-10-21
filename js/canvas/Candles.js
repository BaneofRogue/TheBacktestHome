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

  draw(ctx, offsetX, offsetY, canvasWidth, canvasHeight, priceRange, mousePos = null) {
    if (!this.data || this.data.length === 0) return;

    const totalCandleWidth = this.candleWidth + this.candleSpacing;
    const firstIndex = Math.max(0, Math.floor(-offsetX / totalCandleWidth));
    const lastIndex = Math.min(this.data.length - 1, Math.ceil((canvasWidth - offsetX) / totalCandleWidth));

    let hoveredCandle = null;

    for (let i = firstIndex; i <= lastIndex; i++) {
        const candle = this.data[i];
        const x = i * totalCandleWidth + offsetX;

        const openY  = (priceRange.topPrice - candle.open) * priceRange.pxPerPrice;
        const closeY = (priceRange.topPrice - candle.close) * priceRange.pxPerPrice;
        const highY  = (priceRange.topPrice - candle.high) * priceRange.pxPerPrice;
        const lowY   = (priceRange.topPrice - candle.low) * priceRange.pxPerPrice;

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

        // check hover
        if (mousePos && mousePos.x >= x && mousePos.x <= x + this.candleWidth) {
            hoveredCandle = candle;
        }
    }

    // after the candle loop
    if (hoveredCandle) {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
            `O: ${hoveredCandle.open}  H: ${hoveredCandle.high}  L: ${hoveredCandle.low}  C: ${hoveredCandle.close}`,
            10,   // fixed X
            15    // fixed Y
        );
        ctx.restore();
    }
  }
}
