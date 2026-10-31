# NEXT TASK — Driftwood Yard (Cove 3) + compact dock UI verification

## Context and current source

Repository: `EDLMGit/Lastferry`. Work on `m1-first-crossing`; keep PR #1 draft, main unchanged, no force push or publication without review. The last known UI-cleanup commit is `5ebd5826f83c295ca23941736b664be094a88e46`. Always inspect newer branch changes before editing.

The screenshot feedback of 31 Oct 2026 asks to remove explanatory text from the overlaid **Board Bram** and **Let ashore** buttons, making the buttons smaller. This source change is already committed in `src/main.ts` and `src/style.css`: remove secondary dock notes, retain a one-line label, a 48px minimum hit target and accessible descriptions. **Verification is still outstanding.** Do not restore those oversized descriptions. Keep consequence/depth info available through preview, status and warning UI; prevent irreversible losing actions without a clear warning. The current one-passenger instant actions are valid only if the production safety checks allow them.

The next campaign slice follows the selected direction in `campaign/CAMPAIGN_DIRECTION.md`, `campaign/PUZZLE_PROGRESSION.md`, `campaign/STORY_SCENES.md`. Holding Pier and Bellwater, with First Crossing as optional practice, are implemented. Cove 3 **Driftwood Yard** is proposed, not yet playable. Nell is a boatwright beaver with a two-space load; she has no activated ability. The existing four-space ferry and rule family remain.

## First: verify the compact controls

- Exercise both board and unload (home and temporary shore), single passenger direct action and multiple-passenger chooser, invalid/rejected selection, Undo and terminal Undo/redelivery.
- Confirm no visual `.dock-facts` / `.dock-consequence` text, correct labels/icons/accessible descriptions and no lost information at the point of a risky choice.
- Capture actual rendered landscape 780×320 and 844×390, portrait 390×844, and desktop 1440×900. Confirm button labels fit on one line, no boat/animal occlusion, adjacent actions do not overlap, and the minimum hit areas are 48×48.
- Run Node 24 production build, typecheck, unit suite and focused e2e. Record exact passes/failures. If unable to execute these checks, do not claim they passed.

## Main milestone: author and implement Cove 3

1. Preserve previously accepted campaign opening, Harbor scene, journey checkpoints, sound, water, lighthouse, camera, sailing/headings, animal transfer animation and puzzles. Do not turn optional First Crossing into a required chapter or strand previously rescued characters.
2. Design an original small coastal **Driftwood Yard** layout (timber, ropes, protected work pier, shallow route, safe staging island, warm boathouse glimpses), with a readable puzzle built solely from existing tide, draft and staging rules. Its distinct insight should be choosing which passenger/group to stage or how to plan a loaded return. A candidate level is not accepted until a complete successful witness and a fair tempting alternative are proved by actual reducer behavior.
3. Introduce **Nell the beaver**, occupying 2 spaces. Give her a distinctive model silhouette (flat tail, rounded face, small practical rope/tool prop) and portrait consistent with existing watercolor / miniature style. Do not use the current unknown-animal sheep fallback. Give each passenger explicit stable appearance identity without breaking the earlier nine mappings or accepted existing visual identities.
4. Update level validation, registry, runtime cove selection, story continuity, objective copy, rescue consequences, practice list, asset gallery/catalog/ledger and other necessary consumers. Do not change the 4-space load and draft rules for legacy coves.
5. **Save compatibility is critical.** The existing `last-ferry.journey.v1` validator expects exactly two coves for a completed record. Migrate existing valid saves, especially users who have finished Bellwater, into the expanded three-cove campaign without silently wiping progress or inadvertently marking Nell rescued. Preserve invalid/unknown records rather than overwriting. Distinguish already completed two-cove journeys from new three-cove journeys; test reload and Continue behavior.
6. At C3 victory, show a small satisfying arrival and an **explicit** continue action. Prepare or implement the approved illustrated threshold **A wider deck**, showing Nell's *already-built* spare ferry ready at the protected boathouse, based on `campaign/STORY_SCENES.md`. It is a story reveal, **not** a claim that the new six-space hull or Cove 4 already works. Keep the final boundary honest: if Cove 4 is not playable, say the next crossing is coming, not that it was unlocked. The next milestone after accepting C3 will be C4 Wide Berth and its actual larger hull.
7. Avoid a general engine rewrite, procedural campaign, currencies, upgrades, new current mechanics or unrelated audio/visual redesign.

## Acceptance and handoff

- Prove one successful sequence with production reducer; prove meaningful wrong/blocked plan, correct preview and full Undo and conservation.
- Complete a real UI rescue at desktop and both Android-like orientations; verify touching selection never spends an action and single-action click never double commits.
- Run the full relevant build/typecheck/unit/e2e gates, and `npm run check:assets` for any asset inventory change. Record actual outputs and source SHA. Capture representative in-game frames (model/portrait, stage, board, final arrival), mobile layout, source and review evidence. Distinguish simulated/browser checks from actual Android hardware.
- Update `STATUS.md`, relevant campaign documentation and a review record under `reviews/driftwood-yard/`; push normal commits and update existing PR #1 without merging. Do not deploy the private Site until owner review.
- Report pushed SHA, exact checks, remaining limitations and explicit next step.

**Source of truth:** existing level JSON/rules, campaign direction/progression/scenes and the current implementation. The screenshot is feedback on control density, not authorization to change puzzle logic.
