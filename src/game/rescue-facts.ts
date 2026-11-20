import { passageFlow, type State } from './rules';
import { nodeName, type Level } from '../levels/level';

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

export function nextWaterChange(state: State, level: Level) {
  const rise = level.rules.tide.rises.find(rise => rise.afterTurn > state.turn);
  if (!rise || state.status !== 'playing') return null;
  const landings = level.piers
    .filter(pier => state.tideLevel < pier.elevation && rise.level >= pier.elevation)
    .map(pier => ({
      nodeId: pier.nodeId,
      name: nodeName(pier.nodeId, level),
      waiting: state.waitingByPier[pier.id] ?? [],
      winch: pier.id === level.bridge?.signalPierId && !state.bridgeOpen,
    }));
  const edge = level.edges.find(edge => edge.current);
  const flow = edge && passageFlow(edge, rise.level);
  const current = edge?.current && flow && flow.from !== passageFlow(edge, state.tideLevel)?.from
    ? { name: edge.current.name, from: nodeName(flow.from, level), to: nodeName(flow.to, level) }
    : null;
  return { afterTurn: rise.afterTurn, remaining: rise.afterTurn - state.turn, level: rise.level, landings, current };
}
