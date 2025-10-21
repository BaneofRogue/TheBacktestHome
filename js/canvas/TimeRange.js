export default class TimeRange {
    constructor(canvas, chart = null, candles = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.chart = chart;
        this.candles = candles;

        this.tickPx = 100; // horizontal spacing between labels
        this.font = '12px Arial';
    }

    draw() {
        if (!this.candles || !this.candles.data || this.candles.data.length === 0) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.save();
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#888';
        ctx.fillStyle = '#000';
        ctx.font = this.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.setLineDash([2,2]);

        const totalCandleWidth = this.candles.candleWidth + this.candles.candleSpacing;
        const offsetX = this.chart ? this.chart.offsetX : 0;

        // Calculate first and last visible candle index
        const firstIndex = Math.max(0, Math.floor(-offsetX / totalCandleWidth));
        const lastIndex = Math.min(this.candles.data.length - 1, Math.ceil((width - offsetX) / totalCandleWidth));

        // choose a “nice” interval to avoid label overlap
        const approxLabels = Math.floor(width / this.tickPx);
        const step = Math.max(1, Math.floor((lastIndex - firstIndex) / approxLabels));

        for (let i = firstIndex; i <= lastIndex; i += step) {
            const candle = this.candles.data[i];
            const x = i * totalCandleWidth + offsetX + totalCandleWidth / 2;

            // draw vertical tick
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 5);
            ctx.stroke();

            // format timestamp
            const date = new Date(candle.timestamp * 1000);
            const label = `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;
            ctx.fillText(label, x, 6);
        }

        ctx.restore();
    }
}
