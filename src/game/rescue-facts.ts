import type { State } from './rules';
import type { Level } from '../levels/level';

export function occupiedPierDeadline(state: State, level: Level) {
  return (
    level.piers
      .flatMap((pier) => {
        const required = (state.waitingByPier[pier.id] ?? []).some((id) =>
          level.objective.requiredPassengerIds.includes(id),
        );
        const rise = level.rules.tide.rises.find(
          (rise) => rise.afterTurn > state.turn && rise.level >= pier.elevation,
        );
        return required && rise ? [{ pier, rise, actions: rise.afterTurn - state.turn }] : [];
      })
      .sort((a, b) => a.actions - b.actions)[0] ?? null
  );
}
