import { describe, expect, test } from 'vitest';
import { makeWoodContact } from '../../src/audio/wood';

function contact(weight: 'light' | 'full', sampleRate = 48000) {
  const context = {
    sampleRate,
    createBuffer: (_channels: number, length: number, rate: number) => {
      const samples = new Float32Array(length);
      return { duration: length / rate, getChannelData: () => samples };
    },
  } as unknown as BaseAudioContext;
  const buffer = makeWoodContact(context, weight);
  return { samples: buffer.getChannelData(0), duration: buffer.duration, sampleRate };
}

function rms(samples: Float32Array, sampleRate: number, from: number, to: number) {
  const start = Math.floor(from * sampleRate),
    end = Math.min(samples.length, Math.floor(to * sampleRate));
  let energy = 0;
  for (let i = start; i < end; i++) energy += samples[i] ** 2;
  return Math.sqrt(energy / (end - start));
}

function resonance(samples: Float32Array, sampleRate: number, frequency: number) {
  let sine = 0,
    cosine = 0;
  for (let i = 0; i < samples.length; i++) {
    const phase = (2 * Math.PI * frequency * i) / sampleRate;
    sine += samples[i] * Math.sin(phase);
    cosine += samples[i] * Math.cos(phase);
  }
  return (2 * Math.hypot(sine, cosine)) / samples.length;
}

describe('bounded rounded wood buffers', () => {
  test.each([44100, 48000])('both weights start and end quietly at %i Hz', (sampleRate) => {
    for (const weight of ['light', 'full'] as const) {
      const { samples, duration } = contact(weight, sampleRate);
      expect(duration).toBeLessThanOrEqual(0.28);
      expect(samples.every(Number.isFinite)).toBe(true);
      expect(Math.abs(samples[0])).toBe(0);
      expect(Math.abs(samples.at(-1)!)).toBe(0);
      expect(Math.max(...samples.map(Math.abs))).toBeCloseTo(0.8);
      expect(
        Math.max(...samples.map((value, i) => (i ? Math.abs(value - samples[i - 1]) : 0))),
      ).toBeLessThan(0.08);
      expect(rms(samples, sampleRate, duration - 0.02, duration)).toBeLessThan(
        rms(samples, sampleRate, 0.02, 0.08) * 0.01,
      );
    }
  });

  test('both weights retain useful mid resonances rather than relying on the low body alone', () => {
    for (const [weight, fundamental] of [
      ['light', 225],
      ['full', 165],
    ] as const) {
      const { samples, sampleRate } = contact(weight),
        body = resonance(samples, sampleRate, fundamental),
        middle = resonance(samples, sampleRate, fundamental * 2.19),
        upper = resonance(samples, sampleRate, fundamental * 3.71);
      expect(middle).toBeGreaterThan(body * 0.4);
      expect(middle).toBeLessThan(body * 0.8);
      expect(upper).toBeGreaterThan(body * 0.08);
      expect(upper).toBeLessThan(body * 0.25);
    }
  });

  test('full contact has a longer lower body without raising its peak', () => {
    const light = contact('light'),
      full = contact('full');
    expect(rms(full.samples, full.sampleRate, 0.08, 0.14)).toBeGreaterThan(
      rms(light.samples, light.sampleRate, 0.08, 0.14) * 1.5,
    );
    expect(full.samples).toEqual(contact('full').samples);
    expect(light.samples).toEqual(contact('light').samples);
  });
});
