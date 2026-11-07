import {
  beatSeconds,
  frequency,
  makeNoise,
  makeReverb,
  phraseEvents,
  phraseSeconds,
  score,
} from './score';
import { arrangementForState, companionNote, type Arrangement } from './arrangement';
import { makeWoodContact, type TransferContact } from './wood';
import { arrivalPhrase, type ArrivalNote } from './arrival';
import { storyEffects, type StoryCueKind } from './story-effects';
import type { State } from '../game/rules';
import type { Level } from '../levels/level';

type OwnedSource = {
  kind: 'music' | 'companion' | 'bed' | 'travel' | 'effect' | 'transfer' | 'story';
  nodes: AudioNode[];
  endAt: number | null;
  gain?: GainNode;
  stopping: boolean;
};

export class Sound {
  context: AudioContext | null = null;
  muted = false;
  activated = false;
  hidden = false;
  disposed = false;
  travelling = false;
  unavailable = false;
  lastError: string | null = null;
  onChange: (() => void) | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private musicOutput: GainNode | null = null;
  private ambience: GainNode | null = null;
  private effects: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private scoreAnalyser: AnalyserNode | null = null;
  private meter = new Float32Array(1024);
  private noise: AudioBuffer | null = null;
  private wood = new Map<TransferContact['weight'], AudioBuffer>();
  private padWave: PeriodicWave | null = null;
  private pluckWave: PeriodicWave | null = null;
  private capture: MediaStreamAudioDestinationNode | null = null;
  private permanent: AudioNode[] = [];
  private owned = new Map<AudioScheduledSourceNode, OwnedSource>();
  private scheduler: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private resumePromise: Promise<void> | null = null;
  private generation = 0;
  private epoch = 0;
  private cursor = 0;
  private cycle = 0;
  private contextsCreated = 0;
  private schedulerStarts = 0;
  private scheduledEvents = 0;
  private skippedEvents = 0;
  private sourcesCreated = 0;
  private peakOwned = 0;
  private deliveryCount = 0;
  private arrivalEventCount = 0;
  private victorySettled = false;
  private victoryTarget = 1;
  private arrangementTarget = 0.72;
  private lastVictoryMixChange: { time: number; target: number; duration: number } | null = null;
  private arrivalVoicesPlayed = 0;
  private arrivalVoicesSkipped = 0;
  private arrivalVoicesReclaimed = 0;
  private lastArrival: { time: number; phase: number; notes: ArrivalNote[] } | null = null;
  private transferContacts = 0;
  private transferPlayed = 0;
  private transferSkipped = 0;
  private peakTransferSources = 0;
  private lastTransferContact: (TransferContact & { time: number; played: boolean }) | null = null;
  private storyToken: number | null = null;
  private latestStoryToken = -1;
  private storyConsumed = new Set<string>();
  private storyCueCount = 0;
  private storyPlayed = 0;
  private storySkipped = 0;
  private storyRejected = 0;
  private storyReclaimed = 0;
  private peakStorySources = 0;
  private lastStoryCue: {
    token: number;
    id: string;
    kind: StoryCueKind;
    time: number;
    duration: number;
    strength: number;
    played: boolean;
  } | null = null;
  private desiredArrangement: Arrangement = 'ordinary';
  private arrangement: Arrangement = 'ordinary';
  private pendingTerminal = false;
  private arrangementBeat = 0;
  private companionBeat = 0;
  private companionNotes = 0;
  private companionDeferrals = 0;
  private droppedTones = 0;
  private accompanimentEnabled = true;
  private contextChanged = () => {
    const context = this.context;
    if (!context || this.disposed) return;
    if (context.state !== 'running') {
      this.stopScheduler();
      this.clearActions(this.muted && !this.hidden);
      this.master?.gain.cancelScheduledValues(context.currentTime);
      this.master?.gain.setValueAtTime(0, context.currentTime);
    } else if (this.enabled()) {
      this.unavailable = false;
      this.lastError = null;
      this.restoreMusicOutput();
      this.master?.gain.setValueAtTime(0, context.currentTime);
      this.master?.gain.linearRampToValueAtTime(0.65, context.currentTime + 0.08);
      this.startScheduler();
      this.ensureTravel();
    } else {
      this.stopScheduler();
      this.clearActions(this.muted && !this.hidden);
      this.master?.gain.cancelScheduledValues(context.currentTime);
      this.master?.gain.setValueAtTime(0, context.currentTime);
      void context.suspend().catch(() => {});
    }
    this.notify();
  };
  constructor() {
    try {
      this.muted = localStorage.getItem('last-ferry-muted') === 'true';
    } catch {}
  }
  private enabled() {
    return this.activated && !this.muted && !this.hidden && !this.disposed;
  }
  private notify() {
    try {
      this.onChange?.();
    } catch {}
  }
  private graph() {
    if (this.context || this.disposed) return;
    const context = new AudioContext({ latencyHint: 'interactive' });
    this.context = context;
    this.contextsCreated++;
    this.master = context.createGain();
    this.master.gain.value = 0;
    this.music = context.createGain();
    this.music.gain.value = this.arrangementTarget;
    this.ambience = context.createGain();
    this.ambience.gain.value = 0.11;
    this.effects = context.createGain();
    this.effects.gain.value = 0.34;
    this.musicOutput = context.createGain();
    this.musicOutput.gain.value = this.victoryTarget;
    const reverb = context.createConvolver(),
      send = context.createGain(),
      wet = context.createGain();
    reverb.buffer = makeReverb(context);
    send.gain.value = 0.3;
    wet.gain.value = 0.34;
    this.music.connect(this.musicOutput);
    this.music.connect(send);
    send.connect(reverb);
    reverb.connect(wet);
    wet.connect(this.musicOutput);
    this.musicOutput.connect(this.master);
    this.scoreAnalyser = context.createAnalyser();
    this.scoreAnalyser.fftSize = 1024;
    this.musicOutput.connect(this.scoreAnalyser);
    this.ambience.connect(this.master);
    this.effects.connect(this.master);
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.master.connect(this.analyser);
    this.analyser.connect(context.destination);
    this.permanent.push(
      this.master,
      this.music,
      this.ambience,
      this.effects,
      this.musicOutput,
      reverb,
      send,
      wet,
      this.analyser,
      this.scoreAnalyser,
    );
    this.noise = makeNoise(context);
    this.padWave = context.createPeriodicWave(
      new Float32Array(8),
      new Float32Array([0, 1, 0.18, 0.085, 0.035, 0.025, 0.012, 0.008]),
    );
    this.pluckWave = context.createPeriodicWave(
      new Float32Array(8),
      new Float32Array([0, 1, 0.4, 0.035, 0.015, 0.14, 0.008, 0.025]),
    );
    this.epoch = context.currentTime + 0.04;
    this.startBed();
    context.addEventListener('statechange', this.contextChanged);
  }
  private own(source: AudioScheduledSourceNode, record: OwnedSource) {
    this.owned.set(source, record);
    this.sourcesCreated++;
    this.peakOwned = Math.max(this.peakOwned, this.owned.size);
    source.onended = () => this.release(source);
  }
  private release(source: AudioScheduledSourceNode) {
    const record = this.owned.get(source);
    if (!record) return;
    source.onended = null;
    source.disconnect();
    for (const node of record.nodes) node.disconnect();
    this.owned.delete(source);
  }
  private stop(source: AudioScheduledSourceNode, immediate = false) {
    const record = this.owned.get(source),
      now = this.context?.currentTime ?? 0;
    if (!record || (record.stopping && !immediate)) return;
    record.stopping = true;
    if (record.gain) {
      this.hold(record.gain.gain, now);
      record.gain.gain.linearRampToValueAtTime(0, now + (immediate ? 0 : 0.045));
    }
    try {
      source.stop(now + (immediate ? 0 : 0.06));
    } catch {}
    record.endAt = now + (immediate ? 0 : 0.06);
    if (immediate) this.release(source);
  }
  private hold(parameter: AudioParam, now: number) {
    if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
    else {
      const value = parameter.value;
      parameter.cancelScheduledValues(now);
      parameter.setValueAtTime(value, now);
    }
  }
  reconcileState(state: State, level: Level, deferTerminal = false) {
    const next = arrangementForState(state, level);
    const pending = deferTerminal && (next === 'won' || next === 'lost');
    const wasWon = this.victorySettled;
    if (next !== 'won' || !pending) this.setVictoryMix(next === 'won');
    if (wasWon && next !== 'won') this.setArrangementGain(next === 'lost' ? 0.53 : 0.72, 0.7);
    if (this.desiredArrangement === next && this.pendingTerminal === pending) return;
    this.desiredArrangement = next;
    this.pendingTerminal = pending;
    if (!pending) this.requestArrangement();
  }
  settleArrangement() {
    this.setVictoryMix(this.desiredArrangement === 'won');
    if (!this.pendingTerminal) return;
    this.pendingTerminal = false;
    this.requestArrangement();
  }
  private setVictoryMix(settled: boolean) {
    if (this.victorySettled === settled) return;
    this.victorySettled = settled;
    this.victoryTarget = settled ? 0.5 : 1;
    const time = this.context?.currentTime ?? 0,
      duration = settled ? 0.2 : 0.7;
    this.lastVictoryMixChange = { time, target: this.victoryTarget, duration };
    if (this.musicOutput) {
      this.hold(this.musicOutput.gain, time);
      this.musicOutput.gain.linearRampToValueAtTime(this.victoryTarget, time + duration);
    }
  }
  private restoreMusicOutput() {
    if (!this.musicOutput || !this.context) return;
    const now = this.context.currentTime;
    this.hold(this.musicOutput.gain, now);
    this.musicOutput.gain.setValueAtTime(this.victoryTarget, now);
  }
  private setArrangementGain(target: number, duration = 0.8) {
    if (this.arrangementTarget === target) return;
    this.arrangementTarget = target;
    if (!this.music || !this.context) return;
    const now = this.context.currentTime;
    this.hold(this.music.gain, now);
    this.music.gain.linearRampToValueAtTime(target, now + duration);
  }
  setAccompanimentEnabled(enabled: boolean) {
    if (!import.meta.env.DEV || this.accompanimentEnabled === enabled) return;
    this.accompanimentEnabled = enabled;
    this.requestArrangement();
  }
  private requestArrangement() {
    const now = this.context?.currentTime ?? 0;
    this.arrangementBeat = this.context
      ? Math.max(0, Math.ceil((now - this.epoch + 0.06) / beatSeconds))
      : 0;
    this.companionBeat = this.arrangementBeat;
    for (const [source, record] of this.owned) if (record.kind === 'companion') this.stop(source);
  }
  private pumpCompanion(now: number) {
    const beat = Math.max(0, Math.ceil((now - this.epoch - 0.06) / beatSeconds));
    if (this.companionBeat < beat) this.companionBeat = beat;
    const at = this.epoch + this.companionBeat * beatSeconds;
    if (at > now + 0.15) return;
    if (!this.pendingTerminal && this.companionBeat >= this.arrangementBeat) {
      this.arrangement = this.desiredArrangement;
      this.setArrangementGain(
        this.arrangement === 'lost' ? 0.53 : this.arrangement === 'won' ? 0.62 : 0.72,
      );
    }
    const note = this.accompanimentEnabled
      ? companionNote(this.companionBeat, this.arrangement)
      : null;
    const companions = [...this.owned.values()].filter((record) => record.kind === 'companion');
    if (note && companions.length < 2) {
      this.tone(note.note, Math.max(now, at), note.duration, note.strength, 'companion');
      this.companionNotes++;
    } else if (note) {
      this.companionDeferrals++;
      this.companionBeat++;
      return;
    }
    this.companionBeat += this.arrangement === 'won' ? 8 : 4;
  }
  private clearActions(preserveTravel: boolean) {
    if (!preserveTravel) this.travelling = false;
    this.cancelStoryRun(true);
    for (const [source, record] of this.owned)
      if (record.kind === 'travel' || record.kind === 'effect' || record.kind === 'transfer')
        this.stop(source);
  }
  private noiseVoice(
    kind: 'bed' | 'travel',
    rate: number,
    cutoff: number,
    level: number,
    pan: number,
  ) {
    const context = this.context!;
    const source = context.createBufferSource(),
      filter = context.createBiquadFilter(),
      highpass = context.createBiquadFilter(),
      gain = context.createGain(),
      panner = context.createStereoPanner();
    source.buffer = this.noise;
    source.loop = true;
    source.playbackRate.value = rate;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.45;
    highpass.type = 'highpass';
    highpass.frequency.value = kind === 'travel' ? 110 : 65;
    gain.gain.value = 0;
    gain.gain.linearRampToValueAtTime(
      level,
      context.currentTime + (kind === 'travel' ? 0.15 : 1.8),
    );
    panner.pan.value = pan;
    source.connect(filter);
    filter.connect(highpass);
    highpass.connect(gain);
    gain.connect(panner);
    panner.connect(kind === 'bed' ? this.ambience! : this.effects!);
    this.own(source, {
      kind,
      nodes: [filter, highpass, gain, panner],
      endAt: null,
      gain,
      stopping: false,
    });
    source.start(context.currentTime);
  }
  private startBed() {
    this.noiseVoice('bed', 0.81, 330, 0.28, -0.32);
    this.noiseVoice('bed', 1.07, 880, 0.09, 0.37);
  }
  private tone(
    note: number,
    at: number,
    duration: number,
    strength: number,
    voice: 'pad' | 'motif' | 'companion',
  ) {
    const context = this.context!;
    for (const kind of ['story', 'effect', 'transfer'] as const)
      if (this.owned.size > 28)
        for (const [source, record] of this.owned) {
          if (record.kind === kind) {
            this.stop(source, true);
            if (kind === 'story') this.storyReclaimed++;
            if (kind === 'effect') this.arrivalVoicesReclaimed++;
          }
          if (this.owned.size <= 28) break;
        }
    if (this.owned.size > 28) {
      this.droppedTones++;
      return;
    }
    const source = context.createOscillator(),
      filter = context.createBiquadFilter(),
      gain = context.createGain(),
      panner = context.createStereoPanner();
    source.setPeriodicWave(
      voice === 'pad' || voice === 'companion' ? this.padWave! : this.pluckWave!,
    );
    source.frequency.value = frequency(note);
    source.detune.value = voice === 'pad' ? ((note % 3) - 1) * 3.1 : 0;
    filter.type = 'lowpass';
    filter.Q.value = 0.45;
    filter.frequency.setValueAtTime(
      voice === 'pad' ? 800 : voice === 'companion' ? 1100 : 2400,
      at,
    );
    filter.frequency.exponentialRampToValueAtTime(
      voice === 'pad' ? 1100 : 750,
      at + Math.min(duration * 0.7, 2),
    );
    const attack = voice === 'pad' ? 1.6 : voice === 'companion' ? 0.12 : 0.018,
      peak = strength * (voice === 'pad' ? 0.035 : 0.105),
      end = at + duration;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + attack);
    if (voice === 'pad') {
      gain.gain.setValueAtTime(peak * 0.85, end - 2.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
    } else gain.gain.exponentialRampToValueAtTime(0.0001, end);
    panner.pan.value = voice === 'pad' ? ((note % 5) - 2) * 0.14 : voice === 'motif' ? -0.13 : 0.13;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.music!);
    this.own(source, {
      kind: voice === 'companion' ? 'companion' : 'music',
      nodes: [filter, gain, panner],
      endAt: end + 0.02,
      gain,
      stopping: false,
    });
    source.start(at);
    source.stop(end + 0.02);
  }
  private pump() {
    const context = this.context;
    if (!context || context.state !== 'running' || !this.enabled()) return;
    const now = context.currentTime;
    for (const [source, record] of this.owned)
      if (record.endAt !== null && record.endAt < now - 0.1) this.release(source);
    if (now - (this.epoch + this.cycle * phraseSeconds) > phraseSeconds * 2) {
      this.cycle = Math.floor((now - this.epoch) / phraseSeconds);
      this.cursor = 0;
    }
    for (let guard = 0; guard < 96; guard++) {
      const event = phraseEvents[this.cursor],
        at = this.epoch + this.cycle * phraseSeconds + event.at;
      if (at > now + 0.35) break;
      if (at >= now - 0.06) {
        if (event.kind === 'harmony')
          for (const note of event.chord.notes)
            this.tone(note, Math.max(at, now), 8 * beatSeconds + 2.5, event.chord.strength, 'pad');
        else
          this.tone(
            event.note.note,
            Math.max(at, now),
            event.note.duration,
            event.note.strength,
            'motif',
          );
        this.scheduledEvents++;
      } else this.skippedEvents++;
      this.cursor++;
      if (this.cursor === phraseEvents.length) {
        this.cursor = 0;
        this.cycle++;
      }
    }
    this.pumpCompanion(now);
  }
  private stopScheduler() {
    if (this.scheduler !== null) clearInterval(this.scheduler);
    this.scheduler = null;
  }
  private startScheduler() {
    if (this.scheduler !== null) return;
    this.pump();
    this.scheduler = setInterval(() => this.pump(), 100);
    this.schedulerStarts++;
  }
  private async reconcile(retryResume = false) {
    const generation = ++this.generation;
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    if (!this.enabled()) {
      this.resumePromise = null;
      this.stopScheduler();
      this.clearActions(true);
      const context = this.context;
      if (context && this.master) {
        const now = context.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setValueAtTime(this.master.gain.value, now);
        this.master.gain.linearRampToValueAtTime(0, now + 0.04);
        this.suspendTimer = setTimeout(() => {
          this.suspendTimer = null;
          if (!this.enabled() && !this.disposed) void context.suspend().catch(() => {});
        }, 90);
      }
      this.notify();
      return;
    }
    try {
      this.graph();
      const context = this.context!;
      this.unavailable = false;
      this.lastError = null;
      if (context.state !== 'running') {
        if (retryResume || !this.resumePromise) {
          const pending: Promise<void> = context.resume().finally(() => {
            if (this.resumePromise === pending) {
              this.resumePromise = null;
              this.notify();
            }
          });
          this.resumePromise = pending;
        }
        this.notify();
        await this.resumePromise;
      }
      if (generation !== this.generation || !this.enabled() || context.state !== 'running') return;
      this.unavailable = false;
      this.lastError = null;
      this.restoreMusicOutput();
      this.master!.gain.cancelScheduledValues(context.currentTime);
      this.master!.gain.setValueAtTime(this.master!.gain.value, context.currentTime);
      this.master!.gain.linearRampToValueAtTime(0.65, context.currentTime + 0.06);
      this.startScheduler();
      this.ensureTravel();
      this.notify();
    } catch (error) {
      if (generation !== this.generation || !this.enabled() || this.context?.state === 'running')
        return;
      this.unavailable = true;
      this.lastError = error instanceof Error ? error.name : 'Audio unavailable';
      this.stopScheduler();
      this.notify();
    }
  }
  async activate() {
    if (this.disposed) return;
    const first = !this.activated;
    this.activated = true;
    if (first) this.notify();
    if (this.context?.state === 'running' && this.enabled()) return;
    await this.reconcile(true);
  }
  async toggle() {
    await this.setMuted(!this.muted);
  }
  async setMuted(muted: boolean) {
    if (this.disposed) return;
    this.muted = muted;
    this.activated = true;
    try {
      localStorage.setItem('last-ferry-muted', String(this.muted));
    } catch {}
    await this.reconcile(!muted);
  }
  playback() {
    const running = this.enabled() && this.context?.state === 'running';
    return {
      state: this.muted
        ? ('muted' as const)
        : running
          ? ('running' as const)
          : ('requested' as const),
      requested: this.activated && !this.muted && !this.disposed,
      running,
      retryPending: this.resumePromise !== null,
    };
  }
  private ensureTravel() {
    if (!this.enabled() || this.context?.state !== 'running' || !this.travelling) return;
    if ([...this.owned.values()].some((record) => record.kind === 'travel' && !record.stopping))
      return;
    for (const [source, record] of this.owned)
      if (record.kind === 'travel' && record.stopping) this.stop(source, true);
    this.noiseVoice('travel', 0.93, 690, 0.2, 0);
  }
  startTravel() {
    if (this.disposed) return;
    this.travelling = true;
    this.ensureTravel();
  }
  stopTravel() {
    this.travelling = false;
    for (const [source, record] of this.owned) if (record.kind === 'travel') this.stop(source);
  }
  beginStoryRun(token: number) {
    if (this.disposed || !Number.isSafeInteger(token) || token < 0) return;
    if (this.storyToken === token) return;
    if (token <= this.latestStoryToken) return;
    this.cancelStoryRun(true);
    this.latestStoryToken = token;
    this.storyToken = token;
    this.storyConsumed.clear();
  }
  cancelStoryRun(immediate = false) {
    this.storyToken = null;
    for (const [source, record] of this.owned)
      if (record.kind === 'story') this.stop(source, immediate);
  }
  storyCue(token: number, kind: StoryCueKind, strength = 1, id: string = kind) {
    if (
      this.disposed ||
      token !== this.storyToken ||
      this.storyConsumed.has(id) ||
      this.storyConsumed.size >= 8 ||
      !Number.isFinite(strength)
    ) {
      this.storyRejected++;
      return false;
    }
    this.storyConsumed.add(id);
    this.storyCueCount++;
    const definition = storyEffects[kind],
      level = Math.max(0, Math.min(1, strength)),
      stories = [...this.owned.values()].filter((record) => record.kind === 'story');
    this.lastStoryCue = {
      token,
      id,
      kind,
      time: this.context?.currentTime ?? 0,
      duration: definition.duration,
      strength: level,
      played: false,
    };
    if (
      !this.enabled() ||
      this.context?.state !== 'running' ||
      stories.length >= 2 ||
      this.owned.size >= 29 ||
      level === 0
    ) {
      this.storySkipped++;
      return false;
    }
    const context = this.context,
      now = context.currentTime,
      end = now + definition.duration,
      source = context.createBufferSource(),
      filter = context.createBiquadFilter(),
      highpass = context.createBiquadFilter(),
      gain = context.createGain(),
      panner = context.createStereoPanner();
    if (kind === 'lantern-contact') {
      let buffer = this.wood.get('light');
      if (!buffer) {
        buffer = makeWoodContact(context, 'light');
        this.wood.set('light', buffer);
      }
      source.buffer = buffer;
    } else source.buffer = this.noise;
    source.playbackRate.value = definition.rate;
    source.loop = false;
    filter.type = 'lowpass';
    filter.frequency.value = definition.cutoff;
    filter.Q.value = 0.45;
    highpass.type = 'highpass';
    highpass.frequency.value = kind === 'lantern-contact' ? 60 : 90;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(definition.peak * level, now + definition.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, end - 0.05);
    gain.gain.linearRampToValueAtTime(0, end);
    panner.pan.value = definition.pan;
    source.connect(filter);
    filter.connect(highpass);
    highpass.connect(gain);
    gain.connect(panner);
    panner.connect(this.effects!);
    this.own(source, {
      kind: 'story',
      nodes: [filter, highpass, gain, panner],
      endAt: end,
      gain,
      stopping: false,
    });
    source.start(now);
    source.stop(end);
    this.storyPlayed++;
    this.peakStorySources = Math.max(this.peakStorySources, stories.length + 1);
    this.lastStoryCue.played = true;
    return true;
  }
  transferContact(contact: TransferContact) {
    if (this.disposed || !Number.isFinite(contact.count) || contact.count < 1) return;
    this.transferContacts++;
    this.lastTransferContact = {
      ...contact,
      time: this.context?.currentTime ?? 0,
      played: false,
    };
    const transfers = [...this.owned.values()].filter((record) => record.kind === 'transfer');
    if (
      !this.enabled() ||
      this.context?.state !== 'running' ||
      transfers.length >= 2 ||
      this.owned.size > 27
    ) {
      this.transferSkipped++;
      return;
    }
    const context = this.context,
      now = context.currentTime;
    let buffer = this.wood.get(contact.weight);
    if (!buffer) {
      buffer = makeWoodContact(context, contact.weight);
      this.wood.set(contact.weight, buffer);
    }
    const source = context.createBufferSource(),
      gain = context.createGain(),
      end = now + buffer.length / buffer.sampleRate,
      group = 1 + Math.min(contact.count - 1, 2) * 0.06;
    source.buffer = buffer;
    gain.gain.value =
      (contact.weight === 'full' ? 0.24 : 0.2) *
      group *
      (contact.settle ? 0.48 : 1) *
      (contact.compact ? 0.7 : 1);
    source.connect(gain);
    gain.connect(this.effects!);
    this.own(source, {
      kind: 'transfer',
      nodes: [gain],
      endAt: end,
      gain,
      stopping: false,
    });
    source.start(now);
    source.stop(end);
    this.transferPlayed++;
    this.peakTransferSources = Math.max(this.peakTransferSources, transfers.length + 1);
    this.lastTransferContact.played = true;
  }
  delivery() {
    if (this.disposed) return;
    this.arrivalEventCount++;
    if (!this.enabled() || this.context?.state !== 'running') return;
    for (const [source, record] of this.owned)
      if (record.kind === 'effect') this.stop(source, true);
    const now = this.context.currentTime,
      elapsed = Math.max(0, now - this.epoch),
      notes = arrivalPhrase(elapsed);
    this.lastArrival = { time: now, phase: elapsed % phraseSeconds, notes };
    for (const note of notes) this.arrivalVoice(note, now);
    this.deliveryCount++;
  }
  private arrivalVoice(note: ArrivalNote, now: number) {
    if (this.owned.size >= 29) {
      this.arrivalVoicesSkipped++;
      return;
    }
    const context = this.context!,
      source = context.createOscillator(),
      filter = context.createBiquadFilter(),
      gain = context.createGain(),
      panner = context.createStereoPanner(),
      at = now + note.offset,
      end = at + note.duration;
    source.setPeriodicWave(note.stage === 'answer' ? this.pluckWave! : this.padWave!);
    source.frequency.value = frequency(note.note);
    filter.type = 'lowpass';
    filter.Q.value = 0.45;
    filter.frequency.setValueAtTime(
      note.stage === 'answer' ? 2400 : note.stage === 'opening' ? 1600 : 1050,
      at,
    );
    filter.frequency.exponentialRampToValueAtTime(note.stage === 'settle' ? 650 : 700, end);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(note.peak, at + note.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, end - 0.08);
    gain.gain.linearRampToValueAtTime(0, end);
    panner.pan.value = note.stage === 'answer' ? 0.1 : -0.05;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(this.effects!);
    this.own(source, {
      kind: 'effect',
      nodes: [filter, gain, panner],
      endAt: end,
      gain,
      stopping: false,
    });
    source.start(at);
    source.stop(end);
    this.arrivalVoicesPlayed++;
  }
  resetActionEffects() {
    this.clearActions(false);
  }
  play(kind: 'move' | 'board' | 'unload' | 'wait' | 'arrival') {
    if (kind === 'move') this.startTravel();
    else if (kind === 'arrival') this.delivery();
  }
  visibility(hidden: boolean) {
    if (this.disposed) return;
    this.hidden = hidden;
    if (hidden) this.clearActions(false);
    return this.reconcile();
  }
  captureStream() {
    if (!this.context || !this.master || this.disposed) return null;
    if (!this.capture) {
      this.capture = this.context.createMediaStreamDestination();
      this.master.connect(this.capture);
      this.permanent.push(this.capture);
    }
    return this.capture.stream;
  }
  presentation() {
    const now = this.context?.currentTime ?? 0,
      elapsed = Math.max(0, now - this.epoch);
    let sum = 0,
      peak = 0;
    if (this.analyser) {
      this.analyser.getFloatTimeDomainData(this.meter);
      for (const sample of this.meter) {
        sum += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
      }
    }
    let scoreSum = 0,
      scorePeak = 0;
    if (this.scoreAnalyser) {
      this.scoreAnalyser.getFloatTimeDomainData(this.meter);
      for (const sample of this.meter) {
        scoreSum += sample * sample;
        scorePeak = Math.max(scorePeak, Math.abs(sample));
      }
    }
    const records = [...this.owned.values()];
    return {
      scoreOutputRms: Math.sqrt(scoreSum / this.meter.length),
      scoreOutputPeak: scorePeak,
      scoreRoute: 'music dry + reverb -> victory gain -> master',
      scoreEffectiveOutputRms:
        Math.sqrt(scoreSum / this.meter.length) * (this.master?.gain.value ?? 0),
      ...this.playback(),
      muted: this.muted,
      activated: this.activated,
      hidden: this.hidden,
      disposed: this.disposed,
      unavailable: this.unavailable,
      error: this.lastError,
      contextState: this.context?.state ?? 'not-created',
      currentTime: now,
      contextCount: this.contextsCreated,
      schedulerActive: this.scheduler !== null,
      schedulerCount: this.scheduler === null ? 0 : 1,
      schedulerStarts: this.schedulerStarts,
      sourceCount: this.owned.size,
      sourceNodesCreated: this.sourcesCreated,
      peakOwnedSources: this.peakOwned,
      graphNodeCount:
        this.permanent.length + records.reduce((sum, record) => sum + record.nodes.length + 1, 0),
      musicSources: records.filter((record) => record.kind === 'music' && !record.stopping).length,
      ambienceSources: records.filter((record) => record.kind === 'bed' && !record.stopping).length,
      travelRequested: this.travelling,
      travelActive: records.some((record) => record.kind === 'travel' && !record.stopping),
      arrivalActive: records.some((record) => record.kind === 'effect' && !record.stopping),
      deliveryCount: this.deliveryCount,
      arrivalEventCount: this.arrivalEventCount,
      victorySettled: this.victorySettled,
      victoryTarget: this.victoryTarget,
      victoryGain: this.musicOutput?.gain.value ?? null,
      arrangementTarget: this.arrangementTarget,
      arrangementGain: this.music?.gain.value ?? null,
      effectiveMusicTarget: this.arrangementTarget * this.victoryTarget,
      lastVictoryMixChange: this.lastVictoryMixChange ? { ...this.lastVictoryMixChange } : null,
      arrivalSources: records.filter((record) => record.kind === 'effect').length,
      arrivalVoicesPlayed: this.arrivalVoicesPlayed,
      arrivalVoicesSkipped: this.arrivalVoicesSkipped,
      arrivalVoicesReclaimed: this.arrivalVoicesReclaimed,
      lastArrival: this.lastArrival
        ? { ...this.lastArrival, notes: this.lastArrival.notes.map((note) => ({ ...note })) }
        : null,
      transferContacts: this.transferContacts,
      transferPlayed: this.transferPlayed,
      transferSkipped: this.transferSkipped,
      transferSources: records.filter((record) => record.kind === 'transfer' && !record.stopping)
        .length,
      peakTransferSources: this.peakTransferSources,
      lastTransferContact: this.lastTransferContact ? { ...this.lastTransferContact } : null,
      storyToken: this.storyToken,
      storyConsumedIds: [...this.storyConsumed],
      storyCueCount: this.storyCueCount,
      storyPlayed: this.storyPlayed,
      storySkipped: this.storySkipped,
      storyRejected: this.storyRejected,
      storyReclaimed: this.storyReclaimed,
      storySources: records.filter((record) => record.kind === 'story' && !record.stopping).length,
      storyOwnedSources: records.filter((record) => record.kind === 'story').length,
      peakStorySources: this.peakStorySources,
      lastStoryCue: this.lastStoryCue ? { ...this.lastStoryCue } : null,
      desiredArrangement: this.desiredArrangement,
      arrangement: this.arrangement,
      pendingTerminal: this.pendingTerminal,
      accompanimentEnabled: this.accompanimentEnabled,
      companionSources: records.filter((record) => record.kind === 'companion' && !record.stopping)
        .length,
      companionNotes: this.companionNotes,
      companionDeferrals: this.companionDeferrals,
      droppedTones: this.droppedTones,
      masterGain: this.master?.gain.value ?? 0,
      phrase: score.title,
      bpm: score.bpm,
      phraseSeconds,
      cueDuration: phraseSeconds,
      phaseSeconds: elapsed % phraseSeconds,
      loopCount: Math.floor(elapsed / phraseSeconds),
      scheduledEvents: this.scheduledEvents,
      skippedEvents: this.skippedEvents,
      rms: Math.sqrt(sum / this.meter.length),
      peak,
    };
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelStoryRun(true);
    this.generation++;
    this.resumePromise = null;
    this.stopScheduler();
    if (this.suspendTimer !== null) clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    this.travelling = false;
    this.context?.removeEventListener('statechange', this.contextChanged);
    for (const source of [...this.owned.keys()]) this.stop(source, true);
    for (const node of this.permanent) node.disconnect();
    this.permanent.length = 0;
    for (const track of this.capture?.stream.getTracks() ?? []) track.stop();
    this.noise = null;
    this.wood.clear();
    this.padWave = null;
    this.pluckWave = null;
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {});
    this.notify();
  }
}
