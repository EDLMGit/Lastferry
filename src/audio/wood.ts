export type TransferContact = {
  weight: 'light' | 'full';
  settle: boolean;
  compact: boolean;
  count: number;
};

export function makeWoodContact(context: BaseAudioContext, weight: TransferContact['weight']) {
  const duration = weight === 'full' ? 0.19 : 0.145,
    buffer = context.createBuffer(1, Math.ceil(duration * context.sampleRate), context.sampleRate),
    samples = buffer.getChannelData(0),
    fundamental = weight === 'full' ? 165 : 225,
    decay = weight === 'full' ? 31 : 41,
    smoothing = 1 - Math.exp((-2 * Math.PI * 1250) / context.sampleRate);
  let seed = weight === 'full' ? 173 : 311,
    grain = 0,
    peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / context.sampleRate;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    grain += smoothing * ((seed / 0xffffffff) * 2 - 1 - grain);
    const attack = 1 - Math.exp(-t / 0.0035),
      tail = Math.min(1, (duration - t) / 0.024),
      body =
        Math.sin(2 * Math.PI * fundamental * t) * Math.exp(-decay * t) +
        0.45 * Math.sin(2 * Math.PI * fundamental * 2.31 * t) * Math.exp(-decay * 1.55 * t) +
        0.16 * Math.sin(2 * Math.PI * fundamental * 4.17 * t) * Math.exp(-decay * 2.7 * t);
    samples[i] = attack * tail * (body * 0.72 + grain * 0.34 * Math.exp(-t * 74));
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0) for (let i = 0; i < samples.length; i++) samples[i] *= 0.8 / peak;
  return buffer;
}
