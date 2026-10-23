import { describe, expect, test } from 'vitest';
import { arrivalPhrase } from '../../src/audio/arrival';
import { beatSeconds, phraseSeconds, score } from '../../src/audio/score';

const cellSeconds = 8 * beatSeconds;
const pitchClass = (note: number) => note % 12;

describe('bounded arrival voicing follows the running harmony', () => {
  test('acknowledges immediately with a warm opening, melodic answer and soft bounded tail', () => {
    const phrase = arrivalPhrase(4);
    expect(phrase.map(({ stage }) => stage)).toEqual(['opening', 'answer', 'settle']);
    expect(phrase[0]).toMatchObject({ offset: 0, palette: 'pad' });
    expect(phrase[1]).toMatchObject({ palette: 'pluck' });
    expect(phrase[2]).toMatchObject({ palette: 'pad' });
    expect(phrase[1].peak).toBeGreaterThan(phrase[0].peak);
    expect(phrase[2].peak).toBeLessThan(phrase[0].peak);
    expect(Math.max(...phrase.map(({ offset, duration }) => offset + duration))).toBeCloseTo(3.35);
    for (const note of phrase) {
      expect(note.attack).toBeGreaterThanOrEqual(0.065);
      expect(note.attack).toBeLessThan(note.duration);
      expect(note.duration).toBeLessThan(2.5);
      expect(note.peak).toBeLessThan(0.08);
    }
  });

  test('every stage fits every pad audible during its complete lifetime, including the phrase return', () => {
    const starts = new Set<number>([
      0,
      0.001,
      phraseSeconds - 0.001,
      phraseSeconds,
      phraseSeconds + 0.001,
    ]);
    for (let i = 0; i < score.beats * 8; i++) starts.add((i * beatSeconds) / 8);
    for (let cell = 0; cell < score.harmonies.length; cell++)
      for (const offset of [0, 0.001, 2.499, 2.5, 2.501, 4, 6.4, 7.499])
        starts.add(cell * cellSeconds + offset);
    for (const elapsed of starts)
      for (const note of arrivalPhrase(elapsed)) {
        const start = elapsed + note.offset,
          end = start + note.duration;
        expect(Number.isFinite(note.note), `start ${elapsed}, stage ${note.stage}`).toBe(true);
        expect(Number.isInteger(note.note)).toBe(true);
        expect(note.note).toBeGreaterThanOrEqual(54);
        expect(note.note).toBeLessThanOrEqual(71);
        for (let cell = -1; cell <= 12; cell++) {
          const padStart = cell * cellSeconds,
            padEnd = padStart + cellSeconds + 2.5;
          if (padStart >= end || padEnd <= start) continue;
          const chord = score.harmonies[(cell + score.harmonies.length) % score.harmonies.length];
          expect(
            chord.notes.map(pitchClass),
            `start ${elapsed}, stage ${note.stage}, pad ${cell}`,
          ).toContain(pitchClass(note.note));
        }
      }
  });

  test('single-common-pitch boundaries use useful octaves without introducing foreign harmony', () => {
    expect(arrivalPhrase(29.9).map(({ note }) => pitchClass(note))).toEqual([9, 9, 9]);
    expect(arrivalPhrase(37.4).map(({ note }) => pitchClass(note))).toEqual([4, 4, 4]);
    expect(arrivalPhrase(74.9)).toEqual(arrivalPhrase(149.9));
  });

  test('invalid or negative clock inputs fall back to the opening and results cannot mutate authored data', () => {
    const first = arrivalPhrase(0);
    for (const input of [-1, -Infinity, Infinity, NaN]) expect(arrivalPhrase(input)).toEqual(first);
    first[0].note = 0;
    first[0].duration = 100;
    expect(arrivalPhrase(0)[0]).toMatchObject({ note: 62, duration: 1.55 });
  });
});
