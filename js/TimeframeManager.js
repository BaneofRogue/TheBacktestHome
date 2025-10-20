export class TimeframeManager {
  static aggregate(data, multiplier) {
    const result = [];
    for (let i = 0; i < data.length; i += multiplier) {
      const chunk = data.slice(i, i + multiplier);
      result.push({
        open: chunk[0].open,
        high: Math.max(...chunk.map(c => c.high)),
        low: Math.min(...chunk.map(c => c.low)),
        close: chunk[chunk.length - 1].close,
        time: chunk[0].time,
      });
    }
    return result;
  }
}
