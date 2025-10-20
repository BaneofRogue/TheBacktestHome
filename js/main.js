import { ChartRenderer } from './ChartRenderer.js';
import { DrawingManager } from './DrawingManager.js';
import { InteractionManager } from './InteractionManager.js';
import { TimeframeManager } from './TimeframeManager.js';
import { PlaybackManager } from './PlaybackManager.js';

const chartCanvas = document.createElement('canvas');
const drawCanvas = document.createElement('canvas');
chartCanvas.width = drawCanvas.width = 1000;
chartCanvas.height = drawCanvas.height = 500;
chartCanvas.style.position = 'absolute';
drawCanvas.style.position = 'absolute';

document.getElementById('chart').append(chartCanvas, drawCanvas);

const chartRenderer = new ChartRenderer(chartCanvas);
const drawingManager = new DrawingManager(drawCanvas);
const interactionManager = new InteractionManager(chartRenderer, chartCanvas);
const playbackManager = new PlaybackManager(chartRenderer);

async function loadPreset(file) {
  const res = await fetch(`../data/${file}`);
  const data = await res.json();
  playbackManager.setData(data);
  chartRenderer.setData(data);
  chartRenderer.render();
}

document.getElementById('loadPreset').addEventListener('click', () => {
  const file = document.getElementById('presetSelector').value;
  loadPreset(file);
});

document.getElementById('play').addEventListener('click', () => playbackManager.play());
document.getElementById('pause').addEventListener('click', () => playbackManager.pause());
document.getElementById('step').addEventListener('click', () => playbackManager.step());
