let chart;
let candleSeries;
let priceData = [];
let currentIndex = 0;
let playInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initChart();
  setupEventListeners();
});

function initChart() {
  const chartContainer = document.getElementById('chart');
  chart = LightweightCharts.createChart(chartContainer, {
    width: chartContainer.clientWidth || 800,
    height: 500,
    layout: {
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
    grid: {
      vertLines: { color: '#eeeeee' },
      horzLines: { color: '#eeeeee' },
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

function setupEventListeners() {
  document.getElementById('loadPreset').addEventListener('click', loadPreset);
  document.getElementById('play').addEventListener('click', playPlayback);
  document.getElementById('pause').addEventListener('click', pausePlayback);
  document.getElementById('step').addEventListener('click', stepForward);
}

function loadPreset() {
  const file = document.getElementById('presetSelector').value;

  fetch(`data/${file}`)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response.json();
    })
    .then((json) => {
      priceData = json.map((row) => ({
        time: Math.floor(new Date(row.timestamp).getTime() / 1000),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
      currentIndex = 0;
      candleSeries.setData(priceData.slice(0, 1)); // Start with the first candle
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
  const increment = getTickIncrement(); // e.g., 5 minutes
  const nextIndex = currentIndex + increment;

  if (nextIndex < priceData.length) {
    const slice = priceData.slice(0, nextIndex + 1);
    candleSeries.setData(slice);
    currentIndex = nextIndex;
  } else {
    pausePlayback(); // Stop playback if we've reached the end
  }
}

function playPlayback() {
  if (!playInterval) {
    playInterval = setInterval(stepForward, getTickDelay());
  }
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
