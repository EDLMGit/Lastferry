import {
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Shape,
  ShapeGeometry,
} from 'three';
import { samplePath, type CanonicalPath } from './paths';

export function reefShelves(path: CanonicalPath) {
  return [
    [0.42, -1, 2.15, 1.23, 0.64],
    [0.64, 1, 2.67, 1.25, 0.7],
  ].map(([fraction, side, offset, rx, rz]) => {
    const { position, angle } = samplePath(path, path.length * fraction);
    const turn = Math.PI / 2 - angle - side * 0.2;
    return {
      x: position.x + Math.cos(angle) * side * offset,
      z: position.z - Math.sin(angle) * side * offset,
      rx,
      rz,
      turn,
      cosine: Math.cos(turn),
      sine: Math.sin(turn),
      rock: true,
    };
  });
}

function chevron() {
  const shape = new Shape();
  shape.moveTo(0, 0.31);
  shape.quadraticCurveTo(0.1, 0.08, 0.25, -0.13);
  shape.lineTo(0.19, -0.19);
  shape.lineTo(0, -0.035);
  shape.lineTo(-0.19, -0.19);
  shape.lineTo(-0.25, -0.13);
  shape.quadraticCurveTo(-0.1, 0.08, 0, 0.31);
  const geometry = new ShapeGeometry(shape);
  geometry.rotateX(Math.PI / 2);
  const group = new Group();
  for (const [color, scale, height] of [
    ['#315f66', 1.24, 0.045],
    ['#faefd4', 1, 0.054],
  ] as const) {
    const part = new Mesh(geometry, new MeshBasicMaterial({ color, side: DoubleSide }));
    part.scale.set(scale, 1, scale);
    part.position.y = height;
    group.add(part);
  }
  return group;
}

export function createReefPassage(path: CanonicalPath) {
  const rocks = new Group();
  rocks.name = 'tidal-reef-rocks';
  const base = new DodecahedronGeometry(1, 0);
  const vertices = base.getAttribute('position');
  const colors: number[] = [];
  for (let i = 0; i < vertices.count; i += 3) {
    const y = (vertices.getY(i) + vertices.getY(i + 1) + vertices.getY(i + 2)) / 3;
    const tone = new Color(y > 0.36 ? '#b3ba9f' : y > -0.12 ? '#82968c' : '#5b7977');
    for (let k = 0; k < 3; k++) colors.push(tone.r, tone.g, tone.b);
  }
  base.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
  for (const [i, shelf] of reefShelves(path).entries()) {
    for (const [offset, across, length, height, width] of [
      [-0.48, 0.1, 0.47, 0.26, 0.22],
      [0, 0, 0.58, i === 0 ? 0.67 : 0.52, 0.32],
      [0.62, -0.09, 0.35, 0.31, 0.2],
    ]) {
      const rock = new Mesh(base, material);
      rock.position.set(
        shelf.x + shelf.cosine * offset - shelf.sine * across,
        -0.02,
        shelf.z + shelf.sine * offset + shelf.cosine * across,
      );
      rock.rotation.set(0.11, -shelf.turn, i ? -0.18 : 0.24);
      rock.scale.set(length, height, width);
      rock.castShadow = true;
      rocks.add(rock);
    }
  }
  const arrows = new Group();
  arrows.name = 'tidal-reef-flow';
  for (const fraction of [0.35, 0.55, 0.75]) {
    const { position, angle } = samplePath(path, path.length * fraction);
    const arrow = chevron();
    arrow.position.copy(position);
    arrow.userData.canonicalAngle = angle;
    arrows.add(arrow);
  }
  return { rocks, arrows };
}

export function setReefDirection(arrows: Group, reverse: boolean) {
  for (const arrow of arrows.children)
    arrow.rotation.y = arrow.userData.canonicalAngle + (reverse ? Math.PI : 0);
}
