# ARRIVAL_BUBBLE_01 — a centered mobile homecoming

## Outcome and source

Replace the successful end-of-cove utility panel with a **centered floating celebration card**. Make the three lanterns prominent, show the actual rescued animals together, and give the main actions clear original icons. The user positively received the last two levels and lantern mechanic and supplied three visual references; the third, a centered framed result with a character showcase and large bottom actions, is their preferred structural reference.

Build this in the actual game. Preserve Last Ferry's coastal identity: rounded deep teal surfaces, warm ivory text, sea-glass secondary controls, brass/amber lanterns, a restrained timber or rope detail and the existing animal portraits. Use the references for hierarchy and shape; author our own frame/icons and retain our characters, palette and typography. No stock screenshot, generic stars, coin rewards, social/share bar or fantasy-character artwork belongs in the runtime.

Reviewed implementation: `291d8f2a9570d833709e10815db12bd5c1fe75cc`, on `m1-first-crossing` in `EDLMGit/Lastferry`. Incorporate this task/review commit safely, preserving newer or unrelated work. Do not reset or force-push.

Read `AGENTS.md`, active `docs/PROJECT_STATE.md`, `docs/ART_DIRECTION.md`, `docs/DIFFICULTY_AND_MASTERY.md` and [the independent Ternhaven review](reviews/cove-eight-practice/INDEPENDENT_REVIEW.md). Inspect terminal rendering/positioning in `src/main.ts`, `src/ui/lanterns.ts` / CSS, `src/ui/cove-ui.ts`, `src/game/passenger-appearance.ts`, native dialog/fullscreen ownership and the asset catalog.

Local Codex implements this contained pass and hands it back for review. Choose routine composition and implementation details independently. **No cove, Journey chapter or puzzle rebalance is commissioned.**

## 1. One readable arrival composition

The result must read as a small mobile-game homecoming, with deliberate hierarchy:

| Area | Content and direction |
| --- | --- |
| Reward crown | Three large original lanterns, visibly lit or unlit for the **current rescue**. A shallow arch or slightly raised center lantern may frame the card. |
| Heading | “Everyone home.” and the actual cove name. Keep any established meaningful cove-specific greeting where suitable. |
| Rescued group | A close, welcoming arrangement of every required rescued neighbor, using the existing correct portraits and short names. A small harbor rail or painted recess can unite them. |
| Result | One compact line for final actions and successful Undos. A better accepted best remains distinct from the current rescue. |
| Main actions | A prominent warm forward/cove action and a clear Replay control with an original looping-arrow icon. Keep short visible labels. |
| Utilities | Reachable Undo and Settings, a clearly named Close control, and a quiet Details disclosure for criteria/best/persistence information. |

Avoid repeating the rescue count, action count and result in multiple paragraphs. Move the existing explanatory policy prose into Details where it remains accessible. Show a storage-failure notice clearly when applicable; do not hide an actual persistence failure behind celebration decoration.

Use the current result as the reward source. An older three-lantern best must not light three lanterns for a current one- or two-lantern run. Keep every ordinary rescue warm and complete; an unearned lantern indicates an optional replay goal.

### Original reward and action art

The current result lanterns are only 22×26px. Author a larger, richer result treatment with readable brass body, glass and light, while preserving the compact Practice badges. Use the existing lantern family as the design foundation. At native phone size the reward must be recognizable without reading “3 of 3”; provide equivalent accessible text and lit/unlit distinction beyond color.

Reuse the accepted icon system for Continue, cove choice, Settings, Undo and Close. Add one original **Replay/Restart** icon visibly distinct from Undo and register it properly. A big curved replay arrow restarts the crossing; the existing Undo arrow returns to the previous action. Do not use emoji, Unicode stand-ins or a new icon library.

Use actual semantic buttons. Primary controls should retain comfortable roughly 48px-or-larger hit areas and legible labels; decorations do not count as hit areas. Icon-only Close/Settings controls need accurate accessible names. Keep the utility hierarchy calm and avoid treating every option as equally prominent.

## 2. Show the whole rescued cast

Build the showcase from the real won state and `level.objective.requiredPassengerIds`, with stable identity/appearance resolution. Use `portraitSources` and `resolvePassengerAppearance`; do not infer color from array order or substitute a generic species image.

**Include neighbors delivered on earlier trips.** Ternhaven's cast is Juniper (deer), Sedge (sheep), Fennel (tan rabbit) and Willow (beaver). Sedge is already home before the final Juniper/Fennel/Willow unloading. A showcase derived only from the last transfer would omit her.

Preserve real names and appearances across all nine Practice coves and their matching Journey entries. Compose three-, four- and six-animal groups deliberately. Use two rows when needed; keep faces and short names recognizable, with no face hidden behind another. This is a presentation of the completed rescue, not a transfer chooser: omit capacity badges, selection checkboxes and boarding controls.

Reuse the existing portraits, whose 256px sources support this size. Keep original animal proportions and species/appearance identity. No second WebGL canvas, new species, generated replacement characters or re-rendered model pipeline is required. Handle pending/failed image loads with a named stable fallback rather than a collapsed or empty result.

The source arrival partly hides the sheep behind the beaver in 3D. The portrait group gives every rescued neighbor a clear place. This pass does not require a global Harbor seating or landing-geometry overhaul.

## 3. Center it in both phone orientations

Use a **won-terminal-only placement branch**, centered horizontally and vertically in the existing measured safe visible rectangle. Preserve viewport offsets, browser chrome/safe areas, rotation and fullscreen support. The visible frame and reward crown must fit within those bounds. Keep clear space around the bubble so the sea and Harbor remain present.

| View | Composition |
| --- | --- |
| Portrait, 390×844 and 320px-wide | Stack reward crown, title, rescued group, concise result and actions. Retain a floating card with side margins. |
| Short landscape, 780×320 | Recompose within a wider centered bubble, with the crew and rewards/actions in two balanced groups. Keep primary actions visible without scrolling the whole card. |
| Larger landscape / desktop | Cap the card's width and maintain the same visual hierarchy; do not stretch it across the screen. |

Keep the default closed-details state compact. Expanded Details can use bounded internal scrolling if needed, with the primary controls reachable. Reflow groups and spacing before making names or touch targets too small. The default result must not fall back to the old corner panel or a bottom sheet.

Dim the surrounding game modestly through the existing dialog surface. While the arrival is open, suppress competing play controls and the lingering last-action receipt/toast visually, keeping the native dialog's input isolation. Restore the appropriate settled-world presentation when the card closes and normal gameplay when Undo resumes play. Leave ordinary local action previews and their nearby transfer sheets intact.

### Stable Harbor framing

`positionDialog()` currently passes terminal bounds to `world.setCompletionBounds()`, which can reframe Harbor into a free side region and affect the arrival camera push. A centered card changes that geometry.

Keep the card's measured outer bounds stable. Confine any entrance motion to inner visuals so the camera does not chase an animated rectangle. Make the smallest won-only adjustment necessary to keep a coherent Harbor backdrop; do not squeeze the whole 3D Harbor into a thin leftover strip just to expose every model behind the bubble. The clear portrait group carries rescued identities. Preserve ordinary camera, water, picking and the accepted sailing presentation, and restore canonical framing before Undo gameplay.

## 4. A brief, cancellable celebration

Keep the existing visible-final-unloading event, homecoming gesture, lighthouse sweep, arrival sound and music ducking as owners of the rescue moment. Introduce no new audio composition or score timing.

A gentle card settle and a short one-time lantern illumination may reinforce the result. Controls work immediately; there is no mandatory animation delay. Keep outer layout stable and avoid an endlessly bobbing card, repeated glints or a long confetti sequence. Reduced Motion shows the settled result immediately.

Opening Settings, closing/reopening arrival, rotating, hiding/recovering or fullscreen promotion must not replay the reward sequence, reset Undo history or award anything. Terminal Undo cancels unfinished celebration work; a genuine subsequent redelivery may present the newly calculated result once. Never attach result acceptance or celebration ownership to generic dialog open/close events.

## 5. Preserve action and acceptance semantics

Keep the existing native `<dialog>`, shared Sound owner, fullscreen promotion, focus restoration, input fences and actual handler ownership. Initial focus should make the primary continuation discoverable; Settings/Back and return-to-arrival preserve sensible focus.

| Action | Required behavior |
| --- | --- |
| Journey forward action | **Continue story** uses the existing actual continuation; preserves the seven-cove endpoint. |
| Practice forward action | Keep the real existing route: **Choose a cove**, or the existing special Next cove route where already supported. No arrow invents a new Journey chapter. |
| Replay | Existing successful Restart behavior: accept any pending legitimate result once, then start a fresh attempt. Keep existing confirmation behavior where it applies. |
| Undo | Complete terminal Undo, including passenger state, tide/outcome and successful-Undo history. Redelivery recalculates the same attempt. |
| Close / Escape | Dismiss only; do not accept the pending result or story progress. Arrival remains reopenable. |
| Settings / Back | No result acceptance, duplicate sound or reset. |
| Open/cancel cove chooser | No acceptance merely from opening or cancelling. Actual cove navigation retains its existing acceptance boundary. |
| Confirmed Home | Retain actual Home acceptance and existing confirmation behavior. |
| Rotation / visibility / fullscreen | Preserve state and provisional result; no acceptance or new attempt. |

Do not add a new save/claim-reward button. Keep complete Undo available and preserve a previously accepted best while a different run remains provisional. A partial Harbor delivery must not show a completed rescue card. Restored or synthetic Harbor backgrounds must not create a live completed attempt, show an earned-result card or award mastery. Clearly labeled isolated renderer fixtures remain permitted for bounded visual coverage.

Preserve failure-screen behavior and local gameplay menus; this is a successful-arrival pass. Shared changes must not introduce centered action previews or a celebration on a loss.

## 6. Register Ternhaven's accepted target

The user positively received the latest levels, and a fresh independent execution reproduced the 13-action minimum plus the two distinct 14-action strategies. **Accept target 14, revision 1** so Ternhaven participates in the same lantern result:

`ternhaven: { revision: 1, target: 14 }`

This is the sole new rating entry. Keep the other eight targets/revisions and all existing stored bests unchanged, including Orchard target 13 / revision 1. All three legitimate Ternhaven witnesses qualify for efficiency.

Earlier unscored Ternhaven rescues have no stored action/Undo history. Do not backfill fictional scores; a new scored replay earns the first best. Practice remains separate from Journey. Keep generic unscored-cove fallback support and tests even though Ternhaven now graduates from that state.

Update the Ternhaven-specific null-result assertions and eight-target list expectations in the focused tests. Preserve the independent unscored fixture and its no-write/null-result coverage. A target-table entry must not accidentally invalidate existing mastery data, accept a historical win or change any puzzle/witness file.

The existing mechanical audit remains runnable after registration, but its recorded `unscoredResult` field comes after terminal Undo/redelivery. Rename that output label accurately if updating the report; it should then describe a two-lantern result with one successful Undo. Keep graph/witness/counterfactual logic unchanged. Preserve the old audit output as history and identify any new run separately; include `src/game/mastery.ts` in source hashes for any new scoring-provenance claim.

## 7. Verification and review evidence

Use Node 24. Run production build, standalone TypeScript, asset validation and the focused arrival/mastery/Session/Practice/progress checks. Expand only for a demonstrated shared regression. No new puzzle search or full campaign replay is needed; Ternhaven's independent proof is retained and its puzzle stays unchanged.

Verify the changed risks:

- Current one-, two- and three-lantern results, including a better prior best; no duplicated metrics or wrong lanterns.
- Ternhaven target14/revision1: all three 13/14-action witnesses qualify; successful Undo gives two lanterns within target; old accepted bests remain readable; no invented old Ternhaven score.
- Actual rescue through real controls in portrait and short landscape, including at least one minified-production run. Use Ternhaven for its early-delivered Sedge and a scored Journey cove for real Continue story.
- Terminal Undo/redelivery, close/reopen, Settings/Back, chooser cancellation and actual navigation/restart acceptance. Confirm no result writes occur at dismissal-only boundaries.
- Native `390×844`, `780×320`, `320×740` and a desktop smoke view. Inspect centering, complete reward crown, faces/names, action labels, expanded Details and reachable controls.
- The largest existing six-neighbor cast using real level/state data. Fixtures can cover bounded UI variants, but clearly label them and do not substitute them for required actual rescues.
- Initial/loading/failure portrait fallback; natural keyboard focus; Reduced Motion; rotation and actual fullscreen entry/exit without duplicate celebration, hidden dialog controls or camera jumps.
- Preservation of seven Journey identities, original-byte backups, Practice isolation, all nine level/witness contracts, accepted audio/water/ferry and generic unscored support.

Capture actual in-game before/after native result frames in both principal phone orientations, plus one uninterrupted short final-approach → arrival → interaction sequence with runtime audio. Show the settled card, large lanterns, all rescued identities and the recovery/reopen behavior. Record source/build identity, exact commands, original failures/affected reruns and capture limits. State-only assertions and reference mockups cannot establish the new visual result; distinguish supplied/emulated images from physical Android or listening approval.

Update catalog/gallery/provenance for the result panel, larger lantern treatment, rescue portrait composition and new replay icon. Reuse existing families where appropriate and preserve prior accepted IDs. Do not prescribe a family count in advance.

## 8. Handoff and publication boundary

Update `STATUS.md`, active project state, art direction and mastery documentation with what actually shipped. Keep earlier tasks/reviews/publication receipts as history. Add `reviews/arrival-bubble/REVIEW.md` with native comparisons, runtime evidence, lifecycle/scoring checks and remaining limits.

Commit and push normally to `m1-first-crossing`, verify the final remote SHA and update PR #1 while keeping it draft. Leave GitHub `main` unchanged. Do not deploy or change Site access; ChatGPT reviews the new build before publication under the established workflow.

The recorded live Site remains version 20, game `9c7a05785a021538c996f5dcd4b03415d1a35080`, hosting source `ffc5eebfd8520735b231ffe6fedf1b3a54757f9a`, with its existing custom private audience. This task changes the result presentation and registers the accepted Ternhaven target; it adds no Journey content or save migration.

Return the exact SHA, concise visual/behavior summary, tests and remaining limits, review and native phone evidence, uninterrupted recording, local root URL and Ternhaven URL.
