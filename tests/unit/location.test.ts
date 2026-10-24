import { describe, expect, test } from 'vitest';
import { initial, preview, reduce, type Action, type State } from '../../src/game/rules';
import { bellwater, holdingPier, level as baseline, type Level } from '../../src/levels/level';
import { locationFacts } from '../../src/ui/location';

const run = (actions: Action[], l: Level = holdingPier) =>
  actions.reduce((s, a) => reduce(s, a, l), initial(l));
const atRabbits = () =>
  run([
    { type: 'unload', passengerIds: ['sheep-1'] },
    { type: 'move', to: 'shallows' },
    { type: 'move', to: 'rabbit-pier' },
  ]);

describe('free location-card facts', () => {
  test('distinguishes current, remote, blocked and safe places without changing state', () => {
    const state = initial(holdingPier),
      before = structuredClone(state);
    const stone = locationFacts(state, 'stone', holdingPier);
    expect(stone).toMatchObject({
      current: true,
      home: false,
      relation: 'current',
      status: 'current',
      move: null,
      canSail: false,
      board: null,
      unload: { type: 'unload', passengerIds: ['sheep-1'] },
      unloadLabel: 'Let Moss ashore',
      aboardCopy: 'Moss is safe aboard.',
      safety: 'Stone Pier stays safe through all tide rises.',
    });
    const remote = locationFacts(state, 'rabbit-pier', holdingPier);
    expect(remote).toMatchObject({
      relation: 'remote',
      status: 'remote',
      move: null,
      canSail: false,
      waiting: ['rabbit-1', 'rabbit-2'],
      waitingCopy: 'Pip and Rue wait here.',
      limitation: 'No direct passage from Stone Pier.',
      safety: 'Rabbit Pier floods in 4 actions.',
      board: null,
      unload: null,
    });
    const shallow = locationFacts(state, 'shallows', holdingPier);
    expect(shallow).toMatchObject({
      relation: 'adjacent',
      status: 'too-shallow',
      canSail: false,
      wouldLose: false,
      move: { type: 'move', to: 'shallows' },
      passage: 'Boat needs depth 2. Passage has depth 1: too shallow.',
      limitation: 'Boat needs depth 2. Passage has depth 1: too shallow.',
    });
    const harbor = locationFacts(state, 'harbor', holdingPier);
    expect(harbor).toMatchObject({
      relation: 'adjacent',
      status: 'safe',
      home: true,
      canSail: true,
      wouldLose: false,
      passage: 'Boat needs depth 2. Passage has depth 3: enough depth.',
    });
    expect(state).toEqual(before);
    stone.aboard.length = remote.waiting.length = 0;
    expect(state).toEqual(before);
  });

  test('uses the real preview after unloading and exposes the exact losing tide consequence', () => {
    const empty = reduce(
      initial(holdingPier),
      { type: 'unload', passengerIds: ['sheep-1'] },
      holdingPier,
    );
    const shallow = locationFacts(empty, 'shallows', holdingPier);
    expect(shallow.canSail).toBe(true);
    expect(shallow.passage).toBe('Boat needs depth 1. Passage has depth 1: enough depth.');
    const state = atRabbits(),
      before = structuredClone(state);
    const leave = locationFacts(state, 'shallows', holdingPier);
    expect(leave).toMatchObject({ status: 'loss', canSail: true, wouldLose: true });
    expect(leave.consequence).toBe(
      'The tide rises after this action. Pip and Rue are still waiting at Rabbit Pier when it floods. This ends the crossing.',
    );
    expect(preview(state, leave.move!, holdingPier).state.status).toBe('lost');
    expect(state).toEqual(before);
  });

  test('keeps current boundary boarding and flooded-pier departure distinct', () => {
    const state = atRabbits();
    const dry = locationFacts(state, 'rabbit-pier', holdingPier);
    expect(dry.boardOptions).toEqual(['rabbit-1', 'rabbit-2']);
    expect(dry.board).toEqual({ type: 'board', passengerIds: ['rabbit-1', 'rabbit-2'] });
    expect(dry.boardLabel).toBe('Board Pip and Rue');
    const rescued = reduce(state, dry.board!, holdingPier);
    const flooded = locationFacts(rescued, 'rabbit-pier', holdingPier);
    expect(flooded).toMatchObject({
      flooded: true,
      board: null,
      unload: null,
      boardOptions: [],
      waiting: [],
      aboardCopy: 'Pip and Rue are safe aboard.',
      safety: 'Rabbit Pier is flooded.',
    });
    expect(flooded.transferNote).toContain('the ferry can leave');
    expect(locationFacts(rescued, 'shallows', holdingPier)).toMatchObject({
      status: 'safe',
      canSail: true,
      passage: 'Boat needs depth 2. Passage has depth 2: enough depth.',
    });
  });

  test('retains every passenger choice while offering only an available transfer', () => {
    const variant = structuredClone(holdingPier);
    variant.rules.capacity = 3;
    variant.edges.forEach((edge) => {
      edge.baseDepth = 3;
    });
    const state = run(
      [
        { type: 'move', to: 'shallows' },
        { type: 'move', to: 'rabbit-pier' },
      ],
      variant,
    );
    const facts = locationFacts(state, 'rabbit-pier', variant);
    expect(facts.boardOptions).toEqual(['rabbit-1', 'rabbit-2']);
    expect(facts.boardLabel).toBe('Board Pip and Rue');
    expect(facts.board!.passengerIds).toHaveLength(1);
    expect(preview(state, facts.board!, variant).error).toBeNull();
    expect(
      preview(state, { type: 'board', passengerIds: facts.boardOptions }, variant).error,
    ).toContain('four passenger spaces');
  });

  test('derives remaining local safety, Home and delivery from the active cove', () => {
    const state = run(
      [
        { type: 'move', to: 'shallows' },
        { type: 'move', to: 'low-pier' },
        { type: 'board', passengerIds: ['tansy', 'lark'] },
        { type: 'move', to: 'east-buoy' },
      ],
      bellwater,
    );
    const bell = locationFacts(state, 'bell-pier', bellwater);
    expect(bell).toMatchObject({
      name: 'Bell Pier',
      waitingCopy: 'Bram waits here.',
      safety: 'Bell Pier floods in 4 actions.',
      limitation: 'No direct passage from East Buoy.',
    });
    const homeState: State = { ...state, boatNodeId: 'harbor' };
    expect(locationFacts(homeState, 'harbor', bellwater)).toMatchObject({
      home: true,
      current: true,
      unloadLabel: 'Bring passengers home',
      aboardCopy: 'Tansy and Lark are safe aboard.',
    });
    const renamed = structuredClone(bellwater);
    renamed.names!.nodes!.harbor = 'Lantern Quay';
    expect(locationFacts(initial(renamed), 'bell-pier', renamed).limitation).toBe('');
    expect(locationFacts(initial(renamed), 'low-pier', renamed).limitation).toBe(
      'No direct passage from Lantern Quay.',
    );
  });

  test('preserves the baseline full-load restriction and buoy-only facts', () => {
    const state = run(
      [
        { type: 'move', to: 'sheep-pier' },
        { type: 'board', passengerIds: ['sheep-1'] },
      ],
      baseline,
    );
    expect(locationFacts(state, 'cut', baseline)).toMatchObject({
      status: 'too-shallow',
      canSail: false,
      passage: 'Boat needs depth 3. Passage has depth 2: too shallow.',
    });
    const atBuoy = reduce(state, { type: 'move', to: 'outer-east' }, baseline);
    const buoy = locationFacts(atBuoy, 'outer-east', baseline);
    expect(buoy).toMatchObject({
      current: true,
      pierId: null,
      waitingCopy: '',
      safety: '',
      board: null,
      unload: null,
      transferNote: 'Waypoint · choose the next passage.',
    });
  });
});
