import { updateCandle } from './chart.js';
import { getPriceData, timeframeMinutes } from './data.js';

let currentIndex = 0;
let playInterval = null;
let currentAgg = null; // active forming candle
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
    console.log("%c[Playback] End of data reached", "color:orange;");
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

  // Initialize if needed
  if (!currentAggStart) {
    currentAggStart = candle.time;
    currentAgg = { ...candle };
    console.log(
      `%c[New Candle Start] ${formatTime(candle.time)} (TF ${timeframeMinutes}m)`,
      "color:lime;"
    );
    updateCandle({ ...currentAgg });
    return;
  }

  const elapsed = candle.time - currentAggStart;
  const inSameCandle = elapsed < tfSec;

  console.log(
    `[Tick] ${formatTime(candle.time)} | Current start: ${formatTime(currentAggStart)} | Elapsed: ${elapsed}s | ${inSameCandle ? "UPDATE" : "NEW"}`
  );

  if (inSameCandle) {
    // Update existing candle live
    currentAgg.high = Math.max(currentAgg.high, candle.high);
    currentAgg.low = Math.min(currentAgg.low, candle.low);
    currentAgg.close = candle.close;
    updateCandle({ ...currentAgg });
  } else {
    // Finish previous candle and start new one
    console.log(
      `%c[Finalize Candle] ${formatTime(currentAggStart)} → ${formatTime(candle.time)} | Close: ${currentAgg.close}`,
      "color:cyan;"
    );

    currentAggStart = candle.time;
    currentAgg = { ...candle };
    console.log(
      `%c[New Candle Start] ${formatTime(currentAggStart)}`,
      "color:lime;"
    );
    updateCandle({ ...currentAgg });
  }
}

function formatTime(unixSec) {
  const d = new Date(unixSec * 1000);
  return d.toISOString().substring(11, 19); // HH:MM:SS
}

export function playPlayback() {
  if (!playInterval) {
    console.log("%c[Playback] Started", "color:yellow;");
    playInterval = setInterval(stepForward, getTickDelay());
  }
}

export function pausePlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
    console.log("%c[Playback] Paused", "color:red;");
  }
}

export function resetPlayback() {
  currentIndex = 0;
  currentAgg = null;
  currentAggStart = null;
  pausePlayback();
  console.log("%c[Playback] Reset", "color:gray;");
}
