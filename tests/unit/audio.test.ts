import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Sound } from '../../src/audio/sound';
import { phraseSeconds } from '../../src/audio/score';

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
});
