# Last Ferry — Cove interface and asset inventory

## Current task and outcome

Implement this file as the current task. Apply a small, coherent family of original interface assets to the existing game, and establish an accurate asset inventory that grows with it. The player should feel that the controls belong to the same miniature cove as the ferry, piers and lighthouse: softly rounded, matte, lightly raised and easy to read on a phone. Keep the water and animals visually dominant.

The supplied `cove-ui-package/` contains editable SVG candidates, shared surface CSS, a style guide, a visual specimen, and an audited catalog seed. Use these as implementation inputs. They are new design candidates, not gameplay screenshots or already-integrated runtime code. Refine them against actual gameplay if necessary and record material changes.

Complete the inventory, reusable assets, integration and focused verification in this task. Do not stop after documentation or a gallery. Make routine decisions independently.

## Baseline and publication identity

- Repository: `EDLMGit/Lastferry`; branch `m1-first-crossing`; PR #1 stays draft; main remains unchanged.
- Reviewed game and starting baseline: `8052cfcd67f2e56cf3258243618c4ce125d51c4b`.
- This game was published to the existing private Site as **Sites version 10**, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`.
- URL: `https://last-ferry-playtest.abumech.chatgpt.site`.
- The user now reports that everything works well. Carry this feedback forward as acceptance of the current playtest build and its audio/fullscreen improvement; do not infer a complete device/browser matrix.
- The repository's previous deployment prose still describes version 9. Reconcile `docs/PROJECT_STATE.md` with this confirmed version 10 publication before writing new handoff details. Keep GitHub game SHA and Site source SHA separate.

Read `AGENTS.md`, `docs/PROJECT_STATE.md`, `docs/ART_DIRECTION.md`, `docs/ASSET_PLAN.md`, `docs/ASSET_LEDGER.md` and the current UI/audio/fullscreen sources. Inspect the current game, not only the supplied specimen. If the branch has newer work, inspect and preserve it rather than resetting to this SHA.

## 1. Carry the cove's materials into the interface

Follow `cove-ui-package/STYLE_GUIDE.md` and the actual miniature palette. Use matte sea-green painted surfaces, soft cream lettering where appropriate, dark ink on light action faces, and a small amount of warm lantern color. Borrow the thick rounded edges and shallow relief of the ferry and pier materials.

Create a restrained shared surface family:

| Surface | Use |
| --- | --- |
| Round utility control | Close, sound, small familiar utilities; a stable 48px phone target where space permits |
| Labeled capsule | Board, Let ashore, Bring home, Sail, Wait, Undo, view controls and confirmation |
| Quiet panel | Location options, passenger preview, forecast, Menu and Settings; one soft outer frame |
| Inset choice | Passenger selection, with a clear check/selected state and its name/space cost |
| Small name backing | Existing freestanding location names, retaining their relationship to the marker |
| Warm objective treatment | Harbor's lighthouse/Home identity and primary arrival/progression action |

The supplied CSS is a starting surface implementation, not permission to bypass the existing measured layouts. Use semantic tokens and a shared component helper instead of copying independent SVG/CSS fragments into each renderer. Keep current system body fonts and Georgia title treatment so this pass does not introduce a font-loading or remeasurement problem.

Use a shallow lower edge, a subtle top highlight and a soft contact shadow. A press may compress the inner face or shadow slightly; the measured button/hit target must remain stable. Remove redundant nested frames. Transparency belongs mainly at the perimeter; text needs a substantial dark backing over bright shallows and Harbor reflections. Avoid broad pale/white panels, strong blur, heavy grain, oversized ornaments, or looping button motion.

## 2. Apply the custom icon language without obscuring meaning

The package includes 18 original 24×24 SVG candidates, their symbol sprite and provenance manifest. Use a single runtime source of truth: either import individual SVGs through the existing bundler or generate an icon map/sprite from them. Do not maintain hand-edited copies of the same paths in multiple renderers. Keep the source paths editable and local.

| Player control or identity | Icon and required meaning |
| --- | --- |
| Board | Ferry with arrow toward the deck; visible **Board** text |
| Let ashore | Same ferry with arrow away from the deck; visible **Let ashore** text |
| Bring home at Harbor | Unload family with warm emphasis; visible **Bring home** text |
| Harbor · Home | Lighthouse silhouette; identifies the rescue destination |
| Back to boat | Ferry inside framing corners; camera recentering only |
| Whole cove / Play view | Cove overview versus closer ferry view; action label follows the real mode |
| Sail | Ferry/travel mark; destination and existing action cost remain readable |
| Wait | Hourglass; keep **Wait · 1 action** and existing confirmation consequences |
| Undo | Curved return arrow, clearly distinct from Restart |
| Menu / Settings / Close | Quiet utility variants, recognizable shapes and accessible names |
| Sound | Distinct playing, muted and retry visuals; current explicit Enable/Retry/Mute intent remains authoritative |
| Fullscreen | Enter/exit frame icons determined by actual fullscreen state |
| Confirm / Next cove | Strong primary capsule; retain the action/level wording and existing semantics |

Use **Unload** as the asset/implementation term and the current **Let ashore / Bring home** player wording. “Drop” must not suggest discarding an animal or placing it in the water. Harbor/Home, camera recentering, and Menu are separate meanings.

Keep visible words for puzzle decisions. Icon-only treatment is appropriate for a small familiar utility only when its accessible name and touch discoverability remain clear. Retry must remain visibly recognizable. Do not put text inside an image or SVG. Put decorative SVGs inside native controls with `aria-hidden="true"`, `focusable="false"` and no independent pointer target.

Freestanding map names plus marker remain one semantic selection button and one Tab stop. Retain current/selected/remote/too-shallow/flood-risk shape and written distinctions; the new surface cannot make a blocked passage look safe. Do not add a second Home control that teleports or spends an action without preview.

## 3. Integrate with the working phone interface

Apply the family across the HUD, map selection, dock controls, location options, subset preview, forecast, Menu, Settings and completion. Keep compact existing action placement. Preserve the larger Play framing, Whole cove, bounded pan, Back to boat, nearby preview anchoring, short-landscape placement, portrait bottom sheet and measured safe viewport offsets. Do not make the ferry smaller to fit decorative UI.

Use **48px** main phone targets and keep existing **44px** constrained utility/marker targets as a floor. Glyphs are usually 24px, sometimes 28px. Essential action text remains approximately 16px at phone size. These are project sizing choices, not a claim that every accessibility criterion is automatically satisfied. Aim for normal text contrast at least 4.5:1 and meaningful icon/state contrast at least 3:1 against actual adjacent backgrounds. Check alpha compositing and gradients, not just token pairs. Focus needs a contrasting keyline on both light buttons and dark panels.

### Known integration points that must be handled deliberately

1. **`positionMap()` rotates `.dock-arrow`.** A complete ferry/lighthouse pictogram must not inherit that rotation. Keep a fixed semantic transfer icon, or rotate only a separate directional cue. Test both accepted berth headings and more than one pier.
2. **`renderSound()`, `renderFullscreen()` and `renderView()` currently replace button `textContent`.** Update an icon/label child through a shared helper while preserving the button node, stable IDs, focus, intent data and accessible labels. Re-rendering must not erase icons or invert a pending sound action.
3. **Completed touch audio and explicit sound intent are accepted.** Retain generic completed click / consumed-pan pointer-up activation, exclusions for explicit sound controls, initial gesture intent capture, pending-resume retries and lifecycle generation guards. CSS or SVG children must not break `closest()` lookup or event ownership.
4. **Fullscreen uses the common app root and the same native dialog.** Preserve the synchronous request in the trusted handler and the existing promotion that retains DOM, selected subset, focus and scroll. A new panel appearance must not replace the native dialog or hide its Exit/support controls.
5. **Placement uses measured dimensions.** Update its inputs as needed for new visual bounds, including focus outlines and lower lips. Keep the passenger selection sheet stable as checkboxes change. Transparent layout wrappers should not capture water drags; controls and open panels must stop tap-through.
6. **Keep native interaction semantics.** Buttons remain buttons, selection remains accessible, and disabled/pressed/current/expanded states still describe the real game. Essential affordances cannot depend on hover, color alone or permanent animation.
7. **Preserve passenger-choice buttons and their `aria-pressed` state.** The supplied checkbox specimen demonstrates appearance, not a required DOM conversion. Current dialog Tab traversal includes buttons/selects/summaries/links but excludes inputs. Apply the inset styling to existing choice buttons. If a justified change to native checkboxes is made, update focus traversal and keyboard behavior together and verify Tab/Shift+Tab, Space, selection and cancellation.

## 4. Establish a detailed, extensible inventory

Use `cove-ui-package/asset-catalog.seed.json` as the audited starting point. It includes 40 existing runtime families, reference-only material and the candidate UI family. Validate against the current checkout before integrating.

Create **`assets/catalog.json` as the canonical inventory**. This is build/developer documentation data; gameplay does not need a new asset manager. Keep `docs/ASSET_LEDGER.md` as the provenance/history guide and point its current inventory section to the catalog. Correct its stale top-level sound/font descriptions while preserving historical records. Add `docs/UI_STYLE_GUIDE.md` from the supplied guide, adjusted to the actual integrated result.

Each family gets a stable ID, kind, status, source path(s) and code symbol/selector, purpose/meaning, variants, visual/material contract, consumers, lifecycle/reuse notes, provenance/rights evidence and preview/evidence reference. Register a family once; named rabbits, rocks and level placements remain instances/data. A procedural factory is a real asset source; do not invent a nonexistent GLB or texture export.

Retain the type-specific requirements supplied in `ASSET_INVENTORY.md`: model pivots/attachments; material roles; data texture generation/ownership; shader controls; bounded effect lifecycle/reduced motion; motion restoration; audio scheduling/cancellation/mute; UI states/hit areas/accessibility; icon semantics; system font fallbacks; reference-only provenance. “Not applicable” is preferable to a fabricated value. Record measurements only after taking them.

Use statuses such as `existing-runtime`, `candidate`, `integrated`, and `retired`; track human acceptance separately. Existing assets are grounded in the accepted baseline. New candidates become integrated only when used and verified in the game; do not mark them human-accepted before the next playtest. Retired entries identify their replacement.

Provide a small developer asset gallery driven by this inventory and actual icon/component sources. It may use a development-only route or existing tooling; keep it outside the ordinary game flow and production bundle where practical. Show UI normal, pressed, selected, disabled, focus and warning states at intended glyph sizes. For current world/audio families, show exact source links and existing evidence, and offer previews only where inexpensive. Do not render every cove/effect or play every cue simultaneously to populate a gallery.

Add a lightweight catalog check for unique IDs, recognized statuses/kinds, valid local source/evidence paths, required provenance and relevant per-type fields. Do not parse TypeScript symbols with fragile regex as a correctness gate. Use the current test/tool stack. Add the rule to the existing repository guidance: the same change that adds, replaces or retires an asset family updates the catalog and its gallery/provenance entry. Reuse before creating a near-duplicate.

## 5. Verification and completion

Work in two internal stages: establish assets/catalog and then integrate/review them in actual play. Continue through both without an approval pause. Preserve current puzzles, load/depth/tide rules, complete Undo, score/mix, wake/headings, sailing pace, water, lighthouse and homecoming.

Run the production build/typecheck, existing unit suite and the focused existing browser checks affected by this UI work. Add only checks for concrete new risks: nested icon activation, retained dynamic icon/label state, or catalog consistency. Do not mirror every CSS property in a test or expand the historical suite solely to increase counts.

Required observations:

- Native-size ordinary play, selected location, mixed subset and arrival at **844×390**, **780×320**, **390×844** and one desktop viewport. Include a 360px-wide portrait layout check; retain reachable controls when names wrap.
- Actual portrait and landscape rescues with subset transfer, tide Undo and terminal Undo/redelivery. Verify Board / Let ashore / Bring home at their correct locations and both berth orientations.
- Tap the icon center and label of representative controls: one activation, no accidental pan/tap-through, no duplicate action. Check keyboard traversal, Enter/Space, Escape and focus recovery.
- Cold completed-touch sound start, saved mute and explicit Enable/Retry/Mute through dynamic icon updates. Reuse appropriate pending-resume lifecycle coverage after confirming identity.
- Actual supported fullscreen entry/exit with an already-open menu/subset; rotation and failed-entry support details remain usable. Separate actual API entry from simulated denial tests.
- Focus, selection and warnings remain readable over dark water, brightest shallows and Harbor glow. Reduced Motion removes decorative transition movement. New graphics add no continuous frame loop, shader pass, remote font/icon fetch or broad backdrop blur.

Use matched before/after screenshots and a short uninterrupted interaction capture. Inventory/gallery art is design evidence; only actual game captures establish game fit. Record source identities and original failures honestly. The rapid-touch ≤180ms condition remains unverified and the prior delivered-heading smoothness observation remains open unless separately, credibly resolved; this restyle does not silently close them.

Update `docs/PROJECT_STATE.md`, `STATUS.md`, the catalog and review. Commit and push to `m1-first-crossing`; update PR #1 while keeping it draft. Leave main unchanged. Return exact final SHA, source/evidence identity, a concise review, asset additions/retirements, checks and remaining limits. **Do not deploy this new style pass automatically.** ChatGPT reviews the identifiable result and then publishes it for the next phone playtest under the established workflow.

## Primary accessibility references

- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
