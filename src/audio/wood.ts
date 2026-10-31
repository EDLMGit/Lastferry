export type TransferContact = {
  weight: 'light' | 'full';
  settle: boolean;
  compact: boolean;
  count: number;
};

export function makeWoodContact(context: BaseAudioContext, weight: TransferContact['weight']) {
  const duration = weight === 'full' ? 0.27 : 0.22,
    buffer = context.createBuffer(1, Math.ceil(duration * context.sampleRate), context.sampleRate),
    samples = buffer.getChannelData(0),
    fundamental = weight === 'full' ? 165 : 225,
    decay = weight === 'full' ? 20 : 28,
    smoothing = 1 - Math.exp((-2 * Math.PI * 1050) / context.sampleRate);
  let seed = weight === 'full' ? 173 : 311,
    grain = 0,
    peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    grain += smoothing * ((seed / 0xffffffff) * 2 - 1 - grain);
    const attack = 1 - Math.exp(-t / 0.005),
      remaining = (samples.length - 1 - i) / context.sampleRate,
      tail = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, remaining / 0.04)),
      body =
        Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-decay * t) +
        0.62 * Math.sin(2 * Math.PI * fundamental * 2.19 * t) * Math.exp(-decay * 1.12 * t) +
        0.24 * Math.sin(2 * Math.PI * fundamental * 3.71 * t) * Math.exp(-decay * 1.7 * t) +
        0.09 * Math.sin(2 * Math.PI * fundamental * 5.13 * t) * Math.exp(-decay * 2.4 * t);
    samples[i] = attack * tail * (body * 0.72 + grain * 0.16 * Math.exp(-t * 90));
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0) for (let i = 0; i < samples.length; i++) samples[i] *= 0.8 / peak;
  return buffer;
}
