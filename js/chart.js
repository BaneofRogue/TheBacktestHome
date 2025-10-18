let chart, candleSeries;

export function initChart() {
  const chartContainer = document.getElementById('chart');
  chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth || 800,
    height: 500,
    layout: { backgroundColor: '#ffffff', textColor: '#000000' },
    grid: {
      vertLines: { color: '#eeeeee' },
      horzLines: { color: '#eeeeee' },
    },
    timeScale: { timeVisible: true, secondsVisible: false },
    crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
  });

  candleSeries = chart.addCandlestickSeries();

  window.addEventListener('resize', () =>
    chart.resize(chartContainer.clientWidth, 500)
  );
}

export function updateCandle(candle) {
  candleSeries.update(candle);
}

export function setInitialData(data) {
  candleSeries.setData(data);
}
