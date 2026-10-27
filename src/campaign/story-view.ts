import { createCoveStoryPainter } from './story-painter';
import type { StoryPresentation } from './presentation';
import { storyScenes } from './registry';

export class StoryView {
  private readonly painter;
  private lastSize = '';
  private lastFrame = '';
  private drawCount = 0;
  constructor(readonly canvas: HTMLCanvasElement) {
    this.painter = createCoveStoryPainter(canvas);
  }
  render(frame: StoryPresentation['frame']) {
    if (!frame.scene || !this.canvas.isConnected) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const size = `${rect.width}:${rect.height}:${ratio}`;
    if (size !== this.lastSize) {
      this.painter.resize(rect.width, rect.height, ratio);
      this.lastSize = size;
      this.lastFrame = '';
    }
    const key = `${frame.scene}:${frame.shot}:${frame.elapsed}`;
    if (key === this.lastFrame) return;
    const shot = storyScenes[frame.scene].shots[frame.shotIndex];
    this.painter.draw(shot.illustration, frame.elapsed / 1000);
    this.lastFrame = key;
    this.drawCount++;
  }
  status() {
    return {
      drawCount: this.drawCount,
      connected: this.canvas.isConnected,
      width: this.canvas.width,
      height: this.canvas.height,
      description: this.canvas.getAttribute('aria-label'),
    };
  }
}
