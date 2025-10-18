import { initChart, setInitialData } from './chart.js';
import { loadPreset, setTimeframe } from './data.js';
import { playPlayback, pausePlayback, stepForward, resetPlayback } from './playback.js';

document.addEventListener('DOMContentLoaded', () => {
  initChart();

  document.getElementById('loadPreset').addEventListener('click', async () => {
    const file = document.getElementById('presetSelector').value;
    const tf = document.getElementById('timeframe').value;
    setTimeframe(tf);

    try {
      const data = await loadPreset(file);
      resetPlayback();
      setInitialData([]);
      console.log(`Loaded ${data.length} 1m candles`);
    } catch (e) {
      alert('Failed to load preset data.');
      console.error(e);
    }
  });

  document.getElementById('play').addEventListener('click', playPlayback);
  document.getElementById('pause').addEventListener('click', pausePlayback);
  document.getElementById('step').addEventListener('click', stepForward);
});
