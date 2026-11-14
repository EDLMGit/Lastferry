# Next task — Phone playability

## Authority, baseline and outcome

This is the active task: **NEXT_TASK_PHONE_PLAYABILITY.md**. Read `AGENTS.md`, `docs/PROJECT_STATE.md`, the relevant current UI/camera code and this file before editing. Earlier task files describe completed work; do not restart their scope.

Repository: https://github.com/EDLMGit/Lastferry  
Branch: `m1-first-crossing`  
PR: https://github.com/EDLMGit/Lastferry/pull/1 — keep draft  
Reviewed and user-accepted baseline: **`80545cbabb0496b215cd56f25cfc0113b056da67`**

The sailing-direction/released-crests correction is complete and accepted. Preserve newer or unrelated local work; do not reset a newer checkout to this SHA. Implement this phone task in the actual game. Make routine design and implementation decisions independently.

The user's feedback is the acceptance target:

> Everything feels too small on the phone. Portrait feels slightly better, but landscape should also work. Add a way to pan/zoom out, a fullscreen option, and keep action confirmations from appearing on the other side of the screen.

Deliver one coherent phone usability pass: a visibly larger play view, an explicit whole-cove overview and bounded panning, comfortable controls, nearby action previews, and optional fullscreen. Both orientations must work in the ordinary browser.

### Confirmed publication handoff

ChatGPT reviewed and published the accepted baseline on **2026-10-24**:

- Live game: `80545cbabb0496b215cd56f25cfc0113b056da67`.
- Stable private URL: https://last-ferry-playtest.abumech.chatgpt.site
- Site source: `382b2d358ddf9fb1cac6cebb7905ae9f25f9fdc6`.
- The same Site identity and owner-private audience were preserved.

This publication contains the accepted sailing correction, **not this phone task**. Update the stale live-version fields in `docs/PROJECT_STATE.md` using this confirmed information. Keep the eventual new implementation SHA separate from the live game until its later publication is confirmed.

## 1. What the current source explains

Use these findings to guide the work; verify locations against your checkout.

| Current behavior | Relevant source | Required change |
| --- | --- | --- |
| Camera fits scenery, every route and the full ferry envelope throughout the network. | `src/scene/world.ts`, framing collection around lines 495–589 | Retain complete-network fitting for Overview; give normal phone play its own readable framing. |
| Landscape reserves a fixed top band and repeatedly reduces scale to avoid the forecast at bottom right. | `world.ts`, `resize()`, around 625–650 | Use measured usable space and compact chrome. Do not shrink the entire world just to preserve a large forecast rectangle. |
| Action dialog explicitly chooses the opposite screen half from the target. | `src/main.ts`, `positionDialog()`, around 639–650 | Anchor action mode near its initiating control and place. |
| Local placement searches the screen and falls back to distant corners. | `src/ui/placement.ts`; `main.ts`, around 813–882 | Give proximity and a stable local fallback priority over avoiding every decorative object. |
| Labels and dock placement are cached mainly by viewport/game state. | `main.ts`, `positionMap()` | Reproject and invalidate appropriately when the camera changes, not only when the viewport changes. |
| Portrait forces a 680px minimum and tells players to turn sideways. | `src/style.css`, phone rules; `main.ts` | Support the actual visible portrait viewport deliberately. |
| The dialog is a sibling of the seascape inside the app root. | `main.ts`, initial DOM | Fullscreen the common app/document root, including dialogs and controls. |

The reviewer independently passed build/typecheck and **173/173 unit tests**. Contributor browser evidence supports **23 distinct passed cases across runs**, not one clean 23-case run. There is no fresh independent physical Android, native-GPU, other-engine or listening result.

## 2. Larger play view, accessible overview and bounded pan

### Two understandable views

**Play** is the default phone view. The ferry, animals and current local action should be visibly larger and easier to read. Preserve the fixed isometric angle and actual world geometry.

**Whole cove** is a deliberate zoom-out for planning. Fit the entire navigable network, every selectable place and the Harbor objective into the usable screen. Keep place selection and inspection usable in this view. The existing complete-envelope fitter is a starting point, not an immutable layout.

Provide a plainly labeled **Whole cove** control and an obvious **Back to boat** action in Overview or after manual panning. These may share one compact control if the current mode remains clear. Return should restore a useful play view; no hidden gesture is required to recover orientation.

Use a visibly closer scale in matched phone comparisons. Start by comparing roughly 1.3–1.5 times the current projected ferry size at 844×390, then choose the actual framing through native-size inspection. This is a design starting point, not permission to crop the active action to hit an arbitrary multiplier. Record the before/after projected ferry dimensions and chosen result at the same state.

### Framing behavior

- Prioritize the active ferry, aboard animals, current pier and the selected local decision. Distant decorative land may leave the Play frame; all destinations remain discoverable through Whole cove.
- Keep the ferry and meaningful course context visible during confirmed travel. Use restrained follow/reframing where needed; do not zoom in and out at every node or follow the ferry's bobbing.
- Selection or a passenger checkbox must not make the camera lurch. If a selected place needs framing, make one deliberate adjustment; avoid a camera/card collision feedback loop.
- A confirmed journey in Overview can remain in Overview. Do not repeatedly switch modes against the player's choice.
- Show the full ferry and relevant passengers at departure, arrival and transfers. Preserve enough water around it to appreciate the accepted crests.
- Camera operations never spend actions, advance tide, change subsets, create gameplay history entries or alter the accepted presentation-pose history.

### Bounded manual panning

Allow dragging the open-water play surface to inspect the cove, within useful level bounds. Keep orientation fixed; no orbiting, tilt, inertia experiment or new camera library is needed.

Distinguish a tap from a drag using a practical movement threshold. Capture/release the pointer correctly. A drag ending over a location must not select it or activate an action. Handle pointer cancellation, leaving the surface and a second pointer without accidental inputs. Gestures beginning on buttons, dialogs or passenger choices belong to those controls.

Back to boat must always recover from pan. The full interaction must also work through visible controls and keyboard; pinch gestures are not required for this pass. Do not globally disable browser zoom.

### Homecoming and recovery

Treat the accepted arrival camera as a bounded presentation on top of the new view system. Fit Harbor, the delivered animals and the completion card coherently. Preserve short-phone and Reduced fallbacks. Closing the ending or visiting Settings must not replay the camera/celebration.

Undo restores the accepted boat heading and gameplay state, and leaves a useful view of the restored ferry. Restart/cove changes discard obsolete camera anchors. Reduced motion uses immediate view changes rather than animated pans/zoom. Do not put camera state in puzzle rules or save an intermediate camera animation as a game-state endpoint.

## 3. Comfortable phone sizing and real viewport handling

Preserve the dark teal, ivory and warm-border palette. This task changes sizing, framing and placement, not the visual theme.

- Make primary action/preview text about **16 CSS px or larger**. Keep secondary labels comfortably readable; do not use tiny text or proportional shrinking to fit more controls.
- Prefer **48×48 CSS px** touch areas for new primary controls where feasible; retain at least the existing 44px targets. Increase the visible marker treatment as well as its invisible hitbox.
- Reorganize the HUD and forecast so they use less of the scarce landscape height. Keep objective, load/depth, action/tide state and urgent rescue warning available and understandable. A compact summary may open the existing detailed forecast.
- Use measured HUD/card bounds and real safe insets. Remove the assumption that every portrait viewport needs fixed 198px top and 150px bottom reservations.
- Fit the actual visible viewport. Handle browser bars, display cutouts, orientation changes and fullscreen with suitable dynamic viewport sizing, safe-area insets and resize observation. Avoid a fixed minimum height that pushes the game or Confirm below the screen.
- Keep landscape at **844×390, 780×390 and 780×320** usable without fullscreen. Support portrait at **390×844 and 360×740** deliberately. Remove the compulsory-sounding sideways instruction once both orientations work.
- Let long panel contents scroll internally with the action footer reachable. Do not create horizontal page overflow or hide a choice behind the browser chrome.

UI reflow and camera framing should share one usable-rectangle model. Account for canvas/page offsets consistently and do not subtract the same HUD or safe inset twice.

## 4. Keep action previews beside the action

Remove the opposite-side policy for **action mode**. Use the initiating control plus its associated place as the anchor:

| Action | Anchor |
| --- | --- |
| Board / Let ashore / Bring home | Pressed dock action and current pier/ferry |
| Risky Sail requiring confirmation | Selected destination and its local action card |
| Wait preview | Wait control |
| Keyboard activation | Actual focused control/associated place, with a visible focus return target |

Try adjacent above/below/side positions, flip locally, then clamp within the usable screen. Keep the selected place visibly connected to the surface. Permit the card to cover unimportant water or scenery instead of protecting every object and sending it across the map.

If a local floating surface truly cannot fit, use a deliberate compact sheet at the nearby edge: same side in landscape where possible, and a reachable bottom sheet in narrow portrait. Keep the place/action name and an unambiguous visual association. Do not shrink text or silently choose a far corner.

Keep placement stable while passenger subsets change. Use a concise header, the passenger choices/consequences and a visible Confirm/Cancel area. Preserve the existing semantics:

- Ordinary safe **Sail already commits from the local card**; do not add a second confirmation.
- Subset transfers, Wait and losing alternatives retain their appropriate preview/confirmation.
- Inspection/cancel remain free and preview never mutates committed state.
- Loss warnings, depth comparisons and action cost remain clear.
- Preserve modal focus trapping, Escape/back behavior and return to the initiating control or a deliberate replacement when it no longer exists.
- Opening/closing touches must not fall through to a new Confirm or the map. Retain the existing repeated-input safeguards.
- General Menu/Settings/forecast/ending surfaces can use their appropriate stable layouts; do not force every dialog to follow a world point.

Rotation, a browser-bar change or fullscreen entry/exit while a preview is open must retain the selected action and passenger subset, remeasure placement, and keep Confirm reachable without spending a turn.

## 5. Optional fullscreen

Provide a discoverable **Fullscreen / Exit fullscreen** control through the compact controls or Menu/Settings, without crowding the game. Use a real user-activated Fullscreen API request.

- Target `#app` or another root containing the scene, HUD, local controls and `<dialog>`. Do not fullscreen only the WebGL canvas or `#seascape`.
- Reflect actual `document.fullscreenElement` state through `fullscreenchange`, including browser/OS exits. Do not assume a request succeeded.
- Catch rejection and handle unavailable support with a brief nonblocking explanation. Ordinary browser play must remain functional.
- Call the request from the user's activation; do not attempt automatic entry on load or after an unrelated await that loses activation.
- Preserve puzzle state, action/subset selection, motion preference and audio state. Recompute the usable rectangle, renderer size, projection and overlays on entry/exit.
- Do not require orientation lock, PWA installation, keyboard lock, special permissions changes or a new hosting service.
- If a browser exits fullscreen on navigation/cove reload, reflect that state rather than silently trying to re-enter.
- Record real API results separately from mocked lifecycle tests. A headless simulation is not physical Android approval.

Use the published Site directly in a browser for the eventual phone test; embedded hosts may apply different fullscreen policies. Do not change the Site's audience or hosting policy for this task.

## 6. Integration requirements

Keep one authoritative camera/view state. Every visible camera change must update camera projection, scene picking, DOM markers/names, dock controls, leaders, local/action anchors and the water view coherently.

The existing label/dock caches and `positionMap()` scheduling do not yet account for continuous camera movement. Add a camera revision/notification or equivalent; simply changing the Three.js camera will leave controls detached. Reuse cached world bounds and schedule layout efficiently instead of traversing all geometry or performing repeated full-document measurements on every pointer event.

Update intentional old test contracts. Assertions that every object is always in frame belong to **Whole cove**; normal Play must prove that active subjects/actions are visible and the rest is recoverable. Retain alignment, safety and accessibility coverage rather than deleting tests that expose mistakes.

Preserve all three puzzles, rules, subsets, action ordering, complete Undo, accepted stop/berth headings, released-wave behavior, sailing budget, water/shallow treatment, music/wood/victory mix and lighthouse timing/appearance. Relevant camera/UI integration may change, but do not redesign those systems. No new level, mechanic, art overhaul or audio pass.

## 7. Focused verification and review evidence

Run Node 24 build/typecheck and unit tests. Add meaningful tests for new camera bounds, placement or gesture logic where they protect real behavior; avoid tests that merely mirror constants.

Use focused browser checks tied to these risks:

| Coverage | Required evidence |
| --- | --- |
| Phone scale and layout | Matched native before/after ordinary-play captures at 844×390 and 780×320, plus portrait. Report ferry screen dimensions, visible text/control sizes and actual viewport. |
| Real play | Complete a Holding rescue through actual UI in landscape and portrait, including a subset and tide Undo. Exercise Bellwater's outer course/selection and First Crossing smoke. |
| Local confirmation | Board/unload, risky Sail and Wait near left/right/bottom edges; passenger toggles do not move the panel across the screen. Record anchor and panel rectangles for representative cases. |
| Camera and input | Whole cove reveals all places; pan/return/overview do not change state/history; pan ending over a target does not tap it; camera/marker/picking alignment remains correct. Keyboard can reach offscreen places through a deliberate framing/Overview behavior. |
| Resize lifecycle | Portrait↔landscape with a selected place, an open subset preview and during a journey. No lost subset, duplicate action, stranded control or stale anchor. |
| Fullscreen | Actual entry and exit where supported, external/browser exit, rejection/unavailable fallback; scene and dialogs remain visible. Clearly label any mocked checks. |
| Existing lifecycle | Terminal Undo/redelivery, Restart, cove change, Reduced, arrival/Settings and preserved audio lifecycle. Target affected paths rather than rerunning unrelated historical coverage repeatedly. |
| Desktop | 1440×900 smoke: controls, keyboard, view modes, dialogs and arrival remain coherent. |

Capture one short natural-speed whole-interface phone sequence showing selection, a nearby subset preview, Whole cove/Back to boat, panning and a crossing. Include rotation and fullscreen evidence where the environment supports them. Commit selected native screenshots and a compact animated excerpt that reviewers can actually open; retain full originals locally if large and state their availability accurately.

Compare before/after on the same device/emulation settings, state and motion preference. Distinguish touchscreen emulation, real touch actions, software rendering and physical Android. Keep original failures and document affected reruns. No claim of all-browser or physical-device performance without corresponding evidence.

If camera/layout changes cause a demonstrated performance regression, address that concrete regression. Preserve bounded resources; do not add broad optimization infrastructure.

## 8. Finish and handoff

Update `docs/PROJECT_STATE.md`, `STATUS.md` and a review under `reviews/phone-playability/`:

- Mark sailing-direction/released-crests accepted and the published baseline accurately.
- Describe the selected phone camera/overview/pan behavior and local-panel fallback.
- Include actual viewport/fullscreen results, screenshots, executed commands, original failures and known limits.
- Record final implementation identity separately from the live Site.
- Keep further unspecified feedback queued; do not invent additional features.

Commit and push to `m1-first-crossing`, update PR #1 and keep it draft. Leave `main` unchanged; no force-push or merge. Return the exact final SHA, remote equality, working-tree state, review and media links, verification results and honest limits.

**Local Codex completes this implementation and handoff. ChatGPT reviews the new SHA and then publishes it to the existing private phone Site. A GitHub push alone does not deploy it.**

## Implementation references

Primary documentation consulted for this brief:

- [MDN: requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen) — user activation, asynchronous results and access restrictions.
- [MDN: Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) — actual state, entry/exit and change events.
- [web.dev: sizing units](https://web.dev/learn/css/sizing) — small, large and dynamic mobile viewports.
- [MDN: VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) — visible viewport dimensions, offsets and changes.
- [MDN: setPointerCapture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture) — gesture ownership through drag and release.

These references guide browser integration. The phone composition and acceptance choices above are the game's design decisions.

