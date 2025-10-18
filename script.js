let chart;
let candleSeries;
let priceData = [];
let currentIndex = 0;
let playInterval = null;
let timeframeMinutes = 1;

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  setupEventListeners();
});

function initChart() {
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
}

function setupEventListeners() {
  document.getElementById('loadPreset').addEventListener('click', loadPreset);
  document.getElementById('play').addEventListener('click', playPlayback);
  document.getElementById('pause').addEventListener('click', pausePlayback);
  document.getElementById('step').addEventListener('click', stepForward);
}

function loadPreset() {
  const file = document.getElementById('presetSelector').value;
  timeframeMinutes = parseInt(document.getElementById('timeframe').value, 10);

  fetch(`data/${file}`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((json) => {
      priceData = json.map((row) => ({
        time: row.timestamp,
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
      currentIndex = 0;
      candleSeries.setData([]);
      console.log("Loaded", file, "data points:", priceData.length);
    })
    .catch((err) => {
      console.error("Error loading data:", err);
      alert("Failed to load preset data.");
    });
}

function getTickDelay() {
  return parseInt(document.getElementById('tickSpeed').value, 10) || 1000;
}
function getTickIncrement() {
  return parseInt(document.getElementById('tickIncrement').value, 10) || 1;
}

function stepForward() {
  const increment = getTickIncrement(); // simulated time per tick (minutes)
  const end = Math.min(currentIndex + increment, priceData.length);
  if (currentIndex >= priceData.length) {
    pausePlayback();
    return;
  }

  // slice next chunk of 1m candles
  const chunk = priceData.slice(currentIndex, end);

  // aggregate chunk into timeframe (e.g. 5m)
  const agg = aggregateCandles(chunk, timeframeMinutes);
  for (const candle of agg) candleSeries.update(candle);

  currentIndex = end;
}

// combine 1m candles into higher timeframe
function aggregateCandles(candles, tf) {
  if (tf <= 1) return candles; // no aggregation

  const result = [];
  for (let i = 0; i < candles.length; i += tf) {
    const group = candles.slice(i, i + tf);
    if (group.length === 0) continue;

    const open = group[0].open;
    const close = group[group.length - 1].close;
    const high = Math.max(...group.map(c => c.high));
    const low = Math.min(...group.map(c => c.low));
    const time = group[group.length - 1].time;

    result.push({ time, open, high, low, close });
  }
  return result;
}

function playPlayback() {
  if (!playInterval) playInterval = setInterval(stepForward, getTickDelay());
}
function pausePlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

window.addEventListener('resize', () => {
  chart.resize(document.getElementById('chart').clientWidth, 500);
});
