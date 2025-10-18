let chart;
let candleSeries;

function initChart() {
  chart = LightweightCharts.createChart(document.getElementById('chart'), {
    width: 800,
    height: 500,
    layout: {
      backgroundColor: '#ffffff',
      textColor: '#000',
    },
    grid: {
      vertLines: { color: '#eee' },
      horzLines: { color: '#eee' },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
    },
  });

  candleSeries = chart.addCandlestickSeries();
}

function updateChart(data) {
  const chartData = data.map(row => ({
    time: Math.floor(new Date(row.timestamp).getTime() / 1000),
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
  }));

  candleSeries.setData(chartData);
}
