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
        time: row.timestamp, // UNIX timestamp in seconds — correct format
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
      }));
      currentIndex = 0;
      candleSeries.setData(priceData.slice(0, 1)); // Start with the first candle

      console.log("Sample priceData:", priceData.slice(0, 5));

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
  const increment = getTickIncrement();
  const nextIndex = currentIndex + increment;

  if (currentIndex >= priceData.length) {
    pausePlayback();
    return;
  }

  const end = Math.min(nextIndex, priceData.length);

  for (let i = currentIndex; i < end; i++) {
    const candle = priceData[i];
    
    if (candle && candle.time && candle.open != null) {
      candleSeries.update(candle);
    } else {
      console.warn(`[stepForward] Skipping invalid candle at index ${i}:`, candle);
    }
  }

  currentIndex = end;
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
