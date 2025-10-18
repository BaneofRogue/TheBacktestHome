let priceData = [];
export let timeframeMinutes = 1;

export function setTimeframe(tf) {
  timeframeMinutes = parseInt(tf, 10) || 1;
}

export async function loadPreset(file) {
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

  return priceData;
}

export function aggregateCandles(candles) {
  if (timeframeMinutes <= 1) return candles;
  const result = [];

  for (let i = 0; i < candles.length; i += timeframeMinutes) {
    const group = candles.slice(i, i + timeframeMinutes);
    if (!group.length) continue;

    const open = group[0].open;
    const close = group[group.length - 1].close;
    const high = Math.max(...group.map(c => c.high));
    const low = Math.min(...group.map(c => c.low));
    const time = group[group.length - 1].time;

    result.push({ time, open, high, low, close });
  }
  return result;
}

export function getPriceData() {
  return priceData;
}
