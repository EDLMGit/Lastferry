import { overlaps, type Rectangle } from './placement';

export type Endpoint = { id: string; x: number; y: number };
export type EndpointTarget = Endpoint & { size: number; bounds: Rectangle };

const square = (x: number, y: number, size: number): Rectangle => ({
  left: x - size / 2,
  right: x + size / 2,
  top: y - size / 2,
  bottom: y + size / 2,
});

const fits = (rect: Rectangle, bounds: Rectangle) =>
  rect.left >= bounds.left && rect.right <= bounds.right &&
  rect.top >= bounds.top && rect.bottom <= bounds.bottom;

export function endpointTargets(points: readonly Endpoint[]): EndpointTarget[] {
  const preferred = points.map(({ x, y }) => square(x, y, 48));
  return points.map((point, index) => {
    const size = preferred.some((other, i) => i !== index && overlaps(preferred[index], other, 0))
      ? 44 : 48;
    return { ...point, size, bounds: square(point.x, point.y, size) };
  });
}

const offsets = [[0, 0], [0, 14], [14, 0], [-14, 0], [0, -14], [0, 26],
  [18, 18], [-18, 18], [26, 0], [-26, 0], [18, -18], [-18, -18], [0, -26]];

export function placeCoveTargets(points: Endpoint[], bounds: Rectangle, chrome: Rectangle[], figures: Rectangle[]) {
  const targets = endpointTargets(points);
  const reserved = new Map(targets.map(t => [t.id, t.bounds]));
  return targets.map(target => {
    const onscreen = target.x >= bounds.left && target.x <= bounds.right &&
      target.y >= bounds.top && target.y <= bounds.bottom;
    let best = target;
    let bestCost = Infinity;
    if (onscreen) {
      const neighbors = [...reserved].filter(([id]) => id !== target.id).map(([, rect]) => rect);
      for (const [dx, dy] of offsets) {
        const x = target.x + dx, y = target.y + dy;
        const hit = square(x, y, target.size), symbol = square(x, y, 20);
        if (!fits(hit, bounds)) continue;
        const covered = figures.reduce((sum, r) => {
          const penetration = Math.min(symbol.right - r.left, r.right - symbol.left,
            symbol.bottom - r.top, r.bottom - symbol.top);
          return sum + Math.max(0, 2 + penetration);
        }, 0);
        const cost = chrome.filter(r => overlaps(hit, r, 1)).length * 1000 +
          neighbors.filter(r => overlaps(hit, r, 0)).length * 150 +
          covered * 4 + Math.hypot(dx, dy);
        if (cost >= bestCost) continue;
        bestCost = cost;
        best = { ...target, x, y, bounds: hit };
        if (cost === 0) break;
      }
    }
    reserved.set(best.id, best.bounds);
    const onFigure = figures.some(rect => overlaps(square(best.x, best.y, 20), rect, 0));
    return { ...best, onscreen, onFigure };
  });
}

export type MapName = { id: string; width: number; height: number };
export function placeCoveNames(
  names: MapName[], targets: EndpointTarget[], bounds: Rectangle, obstacles: Rectangle[],
  previous: Map<string, number>, passage: Rectangle[] = [],
) {
  const placed = new Map<string, Rectangle>();
  const anchors = new Map<string, number>();
  for (const { id, width, height } of names) {
    const target = targets.find(t => t.id === id);
    if (!target) continue;
    const { x, y } = target;
    const neighbors = targets.filter(t => t.id !== id).map(t => t.bounds);
    const gap = 15;
    const positions = [
      [x + gap, y - height / 2], [x - width - gap, y - height / 2],
      [x - width / 2, y + gap], [x - width / 2, y - height - gap],
      [x - width / 5, y + gap], [x - width * 4 / 5, y + gap],
      [x - width / 5, y - height - gap], [x - width * 4 / 5, y - height - gap],
      [x + gap, y - height / 10], [x - width - gap, y - height / 10],
      [x + gap, y - height * 9 / 10], [x - width - gap, y - height * 9 / 10],
    ];
    const avoided = [...obstacles, ...neighbors, ...placed.values()];
    let bestCost = Infinity;
    for (const [index, [left, top]] of positions.entries()) {
      const rect = { left, top, right: left + width, bottom: top + height };
      if (!fits(rect, bounds) || avoided.some(r => overlaps(r, rect, 2))) continue;
      const cost = passage.filter(r => overlaps(r, rect, 0)).length * 20 +
        (previous.get(id) === index ? -1 : index);
      if (cost >= bestCost) continue;
      bestCost = cost;
      placed.set(id, rect);
      anchors.set(id, index);
    }
  }
  return { placed, anchors };
}
