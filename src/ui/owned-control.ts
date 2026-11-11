import { overlaps, type Rectangle } from './placement';

type Size = { width: number; height: number };
function rectangle(x: number, y: number, { width, height }: Size): Rectangle {
  return { left: x, top: y, right: x + width, bottom: y + height };
}
function fits(r: Rectangle, bounds: Rectangle) {
  return r.left >= bounds.left && r.right <= bounds.right && r.top >= bounds.top && r.bottom <= bounds.bottom;
}

export function besideOwner(size: Size, anchor: Rectangle, bounds: Rectangle, obstacles: Rectangle[]) {
  const x = (anchor.left + anchor.right) / 2, y = (anchor.top + anchor.bottom) / 2;
  const gap = 5;
  const candidates = [
    [anchor.right + gap, y - size.height / 2], [anchor.left - gap - size.width, y - size.height / 2],
    [x - size.width / 2, anchor.bottom + gap], [x - size.width / 2, anchor.top - gap - size.height],
    [anchor.right + gap, y - size.height], [anchor.left - gap - size.width, y - size.height],
    [x, anchor.bottom + gap], [x - size.width, anchor.bottom + gap],
    [x, anchor.top - size.height - gap], [x - size.width, anchor.top - size.height - gap],
  ];
  for (const [left, top] of candidates) {
    const choice = rectangle(left, top, size);
    if (fits(choice, bounds) && !obstacles.some(r => overlaps(choice, r, 2))) return choice;
  }
  return null;
}

export function atScreenEdge(size: Size, bounds: Rectangle, controls: Rectangle[], subjects: Rectangle[]) {
  const { width, height } = size;
  const candidates: Rectangle[] = [];
  const xs = [bounds.left, bounds.right - width, ...controls.flatMap(r => [r.left - width - 5, r.right + 5])];
  const ys = [bounds.bottom - height, bounds.top, ...controls.flatMap(r => [r.top - height - 5, r.bottom + 5])];
  for (const x of xs) {
    candidates.push(rectangle(x, bounds.bottom - height, size), rectangle(x, bounds.top, size));
  }
  for (const y of ys) {
    candidates.push(rectangle(bounds.left, y, size), rectangle(bounds.right - width, y, size));
  }
  const weight = (r: Rectangle) => controls.filter(c => overlaps(r, c, 2)).length * 100 +
    subjects.filter(s => overlaps(r, s, 1)).length;
  return candidates.filter(r => fits(r, bounds)).sort((a, b) => weight(a) - weight(b))[0] ??
    rectangle(bounds.left, bounds.top, size);
}
