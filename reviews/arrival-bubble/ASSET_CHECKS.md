# Arrival art and presentation checks

These checks cover the shared arrival renderer, reward art, original Replay icon and inventory. The main review owns final actual-game evidence and the source/build manifest.

## Implemented assets

- `assets/ui/result-lantern.svg`: original 64×88 layered lantern source with brass loop, cap, ribs and foot; glass reflection, visible fire/core and restrained aura. Lit flames and hollow unlit glass differ beyond color. The large crown takes its count only from the current result. The original compact lantern SVG and Practice badge dimensions are unchanged.
- `cove-ui-package/ui/icons/replay.svg`: original full loop and central play triangle on the existing 24px grid. Replay is distinct from the existing hooked Undo arrow. The historical supplied sprite is unchanged; runtime imports the individual source.
- The arrival helper and stylesheet reuse the accepted painted material and five original portrait outputs. Every required delivered identity has a named place, including Sedge from Ternhaven's earlier trip. No portrait regeneration, second renderer or new audio is introduced.
- Catalog delta: all **81 previous IDs retained**, with only `ui.icon.replay` added, for **82 families**. The existing lantern, panel, dialog and portrait families carry arrival-specific provenance and pending human visual acceptance. See [inventory delta](asset-inventory-delta.json).

## Executed verification

```text
npm.cmd run check:assets
npm.cmd run test:unit -- tests/unit/arrival-presentation.test.ts tests/unit/asset-catalog.test.ts --maxWorkers=1 --reporter=json --outputFile=reviews/arrival-bubble/asset-presentation-results.json
npm.cmd run typecheck
```

Asset validation passed with **82 unique families**. The focused unit batch passed **22/22**: seventeen presentation cases and five inventory validation cases. TypeScript checking passed after shared integration was complete. Changed-file whitespace checking passed. [Asset command output](assets-validation.txt) · [Unit results](asset-presentation-results.json)

Coverage includes all nine Practice rosters and appearances, unchanged seven-cove Journey identity references, three/four/six-person showcases, current one/two/three lantern outcomes beside a better accepted best, named pending/unavailable portrait slots, unscored fallback, visible storage failure and distinct Replay/Undo semantics. The actual production Ternhaven witness verifies Sedge's early delivery, no partial-result card, all four people after the final delivery, terminal Undo and redelivery with two lanterns. Renderer fixtures elsewhere in the suite are explicitly synthetic state coverage and do not claim played rescues.

The first presentation run also passed **17/17**; there were no presentation or inventory assertion failures to suppress. A typecheck started during concurrent root edits observed a temporarily removed import; the completed integration passed. This was an intermediate editing state, not a retained runtime defect.

## Internal native-size art inspection

An isolated gallery page used the actual `arrivalMarkup` helper and current production portrait sources at a 390×844 viewport and a 780×320 viewport. The 390px Ternhaven fixture displayed two lit lanterns and one hollow lantern, four distinct named faces and both primary controls. The 780px Wide Berth fixture showed all six neighbors in two rows, a full three-lantern crown and readable Replay/Undo controls inside a 692×283 component capture. The gallery clearly labels these synthetic won states as design specimens, with no save, progression or result-acceptance callbacks. These internal images are disposable `.cache/arrival-gallery-portrait.png` and `.cache/arrival-gallery-six-landscape.png`; they are not final gameplay evidence.

The gallery browser reported no JavaScript errors. Initial tooling attempts found no browser at the default sandbox cache and then timed out waiting for network-idle. Using the repository's installed Playwright browser cache and DOM readiness completed the captures without an application change. The isolated browser and its temporary port-5299 server were closed afterward. Final native actual-game comparisons and any later layout refinements belong in the main review.

Physical Android, spoken screen-reader and human visual/listening approval are not established by these checks. No deployment was performed.
