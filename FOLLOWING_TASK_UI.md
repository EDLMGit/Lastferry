# Last Ferry — place names, light markers and dock actions

## Sequencing

This is the separate interface pass after the audio task in `NEXT_TASK.md`. Keep the audio polish intact. Use the branch's reviewed current head when this pass begins; do not reset to `a4fc465` or overwrite newer work.

Goal: make interaction belong to the cove while preserving the clarity and safety gained in the accepted selection flow. The user dislikes large pale panels and map-button labels. Their suggested hovering arrows mean controls floating near the boat, fully usable by touch. Nothing depends on mouse hover.

Continue on `m1-first-crossing`, keep PR #1 draft, and preserve main. Read repository instructions, the current selection/placement logic and the most recent phone feedback. Use existing DOM/CSS/SVG overlays and projected world positions. No extra rendering framework or postprocessing is needed.

The in-chat generated concept is a mood/layout reference only. It is not runtime evidence or a literal implementation blueprint. The production rule helpers remain authoritative for all action availability, warning copy, tide numbers and consequences. Do not use the concept as a clickable background or replace the actual 3D game.

## 1. Island names and selectable light markers

Replace large pill-shaped island-name buttons with freestanding names near their islands/piers and a separate compact light marker at the actual route endpoint. Harbor keeps a quiet Home identity related to the lighthouse. Buoys and route-only stops retain readable names too.

Keep one semantic, focusable control per place. The visible name may be a span within that same borderless control or label its marker; the name and marker must not create duplicate Tab stops. Tapping the name or its associated hit area can select the same place for free. Preserve existing island, pier, landmark and ferry picking.

The marker's visible circle may be small. Its real hit area must stay at least 44×44 CSS pixels, preferably 48×48 where space permits. Transparent hit areas must not overlap other targets or intercept unrelated controls. Do not shrink the interaction target to the visible dot.

Keep names and markers stable during tide, hover and selection. Reuse placement exclusions and project from the existing geometry; do not hardcode a special layout for every cove. A local dark halo/backing is allowed for readability over water and sand, without restoring the large opaque button shape.

| State | Visual direction |
| --- | --- |
| Ordinary | Fine seafoam ring and quiet center |
| Selected | Warm outline and restrained glow |
| Ferry's current stop | Filled center or double ring, distinct from selection |
| Too shallow | Slash or blocked symbol plus inspection text |
| Flood consequence | Amber warning mark plus the real written consequence |
| Remote | Inspectable quiet marker; no implication of available travel |
| Harbor | Persistent modest Home cue connected visually to the lighthouse |

Use shape/state indicators as well as color. Motion is optional decoration; keep touch targets stationary. Avoid continuous bobbing or repeated pulsing that competes with the water. Respect reduced motion.

## 2. Selection and travel remain deliberate

Tapping a place or marker selects and inspects it for free. It does not immediately sail. The accepted rule/preview helpers still determine adjacent, blocked, remote and risky states.

For a selected reachable destination, show one compact dark route callout with the necessary depth/tide consequence and an explicit `Sail · 1 action` control. A directional arrow may accompany the verb. Blocked/remote places show the reason without inventing an action. Preserve the existing confirmation for a losing move.

Do not place a newly revealed Sail control under the opening touch point. Keep the existing explicit-intent, same-control pointer and repeated-input protections. One selection must not accidentally become an action through double-tap, held Enter, pointer release or modal dismissal.

## 3. Boarding and unloading live beside the ferry

When the idle ferry is docked at a usable pier, show compact local controls near the gangplank for the available transfer directions:

- `Board`: arrow from shore toward ferry.
- `Let ashore`: arrow from ferry toward pier.
- `Bring home`: Harbor unloading, with a restrained Home cue.

Show a short verb alongside the directional graphic; direction alone is ambiguous in this camera. The controls should be available without opening a large current-location card first. Current-place inspection can still show its facts when requested.

Clicking a transfer arrow opens the existing passenger-subset preview. Preserve explicit selection of passengers, forecast consequences, errors, tide timing and `Confirm · 1 action`. Do not silently transfer everyone or skip a risky-subset warning.

If both directions are meaningful, show separate controls with non-overlapping hit areas. Hide or make the transfer controls inert during travel and modal presentation. A flooded pier must not advertise boarding/unloading; it still permits the existing departure behavior and explanation. Anchor stable controls near the dock/ferry without covering the passengers or boat.

## 4. One consistent palette for panels

Develop the existing teal location-card palette across the HUD, forecast, Menu, passenger choices, action preview and ending:

- Deep blue-green panel surfaces, starting around `#103a45`.
- Warm ivory text, starting around `#fff3d9`.
- Fine warm-sand/brass borders, starting around `#efd09b`.
- Seafoam for ordinary actionable emphasis; warm amber for selection and clearly differentiated warnings.

These are starting colors, not a contrast guarantee. Text-bearing surfaces need enough opacity over the brightest water/sand. Use a dark translucent fill and local highlights to create the transparent feeling without sacrificing legibility. No backdrop blur or new scene lighting is required.

Keep the current information content and hierarchy initially: objective, boat depth/load, actions/tide/home count, Undo, Wait, Menu and sound. The task changes visual presentation and local transfer launchers; it should not simultaneously invent a new navigation system or hide essential puzzle facts.

When the passenger modal opens, suppress the redundant location/action card beneath it. Retain the logical selection. Closing/cancelling restores the relevant dock trigger or a safe focus fallback, without click-through or spending a turn. One Escape closes one layer.

At success, use a restrained dark panel that leaves Harbor and the rescued animals visible. Keep `Everyone home`, one clear progression action where available, and reachable Undo/Restart. Do not add stars, scores, confetti or progression systems. Preserve the newly polished arrival audio and its timing.

## 5. Mobile and accessibility constraints

- Preserve the short-landscape `min-height` correction and assess 844×390 plus 780×320. Bellwater's six stops must be covered, not only Holding's simpler map.
- Use at least 44×44 CSS-pixel actual targets, preferring 48 where practical. Keep ordinary essential control text at least the existing 14 px baseline.
- Meaningful icon/state/focus cues should achieve at least 3:1 against adjacent colors; ordinary text should achieve at least 4.5:1. Check the resulting composited colors over representative bright and dark scene regions. A faint glow alone is insufficient.
- Retain native semantic buttons, accessible names/states, natural Tab/Shift+Tab/Enter/Space, modal focus and restoration. Do not create extra invisible focus stops or let scene picking bypass a dialog.
- Preserve the placement exclusions for ferry, waiting animals, important landmarks, other selectors, global controls and opening touch point. Short screens need compact presentation, not hidden essential controls.
- Incorporate actual browser-bar/cutout problems if the user's Android test supplies them. Safe-area adjustments should be narrow and verified. Do not add a speculative PWA/native wrapper or graphics-settings system.

## Verification and handoff

Run the production build/typecheck, unit suite and focused selection/placement/modal/input checks affected by this pass. Do not write tests that merely repeat CSS values; verify reachability, selection-versus-commit behavior, focus and actual game consequences.

Inspect native-size screenshots at both phone sizes for: ordinary Holding and Bellwater; dock transfers; safe travel; shallow and remote inspection; critical boarding subset before the rise; modal cancellation; flooded-pier departure; and success. Include one normal desktop sanity view. Keep evidence compact and tied to source.

Complete a real-interface rescue, tide Undo/replay and terminal Undo. Check rapid repeated input, natural keyboard and touch, including a selection that reveals a nearby action. Confirm no target overlap, click-through or accidental turn use. Preserve all three puzzles and prior audio behavior.

Update `STATUS.md` and relevant UI/art documentation, then write a compact report under `reviews/cove-interface/`. Keep original failures and disclose unavailable device coverage. Commit/push normally on the existing branch and update draft PR #1. Return the exact SHA and selected evidence.

The private Site is updated separately from a reviewed commit. Keep the same existing project and URL. A GitHub push alone is not a successful deployment.

## Primary design references

- [W3C target size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html): 44×44 CSS pixels is the AAA enhanced criterion, adopted here as the game's practical baseline; do not mislabel it as the universal AA minimum.
- [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): meaningful controls and state indicators need sufficient contrast, including thin rings.
- [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): ordinary text contrast, relevant to translucent panels over changing scenery.

These references constrain usability. The cove palette, names, dock arrows and composition are the game's art direction.
