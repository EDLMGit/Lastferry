export const score = {
  title: 'Between the lamps',
  bpm: 64,
  beats: 80,
  harmonies: [
    { beat: 0, notes: [50, 57, 64, 66], strength: 0.86 },
    { beat: 8, notes: [47, 54, 61, 64], strength: 0.8 },
    { beat: 16, notes: [43, 57, 59, 66], strength: 0.88 },
    { beat: 24, notes: [42, 57, 62, 69], strength: 0.82 },
    { beat: 32, notes: [45, 52, 59, 61], strength: 0.92 },
    { beat: 40, notes: [40, 55, 62, 66], strength: 0.94 },
    { beat: 48, notes: [43, 50, 57, 59, 66], strength: 0.96 },
    { beat: 56, notes: [42, 57, 62, 64, 69], strength: 0.92 },
    { beat: 64, notes: [45, 52, 59, 62], strength: 0.78 },
    { beat: 72, notes: [50, 57, 59, 64, 66], strength: 0.8 },
  ],
  motif: [
    { beat: 2, note: 74, duration: 2.7, strength: 0.8 },
    { beat: 5, note: 76, duration: 2.1, strength: 0.61 },
    { beat: 6.5, note: 69, duration: 3.8, strength: 0.67 },
    { beat: 12, note: 73, duration: 2.9, strength: 0.65 },
    { beat: 15, note: 74, duration: 3.1, strength: 0.71 },
    { beat: 19, note: 78, duration: 3.4, strength: 0.7 },
    { beat: 22, note: 76, duration: 3.8, strength: 0.58 },
    { beat: 27, note: 74, duration: 3.6, strength: 0.75 },
    { beat: 30.5, note: 69, duration: 4, strength: 0.61 },
    { beat: 35, note: 71, duration: 3.2, strength: 0.78 },
    { beat: 38, note: 73, duration: 2.8, strength: 0.68 },
    { beat: 42, note: 74, duration: 3.9, strength: 0.78 },
    { beat: 46, note: 78, duration: 3.3, strength: 0.69 },
    { beat: 50, note: 81, duration: 3.7, strength: 0.78 },
    { beat: 53.5, note: 78, duration: 3.2, strength: 0.72 },
    { beat: 58, note: 76, duration: 3.6, strength: 0.75 },
    { beat: 61, note: 74, duration: 3.9, strength: 0.65 },
    { beat: 66, note: 71, duration: 3.2, strength: 0.64 },
    { beat: 69, note: 69, duration: 4.2, strength: 0.57 },
    { beat: 74, note: 66, duration: 4.5, strength: 0.58 },
    { beat: 77.5, note: 64, duration: 4.7, strength: 0.42 },
  ],
};

export const beatSeconds = 60 / score.bpm;
export const phraseSeconds = score.beats * beatSeconds;
export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

export const phraseEvents = [
  ...score.harmonies.map((chord) => ({
    kind: 'harmony' as const,
    at: chord.beat * beatSeconds,
    chord,
  })),
  ...score.motif.map((note) => ({ kind: 'motif' as const, at: note.beat * beatSeconds, note })),
].sort((a, b) => a.at - b.at);

export function makeNoise(context: BaseAudioContext, seconds = 8) {
  const length = Math.ceil(context.sampleRate * seconds),
    seam = Math.ceil(context.sampleRate * 0.3),
    buffer = context.createBuffer(1, length, context.sampleRate),
    samples = new Float32Array(length + seam);
  let seed = 0x52f34321,
    low = 0;
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const white = (seed / 0xffffffff) * 2 - 1;
    low = low * 0.975 + white * 0.025;
    samples[i] = low * 2.4 + white * 0.06;
  }
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++)
    data[i] =
      i < seam ? samples[length + i] * (1 - i / seam) + samples[i] * (i / seam) : samples[i];
  return buffer;
}

export function makeReverb(context: BaseAudioContext) {
  const seconds = 3.6,
    buffer = context.createBuffer(2, Math.ceil(context.sampleRate * seconds), context.sampleRate);
  let seed = 0x126abe31;
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let low = 0;
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const white = (seed / 0xffffffff) * 2 - 1;
      low = low * 0.46 + white * 0.54;
      const time = i / context.sampleRate,
        onset = Math.min(1, time / 0.025);
      data[i] = low * onset * Math.exp(-time * 2.3) * 0.38;
    }
  }
  return buffer;
}
