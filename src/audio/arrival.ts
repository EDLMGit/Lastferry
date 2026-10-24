import { beatSeconds, phraseSeconds, score } from './score';

export type ArrivalNote = {
  stage: 'opening' | 'answer' | 'settle';
  note: number;
  offset: number;
  duration: number;
  attack: number;
  peak: number;
  palette: 'pad' | 'pluck';
};

const voicings = [
  [62, 69, 66],
  [59, 66, 64],
  [59, 69, 66],
  [62, 69, 66],
  [61, 69, 64],
  [62, 67, 64],
  [62, 69, 66],
  [62, 69, 64],
  [62, 69, 64],
  [62, 69, 66],
] as const;

const stages: Omit<ArrivalNote, 'note'>[] = [
  { stage: 'opening', offset: 0, duration: 1.55, attack: 0.06, peak: 0.11, palette: 'pad' },
  { stage: 'answer', offset: 0.48, duration: 1.9, attack: 0.035, peak: 0.15, palette: 'pluck' },
  { stage: 'settle', offset: 1.1, duration: 2.25, attack: 0.14, peak: 0.072, palette: 'pad' },
];

const cellSeconds = 8 * beatSeconds;
const pitches = score.harmonies.map(({ notes }) => new Set(notes.map((note) => note % 12)));

function stagePitch(start: number, duration: number, stage: number) {
  const phase = start % phraseSeconds,
    index = Math.floor(phase / cellSeconds),
    within = phase - index * cellSeconds,
    target = voicings[index][stage],
    previous = pitches[(index + pitches.length - 1) % pitches.length],
    next = pitches[(index + 1) % pitches.length],
    allowed = [...pitches[index]].filter(
      (pitch) =>
        (within >= 2.5 || previous.has(pitch)) &&
        (within + duration <= cellSeconds || next.has(pitch)),
    );
  return allowed
    .map((pitch) => pitch + 12 * Math.round((target - pitch) / 12))
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
}

export function arrivalPhrase(elapsedSeconds: number): ArrivalNote[] {
  const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  return stages.map((stage, index) => ({
    ...stage,
    note: stagePitch(elapsed + stage.offset, stage.duration, index),
  }));
}
