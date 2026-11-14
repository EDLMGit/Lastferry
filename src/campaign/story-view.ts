import { createCoveStoryPainter, harborComposition } from './story-painter';
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
    const shot = storyScenes[frame.scene].shots[frame.shotIndex];
    const picture = this.canvas.parentElement!;
    picture.dataset.illustration = shot.illustration;
    if (shot.illustration === 'harbor') {
      const { caption } = harborComposition(rect.width, rect.height);
      picture.style.setProperty('--harbor-caption-left', `${caption.left}px`);
      picture.style.setProperty('--harbor-caption-top', `${caption.top}px`);
      picture.style.setProperty('--harbor-caption-width', `${caption.width}px`);
    }
    const size = `${rect.width}:${rect.height}:${ratio}`;
    if (size !== this.lastSize) {
      this.painter.resize(rect.width, rect.height, ratio);
      this.lastSize = size;
      this.lastFrame = '';
    }
    const key = `${frame.scene}:${frame.shot}:${frame.elapsed}`;
    if (key === this.lastFrame) return;
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
