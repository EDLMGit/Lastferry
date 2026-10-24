import { overlaps, type Rectangle } from './placement';

export type Endpoint = { id: string; x: number; y: number };
export type EndpointTarget = Endpoint & { size: number; bounds: Rectangle };

export function endpointTargets(points: readonly Endpoint[]): EndpointTarget[] {
  const square = ({ x, y }: Endpoint, size: number): Rectangle => ({
    left: x - size / 2,
    right: x + size / 2,
    top: y - size / 2,
    bottom: y + size / 2,
  });
  const preferred = points.map((point) => square(point, 48));
  return points.map((point, index) => {
    const size = preferred.some(
      (other, otherIndex) => index !== otherIndex && overlaps(preferred[index], other, 0),
    )
      ? 44
      : 48;
    return { ...point, size, bounds: square(point, size) };
  });
}
