# MOBILE_MAP_READABILITY_01 — make the phone cove easy to read

> **Completed, reviewed and published, 11 November 2026.** Game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731` is live as Sites version 19. The original assignment below is historical. The user has requested the next Android comparison and named viewer access, which Sites confirmed. See [publication review](reviews/mobile-map-readability/PUBLICATION_REVIEW.md), [receipt](reviews/mobile-map-readability/deployment-confirmation.json) and [current state](docs/PROJECT_STATE.md). Do not repeat this task or add another level from the historical roadmap.

## Goal and baseline

Repair the existing map presentation after the player's physical Android playtest. The story now aligns and looks decent to them. The problem is associating islands, names, markers and actions while the camera alternates between a crowded close view and a tiny Whole cove.

Start from reviewed game `1b7b4f05e576614f061ca4949bf5aca705dc5e0e`, published privately as Sites version **18**. The preceding continuity commit is `a47a306943f2485cab74b096ba44d764c84f666c`; this task is supplied on top of it. Fast-forward the work branch safely, preserving newer and unrelated work. Do not reset to an old runtime commit.

Read this root task, `AGENTS.md`, the active `docs/PROJECT_STATE.md`, and [the source audit, research and three original Android images](docs/MOBILE_MAP_READABILITY_RESEARCH.md) before editing. The images are in `references/mobile-map-readability/`; inspect all three at their native size.

**Success:** a player can identify the ferry, a destination, its name, its route and the owner of an action without tracing a line across the screen. The default phone view supports a next decision while the boat and animals still feel like the game.

## Scope

Use one coherent presentation policy across the six Journey coves and all seven Practice entrances. Work on camera framing, map names/markers, local action placement and compact phone controls. Choose the implementation and exact visual treatment independently within the established cove palette.

Preserve accepted puzzle data, topology, costs, tide/reef schedules, difficulty, animal/ferry scale and art, water, sailing pace, audio, story scenes, Journey order, save conversion/history, Practice isolation and complete Undo. The accepted boat/dock repair is not being reopened. Add no cove, mechanic, species, minimap, story rewrite or rendering framework. This pass should not need a mapping library. Update asset records only for families actually changed.

## Required experience

### 1. Keep places, names and targets together

Make a visible place read as a coherent local group. Prefer a small set of nearby name positions and stable placement. Remove the long island-name leaders that create a second network over the water. Any retained connector must be short and clearly local; a cross-screen connector is a failed layout.

Bound displacement on every placement path, including fallbacks, cached placements and marker relocation. A marker must remain associated with its actual navigation endpoint and island. Do not relocate it into unrelated empty water to make a rectangle fit, or clamp an offscreen name into the view as if its place were there.

When local text cannot fit, reduce secondary presentation or reveal the full name on free selection/focus. Keep the current stop, selected place and Harbor identity clear when visible. Every destination must remain discoverable, canonically named for assistive technology, and freely inspectable. Priority must reflect interaction and spatial relevance, never a recommended solution. Names may become non-interactive text if the associated marker supplies the comfortable, clearly named target.

Distinguish important subjects (animal faces, ferry, landing and selected passage) from decorative island area. Do not treat every island's entire rectangle as untouchable and then send its name elsewhere.

### 2. Let the route network describe travel

Keep the complete network discoverable and truthful. Whole cove must support planning across the whole graph; ordinary Play can give the selected/current passages more emphasis and other passages less.

Keep reef direction attached to the affected passage, and preserve visible shallows/deep pockets and inspectable depth/block reasons. A route does not cease to exist because the current load cannot use it. Do not hide legal alternatives or supply strategy when Tips is Off.

Route emphasis already exists in the renderer. Improve the combined result rather than assuming another opacity change alone solves the problem. Names, action associations and route/current lines need distinct visual roles.

### 3. Keep actions with the correct ferry or destination

Board, Let ashore and Bring home must visibly belong to the actual ferry/current landing. The Wide screenshot with Board over another island is unacceptable even if no DOM rectangles overlap.

The selected destination's Sail action must likewise remain clearly associated with that destination. Use a genuinely local placement or an intentional compact fallback with explicit ownership. Never let an unrestricted free-space search silently move an action across the cove.

Keep free inspection and the existing single explicit Sail/transfer commitment. Do not restore routine confirmation dialogs or cause a selection, focus, pan or zoom to spend an action. Preserve subset choice and stable controls while an input is in progress.

### 4. Supply a useful normal view and an adjustable scale

Replace the forced close-versus-fit-all extremes with framing that considers the actual usable window, current ferry/landing and nearby navigational choices. The initial Play view must be useful without immediately pressing Whole cove. It need not show every distant decoration at full size.

Account for both width and available height, actual corner controls/deadlines, safe areas, browser viewport changes and fullscreen. Do not reserve a new full-width invisible bar. Camera, labels and action placement should agree about which parts of the view are occupied.

Retain Whole cove for planning, and let label/detail presentation adapt to that scale rather than shrinking only the world under unchanged large pills. Allow bounded adjustment between close and whole-cove scales through a compact tap-accessible treatment of the existing view controls. Pinch is welcome if robust, but must not be required. Keep convenient return-to-boat/focus access without adding a permanent bank of controls.

Respect deliberate user framing. Small label changes, warning text or selection must not cause repeated zooming, hunting or jumps. Reframe only for a clear reason; keep sailing and Reduced Motion behavior coherent. The old test requiring Play to be at least 1.4 times Overview encodes the rejected policy and may be replaced with tests for the new experience.

### 5. Give short landscape room to breathe

Reduce persistent wording, decorative bulk and redundant controls where useful. Keep the existing separate corner controls and cove style. Do not recreate the sidebar or full-width header.

Retain comfortable, separated tap areas (aim for at least 44 CSS pixels for primary controls) and readable essential text. Smaller decoration or non-interactive name text must not imply tiny targets. Do not globally shrink the UI.

Keep current load/draft and imminent factual flood/reef events clear. The fuller forecast remains freely accessible; concise presentation must not hide a competing imminent event. Tips remains Off by default, with rules/facts available independently.

## Implementation approach and evidence

First reproduce the problematic compositions and establish a shared policy using Two Shelters and Wide Berth. Then apply it to the other existing coves. Complete both stages in this task; do not stop after a static mockup. Use the smallest sound implementation, replacing obsolete special cases where justified rather than adding another chain of per-cove offsets.

These are real user images, not proof of their CSS viewport or exact action history. Their bitmap size is 1536 by 716. Record actual CSS viewport, device pixel ratio and relevant view state in your evidence; do not use the bitmap dimensions as an assumed phone viewport.

Provide focused verification:

- Build/typecheck and relevant unit checks. Add regression coverage for the actual distant-name/distant-action failure and the new camera/visibility behavior. Test product invariants rather than locking in a new arbitrary zoom multiplier.
- Matched native before/after compositions for Two Shelters near Reed Pier, Wide at the occupied northern landing in Whole cove, and Wide near Harbor with High Quay/current visible. Recreate the nearest legitimate state and record it; do not claim an exact match if the source state is unknown. Also inspect a busy Reef Return state.
- Deep checks at **780×320 and 844×390** landscape and **390×844** portrait, plus a **360px** portrait fit check. Sweep the remaining coves, including First Crossing Practice, and desktop for shared-system regressions. Prefer a small decisive set of frames to dozens of redundant screenshots.
- Inspect a continuous pan → scale adjustment → select/inspect → sail → rotate/resize → return-to-boat sequence. Verify no detached labels, misleading offscreen labels, action migration, camera hunting, drag/pinch release committing an action, inaccessible hidden-name targets or focus loss. Exercise fullscreen recovery where tooling allows; distinguish emulation from physical Android.
- Complete actual Two Shelters and Wide rescues through the interface, including subset transfer and tide/terminal Undo across the coverage. Check a reef event and show all destinations/facts remain available with Tips Off. Preserve save/Practice isolation and Sound/Motion settings; reuse unchanged evidence honestly where appropriate.

Visual acceptance includes association, legibility and readable scale, not just rectangle separation. At normal phone size, the reviewer should immediately answer: **Where is High Quay? Whose passengers will Board transfer? Which lines are routes? What changes at the next flood/reef event?**

Keep original failures and material limits in a concise `reviews/mobile-map-readability/REVIEW.md`. Do not claim a physical-phone pass or performance/listening approval from Chromium emulation. Avoid adding expensive effects or repeated layout work to solve a composition issue.

## Completion

Update `STATUS.md`, the active project state and relevant implemented asset records. Commit and push to `m1-first-crossing`; keep PR #1 draft and `main` unchanged. Do not automatically deploy.

Return the exact final SHA, concise change/review summary, matched representative phone frames, an uninterrupted actual interaction/rescue sequence and scoped verification with remaining limits. Include the running local root Journey and direct Two Shelters/Wide practice links. The next step is review and publication to the existing private Site for another Android comparison.
