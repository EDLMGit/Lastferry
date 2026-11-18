import { expect, test } from 'vitest';
import { lanternReach as level } from '../../src/levels/level';
import { bridgeStatus, initial, reduce, type Action } from '../../src/game/rules';
import { currentNotice, forecastCopy } from '../../src/ui/presentation';
import plans from '../../data/lantern-reach/witnesses.json';

test('inspection distinguishes the last dry winch turn from the first current reversal', () => {
  const start = initial(level);
  const finalSignalTurn = level.rules.tide.rises[0].afterTurn;
  expect(bridgeStatus(start, level)).toContain('Signal Quay by action 3');
  expect(currentNotice(start, level)?.turnsIn).toBe(8);
  let s = start;
  for (let i = 0; i < finalSignalTurn; i++) s = reduce(s, { type: 'wait' }, level);
  expect(bridgeStatus(s, level)).toContain('winch at Signal Quay is flooded');
  expect(bridgeStatus({ ...s, bridgeOpen: true }, level)).toBe('Lantern Bridge is open.');
});

test('turn-six forecast reveals the two rescue windows from the real waiting groups', () => {
  const route = plans.witnesses.find(plan => plan.id === 'signal-first')!.actions as Action[];
  let s = initial(level);
  for (const action of route.slice(0, 6)) s = reduce(s, action, level);
  const expected = [
    { landing: 'Wick Landing', passengers: 'Tallow and Ember', spaces: 2, deadline: 'floods in 6 actions' },
    { landing: 'Lantern Steps', passengers: 'Sorbus', spaces: 3, deadline: 'floods in 2 actions' },
  ];
  expect(forecastCopy(s, level).waitingAtLandings).toEqual(expected);
  for (const action of route.slice(6, 8)) s = reduce(s, action, level);
  expect(forecastCopy(s, level).waitingAtLandings).toEqual([{ ...expected[0], deadline: 'floods in 4 actions' }]);
});
