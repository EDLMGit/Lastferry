# PLAY_READABILITY_01 — readable water, lighter controls and a composed Harbor scene

## Identity and scope

**Current assignment:** implement this file. Previous NEXT_TASK files describe history and are not concurrent work.

- Reviewed runtime: 7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695.
- Later reviewed continuity HEAD: 52f72d6cdb1caa292425511394f4a11efa024a61; no intervening runtime changes.
- Branch: m1-first-crossing. PR #1 stays draft. Main remains unchanged.
- Current repository-recorded private publication: version 13 / game 7ae1d8a / hosting c24aa6528675bc278de848e111ee73f9e22810ac.
- Start from the current checkout, preserving newer or unrelated work. Do not reset to either SHA or restore stale version-12 claims.
- Complete this scoped pass and its focused evidence. Do not deploy or implement the next cove.

The player should see the cove rather than a dashboard, understand shallow approaches from the water, act through one nearby Sail control, and read the Harbor connection as one composed story image.

The user's Wide Berth difficulty feedback changes campaign direction. This pass updates that direction in documentation but leaves the current runtime order, launch trigger, checkpoints and puzzles intact. CAMPAIGN_RECALIBRATION.md defines the subsequent direction; it is not a second implementation assignment.

## 1. Read before editing

Resolve and report this exact task path. Read:

- AGENTS.md, docs/PROJECT_STATE.md and current STATUS.md.
- This package's REVIEW_FINDINGS.md, CAMPAIGN_RECALIBRATION.md and baseline/REVIEW_BASELINE.json.
- campaign/CAMPAIGN_DIRECTION.md, campaign/PUZZLE_PROGRESSION.md and campaign/STORY_SCENES.md.
- docs/GAMEPLAY_RULES.md, docs/ART_DIRECTION.md, assets/catalog.json and docs/ASSET_LEDGER.md.
- reviews/wide-berth-visual-repair/REVIEW.md and the newer deployment-confirmation.json.
- The relevant main.ts, UI placement/location, camera, water/seabed and story-player/painter code.

Use the current task to resolve older milestone instructions. Preserve exact level mechanics and authored scene progression; presentation changes cannot silently rewrite either.

## 2. Replace the continuous HUD

### Default play

Use the existing rounded cove controls, palette, icons and restrained elevation.

- Upper right: individual Undo, Wait, Menu and Sound buttons. No continuous background connecting them across the screen. Keep accessible names, state and adequate touch targets. Wait remains clearly an action, not a free view control.
- A small expandable status capsule keeps occupied spaces/capacity and current required depth visible, for example “2/4 · Depth 2”. Expanded information holds cove name, objective, rescued progress, elapsed actions and tide detail.
- A separate compact forecast/deadline capsule keeps the next meaningful occupied-pier threat and actions remaining visible. Reuse the actual forecast/status logic; do not hide a known imminent flood in Menu. If no occupied pier is threatened, show a quiet tide summary.
- Keep Whole cove, Back to boat and fullscreen access. Make the few persistent controls fit portrait and short landscape without producing another solid full-width bar.
- Use no new explanatory paragraphs on ordinary dock buttons. Keep direct single transfers, nearby subset choosers and transaction feedback.

Fit 320px portrait through desktop. Small visual controls must retain at least 44×44 CSS-pixel interactive targets with usable spacing. Avoid horizontal scrolling or a new fixed sidebar. Critical short text may wrap where necessary rather than truncate names or costs.

### Placement and camera are part of this change

main.ts currently treats .hud as a full-width exclusion in viewport(), positionMap(), receipt placement, observers and diagnostics. Replace those assumptions. Use independent visible control/panel rectangles as obstacles and reclaim empty scene area between them.

Update the camera/layout geometry alongside DOM/CSS. Preserve stable Play and Whole cove framing, panning limits and Back to boat. Do not make the camera reframe abruptly when information expands. Keep selected actions close to their marker and avoid animal faces, the ferry, neighboring targets and meaningful landmarks.

Controls and expansion must work with natural Tab/Shift+Tab, Enter, Escape, touch and rotation/fullscreen safe areas. No focus trap or return target may point to a removed heading.

## 3. One explicit Sail action

Ordinary safe Sail already executes directly. The current burden is the verbose location card and, for immediately losing moves, an extra confirmation. Correct the actual layer.

- Marker/name selection remains free inspection. It never spends an action.
- An adjacent available destination shows a compact local “Sail · 1 action” control, with an icon and optional Details. Use the freestanding map name rather than repeating a large header.
- Details exposes exact passage depth, current ferry requirement, occupants, safety and forecast information using existing facts/preview. Routine “enough depth” prose is collapsed by default.
- Activating Sail commits exactly one existing move through the existing execute/Session path. No second Confirm dialog.
- An impossible passage shows a short exact reason, such as “Needs depth 3 · passage 1”, and cannot commit. Do not turn a disabled choice into a hidden automatic detour.
- A legal move with immediate loss displays the precise endangered pier/passenger consequence inline before activation. Its same explicit action may read “Sail anyway · 1 action”. No extra modal or acknowledgment checkbox. A toast after the loss is not sufficient advance warning.
- A remote destination remains inspectable, with an honest “No direct passage” state; do not introduce automatic routing.
- Current-place inspection and passenger controls remain available without reopening long action explanations.

Revalidate against the committed state at activation. Preserve busy gating, complete Undo, touch release protection, audio activation and keyboard focus recovery. The input which selects a location must not also commit its newly appeared Sail control. Compact layout must not place the new action directly under the release point in a way that triggers it.

Do not claim the inherited precise ≤180ms repeat-input guarantee is solved unless it is measured. Prevent demonstrated double actions with the existing architecture; record any narrower verification honestly.

## 4. Make true shallow passages readable

### Ground appearance in level data

The current coastal mask contains shallow-route information which the visible shader ignores; the current seabed follows shores and decorative patches. Connect actual gameplay depth geography to the final rendered water/substrate.

- Derive shallow corridors from canonical curved edge paths and authored baseDepth. Use coherent submerged sand/stone and lighter teal water for depth-1 banks, a quieter intermediate transition for depth 2 and a deeper blue alternative for depth 3.
- Those categories describe base-depth geography. Current passage depth remains baseDepth + tideLevel, and legality compares that current depth with the current ferry requirement. A bank can become navigable as water rises. Keep rule units distinct from world-space heights; preserve or deliberately map the existing visual scale of 0.18 water-height units per tide rather than treating depth integers as meters.
- Shape broad, irregular submerged banks around the real courses. Avoid luminous road stripes, hard circles, a blanket cyan wash or brighter route dots as a substitute for water readability.
- Respect authored node pockets. Holding's shallows and Driftwood's bend nodes are depth 3 even though approaches are depth 1. Keep those deeper turning areas legible and preserve mechanical truth.
- Bed geography remains stable as animals board/unload. Draft changes route legality and marker feedback; it does not move sand or recolor the entire shallow according to the boat load.
- Tide increases must change optical depth consistently. The same relative bank should remain recognizable under deeper water. Preserve the existing shore contact, warm reflection, wake, palette and water movement.
- Numeric depth inspection, blocked shapes and forecast remain the precise accessible channel. Color and decorative texture must not be the sole way to understand a rule.

Use the existing field/mask architecture where practical; avoid an expensive new rendering pipeline. A passing mask-data test or an assigned uniform is not sufficient if the shallow still looks deep in the built game.

### Perceptual acceptance

At ordinary Play scale on portrait and landscape phone, a player should be able to distinguish a shallow approach from its deep alternative before reading its label. Its curved geographic relationship should survive a still frame, mute and Reduced Motion. Any label-suppressed review frame is an evidence-only diagnostic, not a hidden gameplay mode.

Inspect Holding and Driftwood at tides 0, 1 and 2, and compare a light and heavier ferry at a matched tide. Confirm that the world does not falsely change with load. Check Bellwater and Wide for new false shallow-looking deep passages or covered landings.

## 5. Recompose the Holding → Bellwater connection

Target scene another-bell / harbor. The scene currently spreads objects by viewport fractions while their size stops growing.

Use one bounded foreground composition containing:

- A clearly supported high Harbor landing, with visible connection to the water.
- Rue placing her lantern, with Pip and Moss grouped close enough to belong together.
- The empty ferry waiting nearby at a believable relative scale.
- Pip's glance linking that ferry to the distant Bellwater light.
- A readable caption positioned in relation to this group, leaving clear art and control space.

Build the foreground in a local design coordinate system and scale the group coherently. Extend sky, distant land and water independently. Author a deliberate portrait arrangement/crop and short-landscape arrangement when necessary; do not stretch the foreground or push a character off-screen. Preserve the restrained painted style and characters' identity.

Keep the five-second shot, caption timing at 1.05s, lantern-contact cue at 3.2s, existing music/sound intent, immediate Continue availability, autoplay/pause, Skip-versus-acknowledgment distinction and explicit final handoff. Reduced Motion must show a readable composed settled state without blocking continuation.

Use the story player's art/caption/control bounds, not gameplay HUD insets. If a shared story layout helper changes, inspect opening, Driftwood and launch as regressions. Do not commission narration, rewrite the story, add an extra shot or add a new renderer for this pass.

## 6. Campaign continuity and retained work

Update the canonical planning documents and compact project state to record:

- Wide Berth followed the earlier assignment, but the user's difficulty playtest is negative; its mandatory campaign slot is under revision.
- The proposed next C4 is a compact four-space puzzle with a distinct staging-location/retrieval-order decision.
- Orin is planned at C5 in the four-space ferry.
- The planned six-space launch moves to the C5 → C6 threshold, where mixed passenger sizes give it a clear purpose.
- Existing runtime order remains Holding → Bellwater → Driftwood → Wide for this pass.
- Future puzzle, route/save revision and launch relocation are pending implementation and playtest.

Follow CAMPAIGN_RECALIBRATION.md for the full twelve-cove arc. Preserve historical reports and publication receipts. Do not describe proposed content as playable or tested.

Keep all five current level JSON files and existing mechanics unchanged. Retain the six-space model and launch implementation for later reuse. Do not delete Wide, relabel old completion as a new cove, alter strict save-prefix validation or automatically rewrite stored progress. Explicit practice links stay isolated.

Update existing asset families, gallery/evidence and ledger for content actually changed. Preserve stable IDs; add a family only when it is genuinely new. Do not inflate inventory with duplicate HUD/status variants.

## 7. Focused verification and evidence

Run the existing Node 24 production build, typecheck, unit suite and asset validation. Add or adjust only meaningful regression checks for changed behavior, not assertions that mirror CSS or count elements.

Use real UI inputs and a built version for the final smoke. Cover these concrete risks:

1. Free selection and information expansion spend no actions; one Sail activation spends one. A blocked Sail spends none; a legal losing Sail shows its consequence beforehand, commits once and can be completely undone.
2. Natural keyboard focus survives selection, Details, close, sailing, loss/Undo and Menu. Touch selection/panning never inadvertently sails. Repeat activation is exercised and its actual timing recorded if a timing guarantee is claimed.
3. Complete one Holding and one Driftwood rescue through the interface, including a tide Undo/replay and terminal Undo. Traverse the actual Holding → Harbor scene → Bellwater boundary and preserve practice isolation.
4. Smoke Bellwater and Wide with their large local group/loaded ferry, subset controls and camera modes; inspect First Crossing. Reuse unchanged puzzle witness verification only with an exact source comparison and explicit scope.
5. Check Home/settings, mute/audio activation, Reduced Motion, portrait↔landscape and fullscreen entry/exit without losing controls or resetting the game.
6. Inspect depth-1 and depth-3 routes plus deeper node pockets at matched tides and loads. Require visible runtime evidence of the corrected shallow water. Show one base-depth-1 passage blocked for a heavier ferry at tide 0 and legal at a later tide, retaining the same bank geography; Undo restores the earlier legality and appearance.
7. Confirm the campaign registry/checkpoints and all current level data retain their semantics; planning documentation must not silently alter the runtime.

### Native capture set

Use 320×740, 390×844, 780×320, 844×390, a normal desktop size and the user's 2048×930 wide composition. Do not multiply every scenario by every size; cover the actual layout risks.

- Collapsed play and expanded information on portrait and short landscape.
- Safe Sail, blocked Sail and inline immediate-loss Sail, with the local destination visible.
- Matched Holding and Driftwood shallow/deep comparisons across the three tides, with at least one ordinary label-free diagnostic frame and one matched-load comparison.
- Harbor scene beginning, lantern placement and endpoint on 2048×930, portrait and short landscape.
- One uninterrupted actual UI sequence showing direct sailing, a shallow approach and the Harbor connection. Keep it short enough to inspect, retain runtime audio where available, and record the source/build identity.

Inspect representative frames at native size. Do not substitute a composed mockup, cropped screenshot or engine-state assertion for actual play evidence. Record visual acceptance separately from functional results. User/physical-phone perception is not inferred from a software-rendered capture.

Preserve original failed attempts and corrections in the report. Resolve newly introduced blocking defects. Keep inherited heading, overlap, image-loading, precise repeat-touch, device and listening limitations open unless the new evidence specifically closes them. Avoid rerunning unrelated historical suites after the affected risks are covered.

## 8. Handoff

Update docs/PROJECT_STATE.md, STATUS.md and the relevant asset/campaign records. Write a concise review under reviews/play-readability/ with changed behavior, exact source identity, focused results, selected native frames and remaining limits.

Commit and push to m1-first-crossing without force-pushing. Keep PR #1 draft and main unchanged. Do not publish.

Return:

- Exact final SHA and remote equality.
- What changed in HUD/Sail, water and Harbor composition.
- Check results with any retained failures and actual verification scope.
- Selected desktop/phone frames and the uninterrupted sequence.
- Confirmation that existing puzzle data/rules and campaign save semantics are preserved.
- Local root URL without ?cove=, plus Holding and Driftwood practice links.
- Current deployment record, stated separately from this un-deployed task.

Stop after PLAY_READABILITY_01. The next content assignment is the small C4 prototype described in the revised direction; it is not part of this implementation.
