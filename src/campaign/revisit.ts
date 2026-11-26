import { legacyContinuationScene, type JourneyRecord } from './progress';
import { storyCoves, storyScenes, supperScene } from './registry';

export function canRevisit(coveId: string, record: JourneyRecord | null, firstCrossingBest: boolean) {
  if (coveId === 'first-crossing') return firstCrossingBest;
  return record?.completed.some(id => id === coveId) ?? false;
}

/** Both the button and its handler follow the same accepted Journey checkpoint. */
export function returnDestination(record: JourneyRecord | null) {
  if (!record) return { kind: 'home', label: 'Return Home' } as const;
  const { checkpoint } = record;
  const scene = legacyContinuationScene(record) ?? (checkpoint.kind === 'scene' ? checkpoint.id : null);
  if (scene === 'opening') return { kind: 'journey', label: 'Continue to Holding Pier' } as const;
  if (scene === supperScene) return { kind: 'journey', label: 'Continue to supper' } as const;
  if (scene) return { kind: 'journey', label: storyScenes[scene].continueLabel } as const;
  if (checkpoint.kind === 'cove') {
    const cove = storyCoves.find(entry => entry.id === checkpoint.id)!;
    return { kind: 'journey', label: cove.entryScene === 'opening' ? 'Continue to Holding Pier' : storyScenes[cove.entryScene].continueLabel } as const;
  }
  return { kind: 'log', label: 'Open Harbor log' } as const;
}
