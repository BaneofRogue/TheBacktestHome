// InteractionManager.js
export class InteractionManager {
  constructor(chartRenderer, canvas) {
    this.chartRenderer = chartRenderer;
    this.canvas = canvas;

    this.dragging = false;
    this.lastX = 0;

    canvas.addEventListener('wheel', e => this.onWheel(e), { passive: false });
    canvas.addEventListener('mousedown', e => this.startDrag(e));
    canvas.addEventListener('mousemove', e => this.onDrag(e));
    canvas.addEventListener('mouseup', () => this.stopDrag());
    canvas.addEventListener('mouseleave', () => this.stopDrag());
    window.addEventListener('resize', () => this.onResize());
  }

  onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    this.chartRenderer.zoomAt(factor, mouseX);
  }

  startDrag(e) {
    // Only middle or right click (1 = middle, 2 = right)
    if (e.button !== 1 && e.button !== 2) return;
    e.preventDefault();

    this.dragging = true;
    this.lastX = e.clientX;
    this.canvas.style.cursor = 'grabbing';
  }

  onDrag(e) {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.chartRenderer.setOffsetX(this.chartRenderer.offsetX + dx);
  }

  stopDrag() {
    if (this.dragging) {
      this.dragging = false;
      this.canvas.style.cursor = 'default';
    }
  }

  onResize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
    this.chartRenderer.render();
  }
}
