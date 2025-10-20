import ChartCanvas from './ChartCanvas.js';

const chart = new ChartCanvas('mainCanvas', 'priceCanvas');

const symbolSelect = document.getElementById('symbol');
const timeframeSelect = document.getElementById('timeframe');
const loadBtn = document.getElementById('load');

loadBtn.addEventListener('click', async () => {
  const symbol = symbolSelect.value;
  const timeframe = timeframeSelect.value;

  // example: fetch data file (JSON) for selected symbol
  const response = await fetch(`data/${symbol}`);
  const data = await response.json();

  // TODO: process timeframe (filter/aggregate data)
  chart.loadCandles(data); // implement loadCandles in ChartCanvas
});
