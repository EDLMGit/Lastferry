# Authored story scenes — asset record

This pass refines the existing `ui.story-presentation` family. **73 total IDs remain, with no added or retired family.** Existing ferry, rabbit/sheep models, portraits, lighthouse, water, painted panels, typography and audio provide all visual/sound material. No generated bitmap, external asset, model, font, score, renderer or audio owner is introduced.

## Editable sources

- `src/campaign/registry.ts`: unchanged exact captions and story associations; 7.2-second opening and four-second connection recipes.
- `src/campaign/presentation.ts`: finite authored timeline, settlement/cancellation and immediate Continue lifecycle.
- `src/scene/story-staging.ts` and `src/scene/world.ts`: shot composition and presentation-only animal acknowledgment over existing scene assets; default gameplay framing and state remain separate.
- `src/main.ts` and `src/campaign/story.css`: quiet responsive caption treatment within the existing native dialog, complete live copy, active-only Skip and immediate Continue.
- `src/dev/asset-gallery.ts`: imports the exact runtime caption/recipe data and labels its static specimens as design guidance.
- `campaign/STORY_SCENES.md`: current opening/connection direction revised explicitly under this task; later content sections remain authored future work.

The supplied task is retained byte-for-byte in [supplied-inputs.json](supplied-inputs.json). Historical foundation source hashes remain in their original review. Revising current storyboard wording does not alter those original records or establish future content as implemented.

## Verification and acceptance

Actual native beginning, intermediate beat and endpoint frames plus uninterrupted recordings belong in [REVIEW.md](REVIEW.md). A static gallery specimen cannot establish visible storytelling or a gameplay handoff. Final Node 24 build/TypeScript, 276/276 units across 33 files and validation of all 73 families pass. [Catalog comparison](catalog-change.json) confirms no new or removed ID and only the existing story family changed. Seven distinct focused browser cases pass across the retained runs, with the original unit/fullscreen harness failures kept. Twenty-one representative scene frames at the requested phones and desktop, recovery/source-handoff checks and all three actual deliverable endpoint frames were inspected at native size. [Native inspection](native-inspection.json) records exact hashes and scope. Gallery imports/type/catalog contracts were checked; no fresh gallery visual approval is claimed. Human visual/pacing acceptance and physical Android behavior remain separate.

The existing owner-private Site remains version 12/game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. Neither the foundation nor this correction has been published. This task does not deploy.
