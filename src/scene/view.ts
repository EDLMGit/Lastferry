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
