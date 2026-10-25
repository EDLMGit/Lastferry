import { storyCoves, storyScenes, type CoveId, type SceneId } from './registry';

export const JOURNEY_STORAGE_KEY = 'last-ferry.journey.v1';
export const checkpointCopy = 'Progress is saved between coves. An unfinished cove starts again.';
export const unavailableCopy =
  'Progress cannot be saved on this device. You can keep playing, but this journey will not survive closing.';

export type JourneyCheckpoint =
  { kind: 'scene'; id: SceneId } | { kind: 'cove'; id: CoveId } | { kind: 'complete' };

export type JourneyRecord = {
  version: 1;
  checkpoint: JourneyCheckpoint;
  completed: CoveId[];
  acknowledgedScenes: SceneId[];
};

export type JourneyValidation =
  { valid: true; record: JourneyRecord } | { valid: false; issue: string };

export type JourneyStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type JourneySnapshot = {
  kind: 'empty' | 'valid' | 'invalid';
  record: JourneyRecord | null;
  raw: string | null;
  issue: string | null;
  persistent: boolean;
};

function copy(record: JourneyRecord): JourneyRecord {
  return {
    version: 1,
    checkpoint: { ...record.checkpoint },
    completed: [...record.completed],
    acknowledgedScenes: [...record.acknowledgedScenes],
  };
}

function keys(value: unknown, names: string[]): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).length === names.length &&
    names.every((name) => Object.hasOwn(value, name))
  );
}

function sameItems(value: unknown, expected: readonly string[]): boolean {
  return (
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((id, i) => value[i] === id)
  );
}

export function newJourney(): JourneyRecord {
  return {
    version: 1,
    checkpoint: { kind: 'scene', id: storyCoves[0].entryScene },
    completed: [],
    acknowledgedScenes: [],
  };
}

export function validateJourney(value: unknown): JourneyValidation {
  if (value !== null && typeof value === 'object' && 'version' in value && value.version !== 1) {
    return {
      valid: false,
      issue: 'This journey uses an unsupported save version. Your stored progress has been kept.',
    };
  }
  if (
    !keys(value, ['version', 'checkpoint', 'completed', 'acknowledgedScenes']) ||
    value.version !== 1
  ) {
    return {
      valid: false,
      issue: 'This journey could not be read. Your stored progress has been kept.',
    };
  }
  const checkpoint = value.checkpoint;
  if (!keys(checkpoint, ['kind', 'id']) && !keys(checkpoint, ['kind'])) {
    return {
      valid: false,
      issue: 'This journey has an invalid checkpoint. Your stored progress has been kept.',
    };
  }
  if (
    checkpoint.kind === 'complete' &&
    keys(checkpoint, ['kind']) &&
    sameItems(
      value.completed,
      storyCoves.map((cove) => cove.id),
    ) &&
    sameItems(
      value.acknowledgedScenes,
      storyCoves.map((cove) => cove.entryScene),
    )
  ) {
    return { valid: true, record: copy(value as JourneyRecord) };
  }
  for (let i = 0; i < storyCoves.length; i++) {
    const cove = storyCoves[i];
    const previous = storyCoves.slice(0, i);
    if (
      !keys(checkpoint, ['kind', 'id']) ||
      !sameItems(
        value.completed,
        previous.map((entry) => entry.id),
      )
    )
      continue;
    const pending = checkpoint.kind === 'scene' && checkpoint.id === cove.entryScene;
    const playing = checkpoint.kind === 'cove' && checkpoint.id === cove.id;
    const acknowledged = (pending ? previous : storyCoves.slice(0, i + 1)).map(
      (entry) => entry.entryScene,
    );
    if ((pending || playing) && sameItems(value.acknowledgedScenes, acknowledged)) {
      return { valid: true, record: copy(value as JourneyRecord) };
    }
  }
  return {
    valid: false,
    issue:
      'This journey contains an unknown place or inconsistent progress. Your stored progress has been kept.',
  };
}

export function parseJourney(raw: string): JourneyValidation {
  try {
    if (raw.length > 8192) throw new Error('Oversized journey');
    return validateJourney(JSON.parse(raw));
  } catch {
    return {
      valid: false,
      issue: 'This journey could not be read. Your stored progress has been kept.',
    };
  }
}

export function acknowledgeScene(record: JourneyRecord, id: SceneId): JourneyRecord {
  if (
    !validateJourney(record).valid ||
    record.checkpoint.kind !== 'scene' ||
    record.checkpoint.id !== id
  )
    return record;
  return {
    ...copy(record),
    checkpoint: { kind: 'cove', id: storyScenes[id].destination },
    acknowledgedScenes: [...record.acknowledgedScenes, id],
  };
}

export function acceptCove(record: JourneyRecord, id: CoveId, status: string): JourneyRecord {
  if (
    !validateJourney(record).valid ||
    status !== 'won' ||
    record.checkpoint.kind !== 'cove' ||
    record.checkpoint.id !== id
  )
    return record;
  const index = storyCoves.findIndex((cove) => cove.id === id);
  const next = storyCoves[index + 1];
  return {
    ...copy(record),
    completed: [...record.completed, id],
    checkpoint: next ? { kind: 'scene', id: next.entryScene } : { kind: 'complete' },
  };
}

export function checkpointCove(record: JourneyRecord): CoveId {
  const checkpoint = record.checkpoint;
  if (checkpoint.kind === 'complete') return storyCoves.at(-1)!.id;
  return checkpoint.kind === 'scene' ? storyScenes[checkpoint.id].destination : checkpoint.id;
}

export class JourneyProgress {
  private storage: JourneyStorage | null = null;
  private current: JourneySnapshot = {
    kind: 'empty',
    record: null,
    raw: null,
    issue: null,
    persistent: true,
  };

  constructor(getStorage: () => JourneyStorage = () => window.localStorage) {
    try {
      this.storage = getStorage();
      const raw = this.storage.getItem(JOURNEY_STORAGE_KEY);
      if (raw === null) return;
      const result = parseJourney(raw);
      this.current = result.valid
        ? { kind: 'valid', record: result.record, raw, issue: null, persistent: true }
        : { kind: 'invalid', record: null, raw, issue: result.issue, persistent: true };
    } catch {
      this.storage = null;
      this.current.persistent = false;
      this.current.issue = unavailableCopy;
    }
  }

  get snapshot(): JourneySnapshot {
    return { ...this.current, record: this.current.record ? copy(this.current.record) : null };
  }

  replace(): JourneyRecord {
    this.save(newJourney());
    return copy(this.current.record!);
  }

  acknowledge(id: SceneId): boolean {
    const record = this.current.record;
    if (!record) return false;
    const next = acknowledgeScene(record, id);
    if (next === record) return false;
    this.save(next);
    return true;
  }

  accept(id: CoveId, status: string): boolean {
    const record = this.current.record;
    if (!record) return false;
    const next = acceptCove(record, id, status);
    if (next === record) return false;
    this.save(next);
    return true;
  }

  private save(record: JourneyRecord) {
    const raw = JSON.stringify(record);
    let persistent = this.current.persistent;
    try {
      if (!this.storage) throw new Error('Storage unavailable');
      this.storage.setItem(JOURNEY_STORAGE_KEY, raw);
    } catch {
      persistent = false;
      this.storage = null;
    }
    this.current = {
      kind: 'valid',
      record,
      raw,
      persistent,
      issue: persistent ? null : unavailableCopy,
    };
  }
}
