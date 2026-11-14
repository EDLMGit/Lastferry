# Story assets and inventory

The repository's `assets/catalog.json` stays authoritative. At the reviewed `6fc5a09` baseline it contains **73 families**. That is a source fact, not a required post-task total. Preserve all IDs; add only implemented content and update consumers/provenance accurately.

## Existing families

| Family | This task |
| --- | --- |
| `ui.story-presentation` | Update to the real illustrated view, controls, captions, behavior and review evidence |
| `model.ferry`, `model.rabbit`, `model.sheep`, `model.lighthouse` | Preserve accepted gameplay assets; use their identity/palette in illustrations |
| `ui.passenger-portraits` | Preserve names, capacity labels, fallback and identity mapping; Pip cream, Rue tan |
| `audio.score`, `audio.accompaniment` | Preserve accepted composition and phase/lifecycle |
| `audio.ambience-travel`, `audio.transfer-wood`, `audio.arrival`, `audio.reverb` | Preserve gameplay behavior; shared low-level synthesis is acceptable |

Check the current catalog before adding or updating anything. Reconcile with newer source if the branch has moved.

## New implemented illustration families

Use the catalog's existing conventions. A small grouping such as illustrated characters, coast and props is sufficient; prefer variants over a new family for every individual frame. If the current inventory can represent the new illustrations cleanly inside an existing relevant family, use it.

Record the actual source modules, supplied reference hash, derivatives, runtime consumers, color/identity rules, render-size behavior and review evidence. The source is the supplied original code-native Canvas artwork, adapted in this pass. Do not label it as an imported stock image, a commissioned recording or a generated image asset.

Add a story-effects family only if the implemented cues need one, and link reused sound helpers honestly. An optional narration field is not a delivered audio asset: no narration family should claim recordings exist while `asset` is null.

## Separate implementation from acceptance

The user approved the supplied opening reference. That approval does not automatically cover the production port, the new Harbor drawing, the actual mix or physical Android performance. Record those statuses separately. A passed asset validator proves catalog consistency, not that an illustration or sound was perceptually approved.

For future asset additions, retain the same basic record: stable ID, source, derivatives, consumers, character/capacity identity where relevant, sizes, motion/reduced states, provenance and approval status. Proposed Nell, Orin and larger-ferry concepts remain in campaign planning until those assets are actually built.

Update the developer gallery for implemented reusable families, following the repository's existing pattern, and run `npm run check:assets`.
