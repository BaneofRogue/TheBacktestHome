let priceData = [];
export let timeframeMinutes = 1;

const statusEl = document.getElementById("dataStatus"); // expects <span id="dataStatus">

function updateStatus(loaded) {
  if (!statusEl) return;
  statusEl.textContent = loaded ? "Loaded ✓" : "Not loaded";
  statusEl.style.color = loaded ? "limegreen" : "red";
}

export function setTimeframe(tf) {
  timeframeMinutes = parseInt(tf, 10) || 1;
}

export async function loadPreset(file) {
  try {
    console.log(`Attempting to load: data/${file}`);
    const res = await fetch(`data/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    priceData = json.map(row => ({
      time: row.timestamp,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
    }));

    console.log(`✅ Loaded ${priceData.length} candles from ${file}`);
    updateStatus(true);
    return priceData;
  } catch (err) {
    console.error("❌ Failed to load preset:", err);
    updateStatus(false);
    priceData = [];
    return [];
  }
}

export function aggregateCandles(candles) {
  if (timeframeMinutes <= 1) return candles;
  const result = [];

  console.log(`⏱ Aggregating with timeframe ${timeframeMinutes}m`);
  for (let i = 0; i < candles.length; i += timeframeMinutes) {
    const group = candles.slice(i, i + timeframeMinutes);
    if (!group.length) continue;

    const open = group[0].open;
    const close = group[group.length - 1].close;
    const high = Math.max(...group.map(c => c.high));
    const low = Math.min(...group.map(c => c.low));
    const time = group[group.length - 1].time;

    console.log(`🕒 Candle ${i / timeframeMinutes}: ${new Date(time * 1000).toLocaleTimeString()}`);
    result.push({ time, open, high, low, close });
  }

  console.log(`✅ Aggregated ${result.length} candles total`);
  return result;
}

export function getPriceData() {
  return priceData;
}
