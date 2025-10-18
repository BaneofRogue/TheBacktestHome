import { updateCandle } from './chart.js';
import { aggregateCandles, getPriceData, timeframeMinutes } from './data.js';

let currentIndex = 0;
let playInterval = null;

export function getTickDelay() {
  return parseInt(document.getElementById('tickSpeed').value, 10) || 1000;
}
export function getTickIncrement() {
  return parseInt(document.getElementById('tickIncrement').value, 10) || 1;
}

export function stepForward() {
  const priceData = getPriceData();
  const increment = getTickIncrement();
  const end = Math.min(currentIndex + increment, priceData.length);
  if (currentIndex >= priceData.length) return pausePlayback();

  const chunk = priceData.slice(currentIndex, end);
  const agg = aggregateCandles(chunk, timeframeMinutes);
  for (const candle of agg) updateCandle(candle);

  currentIndex = end;
}

export function playPlayback() {
  if (!playInterval) playInterval = setInterval(stepForward, getTickDelay());
}

export function pausePlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

export function resetPlayback() {
  currentIndex = 0;
  pausePlayback();
}
