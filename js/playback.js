import { updateCandle } from './chart.js';
import { getPriceData, timeframeMinutes } from './data.js';

let currentIndex = 0;
let playInterval = null;
let currentAgg = null; // currently forming candle
let currentAggStart = null;

export function getTickDelay() {
  return parseInt(document.getElementById('tickSpeed').value, 10) || 1000;
}
export function getTickIncrement() {
  return parseInt(document.getElementById('tickIncrement').value, 10) || 1;
}

export function stepForward() {
  const data = getPriceData();
  const inc = getTickIncrement();

  if (currentIndex >= data.length) {
    pausePlayback();
    return;
  }

  const next = Math.min(currentIndex + inc, data.length);
  for (let i = currentIndex; i < next; i++) {
    const c = data[i];
    updateAggregatedCandle(c);
  }
  currentIndex = next;
}

function updateAggregatedCandle(candle) {
  const tfSec = timeframeMinutes * 60;

  if (!currentAggStart) currentAggStart = candle.time;

  const elapsed = candle.time - currentAggStart;

  // if still inside same timeframe
  if (elapsed < tfSec) {
    if (!currentAgg) {
      currentAgg = { ...candle };
    } else {
      currentAgg.high = Math.max(currentAgg.high, candle.high);
      currentAgg.low = Math.min(currentAgg.low, candle.low);
      currentAgg.close = candle.close;
    }
    updateCandle({ ...currentAgg });
  } else {
    // new candle starts
    currentAgg = { ...candle };
    currentAggStart = candle.time;
    updateCandle({ ...currentAgg });
  }
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
  currentAgg = null;
  currentAggStart = null;
  pausePlayback();
}
