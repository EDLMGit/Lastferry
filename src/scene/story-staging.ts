import { overviewScale, viewFrame, type ViewBounds, type ViewRectangle } from './view';

export type StorySceneId = 'opening' | 'another-bell' | 'driftwood-light';
export type StoryStage = {
  id: StorySceneId;
  elapsed: number;
  settled: boolean;
  beat: 'ferry' | 'light' | 'crossing' | 'neighbors' | 'water';
  widening: number;
  nod: number;
  turn: number;
  hop: number;
};

const smooth = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};
const arc = (elapsed: number, start: number, duration: number) => {
  const t = (elapsed - start) / duration;
  return t <= 0 || t >= 1 ? 0 : Math.sin(t * Math.PI) ** 2;
};

export function storyStage(
  id: StorySceneId,
  elapsed: number,
  settled: boolean,
  cut: boolean,
): StoryStage {
  const duration = id === 'opening' ? 7200 : 4000;
  const time = settled ? duration : Math.max(0, Math.min(duration, elapsed));
  if (id === 'opening') {
    return {
      id,
      elapsed: time,
      settled: settled || time === duration,
      beat: time < 2200 ? 'ferry' : time < 5200 ? 'light' : 'crossing',
      widening: cut ? (time < 2200 ? 0 : 1) : smooth((time - 1800) / 3600),
      nod: arc(time, 400, 1500) * 0.22,
      turn: arc(time, 250, 1900) * 0.24,
      hop: 0,
    };
  }
  return {
    id,
    elapsed: time,
    settled: settled || time === duration,
    beat: time < 1800 ? 'neighbors' : 'water',
    widening: cut ? (time < 1800 ? 0 : 1) : smooth((time - 1600) / 2000),
    nod: 0,
    turn: arc(time, 200, 1500),
    hop: arc(time, 650, 650) * 0.17,
  };
}

export function storyCameraFrame(
  close: ViewBounds,
  wide: ViewBounds,
  stage: StoryStage,
  usable: ViewRectangle,
  width: number,
  height: number,
) {
  const padded = {
    left: usable.left + 16,
    right: usable.right - 16,
    top: usable.top + 12,
    bottom: usable.bottom - 12,
  };
  const closeScale = Math.min(overviewScale(close, padded), width < 600 ? 105 : 125);
  const wideScale = overviewScale(wide, padded);
  const k = stage.widening;
  const scale = closeScale + (wideScale - closeScale) * k;
  const closeX = (close.minX + close.maxX) / 2;
  const closeY = (close.minY + close.maxY) / 2;
  const focus = {
    x: closeX + ((wide.minX + wide.maxX) / 2 - closeX) * k,
    y: closeY + ((wide.minY + wide.maxY) / 2 - closeY) * k,
  };
  return { frame: viewFrame(width, height, usable, scale, focus), scale, focus };
}
