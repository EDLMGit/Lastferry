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
  maximumScale = Infinity,
  preferredCenter?: ViewPoint,
) {
  const center = { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 };
  const initialScale = Math.min(maximumScale, overviewScale(bounds, usable));
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
    const desiredX = preferredCenter ? Math.max(minimumX, Math.min(maximumX, (center.x - preferredCenter.x) * scale)) : 0;
    const desiredY = preferredCenter ? Math.max(minimumY, Math.min(maximumY, (preferredCenter.y - center.y) * scale)) : 0;
    const xs = new Set([desiredX, minimumX, maximumX]),
      ys = new Set([desiredY, minimumY, maximumY]);
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
        const displacement = (dx - desiredX) ** 2 + (dy - desiredY) ** 2;
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

export function neighborhoodFrame(
  landing: ViewBounds,
  boat: ViewBounds,
  adjacent: ViewBounds[],
  usable: ViewRectangle,
  obstacles: ViewRectangle[],
  coveCenter?: ViewPoint,
) {
  const extend = (a: ViewBounds, b: ViewBounds): ViewBounds => ({
    minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
    minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY),
  });
  const padded = {
    left: usable.left + 16, right: usable.right - 16,
    top: usable.top + 16, bottom: usable.bottom - 16,
  };
  let bounds = extend(landing, boat);
  const neighbors = [...adjacent].sort((a, b) =>
    overviewScale(extend(bounds, b), padded) - overviewScale(extend(bounds, a), padded));
  const subjects = [boat];
  const contexts = [bounds];
  for (const [index, neighbor] of neighbors.entries()) {
    const context = extend(bounds, neighbor);
    if (index === 0 || overviewScale(context, padded) >= 27) {
      bounds = context;
      contexts.push(context);
      subjects.push(neighbor);
    }
  }
  let frame = unobscuredOverview(bounds, subjects, padded, obstacles, 40, coveCenter);
  while (frame.overlap > 0 && contexts.length > 2) {
    contexts.pop();
    subjects.pop();
    frame = unobscuredOverview(contexts.at(-1)!, subjects, padded, obstacles, 40, coveCenter);
  }
  return frame;
}

export function adjustedScale(normal: number, whole: number, step: number) {
  const near = Math.max(normal * 1.35, 52);
  if (step < 0) return normal + (normal - whole) * Math.max(-2, step) / 2;
  return normal + (near - normal) * Math.min(2, step) / 2;
}

export function nextZoomStep(normal: number, whole: number, step: number, direction: -1 | 1) {
  const current = adjustedScale(normal, whole, step);
  for (let next = step + direction; next >= -2 && next <= 2; next += direction) {
    if (next === -1 && normal - whole < 2) continue;
    if ((adjustedScale(normal, whole, next) - current) * direction >= 1) return next;
  }
  return null;
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
