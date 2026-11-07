import type { Rectangle } from './placement';

export function visibleViewport(
  viewport: Pick<VisualViewport, 'width' | 'height' | 'offsetLeft' | 'offsetTop'> | null,
  width: number,
  height: number,
): Rectangle {
  const left = viewport?.offsetLeft ?? 0;
  const top = viewport?.offsetTop ?? 0;
  return {
    left,
    top,
    right: left + (viewport?.width || width),
    bottom: top + (viewport?.height || height),
  };
}

export function insetRectangle(
  bounds: Rectangle,
  insets: { top: number; right: number; bottom: number; left: number },
  gap = 8,
): Rectangle {
  return {
    left: bounds.left + insets.left + gap,
    right: Math.max(bounds.left + insets.left + gap, bounds.right - insets.right - gap),
    top: bounds.top + insets.top + gap,
    bottom: Math.max(bounds.top + insets.top + gap, bounds.bottom - insets.bottom - gap),
  };
}
