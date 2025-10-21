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
  const data = await response.json();

  chart.loadCandles(data, timeframe);

  const tradingDates = getTradingDates(data);
  const randomDate = pickRandomDate(tradingDates);

  const prev5Dates = getPreviousTradingDates(tradingDates, randomDate, 5);

  const indices = prev5Dates.map(date => findIndexByTime(data, date, '09:30:00'))
                             .filter(i => i !== -1);

  console.log('Random date selected:', randomDate);
  console.log('Previous 5 trading days including selected:', prev5Dates);
  console.log('Indices at 9:30AM:', indices);

  chart.savedIndices = indices;
});
