# Approved reference and editable artwork

Open **`approved-opening.html`** in a browser. It is the standalone viewer for the user-approved Words and Light opening. It is silent and works without a game checkout or voice service.

## Files

- `approved-opening.fragment.html`: exact approved inline source, including art, text and prototype controls. SHA-256: `ff437f9e70675c8b532f2f774e9b9c766eb30e2cf9da73072d5b7e872fd22ce1`.
- `approved-opening.html`: portable viewing wrapper around that exact fragment.
- `scene-painter.js`: editable original Canvas2D painter used by the approved source.

The painter exposes `createCoveStoryPainter(canvas)`, then `resize(width, height, devicePixelRatio)`, `draw(shotIndex, elapsedSeconds)` and `durations` of `[6, 6, 7]`. It has no puzzle or campaign responsibilities. Adapt it into the production app's TypeScript module conventions.

The three opening shots, captions and visual language are approved. The proposed Harbor shot in the task is new work in that same language and requires review.

## Preserve the work; replace the harness

Retain the actual art, readable close compositions, caption staging and player-paced endpoints. Do not ship this standalone wrapper, its iframe, development status global or separate prototype navigation inside the game. The real app must own journey entry, settings, fullscreen, progress and final handoff.

The reference's Play story / Finish / Replay story controls make it independently explorable. The production flow begins from the existing Begin journey action and ends with Take the helm. Internal Next must not acknowledge the whole scene.

The preview was designed for an inline conversation surface. Its height is not a production viewport contract: at a 780×320 short-landscape screen, the original surface can extend to approximately 330px. Production must fit all essential controls and text within the available game viewport, with appropriate safe areas and readable transcript access.

## What is absent

No production audio, narration recording, campaign storage, puzzle transition or Harbor connection is implemented by this viewer. Those boundaries are intentional. The task requires integrating the reference into the real game and adding the specified effects; it does not claim that the preview already passes the game's lifecycle or physical-device checks.
