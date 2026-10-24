import { describe, expect, it, vi } from 'vitest';
import { MotionPreference, motionStorageKey } from '../../src/ui/motion-preference';

function device(initial = false) {
  let matches = initial;
  const changes = new Set<EventListenerOrEventListenerObject>();
  const query = {
    get matches() {
      return matches;
    },
    addEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
      changes.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: EventListenerOrEventListenerObject) => {
      changes.delete(listener);
    }),
  };
  return {
    query,
    set(value: boolean) {
      matches = value;
      for (const listener of changes) {
        if (typeof listener === 'function') listener(new Event('change'));
        else listener.handleEvent(new Event('change'));
      }
    },
    get listenerCount() {
      return changes.size;
    },
  };
}

function storage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(motionStorageKey, initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

describe('shared motion preference', () => {
  it('follows the device by default and reports effective preference changes once', () => {
    const os = device();
    const preference = new MotionPreference(os.query, storage());
    const listener = vi.fn();
    preference.subscribe(listener);
    expect(preference.mode).toBe('device');
    expect(preference.reduced).toBe(false);
    os.set(true);
    os.set(true);
    os.set(false);
    expect(listener.mock.calls).toEqual([
      [true, 'device'],
      [false, 'device'],
    ]);
    expect(os.listenerCount).toBe(1);
    preference.dispose();
  });

  it('persists a manual reduction across instances and ignores device changes until follow device is restored', () => {
    const os = device();
    const saved = storage();
    const original = new MotionPreference(os.query, saved);
    original.setMode('reduced');
    expect(saved.getItem(motionStorageKey)).toBe('reduced');
    original.dispose();
    const restored = new MotionPreference(os.query, saved);
    const listener = vi.fn();
    restored.subscribe(listener);
    expect(restored.mode).toBe('reduced');
    expect(restored.reduced).toBe(true);
    os.set(true);
    os.set(false);
    expect(listener).not.toHaveBeenCalled();
    restored.setMode('device');
    expect(restored.reduced).toBe(false);
    expect(saved.getItem(motionStorageKey)).toBe('device');
    os.set(true);
    expect(listener.mock.calls).toEqual([
      [false, 'device'],
      [true, 'device'],
    ]);
    restored.dispose();
  });

  it('reports a changed choice even when both choices currently resolve to reduced', () => {
    const os = device(true);
    const preference = new MotionPreference(os.query, storage());
    const listener = vi.fn();
    preference.subscribe(listener);
    preference.setMode('reduced');
    preference.setMode('reduced');
    preference.setMode('device');
    expect(listener.mock.calls).toEqual([
      [true, 'reduced'],
      [true, 'device'],
    ]);
    preference.dispose();
  });

  it.each(['', 'normal', 'false', 'REDUCED', '{bad'])(
    'falls back to follow device for invalid storage %j',
    (stored) => {
      const preference = new MotionPreference(device(true).query, storage(stored));
      expect(preference.mode).toBe('device');
      expect(preference.reduced).toBe(true);
      preference.dispose();
    },
  );

  it('keeps the choice usable in memory when storage cannot be read or written', () => {
    const unavailable = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    const preference = new MotionPreference(device().query, unavailable);
    expect(preference.mode).toBe('device');
    preference.setMode('reduced');
    expect(preference.reduced).toBe(true);
    preference.setMode('device');
    expect(preference.reduced).toBe(false);
    preference.dispose();
  });

  it('unsubscribes and disposes the single device listener without later notifications', () => {
    const os = device();
    const preference = new MotionPreference(os.query, storage());
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = preference.subscribe(first);
    preference.subscribe(second);
    unsubscribe();
    os.set(true);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    preference.dispose();
    preference.dispose();
    expect(os.listenerCount).toBe(0);
    expect(os.query.removeEventListener).toHaveBeenCalledTimes(1);
    os.set(false);
    preference.setMode('reduced');
    expect(second).toHaveBeenCalledTimes(1);
  });
});
