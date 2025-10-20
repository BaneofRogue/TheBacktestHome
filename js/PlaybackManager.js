export class PlaybackManager {
  constructor(chartRenderer) {
    this.chartRenderer = chartRenderer;
    this.data = [];
    this.index = 0;
    this.tickDelay = 500;
    this.tickIncrement = 1;
    this.playing = false;
  }

  setData(data) {
    this.data = data;
    this.index = 0;
  }

  async play() {
    this.playing = true;
    while (this.playing && this.index < this.data.length) {
      this.chartRenderer.setData(this.data.slice(0, this.index));
      this.chartRenderer.render();
      await new Promise(r => setTimeout(r, this.tickDelay));
      this.index += this.tickIncrement;
    }
  }

  pause() {
    this.playing = false;
  }

  step() {
    this.index += this.tickIncrement;
    this.chartRenderer.setData(this.data.slice(0, this.index));
    this.chartRenderer.render();
  }
}
