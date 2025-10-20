export class InteractionManager {
  constructor(chartRenderer, canvas) {
    this.chartRenderer = chartRenderer;
    this.canvas = canvas;
    this.dragging = false;
    this.lastX = 0;

    canvas.addEventListener('wheel', e => this.onWheel(e));
    canvas.addEventListener('mousedown', e => this.startDrag(e));
    canvas.addEventListener('mousemove', e => this.onDrag(e));
    canvas.addEventListener('mouseup', () => this.stopDrag());
  }

  onWheel(e) {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    this.chartRenderer.scaleX *= delta > 0 ? 0.9 : 1.1;
    this.chartRenderer.render();
  }

  startDrag(e) {
    this.dragging = true;
    this.lastX = e.clientX;
  }

  onDrag(e) {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    this.chartRenderer.offsetX += dx;
    this.lastX = e.clientX;
    this.chartRenderer.render();
  }

  stopDrag() {
    this.dragging = false;
  }
}
