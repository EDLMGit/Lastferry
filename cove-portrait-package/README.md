# Last Ferry — passenger portrait package

This is the focused follow-up to source `23a644aba24e6479b9d82a106a745d15c3f8c7dc`. The user likes the painted panels and wants to recognize each animal inside passenger selection.

## Use

Extract the package into the existing repository root. It adds `NEXT_TASK_PASSENGER_PORTRAITS.md`, `PASSENGER_PORTRAITS_PROMPT.txt` and this `cove-portrait-package/` directory. It does not replace the game source or canonical catalog. Paste the named prompt into local Codex and implement the task through its focused checks.

## Selected design

Use small transparent portraits made from the existing 3D animal models. Display them at approximately 40–44px beside the full name and space cost in the existing native choice button. Preserve compact tile height where content fits and let columns respond to available width. No tall portrait row or live 3D menu viewport is needed.

Three shared appearance variants cover all current identities:

- `rabbit-cream`: Pip / Tansy.
- `rabbit-tan`: Rue / Lark.
- `sheep-wool`: Moss / Bram.

First Crossing and Holding Pier share Pip/Rue/Moss. Names and space costs remain level-owned data, not text baked into the image. Portrait identity must be resolved from the full level and passenger ID, never the current selected-list position.

## Sources and generated outputs

The original editable model source remains `src/scene/models.ts`, with world proportions defined by the current presentation. The supplied source generator is `tools/render-portraits.mjs`. It produces model-derived SVG intermediates and transparent 256px PNG derivatives using the variant recipe and paths recorded in the supplied generation metadata.

The portable SVG stage uses Node 24 and the project's existing Three.js installation. PNG rasterization may use an available offline rasterizer; the authoring environment has Sharp available. Do not add a production dependency or browser renderer merely to display these static PNGs. The actual integration should retain a documented reproducible command and the exact environment it used.

The SVG path uses simplified offline shading. The result is derived from the actual model geometry, colors and proportions, but is **not a pixel-identical WebGL screenshot**. Native 40–44px recognition and clean transparency are the acceptance tests. Do not hand-maintain a separate unrelated portrait drawing alongside the model source.

### Regeneration

The three PNGs are supplied ready for integration; regeneration is needed only when the recipe or source model changes. The generator reads the actual repository HEAD, records source hashes and relevant working-tree changes, and rejects a mismatched optional `--source-commit` assertion.

To export SVG intermediates separately, with Node 24 and the project's installed Three.js dependency:

```sh
node cove-portrait-package/tools/render-portraits.mjs --repo . --out reviews/passenger-portraits/generated-svg
```

To regenerate the supplied PNG family as well, provide a resolvable installed Sharp module or its absolute module path:

```sh
node cove-portrait-package/tools/render-portraits.mjs --repo . --sharp-module sharp
```

The authoring run used Node 24.22.1, the exact `23a644aba24e6479b9d82a106a745d15c3f8c7dc` checkout, and the shared offline Sharp installation at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp`. That machine-specific path is provenance, not a path expected on the user's computer. The manifest records Three.js, Sharp and rasterizer versions plus the actual source/output hashes. Keep any rasterizer out of the game runtime dependency graph.

## Other package documents

- `ART_AND_INTEGRATION.md`: character mapping, crop/material rules, DOM/layout safeguards and source ownership.
- `asset-update-plan.json`: intended catalog updates; merge into the existing catalog, never replace it.
- `preview/PORTRAIT_STYLEBOARD.png`: visual direction and native-size component composition.
- `preview/PORTRAIT_PREVIEW.html`: portable interactive choice specimen; open after extracting the package so its relative image paths resolve.
- `verification/REVIEW.md`: independent baseline review, publication receipt and limits.
- Root task: complete implementation, checks, evidence and Git handoff.

The supplied preview board and any standalone component specimen are design evidence. Only new actual-game captures establish integration and phone fit.

## Publication and acceptance

The task file records the confirmed baseline publication separately from the new portrait work. This package does not authorize an automatic deployment of the unreviewed portrait pass. Keep the Site's real version/hosting identity separate from the GitHub SHA.

Confirmed 2026-10-25: the same owner-private Site is version 11, game `23a644aba24e6479b9d82a106a745d15c3f8c7dc`, hosting source `d1fc7158d7b00717af18b7bc61ee4a33fe85bf2f`. The new portraits are not in that published build. The receipt is `verification/deployment-confirmation.json`; reconcile older version 10 prose while preserving its history.

The user has praised the current panel direction. Portrait artwork is a new candidate until integrated, inspected at phone size and playtested; that status must remain explicit in the catalog and review.
