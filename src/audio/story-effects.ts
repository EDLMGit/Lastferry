export type StoryCueKind = 'tide-wash' | 'lantern-contact' | 'ferry-water';

export const storyEffects = {
  'tide-wash': { duration: 2.8, attack: 0.45, peak: 0.125, cutoff: 620, rate: 0.81, pan: -0.12 },
  'lantern-contact': {
    duration: 0.24,
    attack: 0.014,
    peak: 0.14,
    cutoff: 1350,
    rate: 0.92,
    pan: -0.08,
  },
  'ferry-water': { duration: 4.2, attack: 0.65, peak: 0.14, cutoff: 680, rate: 0.93, pan: 0.08 },
} satisfies Record<
  StoryCueKind,
  {
    duration: number;
    attack: number;
    peak: number;
    cutoff: number;
    rate: number;
    pan: number;
  }
>;
