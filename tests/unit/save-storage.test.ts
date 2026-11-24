import { expect, test } from 'vitest';
import { storageForRecord } from '../../src/game/save-storage';
import { HARBOR_LOG_KEY, HarborEntryStore } from '../../src/game/moss-request';
import { JOURNEY_STORAGE_KEY } from '../../src/campaign/progress';

function storage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

test('ordinary web saves use the original storage; installed older records and backups keep their bytes', () => {
  const localStorage = storage(), disk = storage();
  const old = ' { "version": 1 }\n';
  localStorage.setItem(JOURNEY_STORAGE_KEY, old);
  expect(storageForRecord(JOURNEY_STORAGE_KEY, { localStorage })).toBe(localStorage);
  const installed = storageForRecord(JOURNEY_STORAGE_KEY, {
    localStorage,
    lastFerrySaves: { read: disk.getItem, write: (k, v) => { disk.setItem(k, v); return true; } },
  });
  expect(installed.getItem(JOURNEY_STORAGE_KEY)).toBe(old);
  expect(disk.getItem(JOURNEY_STORAGE_KEY)).toBeNull();
  const backupKey = JOURNEY_STORAGE_KEY + '.before-drowned-orchard';
  installed.setItem(backupKey, old);
  installed.setItem(JOURNEY_STORAGE_KEY, 'next');
  expect(installed.getItem(backupKey)).toBe(old);
  expect(disk.getItem(backupKey)).toBeNull();
  expect(disk.getItem(JOURNEY_STORAGE_KEY)).toBe('next');
  expect(localStorage.getItem(JOURNEY_STORAGE_KEY)).toBe('next');
});

test('cold launch repairs a rolled-back WebView mirror from the confirmed Android reward', () => {
  const localStorage = storage(), disk = storage();
  const lastFerrySaves = { read: disk.getItem, write: (k: string, v: string) => { disk.setItem(k, v); return true; } };
  const installed = () => storageForRecord(HARBOR_LOG_KEY, { localStorage, lastFerrySaves });
  const store = new HarborEntryStore(installed);
  store.keep('rue-lantern');
  const old = localStorage.getItem(HARBOR_LOG_KEY)!;
  store.keep('moss-own-crossing');
  localStorage.setItem(HARBOR_LOG_KEY, old);
  expect(new HarborEntryStore(installed).mossEarned).toBe(true);
  expect(localStorage.getItem(HARBOR_LOG_KEY)).toBe(disk.getItem(HARBOR_LOG_KEY));
});

test('rejected native writes leave the previous mirror intact and a retry can confirm the record', () => {
  const localStorage = storage(), disk = storage();
  let writable = false;
  localStorage.setItem(HARBOR_LOG_KEY, '{"version":1,"entries":[]}');
  const installed = () => storageForRecord(HARBOR_LOG_KEY, {
    localStorage,
    lastFerrySaves: { read: disk.getItem, write: (k, v) => {
      if (writable) disk.setItem(k, v);
      return writable;
    } },
  });
  const store = new HarborEntryStore(installed);
  store.keep('moss-own-crossing');
  expect(store.issue).toContain('visit');
  expect(localStorage.getItem(HARBOR_LOG_KEY)).toBe('{"version":1,"entries":[]}');
  writable = true;
  store.retry();
  expect(new HarborEntryStore(installed).mossEarned).toBe(true);
  expect(store.issue).toBeNull();
});
