# Story foundation asset record

The implementation adds one family, `ui.story-presentation`, to the canonical catalog: **73 total, all 72 prior IDs and retired records retained**. The machine-readable comparison is [catalog-change.json](catalog-change.json). No new raster output, generated audio, model, font or external asset is introduced.

The existing `ui.dialogs` family records the same native dialog's additional journey/story modes. `ui.passenger-portraits` retains its original image/source provenance and gains the supplied version 12 publication history. Published does not mean newly verified on every device, and the new story family remains pending human review.

## Editable source and reuse

- `src/campaign/registry.ts`: exact opening/connective captions, eight-second optional scene recipe, two existing story coves and separate practice list.
- `src/campaign/presentation.ts`: bounded settling/cancellation controller; no renderer or audio owner.
- `src/main.ts`, `src/campaign/story.css`: native dialog integration and responsive title/caption controls.
- `src/scene/world.ts`: opt-in `setStoryFraming` fits existing lighthouse/ferry/aboard silhouettes above or beside the reading card; normal playable camera behavior is unchanged.
- `src/dev/asset-gallery.ts`: imports the same caption/policy sources and established component helpers. Static specimens are design evidence, never gameplay screenshots.
- Existing painted CSS/SVG, controls/icons, Three.js world, models/portraits, water, lighthouse and sound remain the visual/audio source families.

The three campaign documents are original supplied direction. Only the opening, Holding → Bellwater connection, compact journey surfaces and explicit prototype endpoint are part of this pass. New species, boat, coves, current rules, supper scene and other proposed scenes are not cataloged as integrated content.

## Supplied source and publication provenance

[supplied-inputs.json](supplied-inputs.json) records byte-identical copies of the active task, three campaign documents and `review/deployment-confirmation.json`. Their parent-workspace originals are preserved. The receipt confirms Sites version 12 at 2026-10-25 17:28 Madrid, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`, unchanged owner-private audience. It reports all six reviewed production files identical. This pass did not deploy or independently re-audit hosting.

## Verification status

`npm run check:assets` passed with 73 unique families after adding the live source paths and gallery contract. The existing bounded asset validator and generated-image checks remain unchanged. The gallery's shared imports/source, TypeScript and catalog contract were checked; no fresh gallery visual inspection is claimed. Actual runtime screenshots and scene/input results are documented in [REVIEW.md](REVIEW.md), including 33 native inspected images and an uninterrupted sequence. Gallery specimens do not substitute for gameplay checks. Human acceptance and a subsequent private Site publication are separate decisions.
