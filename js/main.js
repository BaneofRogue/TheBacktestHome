import ChartCanvas from './ChartCanvas.js';
import { getTradingDates, findIndexByTime, getPreviousTradingDates, pickRandomDate } from './dates.js';

const chart = new ChartCanvas('mainCanvas', 'priceCanvas');

const symbolSelect = document.getElementById('symbol');
const timeframeSelect = document.getElementById('timeframe');
const loadBtn = document.getElementById('load');

loadBtn.addEventListener('click', async () => {
  const symbol = symbolSelect.value;
  const timeframe = parseInt(timeframeSelect.value, 10);

  const response = await fetch(`data/${symbol}`);
  const rawData = await response.json();

  const tradingDates = getTradingDates(rawData);
  const randomDate = pickRandomDate(tradingDates);
  const prev5Dates = getPreviousTradingDates(tradingDates, randomDate, 5);
  const indices = prev5Dates.map(date => findIndexByTime(rawData, date, '09:30:00')).filter(i => i !== -1);

  const startIdx = indices[0];
  const endIdx = indices[indices.length - 1] + 1;
  const newData = rawData.slice(startIdx, endIdx);

  chart.loadCandles(newData, timeframe);
  chart.savedIndices = indices;

  console.log('Random date selected:', randomDate);
  console.log('Previous 5 trading days including selected:', prev5Dates);
  console.log('Indices at 9:30AM:', indices);
});
