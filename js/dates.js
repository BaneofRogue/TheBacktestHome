// dates.js

// Extract unique trading dates, skipping weekends (and optionally holidays)
export function getTradingDates(data) {
  const dates = Array.from(new Set(data.map(d => {
    const dt = new Date(d.timestamp * 1000);
    return dt.toISOString().split('T')[0]; // YYYY-MM-DD
  })));
  return dates.filter(d => {
    const day = new Date(d).getDay();
    return day !== 0 && day !== 6; // skip weekends
  });
}

// Find the index of a specific date + time (default 09:30:00)
export function findIndexByTime(data, dateStr, timeStr = '09:30:00') {
  const target = new Date(`${dateStr}T${timeStr}`);
  return data.findIndex(d => {
    const dt = new Date(d.timestamp * 1000);
    return dt.getTime() === target.getTime();
  });
}

// Get previous N trading dates including selected date
export function getPreviousTradingDates(tradingDates, selectedDateStr, count = 5) {
  const idx = tradingDates.indexOf(selectedDateStr);
  if (idx === -1) return [];
  return tradingDates.slice(Math.max(0, idx - count), idx + 1);
}

// Pick a random date from trading dates
export function pickRandomDate(tradingDates) {
  return tradingDates[Math.floor(Math.random() * tradingDates.length)];
}
