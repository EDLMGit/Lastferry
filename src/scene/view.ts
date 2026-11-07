export type ViewRectangle = { left: number; right: number; top: number; bottom: number };
export type ViewBounds = { minX: number; maxX: number; minY: number; maxY: number };
export type ViewPoint = { x: number; y: number };

export function usableViewRectangle(
  width: number,
  height: number,
  measured?: ViewRectangle | null,
) {
  const left = Math.max(8, Math.min(width - 64, measured?.left ?? 12));
  const top = Math.max(8, Math.min(height - 64, measured?.top ?? 80));
  return {
    left,
    right: Math.max(left + 48, Math.min(width - 8, measured?.right ?? width - 12)),
    top,
    bottom: Math.max(top + 48, Math.min(height - 8, measured?.bottom ?? height - 12)),
  };
}

export function overviewScale(bounds: ViewBounds, usable: ViewRectangle) {
  return Math.min(
    (usable.right - usable.left) / Math.max(0.1, bounds.maxX - bounds.minX),
    (usable.bottom - usable.top) / Math.max(0.1, bounds.maxY - bounds.minY),
  );
}

export function unobscuredOverview(
  bounds: ViewBounds,
  subjects: ViewBounds[],
  usable: ViewRectangle,
  obstacles: ViewRectangle[],
) {
  const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
  const initialScale = overviewScale(bounds, usable);
  const midpoint = { x: (usable.left + usable.right) / 2, y: (usable.top + usable.bottom) / 2 };
  const blocked = obstacles.filter(
    (rect) =>
      rect.right > usable.left &&
      rect.left < usable.right &&
      rect.bottom > usable.top &&
      rect.top < usable.bottom,
  );
  let best = { focus: center, scale: initialScale, overlap: Infinity, displacement: Infinity };
  for (const factor of [1, 0.98, 0.96, 0.94, 0.92]) {
    const scale = initialScale * factor;
    const project = (box: ViewBounds): ViewRectangle => ({
      left: midpoint.x + (box.minX - center.x) * scale,
      right: midpoint.x + (box.maxX - center.x) * scale,
      top: midpoint.y - (box.maxY - center.y) * scale,
      bottom: midpoint.y - (box.minY - center.y) * scale,
    });
    const envelope = project(bounds),
      protectedRects = subjects.map(project);
    const minimumX = usable.left - envelope.left,
      maximumX = usable.right - envelope.right;
    const minimumY = usable.top - envelope.top,
      maximumY = usable.bottom - envelope.bottom;
    const xs = new Set([0, minimumX, maximumX]),
      ys = new Set([0, minimumY, maximumY]);
    for (const subject of protectedRects)
      for (const obstacle of blocked) {
        xs.add(Math.max(minimumX, Math.min(maximumX, obstacle.left - subject.right - 8)));
        xs.add(Math.max(minimumX, Math.min(maximumX, obstacle.right - subject.left + 8)));
        ys.add(Math.max(minimumY, Math.min(maximumY, obstacle.top - subject.bottom - 8)));
        ys.add(Math.max(minimumY, Math.min(maximumY, obstacle.bottom - subject.top + 8)));
      }
    let candidate = { focus: center, scale, overlap: Infinity, displacement: Infinity };
    for (const dx of xs)
      for (const dy of ys) {
        if (
          dx < minimumX - 1e-7 ||
          dx > maximumX + 1e-7 ||
          dy < minimumY - 1e-7 ||
          dy > maximumY + 1e-7
        )
          continue;
        let overlap = 0;
        for (const subject of protectedRects)
          for (const obstacle of blocked)
            overlap +=
              Math.max(
                0,
                Math.min(subject.right + dx + 6, obstacle.right) -
                  Math.max(subject.left + dx - 6, obstacle.left),
              ) *
              Math.max(
                0,
                Math.min(subject.bottom + dy + 6, obstacle.bottom) -
                  Math.max(subject.top + dy - 6, obstacle.top),
              );
        const displacement = dx * dx + dy * dy;
        if (
          overlap < candidate.overlap - 1e-7 ||
          (Math.abs(overlap - candidate.overlap) < 1e-7 && displacement < candidate.displacement)
        )
          candidate = {
            focus: { x: center.x - dx / scale, y: center.y + dy / scale },
            scale,
            overlap,
            displacement,
          };
      }
    if (candidate.overlap === 0) return candidate;
    if (candidate.overlap < best.overlap) best = candidate;
  }
  return best;
}

export function phonePlayScale(bounds: ViewBounds, usable: ViewRectangle) {
  return Math.max(
    overviewScale(bounds, usable) * 1.4,
    Math.min(44, (usable.right - usable.left) / 6.8, (usable.bottom - usable.top) / 4.9),
  );
}

export function clampViewFocus(
  focus: ViewPoint,
  bounds: ViewBounds,
  usable: ViewRectangle,
  scale: number,
) {
  const limit = (value: number, minimum: number, maximum: number, span: number) => {
    if (span >= maximum - minimum) return (minimum + maximum) / 2;
    const margin = span * 0.1;
    return Math.max(minimum + margin, Math.min(maximum - margin, value));
  };
  return {
    x: limit(focus.x, bounds.minX, bounds.maxX, (usable.right - usable.left) / scale),
    y: limit(focus.y, bounds.minY, bounds.maxY, (usable.bottom - usable.top) / scale),
  };
}

export function viewFrame(
  width: number,
  height: number,
  usable: ViewRectangle,
  scale: number,
  focus: ViewPoint,
) {
  const centerX = focus.x + (width / 2 - (usable.left + usable.right) / 2) / scale;
  const centerY = focus.y + ((usable.top + usable.bottom) / 2 - height / 2) / scale;
  return {
    left: centerX - width / scale / 2,
    right: centerX + width / scale / 2,
    top: centerY + height / scale / 2,
    bottom: centerY - height / scale / 2,
  };
}

export function panViewFocus(focus: ViewPoint, deltaX: number, deltaY: number, scale: number) {
  return { x: focus.x - deltaX / scale, y: focus.y + deltaY / scale };
}
