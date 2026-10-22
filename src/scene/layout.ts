export type IslandStyle = 'garden' | 'crag' | 'reeds' | 'rocky';
type Landmark = {
  kind: 'lighthouse' | 'cottage' | 'bell';
  islandId: string;
  positionXZ: [number, number];
};
export type SceneLayout = {
  landmarks: Landmark[];
  islandStyles: Record<string, IslandStyle>;
  stonePiers: string[];
  centeredWaitingPairs: boolean;
  cameraPosition: [number, number, number];
  landscapeCameraPosition?: [number, number, number];
  light?: {
    background: string;
    sky: string;
    ground: string;
    sun: string;
    sunPosition: [number, number, number];
  };
};
const layouts: Record<string, SceneLayout> = {
  'first-crossing': {
    landmarks: [
      { kind: 'lighthouse', islandId: 'lighthouse-island', positionXZ: [-6.15, -3.25] },
      { kind: 'cottage', islandId: 'sheep-island', positionXZ: [6.3, -3.25] },
    ],
    islandStyles: { 'central-rock': 'crag' },
    stonePiers: [],
    centeredWaitingPairs: false,
    cameraPosition: [0, 34, 24],
    landscapeCameraPosition: [0, 30, 30],
  },
  'holding-pier': {
    landmarks: [
      { kind: 'lighthouse', islandId: 'lighthouse-island', positionXZ: [-6.15, -3.25] },
      { kind: 'cottage', islandId: 'rabbit-island', positionXZ: [6.3, -3.25] },
    ],
    islandStyles: { 'stone-island': 'rocky' },
    stonePiers: ['stone-pier'],
    centeredWaitingPairs: true,
    cameraPosition: [0, 34, 24],
    landscapeCameraPosition: [0, 30, 30],
  },
  bellwater: {
    landmarks: [
      { kind: 'lighthouse', islandId: 'lighthouse-island', positionXZ: [-5.75, -2.8] },
      { kind: 'bell', islandId: 'bell-island', positionXZ: [0.45, -4.95] },
    ],
    islandStyles: { 'low-island': 'reeds', 'bell-island': 'rocky' },
    stonePiers: ['bell-pier'],
    centeredWaitingPairs: true,
    cameraPosition: [0, 34, 24],
    landscapeCameraPosition: [0, 30, 30],
    light: {
      background: '#2a6372',
      sky: '#f2f1db',
      ground: '#668c93',
      sun: '#ffe7bd',
      sunPosition: [-7, 17, 5],
    },
  },
};
export function sceneLayout(levelId: string) {
  return layouts[levelId] ?? layouts['first-crossing'];
}
