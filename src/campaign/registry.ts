import { bellwater, holdingPier, level as firstCrossing, type Level } from '../levels/level';

export type CoveId = 'holding-pier' | 'bellwater';
export type SceneId = 'opening' | 'another-bell';

export type StoryScene = {
  id: SceneId;
  title: string;
  captions: readonly string[];
  duration: number;
  staging: 'holding-start' | 'holding-harbor';
  destination: CoveId;
};

export const storyScenes: Record<SceneId, StoryScene> = {
  opening: {
    id: 'opening',
    title: 'The first evening',
    captions: [
      'Your first evening alone at the helm.',
      'The tide will be high tonight.',
      'Bring everyone to the lighthouse.',
    ],
    duration: 7200,
    staging: 'holding-start',
    destination: 'holding-pier',
  },
  'another-bell': {
    id: 'another-bell',
    title: 'Another bell',
    captions: ['Pip, Rue and Moss are safe. Across the water, Bellwater is still waiting.'],
    duration: 4000,
    staging: 'holding-harbor',
    destination: 'bellwater',
  },
};

export type StoryCove = {
  id: CoveId;
  level: Level;
  order: number;
  entryScene: SceneId;
};

export const storyCoves: readonly StoryCove[] = [
  { id: 'holding-pier', level: holdingPier, order: 0, entryScene: 'opening' },
  { id: 'bellwater', level: bellwater, order: 1, entryScene: 'another-bell' },
];

export const practiceCoves = [firstCrossing, holdingPier, bellwater] as const;

export function storyCove(id: string): StoryCove | undefined {
  return storyCoves.find((cove) => cove.id === id);
}

export function practiceCove(id: string): Level | undefined {
  return practiceCoves.find((cove) => cove.id === id);
}
