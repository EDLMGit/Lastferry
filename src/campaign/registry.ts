import {
  bellwater,
  driftwoodYard,
  holdingPier,
  wideBerth,
  twoShelters,
  reefReturn,
  level as firstCrossing,
  type Level,
} from '../levels/level';

export type CoveId =
  'holding-pier' | 'bellwater' | 'driftwood-yard' | 'two-shelters' | 'wide-berth' | 'reef-return';
export type SceneId =
  | 'opening'
  | 'another-bell'
  | 'driftwood-light'
  | 'among-the-reeds'
  | 'a-wider-deck'
  | 'lights-beyond-the-reef';
export type IllustrationId =
  'tide' | 'lantern' | 'ferry' | 'harbor' | 'driftwood' | 'reeds' | 'launch' | 'reef';
export type StoryCue = {
  id: string;
  atMs: number;
  kind: 'tide-wash' | 'lantern-contact' | 'ferry-water';
  strength?: number;
};
export type StoryShot = {
  id: IllustrationId;
  illustration: IllustrationId;
  durationMs: number;
  caption: string;
  captionCueMs: number;
  description: string;
  cues: readonly StoryCue[];
  narrationAssetId?: string;
};

export type StoryScene = {
  id: SceneId;
  title: string;
  shots: readonly StoryShot[];
  destination: CoveId;
  continueLabel: string;
};

export const storyScenes: Record<SceneId, StoryScene> = {
  opening: {
    id: 'opening',
    title: 'The first evening',
    shots: [
      {
        id: 'tide',
        illustration: 'tide',
        durationMs: 6000,
        captionCueMs: 1050,
        caption: 'Your first evening at the helm.\nA high tide ahead.',
        description:
          'Water covers the lower stone steps and a marked post. Tan Rue and cream Pip wait safely on the higher landing.',
        cues: [{ id: 'opening.tide.wash', atMs: 1900, kind: 'tide-wash' }],
        narrationAssetId: 'narration.opening.tide',
      },
      {
        id: 'lantern',
        illustration: 'lantern',
        durationMs: 6000,
        captionCueMs: 1050,
        caption: 'Pip and Rue have kept a light for you.',
        description:
          'Rue, the tan rabbit on the left, raises a warm lantern. Cream Pip waits close beside her on the right.',
        cues: [{ id: 'opening.lantern.contact', atMs: 1450, kind: 'lantern-contact' }],
        narrationAssetId: 'narration.opening.lantern',
      },
      {
        id: 'ferry',
        illustration: 'ferry',
        durationMs: 7000,
        captionCueMs: 1050,
        caption: 'Moss is aboard.\nBring everyone to the lighthouse.',
        description:
          'The yellow ferry with its red cabin and Moss the sheep approaches through open water toward the warm lighthouse.',
        cues: [{ id: 'opening.ferry.water', atMs: 650, kind: 'ferry-water' }],
        narrationAssetId: 'narration.opening.ferry',
      },
    ],
    destination: 'holding-pier',
    continueLabel: 'Take the helm',
  },
  'another-bell': {
    id: 'another-bell',
    title: 'Another bell',
    shots: [
      {
        id: 'harbor',
        illustration: 'harbor',
        durationMs: 5000,
        captionCueMs: 1050,
        caption: 'Pip, Rue and Moss are safe.\nBellwater is still waiting.',
        description:
          'Rue sets her lantern on the high Harbor landing beside safe Pip and Moss. Pip looks toward the empty waiting ferry and a distant light.',
        cues: [
          {
            id: 'another-bell.harbor.contact',
            atMs: 3200,
            kind: 'lantern-contact',
            strength: 0.75,
          },
        ],
        narrationAssetId: 'narration.another-bell.harbor',
      },
    ],
    destination: 'bellwater',
    continueLabel: 'Continue to Bellwater',
  },
  'driftwood-light': {
    id: 'driftwood-light',
    title: 'A light at the yard',
    shots: [
      {
        id: 'driftwood',
        illustration: 'driftwood',
        durationMs: 7000,
        captionCueMs: 1050,
        caption: 'Nell, the boatwright, is still at the yard.',
        description:
          'Nell, a warm brown beaver with small round ears and a broad flat dark tail, works at a timber rail. She lifts her lantern in a clear arc, then turns toward the approaching ferry light and holds it in greeting.',
        cues: [
          { id: 'driftwood-light.channel.water', atMs: 3500, kind: 'ferry-water', strength: 0.65 },
        ],
      },
    ],
    destination: 'driftwood-yard',
    continueLabel: 'Continue to Driftwood',
  },
  'among-the-reeds': {
    id: 'among-the-reeds',
    title: 'Among the reeds',
    shots: [
      {
        id: 'reeds',
        illustration: 'reeds',
        durationMs: 7000,
        captionCueMs: 1050,
        caption: 'Hazel and Bracken are aboard.\nMica looks up from the reeds.',
        description:
          'The small yellow ferry carries the two brown beavers. As it draws closer, cream rabbit Mica steps clear of the reeds and lifts a paw. A beaver answers from the open deck.',
        cues: [
          { id: 'among-the-reeds.ferry.water', atMs: 900, kind: 'ferry-water', strength: 0.6 },
        ],
      },
    ],
    destination: 'two-shelters',
    continueLabel: 'Continue to Two Shelters',
  },
  'a-wider-deck': {
    id: 'a-wider-deck',
    title: 'A wider deck',
    shots: [
      {
        id: 'launch',
        illustration: 'launch',
        durationMs: 8000,
        captionCueMs: 1050,
        caption: 'Nell had a bigger boat ready. Now there are hands to launch it.',
        description:
          'At the protected boathouse, safely rescued Nell frees a visible mooring line. Pip guides with an outstretched paw while Rue watches from the high quay. The prepared wider yellow ferry, red cabin and large open deck glide out onto the water, then settle ready for the next crossing. Nobody boards or becomes stranded during the launch.',
        cues: [
          { id: 'a-wider-deck.launch.water', atMs: 3500, kind: 'ferry-water', strength: 0.65 },
        ],
      },
    ],
    destination: 'wide-berth',
    continueLabel: 'Continue to Wide Berth',
  },
  'lights-beyond-the-reef': {
    id: 'lights-beyond-the-reef',
    title: 'Lights beyond the reef',
    shots: [
      {
        id: 'reef',
        illustration: 'reef',
        durationMs: 7000,
        captionCueMs: 1050,
        caption: 'Heather and Birch are aboard.\nBeyond the reef, Dot answers Flick’s light.',
        description:
          'Heather the sheep and Birch the beaver share the larger ferry. Beyond the low reef, tan Flick lifts a lantern from Shell Pool. Cream Dot raises a second light at Wrack Pier.',
        cues: [
          {
            id: 'lights-beyond-the-reef.ferry.water',
            atMs: 750,
            kind: 'ferry-water',
            strength: 0.55,
          },
          {
            id: 'lights-beyond-the-reef.lantern.contact',
            atMs: 3650,
            kind: 'lantern-contact',
            strength: 0.55,
          },
        ],
      },
    ],
    destination: 'reef-return',
    continueLabel: 'Continue to Reef Return',
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
  { id: 'driftwood-yard', level: driftwoodYard, order: 2, entryScene: 'driftwood-light' },
  { id: 'two-shelters', level: twoShelters, order: 3, entryScene: 'among-the-reeds' },
  { id: 'wide-berth', level: wideBerth, order: 4, entryScene: 'a-wider-deck' },
  { id: 'reef-return', level: reefReturn, order: 5, entryScene: 'lights-beyond-the-reef' },
];

export const practiceCoves = [
  firstCrossing,
  holdingPier,
  bellwater,
  driftwoodYard,
  wideBerth,
  twoShelters,
  reefReturn,
] as const;

export function storyCove(id: string): StoryCove | undefined {
  return storyCoves.find((cove) => cove.id === id);
}

export function practiceCove(id: string): Level | undefined {
  return practiceCoves.find((cove) => cove.id === id);
}

export function scenePredecessor(id: SceneId): Level {
  const index = storyCoves.findIndex((cove) => cove.entryScene === id);
  return storyCoves[Math.max(0, index - 1)].level;
}
