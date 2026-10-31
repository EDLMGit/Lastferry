# Last Ferry — cove interface package

## Start here

Extract the complete archive into the existing Lastferry repository root. It adds `NEXT_TASK_COVE_UI_ASSETS.md`, `COVE_UI_PROMPT.txt` and this `cove-ui-package/` directory. It does not replace the game's runtime files. Give local Codex the prompt in `COVE_UI_PROMPT.txt`.

The current accepted game is GitHub `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, published as Sites version 10. The user reports that the current build works well. This package defines the next interface/art-inventory pass.

## Contents

| File | Purpose |
| --- | --- |
| `../NEXT_TASK_COVE_UI_ASSETS.md` | Complete implementation, integration and verification task |
| `../COVE_UI_PROMPT.txt` | Exact paste prompt naming that task |
| `STYLE_GUIDE.md` | Material, palette, icon, state and phone readability rules |
| `UI_STYLEBOARD.svg` / `.png` | Proposed visual specimen; not a gameplay screenshot |
| `UI_PREVIEW.html` | Self-contained local component specimen with native pressed/focus/checkbox states and expandable inventory; no gameplay or network |
| `ui/cove-ui.css` | Editable candidate shared surface CSS; integrate with current measured layouts |
| `ui/icons/*.svg` | 18 original, editable 24×24 icon candidates |
| `ui/icons/cove-icons.svg` | Generated convenience sprite; individual SVGs are the editable source |
| `ui/icons/manifest.json` | Stable IDs, icon semantics, labels and provenance |
| `asset-catalog.seed.json` | 71 audited/proposed entries: 40 existing runtime families, 25 new UI candidates, 6 references |
| `ASSET_INVENTORY.md` | Detailed human-readable seed inventory and type-specific extension rules |
| `ASSET_ENTRY.template.json` | Copyable entry pattern for a future asset |
| `PACKAGE_VALIDATION.json` | Source-path/XML/ID checks and preliminary color-pair calculations |

Open `UI_PREVIEW.html` locally to inspect the actual SVG/CSS component candidates. Its sample controls are appearance specimens. Fullscreen and audio icons there do not request device capabilities or play sound. The actual game integration is performed by the named Codex task.

The runtime asset registry should become `assets/catalog.json`, with the existing ledger retained for provenance/history. The supplied human-readable inventory and HTML are package snapshots. The integrated developer gallery should read the canonical catalog and real shared sources so future additions have one maintained home.

## Rights and evidence

The icons and surfaces are original sources authored for this project package. No third-party icon set, bitmap texture, web font or audio sample is included. Existing code-built assets and reference files retain their repository provenance and rights. This package does not declare a new project license.

The source audit identifies real current factories and code paths. It does not imply that procedural assets were exported to GLB, that every family has a new isolated capture, or that candidate UI has already been accepted in the actual game. Validation covers the package itself; current game behavior is protected and verified during integration.

## Handoff

Codex implements the task, records new/changed/retired inventory entries, completes the focused checks, pushes `m1-first-crossing`, and updates PR #1 while keeping it draft. ChatGPT reviews the identifiable result before the next private Site publication. Main remains unchanged.
