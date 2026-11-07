# Campaign continuity — Driftwood Yard

Supporting contract for **`DRIFTWOOD_YARD_01`**, implemented through `NEXT_TASK_DRIFTWOOD_YARD.md`. This is part of that assignment, not a separate task.

The reviewed game source is `da1f2686ce6aff8d754e13111447dabb6e1313f0`. The observed newer branch head, `879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3`, has the same tree, `4aa851646f66cb0eda3ee9960ca9c5125170b0e0`. Work forward from the actual checkout and preserve newer/unrelated work; do not reset to the review commit.

## 1. Extend the existing journey

Preserve `holding-pier`, `bellwater`, `opening` and `another-bell`. Append cove **`driftwood-yard`**, with entry scene **`driftwood-light`** and explicit final action **Continue to Driftwood**. Use the existing registry, progress owner and story player.

The ordinary new journey becomes Holding → Bellwater → Driftwood. Winning remains undoable until the player explicitly accepts the rescue. Bellwater acceptance saves the pending new scene and plays it freshly. Autoplay, Skip, inspection and previews never accept a rescue or acknowledge a scene. Only the final scene action acknowledges `driftwood-light` and enters Driftwood's original start.

After Driftwood's rescue is explicitly accepted, show **“Three coves are safe.”** with an honest available-content endpoint, Return Home, Practice and Options. This is not the complete twelve-cove ending. Keep the **A wider deck** launch and six-space ferry with the next Wide Berth task; do not show an acquired upgrade or offer an unavailable destination now.

## 2. Preserve completed two-cove saves

The current complete-record validator compares progress with the full ordered registry. Simply appending Driftwood would make legitimate earlier completions invalid. Recognize this exact historical version-1 shape:

```json
{
  "version": 1,
  "checkpoint": { "kind": "complete" },
  "completed": ["holding-pier", "bellwater"],
  "acknowledgedScenes": ["opening", "another-bell"]
}
```

Use a narrow compatibility path that preserves version 1 and the existing storage key. It must require the exact known keys, ordered IDs and checkpoint shape. Do not accept arbitrary completed prefixes, drop unknown fields, reorder progress, infer missing acknowledgments or reinterpret unsupported future versions. Invalid records retain their raw bytes until confirmed replacement through the existing New journey flow.

For that recognized historical completion:

1. Home offers **Continue** to the new content. Reading Home, rendering its background, opening Options or browsing Practice does not rewrite storage.
2. The deliberate Continue activation saves the pending `driftwood-light` checkpoint, retaining both previous completion and acknowledgment arrays. It does not mark the new scene seen or Driftwood rescued.
3. Play this newly available scene from its beginning. Do not route it through the already-seen restored-scene recap merely because progress originally came from storage.
4. Once the pending new scene has been saved, a later reload retains the existing final static recap and explicit Replay scene behavior. Its final action remains necessary.
5. Repeated Continue, reload and return Home do not duplicate completion or replay migration. Storage failure preserves the supported in-memory continuation with the existing honest saving notice.

Choose the smallest implementation that exposes this distinction to Home and the progress owner. A general migration framework or speculative save-version redesign is unnecessary.

## 3. Keep current boundaries truthful

Existing opening, Holding, Harbor-connection and Bellwater checkpoints retain their meaning. A saved cove resumes from its beginning; no mid-puzzle history is promised. New journey still confirms replacement and preserves Sound/Motion preferences. Cancelling replacement or return Home leaves the existing record/live crossing unchanged.

Explicit `?cove=driftwood-yard` and all existing `?cove=` entrances are independent review/practice flows. They must not create campaign progress, perform migration, accept rescues or overwrite saved bytes. First Crossing remains practice. Normal Home and the crossing picker must expose the actual available coves consistently.

## 4. Audit the existing integration points

- Replace the initial hard-coded URL selection so Driftwood's direct URL really opens Driftwood instead of falling back to Holding. Reuse the playable registry for pickers where practical.
- Update actual “Both coves”/“two playable coves” completion copy. Keep ordinary Home concise; a development-content count is not required there.
- Remove Help's unconditional `find(species === 'sheep')!` dependency. Passenger names and costs come from the current level; a cove containing Nell and rabbits must work without a sheep.
- Extend the restored-scene/background routing deliberately. The existing opening/another-bell special cases do not establish the new scene's background. Keep decorative state separate from gameplay and reuse the retained renderer/story/audio owners.
- Nell uses two spaces. Classify her wooden contact through appropriate existing full-contact behavior rather than the sheep-only check, preserving accepted timing and sound design.
- Keep new scene/illustration IDs, captions, replay and transcript handling consistent. Preserve audio intent, cancellation, Reduced Motion and fresh-input protection at its final handoff.

## 5. Focused proof and continuity

Verify the exact legacy completion through read-only Home, explicit first continuation, pending-scene reload and Driftwood entry. Also cover earlier valid checkpoints, invalid/future records, unavailable storage, cancelled replacement, practice isolation and repeated continuation. Earn Bellwater's transition through an actual rescue; retain terminal Undo before acceptance. Complete Driftwood and confirm the honest three-cove endpoint.

Reconcile canonical campaign/story/current-task documentation with this implemented slice and existing autoplay. Mark earlier task scopes as historical while preserving their evidence and publication history. No new Site version or physical-device approval follows from this code change alone.
