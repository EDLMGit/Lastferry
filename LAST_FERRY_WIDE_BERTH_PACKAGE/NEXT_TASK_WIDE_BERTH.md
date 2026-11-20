# NEXT_TASK_WIDE_BERTH — WIDE_BERTH_01

## Outcome

Build the next complete playable milestone: **A wider deck → Wide Berth**. Nell and the rescued neighbors launch an already prepared larger ferry. The player then uses its six spaces in a cove where loading, route choice, safe staging and two flood boundaries interact.

The user accepted Driftwood as an interesting challenge and asked for greater difficulty and new challenges. Revise the formerly gentle C4 brief: demonstrate the benefit clearly, then require a meaningful rescue plan within this same cove. Difficulty is a design target requiring their playtest, not something established by a state count.

This is one assignment with internal implementation stages, not separate approval gates. Complete the actual boat, authored level, scene, continuity and verification. Do not stop at a prototype or return a plan instead of implementing.

## Authority and read order

Reviewed baseline: **7e324e88827857469bf348fca311548344d03da6**, branch **m1-first-crossing**, PR **#1 draft**. Read the actual repository's AGENTS.md, PROJECT_STATE and canonical campaign files, then:

- `direction/LAUNCH_AND_DIFFICULTY.md`
- `design/wide-proof/README.md`, proposal and witnesses
- `contracts/FERRY_AND_TRANSFERS.md`
- `contracts/CAMPAIGN_CONTINUITY.md`
- `verification/ACCEPTANCE.md`
- `review/REVIEW.md`

This named task and its package deliberately amend C4's old difficulty calibration. Preserve newer unrelated changes and all historical tasks/evidence. Resolve the actual Git root; never reset a newer working tree to the review SHA.

## 1. The rescue decision

The intended question is: **carry the full first group home by deep water before returning for the second landing, or leave a deliberate subset safely at High Quay to rescue that landing earlier and return by a shallower shortcut?**

Implement the exact mechanical contract in `design/wide-proof/wide-berth-mechanics.proposal.json` using the existing level schema and reducer:

- Five nodes and five ordinary bidirectional passages; four piers.
- Six-space capacity; draft bands 0→1, 1–2→2, 3–4→3, 5–6→4.
- Initial six-space group at Wide Berth: sheep Alder/Clover and rabbits Poppy/Wren.
- Additional two-space group at Shell Landing: rabbits Sorrel/Finch.
- Wide Berth floods after action 5; Shell Landing after action 10. Harbor and High Quay remain dry.
- The Harbor shortcut and Shell Landing passage have base depth 2. Deep passages have base depth 4. All nodes have base depth 4.
- All required neighbors finish at Harbor. High Quay is safe staging, never an additional delivery point.

The proposal is mechanical data only. Author complete world coordinates, islands, pier geometry, smoothed routes, clear shallow/deep water and camera bounds in a real `wide-berth` level. Its visual layout must explain the network and fit the larger hull; do not ship the proposal JSON as a completed level.

Retain both critical plans and legal variations. The reference witnesses win in 13 and 14 actions; the 17-action five-body variation and 16-action opening-slack variation also pass. These are developer proofs, not score targets or player-facing instructions. Thinking and inspection remain free. No real-time pressure, global action budget, scoring, random tides, new current rule or hidden exception.

The base-depth-2 shortcut is deliberate: it becomes depth 3 at the first rise, which still excludes a full draft-4 load. Waiting for depth 4 while the low group remains ashore loses that group. Preserve harmless waiting after endangered piers have been cleared; do not outlaw a legitimate solution to force one intended route.

Use the unchanged production action order: validate against current water, perform the action, increment, rise, check stranded waiting passengers, then victory. Boarding everyone on a flood action can save them; arriving on that action cannot.

## 2. Build the ferry, not just capacity text

Implement a small active-level presentation profile with actual wider/longer deck geometry, matching seating, transfer paths, contact/wake dimensions and model bounds. Preserve the familiar yellow hull/red cabin visual identity.

First Crossing, Holding, Bellwater and Driftwood retain their original four-space profile and data, including in Practice after the launch. Do not add a fleet system, hull selector or global unlocked-boat substitution.

Apply `contracts/FERRY_AND_TRANSFERS.md` completely. The authored roster includes eight total spaces across six bodies, with a reachable maximum aboard of five bodies/six spaces. Every capacity-legal subset must fit automatically, including either sheep independently and four rabbits together. Six neighbors may wait together at High Quay or end together at Harbor. The new boat must support that actual content without interpenetration, shrinking the cast, reseating snaps or a hidden packing rule.

Share production placement/profile logic with meaningful geometry tests. Check actual hull and passenger geometry against routes, piers, rails, cabin and stationary passengers; do not certify clearance from camera bounds or old reference radii. Preserve existing clearance thresholds and old-level behavior.

At draft four, inspect the extra displacement, deck attachment, water contact and bridge reach. Match released wake contact to the new hull while retaining its accepted visual character, finite fade, reduced-motion behavior and travel timing.

## 3. A readable new cove

Keep compact dock actions. One short action label plus existing icon remains the normal presentation. Do not restore explanatory paragraphs inside every button.

Preserve free inspection, clear current depth versus required draft, forecast and subset consequences. Derive capacity and Help from active-level data; remove the current four-space-only error/Help assumptions. Six spaces means occupancy, not six equal-size animals.

At the High Quay decision, nearby inspection must make the deep detour, blocked shortcut, low landing deadline and safe staging pier discoverable without camera hunting. Do not add an unsolicited full solution. Show two flood boundaries honestly, including the different outcomes of arrival versus boarding on the boundary action.

The chooser must fit six full-name/portrait options and deal clearly with selecting all eight spaces. A blocked/overcapacity interaction costs nothing and does not alter history or busy state. Preserve deliberate loss forecasts, focus recovery, accessible names and existing native control behavior.

Use existing explicit sheep/rabbit appearance families for the new neighbors. Keep identity stable through reorder, subsets, transfers, Undo and image fallback. Existing rescued characters remain safe.

## 4. The launch and journey boundary

Implement scene `a-wider-deck`, illustration `launch`, cove `wide-berth`. Use the existing shared illustrated player, not another renderer or a new idle text overlay. Exact composition, motion beats and caption are in `direction/LAUNCH_AND_DIFFICULTY.md`.

The larger spare ferry was already prepared at the protected boathouse. Nell is safely home; safe neighbors help launch it. A brief, visible launch demonstrates the wider deck and community progress before gameplay. No construction task, timer, currency or new rescue of the existing cast.

Only accepting the completed Driftwood rescue earns the scene. Playback remains skippable with established autoplay, Pause/Resume, recap, Replay, transcript, Motion and Sound behavior. The final control is **Continue to Wide Berth**; only that deliberate handoff acknowledges the scene and enters the new start. Keep the existing immediate skip-to-end/continuation path; no mandatory animation wait.

Apply `contracts/CAMPAIGN_CONTINUITY.md` completely. Support both exact historical two-cove and three-cove complete records, preserve their stored bytes until deliberate continuation, and present the correct predecessor cove. Generalize the current hardcoded scene predecessor; avoid displaying a future Wide Berth rescue on old saves. Current completion truthfully says four coves are safe, with more of the planned story still to come.

Explicit `?cove=` review/Practice entries remain independent and cannot change campaign progress. Retain cove-boundary checkpoints, storage failure notices and terminal Undo until the rescue is explicitly accepted.

## 5. Canonical continuity and assets

Update PROJECT_STATE, the campaign direction, puzzle progression and scenes to reflect the deliberate C4 calibration and actual implemented four-cove journey. Next remains Orchard Landing/Orin, followed by mixed-size synthesis and later currents. Do not implement those future systems now.

Retain all 78 baseline asset IDs. Extend the existing ferry/story/environment families where appropriate; register only justified new families/variants, with gallery and provenance. Reconcile stale counts and obsolete fallback/status statements against actual source. Preserve accepted music, audio gains, grouped wooden transfer cues, homecoming, lighthouse, Home/Options, water palette and game rules.

Keep implemented source, user acceptance, executed verification and publication distinct. This user acceptance covers Driftwood gameplay, not physical Android, acoustic listening or unresolved earlier defects.

## 6. Verification, evidence and handoff

Complete `verification/ACCEPTANCE.md`. The reference harness proves only mechanics on baseline source. Final checks must load the actual authored level and current production code, not only rerun the proposal.

Capture the real launch and rescue through the interface, including six-space loading, a full or light route decision, subset/staging, both rises, and tide/terminal Undo. Inspect native portrait and short landscape, including full deck, six-option chooser and arrival. Record original failures and material corrections. Evidence must identify the exact source it exercised.

Make routine implementation decisions independently; resolve normal geometry/layout issues rather than asking the user to design them. Report any actual unresolved blocker precisely. Do not weaken tests, alter old puzzles or inflate “passed” claims to complete the checklist.

Commit and push to **m1-first-crossing**, update PR #1 while keeping it **draft**, verify remote equality, and leave **main unchanged**. Do not deploy. Return exact final SHA, concise review, actual source-linked phone evidence and uninterrupted sequence, remaining limits, and local root journey plus direct Wide Berth URLs.
