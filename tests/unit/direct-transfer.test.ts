import { expect, test } from 'vitest';
import { initial, reduce, type Action } from '../../src/game/rules';
import { holdingPier as level } from '../../src/levels/level';
import { transferFacts, transferReceipt } from '../../src/ui/transfer';

test('Moss direct transfer discloses cost band and actual safe landing without mutating state', () => {
  const before = initial(level);
  const action = { type: 'unload' as const, passengerIds: ['sheep-1'] };
  expect(transferFacts(before, action, level)).toMatchObject({
    direct: true,
    label: 'Let Moss ashore',
    depth: 'Needs depth 2 → 1',
  });
  expect(transferFacts(before, action, level).detail).toContain('Stone Pier stays safe');
  expect(before.turn).toBe(0);
  expect(transferReceipt(before, reduce(before, action, level), action, level)).toEqual({
    title: 'Moss ashore · 1 action used',
    depth: 'Needs depth 2 → 1',
  });
});

test('last safe group is deliberate; a single rabbit still requires the real loss warning', () => {
  let before = initial(level);
  for (const action of [
    { type: 'unload', passengerIds: ['sheep-1'] },
    { type: 'move', to: 'shallows' },
    { type: 'move', to: 'rabbit-pier' },
  ] as Action[])
    before = reduce(before, action, level);
  const group = { type: 'board' as const, passengerIds: ['rabbit-1', 'rabbit-2'] };
  expect(transferFacts(before, group, level)).toMatchObject({ direct: false, error: null });
  expect(transferFacts(before, group, level).detail).toBe('The tide rises after this action.');
  const subset = { type: 'board' as const, passengerIds: ['rabbit-1'] };
  const facts = transferFacts(before, subset, level);
  expect(facts.direct).toBe(false);
  expect(facts.detail).toContain('Rue');
  expect(facts.detail).toContain('flood');
  expect(transferFacts(before, { type: 'board', passengerIds: [] }, level).error).toBeTruthy();
});

test('single home delivery can win directly; same-band receipts omit misleading depth change', () => {
  const before = {
    ...initial(level),
    boatNodeId: 'harbor',
    turn: 8,
    tideLevel: 2,
    aboard: ['rabbit-1'],
    delivered: ['rabbit-2', 'sheep-1'],
    waitingByPier: Object.fromEntries(level.piers.map((p) => [p.id, []])),
  };
  const action = { type: 'unload' as const, passengerIds: ['rabbit-1'] };
  expect(transferFacts(before, action, level)).toMatchObject({
    direct: true,
    label: 'Bring Pip home',
  });
  expect(reduce(before, action, level).status).toBe('won');
  const partial = { ...before, aboard: ['rabbit-1', 'rabbit-2'], delivered: ['sheep-1'] };
  expect(transferReceipt(partial, reduce(partial, action, level), action, level)).toEqual({
    title: 'Pip home · 1 action used',
    depth: '',
  });
});
