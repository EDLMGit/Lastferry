import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Sound } from '../../src/audio/sound';
import { phraseSeconds } from '../../src/audio/score';
import { arrivalPhrase } from '../../src/audio/arrival';
import { initial } from '../../src/game/rules';
import { holdingPier } from '../../src/levels/level';

class Parameter {
  value = 1;
  events: { kind: string; value: number; time: number }[] = [];
  setValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: 'set', value, time });
  }
  linearRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: 'linear', value, time });
  }
  exponentialRampToValueAtTime(value: number, time: number) {
    this.value = value;
    this.events.push({ kind: 'exponential', value, time });
  }
  cancelScheduledValues(time: number) {
    this.events = this.events.filter((event) => event.time < time);
  }
}
class Node {
  gain = new Parameter();
  frequency = new Parameter();
  detune = new Parameter();
  Q = new Parameter();
  pan = new Parameter();
  playbackRate = new Parameter();
  type = '';
  buffer: any = null;
  loop = false;
  fftSize = 1024;
  connections = new Set<Node>();
  connect(destination: Node) {
    this.connections.add(destination);
    return destination;
  }
  disconnect() {
    this.connections.clear();
  }
  getFloatTimeDomainData(data: Float32Array) {
    data.fill(0);
  }
}
class Source extends Node {
  onended: (() => void) | null = null;
  started = false;
  startAt = 0;
  endAt = Infinity;
  start(at: number) {
    this.started = true;
    this.startAt = at;
  }
  stop(at: number) {
    this.endAt = at;
  }
  setPeriodicWave() {}
}
class Context {
  static instances: Context[] = [];
  static reject = false;
  sampleRate = 1000;
  currentTime = 0;
  state: 'suspended' | 'running' | 'closed' = 'suspended';
  destination = new Node();
  nodes: Node[] = [];
  sources: Source[] = [];
  track = { stop: vi.fn() };
  listeners = new Set<() => void>();
  constructor() {
    Context.instances.push(this);
  }
  addEventListener(_name: string, listener: () => void) {
    this.listeners.add(listener);
  }
  removeEventListener(_name: string, listener: () => void) {
    this.listeners.delete(listener);
  }
  notify() {
    for (const listener of this.listeners) listener();
  }
  createGain() {
    const node = new Node();
    this.nodes.push(node);
    return node;
  }
  createBiquadFilter() {
    return this.createGain();
  }
  createStereoPanner() {
    return this.createGain();
  }
  createConvolver() {
    return this.createGain();
  }
  createAnalyser() {
    return this.createGain();
  }
  createPeriodicWave() {
    return {};
  }
  createBuffer(channels: number, length: number, sampleRate: number) {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return { getChannelData: (channel: number) => data[channel], length, sampleRate };
  }
  createMediaStreamDestination() {
    return Object.assign(this.createGain(), { stream: { getTracks: () => [this.track] } });
  }
  createOscillator() {
    const source = new Source();
    this.sources.push(source);
    return source;
  }
  createBufferSource() {
    return this.createOscillator();
  }
  async resume() {
    if (Context.reject) throw new Error('NotAllowedError');
    this.state = 'running';
    this.notify();
  }
  async suspend() {
    this.state = 'suspended';
    this.notify();
  }
  async close() {
    this.state = 'closed';
    this.notify();
  }
  advance(seconds: number) {
    this.currentTime += seconds;
    for (const source of this.sources) if (source.endAt <= this.currentTime) source.onended?.();
  }
}

describe('continuous audio ownership and phase', () => {
  const active: Sound[] = [];
  let stored: Map<string, string>;
  const sound = () => {
    const value = new Sound();
    active.push(value);
    return value;
  };
  beforeEach(() => {
    vi.useFakeTimers();
    Context.instances = [];
    Context.reject = false;
    stored = new Map();
    vi.stubGlobal('AudioContext', Context);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => stored.get(key),
      setItem: (key: string, value: string) => stored.set(key, value),
    });
  });
  afterEach(() => {
    for (const value of active.splice(0)) value.dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('muted reload and passive visibility create no context; explicit enable owns one graph', async () => {
    stored.set('last-ferry-muted', 'true');
    const value = sound();
    await value.activate();
    value.visibility(true);
    value.visibility(false);
    expect(Context.instances).toHaveLength(0);
    await value.toggle();
    expect(Context.instances).toHaveLength(1);
    expect(value.presentation()).toMatchObject({
      muted: false,
      contextState: 'running',
      contextCount: 1,
      schedulerCount: 1,
    });
    for (let i = 0; i < 8; i++) await value.activate();
    expect(value.presentation().contextCount).toBe(1);
    expect(value.presentation().schedulerCount).toBe(1);
  });

  test('live mute ramps the complete master and clears travel/accent sources without stacking on toggles', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    value.startTravel();
    value.delivery();
    expect(value.presentation()).toMatchObject({ travelActive: true, arrivalActive: true });
    const stream = value.captureStream();
    expect(value.captureStream()).toBe(stream);
    await value.toggle();
    expect(value.presentation()).toMatchObject({
      muted: true,
      masterGain: 0,
      schedulerCount: 0,
      travelActive: false,
      arrivalActive: false,
    });
    expect(context.nodes[0].gain.events.at(-1)).toMatchObject({ kind: 'linear', value: 0 });
    context.advance(0.1);
    await vi.advanceTimersByTimeAsync(100);
    expect(value.presentation().contextState).toBe('suspended');
    for (let i = 0; i < 8; i++) {
      await value.toggle();
      await value.toggle();
    }
    await value.toggle();
    expect(value.presentation()).toMatchObject({
      muted: false,
      contextCount: 1,
      schedulerCount: 1,
      travelActive: true,
    });
    expect(value.presentation().ambienceSources).toBe(2);
    value.dispose();
    expect(value.presentation()).toMatchObject({
      sourceCount: 0,
      graphNodeCount: 0,
      schedulerCount: 0,
    });
    expect(context.track.stop).toHaveBeenCalledTimes(1);
  });

  test('Undo/Restart action cleanup preserves musical phase and does not schedule another base phrase', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    context.advance(5);
    await vi.advanceTimersByTimeAsync(100);
    const before = value.presentation();
    value.startTravel();
    value.delivery();
    value.resetActionEffects();
    expect(value.presentation()).toMatchObject({
      travelActive: false,
      arrivalActive: false,
      phaseSeconds: before.phaseSeconds,
      schedulerStarts: before.schedulerStarts,
      scheduledEvents: before.scheduledEvents,
    });
    context.advance(0.1);
    await vi.advanceTimersByTimeAsync(100);
    expect(value.presentation().musicSources).toBeGreaterThan(0);
    expect(value.presentation().ambienceSources).toBe(2);
  });

  test('hide suspends scheduling and returns without backlog, duplicate beds or rewound phase', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    context.advance(11);
    await vi.advanceTimersByTimeAsync(100);
    value.startTravel();
    const phase = value.presentation().phaseSeconds;
    value.visibility(true);
    await vi.advanceTimersByTimeAsync(100);
    expect(value.presentation()).toMatchObject({
      contextState: 'suspended',
      schedulerCount: 0,
      travelActive: false,
    });
    await vi.advanceTimersByTimeAsync(10000);
    expect(value.presentation().phaseSeconds).toBe(phase);
    await value.visibility(false);
    expect(value.presentation()).toMatchObject({
      contextCount: 1,
      schedulerCount: 1,
      ambienceSources: 2,
      phaseSeconds: phase,
    });
  });

  test('the audio clock crosses two phrase returns with bounded sources and no duplicate scheduler', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    for (let step = 0; step < Math.ceil((phraseSeconds * 2 + 3) / 0.1); step++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
      expect(value.presentation().sourceCount).toBeLessThan(24);
    }
    const view = value.presentation();
    expect(view.loopCount).toBe(2);
    expect(view.scheduledEvents).toBeGreaterThan(60);
    expect(view.skippedEvents).toBe(0);
    expect(view.contextCount).toBe(1);
    expect(view.schedulerStarts).toBe(1);
    expect(view.ambienceSources).toBe(2);
    expect(view.desiredArrangement).toBe('ordinary');
    expect(view.arrangement).toBe('ordinary');
    expect(view.companionNotes).toBe(0);
  });

  test('rejected activation is quiet and retryable, and teardown clears fading action nodes', async () => {
    Context.reject = true;
    const value = sound();
    await value.activate();
    expect(value.presentation()).toMatchObject({
      unavailable: true,
      schedulerCount: 0,
      masterGain: 0,
    });
    Context.reject = false;
    await value.activate();
    expect(value.presentation()).toMatchObject({
      unavailable: false,
      schedulerCount: 1,
      contextCount: 1,
    });
    value.startTravel();
    value.resetActionEffects();
    value.dispose();
    value.visibility(false);
    await value.activate();
    expect(value.presentation()).toMatchObject({
      disposed: true,
      sourceCount: 0,
      graphNodeCount: 0,
      schedulerCount: 0,
    });
  });

  test('an interrupted context stops action effects and catches up without a backlog or duplicate bed', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    value.startTravel();
    value.delivery();
    context.state = 'suspended';
    context.notify();
    expect(value.presentation()).toMatchObject({
      schedulerCount: 0,
      travelActive: false,
      arrivalActive: false,
    });
    const scheduled = value.presentation().scheduledEvents;
    context.advance(503);
    context.state = 'running';
    context.notify();
    expect(value.presentation().scheduledEvents - scheduled).toBeLessThanOrEqual(1);
    expect(value.presentation()).toMatchObject({
      contextCount: 1,
      schedulerCount: 1,
      ambienceSources: 2,
    });
    expect(value.presentation().sourceCount).toBeLessThan(12);
  });

  test('latest desired arrangement survives preactivation, mute, hide and rapid replacements without replay', async () => {
    const value = sound();
    const ordinary = initial(holdingPier);
    const deadline = { ...ordinary, turn: 2 };
    const homeward = {
      ...ordinary,
      aboard: [...holdingPier.objective.requiredPassengerIds],
      waitingByPier: {},
    };
    value.reconcileState(deadline, holdingPier);
    value.reconcileState(homeward, holdingPier);
    expect(value.presentation()).toMatchObject({ desiredArrangement: 'homeward', contextCount: 0 });
    await value.activate();
    const context = Context.instances[0];
    expect(value.presentation()).toMatchObject({ arrangement: 'homeward', companionSources: 1 });
    const phase = value.presentation().phaseSeconds;
    for (let i = 0; i < 50; i++) {
      value.reconcileState(deadline, holdingPier);
      value.reconcileState(homeward, holdingPier);
    }
    value.reconcileState(ordinary, holdingPier);
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      arrangement: 'ordinary',
      companionSources: 0,
      deliveryCount: 0,
      schedulerStarts: 1,
    });
    expect(value.presentation().phaseSeconds).toBeGreaterThan(phase);
    await value.toggle();
    value.reconcileState(deadline, holdingPier);
    await value.visibility(true);
    value.reconcileState(homeward, holdingPier);
    await value.visibility(false);
    await value.toggle();
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      arrangement: 'homeward',
      contextCount: 1,
      schedulerCount: 1,
      deliveryCount: 0,
    });
  });

  test('terminal targets wait for visible settlement and delivery does not clear the companion', async () => {
    const value = sound();
    const homeward = {
      ...initial(holdingPier),
      aboard: [...holdingPier.objective.requiredPassengerIds],
      waitingByPier: {},
    };
    value.reconcileState(homeward, holdingPier);
    await value.activate();
    const context = Context.instances[0];
    value.reconcileState(
      { ...homeward, status: 'won', aboard: [], delivered: homeward.aboard },
      holdingPier,
      true,
    );
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      desiredArrangement: 'won',
      arrangement: 'homeward',
      pendingTerminal: true,
    });
    const companions = value.presentation().companionSources;
    value.delivery();
    expect(value.presentation().companionSources).toBe(companions);
    value.settleArrangement();
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      arrangement: 'won',
      pendingTerminal: false,
      deliveryCount: 1,
    });
    value.reconcileState(homeward, holdingPier);
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation().arrangement).toBe('homeward');
    value.reconcileState({ ...homeward, status: 'lost' }, holdingPier, true);
    expect(value.presentation().arrangement).toBe('homeward');
    value.settleArrangement();
    value.settleArrangement();
    for (let i = 0; i < 12; i++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      arrangement: 'lost',
      companionSources: 0,
      deliveryCount: 1,
    });
  });

  test('companion plus travel, transfer contacts and delivery stays bounded with no dropped tones', async () => {
    const value = sound();
    value.reconcileState(
      {
        ...initial(holdingPier),
        aboard: [...holdingPier.objective.requiredPassengerIds],
        waitingByPier: {},
      },
      holdingPier,
    );
    await value.activate();
    value.startTravel();
    const context = Context.instances[0];
    for (let step = 0; step < 800; step++) {
      if (step % 75 === 0) value.delivery();
      if (step % 10 === 0 || step % 10 === 2)
        value.transferContact({
          weight: 'light',
          settle: step % 10 === 2,
          compact: false,
          count: 2,
        });
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
      expect(value.presentation().companionSources).toBeLessThanOrEqual(2);
      expect(value.presentation().sourceCount).toBeLessThanOrEqual(29);
      expect(value.presentation().transferSources).toBeLessThanOrEqual(2);
    }
    expect(value.presentation()).toMatchObject({
      loopCount: 1,
      droppedTones: 0,
      skippedEvents: 0,
      schedulerStarts: 1,
      contextCount: 1,
    });
    expect(value.presentation().companionNotes).toBeGreaterThan(20);
    expect(value.presentation().transferPlayed).toBe(160);
  });

  test('wood contacts cache bounded dry buffers with lighter rabbits and quieter settlement', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    value.transferContact({ weight: 'light', settle: false, compact: false, count: 2 });
    const rabbits = context.sources.at(-1)!,
      rabbitGain = [...rabbits.connections][0];
    expect(rabbits.endAt - rabbits.startAt).toBeLessThanOrEqual(0.28);
    expect(rabbits.loop).toBe(false);
    expect(Math.abs(rabbits.buffer.getChannelData(0)[0])).toBe(0);
    expect(
      Math.max(...Array.from(rabbits.buffer.getChannelData(0) as Float32Array, Math.abs)),
    ).toBeCloseTo(0.8);
    context.advance(0.3);
    value.transferContact({ weight: 'light', settle: true, compact: false, count: 2 });
    const settling = context.sources.at(-1)!;
    expect(settling.buffer).toBe(rabbits.buffer);
    expect([...settling.connections][0].gain.value).toBeLessThan(rabbitGain.gain.value * 0.5);
    context.advance(0.3);
    value.transferContact({ weight: 'full', settle: false, compact: false, count: 1 });
    const sheep = context.sources.at(-1)!,
      sheepGain = [...sheep.connections][0];
    expect(sheep.buffer).not.toBe(rabbits.buffer);
    expect(sheepGain.gain.value).toBeGreaterThan(rabbitGain.gain.value);
    context.advance(0.3);
    value.transferContact({ weight: 'full', settle: false, compact: true, count: 100 });
    const compact = context.sources.at(-1)!;
    expect(compact.buffer).toBe(sheep.buffer);
    expect([...compact.connections][0].gain.value).toBeLessThan(sheepGain.gain.value);
    for (let i = 0; i < 20; i++)
      value.transferContact({ weight: 'light', settle: false, compact: false, count: 2 });
    expect(value.presentation()).toMatchObject({ transferSources: 2, peakTransferSources: 2 });
    expect(value.presentation().transferSkipped).toBe(19);
    context.advance(0.3);
    expect(value.presentation().transferSources).toBe(0);
    expect(compact.connections.size).toBe(0);
  });

  test('arrival leaves wooden contacts playing, while Undo clears both and preserves music', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0],
      before = value.presentation();
    value.transferContact({ weight: 'full', settle: true, compact: false, count: 3 });
    const contact = context.sources.at(-1)!,
      endAt = contact.endAt;
    expect(value.presentation()).toMatchObject({ transferSources: 1, arrivalActive: false });
    value.delivery();
    expect(contact.endAt).toBe(endAt);
    expect(value.presentation()).toMatchObject({ transferSources: 1, arrivalActive: true });
    value.resetActionEffects();
    expect(value.presentation()).toMatchObject({
      transferSources: 0,
      arrivalActive: false,
      musicSources: before.musicSources,
      schedulerStarts: before.schedulerStarts,
      scheduledEvents: before.scheduledEvents,
      phaseSeconds: before.phaseSeconds,
      transferPlayed: 1,
    });
    context.advance(0.1);
    expect(contact.connections.size).toBe(0);
    value.transferContact({ weight: 'full', settle: false, compact: true, count: 3 });
    expect(value.presentation()).toMatchObject({ transferPlayed: 2, transferSources: 1 });
    value.dispose();
    expect(value.presentation()).toMatchObject({
      transferSources: 0,
      sourceCount: 0,
      graphNodeCount: 0,
    });
  });

  test('inactive, muted, hidden and interrupted contacts are consumed without any resume replay', async () => {
    const value = sound(),
      cue = { weight: 'light', settle: false, compact: false, count: 2 } as const;
    value.transferContact(cue);
    expect(value.presentation()).toMatchObject({
      contextCount: 0,
      transferContacts: 1,
      transferSkipped: 1,
    });
    await value.activate();
    const context = Context.instances[0];
    value.transferContact(cue);
    await value.toggle();
    value.transferContact(cue);
    expect(value.presentation()).toMatchObject({ transferSources: 0, transferPlayed: 1 });
    context.advance(0.1);
    await vi.advanceTimersByTimeAsync(100);
    await value.toggle();
    expect(value.presentation()).toMatchObject({ transferSources: 0, transferPlayed: 1 });
    value.transferContact(cue);
    await value.visibility(true);
    value.transferContact(cue);
    context.advance(0.1);
    await vi.advanceTimersByTimeAsync(100);
    await value.visibility(false);
    expect(value.presentation()).toMatchObject({ transferSources: 0, transferPlayed: 2 });
    value.transferContact(cue);
    context.state = 'suspended';
    context.notify();
    value.transferContact(cue);
    context.advance(10);
    context.state = 'running';
    context.notify();
    expect(value.presentation()).toMatchObject({
      transferSources: 0,
      transferContacts: 7,
      transferPlayed: 3,
      transferSkipped: 4,
      contextCount: 1,
      schedulerCount: 1,
      ambienceSources: 2,
    });
    expect(value.presentation().lastTransferContact).toMatchObject({ ...cue, played: false });
  });

  test('rapid arrival replacement cannot accumulate voices or evict contacts or music', async () => {
    const reference = sound(),
      withContact = sound();
    await reference.activate();
    await withContact.activate();
    withContact.transferContact({ weight: 'full', settle: false, compact: false, count: 3 });
    withContact.transferContact({ weight: 'light', settle: true, compact: false, count: 2 });
    for (let i = 0; i < 10; i++) {
      reference.delivery();
      withContact.delivery();
      expect(withContact.presentation().droppedTones).toBe(reference.presentation().droppedTones);
      expect(withContact.presentation().sourceCount).toBeLessThanOrEqual(29);
    }
    expect(withContact.presentation()).toMatchObject({
      transferPlayed: 2,
      transferSources: 2,
      arrivalSources: 3,
      arrivalVoicesSkipped: 0,
      musicSources: reference.presentation().musicSources,
      scheduledEvents: reference.presentation().scheduledEvents,
    });
  });

  test('arrival uses the current clock immediately and owns its complete dry tail', async () => {
    const value = sound();
    await value.activate();
    const context = Context.instances[0];
    context.advance(74.94);
    const before = value.presentation(),
      firstSource = context.sources.length,
      firstNode = context.nodes.length;
    value.delivery();
    const notes = arrivalPhrase(before.phaseSeconds),
      sources = context.sources.slice(firstSource),
      nodes = context.nodes.slice(firstNode);
    expect(value.presentation().lastArrival).toEqual({
      time: context.currentTime,
      phase: before.phaseSeconds,
      notes,
    });
    expect(sources).toHaveLength(3);
    expect(sources[0].startAt).toBe(context.currentTime);
    for (let i = 0; i < sources.length; i++) {
      const [filter, gain, panner] = nodes.slice(i * 3, i * 3 + 3),
        note = notes[i],
        at = context.currentTime + note.offset;
      expect(sources[i].startAt).toBe(at);
      expect(sources[i].endAt).toBe(at + note.duration);
      expect(gain.gain.events).toEqual([
        { kind: 'set', value: 0, time: at },
        { kind: 'linear', value: note.peak, time: at + note.attack },
        { kind: 'exponential', value: 0.0001, time: at + note.duration - 0.08 },
        { kind: 'linear', value: 0, time: at + note.duration },
      ]);
      expect(sources[i].connections.has(filter)).toBe(true);
      expect(filter.connections.has(gain)).toBe(true);
      expect(gain.connections.has(panner)).toBe(true);
      expect([...panner.connections]).toEqual([context.nodes[3]]);
      expect([...context.nodes[3].connections]).toEqual([context.nodes[0]]);
    }
    expect(value.presentation()).toMatchObject({
      phaseSeconds: before.phaseSeconds,
      schedulerStarts: before.schedulerStarts,
      musicSources: before.musicSources,
      arrivalVoicesPlayed: 3,
    });
    context.advance(3.36);
    expect(value.presentation()).toMatchObject({ arrivalActive: false, arrivalSources: 0 });
    expect(sources.every((source) => source.connections.size === 0)).toBe(true);
  });

  test.each([0.03, 0.7, 1.4, 2.9])(
    'Undo cancels future notes and the complete owned tail at %ss',
    async (delay) => {
      const value = sound();
      await value.activate();
      const context = Context.instances[0],
        first = context.sources.length;
      value.delivery();
      const sources = context.sources.slice(first);
      context.advance(delay);
      value.resetActionEffects();
      expect(value.presentation().arrivalActive).toBe(false);
      for (const source of sources.filter((item) => item.connections.size)) {
        const filter = [...source.connections][0],
          gain = [...filter.connections][0];
        expect(source.endAt).toBeLessThanOrEqual(context.currentTime + 0.06);
        expect(gain.gain.events.filter((event) => event.time > context.currentTime)).toEqual([
          { kind: 'linear', value: 0, time: context.currentTime + 0.045 },
        ]);
      }
      context.advance(0.1);
      expect(value.presentation().arrivalSources).toBe(0);
      expect(sources.every((source) => source.connections.size === 0)).toBe(true);
      expect(value.presentation().musicSources).toBeGreaterThan(0);
    },
  );

  test('arrival yields a full graph and score can reclaim its voices without dropping notes', async () => {
    const value = sound();
    await value.activate();
    const internal = value as any,
      context = Context.instances[0];
    while (value.presentation().sourceCount < 27) internal.tone(62, 0, 10, 0.5, 'pad');
    value.transferContact({ weight: 'full', settle: false, compact: false, count: 1 });
    const transfer = context.sources.at(-1)!,
      endAt = transfer.endAt;
    value.delivery();
    expect(value.presentation()).toMatchObject({
      sourceCount: 29,
      arrivalSources: 1,
      arrivalVoicesSkipped: 2,
      transferSources: 1,
      droppedTones: 0,
    });
    expect(transfer.endAt).toBe(endAt);
    internal.tone(66, 0, 10, 0.5, 'pad');
    expect(value.presentation()).toMatchObject({
      sourceCount: 29,
      arrivalSources: 0,
      arrivalVoicesReclaimed: 1,
      transferSources: 1,
      droppedTones: 0,
    });
    internal.tone(69, 0, 10, 0.5, 'pad');
    expect(value.presentation()).toMatchObject({ transferSources: 0, droppedTones: 0 });
  });

  test('rapid changes during active companion notes release obsolete voices without a mood queue', async () => {
    const value = sound();
    const deadline = { ...initial(holdingPier), turn: 2 };
    const homeward = {
      ...initial(holdingPier),
      aboard: [...holdingPier.objective.requiredPassengerIds],
      waitingByPier: {},
    };
    await value.activate();
    const context = Context.instances[0];
    for (let step = 0; step < 120; step++) {
      value.reconcileState(step % 2 ? deadline : homeward, holdingPier);
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
      expect(value.presentation().companionSources).toBeLessThanOrEqual(2);
    }
    value.reconcileState(homeward, holdingPier);
    for (let step = 0; step < 12; step++) {
      context.advance(0.1);
      await vi.advanceTimersByTimeAsync(100);
    }
    expect(value.presentation()).toMatchObject({
      desiredArrangement: 'homeward',
      arrangement: 'homeward',
      schedulerStarts: 1,
      droppedTones: 0,
      companionDeferrals: 0,
      deliveryCount: 0,
    });
  });
});
