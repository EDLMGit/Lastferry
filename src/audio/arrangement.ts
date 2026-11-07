import type { State } from '../game/rules';
import type { Level } from '../levels/level';
import { occupiedPierDeadline } from '../game/rescue-facts';

export type Arrangement = 'ordinary' | 'deadline' | 'homeward' | 'won' | 'lost';

export function arrangementForState(state: State, level: Level): Arrangement {
  if (state.status !== 'playing') return state.status;
  const deadline = occupiedPierDeadline(state, level);
  if (deadline && deadline.actions <= 2) return 'deadline';
  const required = level.objective.requiredPassengerIds;
  return required.some((id) => state.aboard.includes(id)) &&
    required.every((id) => state.aboard.includes(id) || state.delivered.includes(id))
    ? 'homeward'
    : 'ordinary';
}

export const companionCells = [
  [64, 57],
  [64, 61],
  [66, 59],
  [57, 62],
  [57, 61],
  [64, 62],
  [62, 59],
  [57, 64],
  [62, 59],
  [62, 66],
] as const;

export function companionNote(beat: number, arrangement: Arrangement) {
  if (arrangement === 'ordinary' || arrangement === 'lost') return null;
  const phase = ((beat % 80) + 80) % 80;
  const index = Math.floor(phase / 8);
  const cell = companionCells[index];
  return {
    note: phase % 8 >= 6 ? companionCells[(index + 1) % 10][0] : cell[phase % 8 < 3 ? 0 : 1],
    strength: arrangement === 'deadline' ? 0.19 : arrangement === 'won' ? 0.1 : 0.24,
    duration: arrangement === 'homeward' ? 2.3 : 1.8,
  };
}
