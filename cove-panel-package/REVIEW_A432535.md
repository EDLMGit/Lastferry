# Review — Cove interface a432535

Reviewed on 2026-10-25 against exact source `a4325353cf11cd4edba8d5384b58fe138e4772e3` and accepted published `8052cfcd67f2e56cf3258243618c4ce125d51c4b`.

## Decision

Keep the new button/icon direction and the canonical inventory. Correct the reported passenger preview and refine the shared panel material before treating this interface pass as visually complete. This review does not publish a build.

## Confirmed visual finding — clipped passenger choices

The user image shows three selected passengers at Harbor, cut-off capacity labels and a horizontal native scrollbar. The image is a 426×405 crop around an approximately 400px-wide dialog, not a known viewport.

At this source, `src/style.css` places all choices in one nonwrapping flex row. `src/ui/cove-ui.css` adds a fixed 22px check, 7px gap and padding while the capacity span stays nonwrapping. `src/main.ts` keeps name and capacity inline. This combination is consistent with the exact visible clipping. The body's `overflow: auto` exposes the excess horizontally.

Correct the information layout and intrinsic sizing. A check/name first row plus full-width capacity beneath, with fewer columns when required, is the selected direction. Keep full labels and phone target sizes. A hidden scrollbar without readable content would leave the defect unresolved.

## Preview clarity finding

`src/ui/presentation.ts` uses present-tense success language for the proposed winning state: “Everyone is safely home at Harbor.” The screenshot is still a confirmation preview. The same panel shows proposed empty boat capacity.

Use future/conditional wording and label the projected state. Source inspection shows this is derived preview data; the screenshot does not prove early committed delivery. Verify that opening/toggling/cancelling this preview cannot alter committed state or start victory effects.

## Material assessment

The new actions have an evident face, edge and depth. The shared panel is still largely a flat 97%-opaque teal surface with a transparent preview interior. Faint scene animals and underlying controls remain visible in the reading area. Those silhouettes are consistent with the scene showing through the material; there is no large-animal illustration in the dialog markup.

The new candidate uses an opaque painted teal face, a softer upper wash, subdued sage rim, dark lower lip and sparse low-contrast shoreline corner curves. The world stays visible around compact panels. Preserve the accepted world palette and the existing button faces. The asset is CSS plus a small SVG source, with no baked text or fixed-size background image.

## Why the handoff checks did not catch this

The reported 20 matched screenshots capture the two-rabbit mixed subset at Rabbit Pier. `tools/capture-cove-ui.mjs` later opens the three-passenger Harbor preview and immediately confirms it before recording arrival. Its three-choice pre-confirmation state has no saved comparison image.

The current focused UI tests check native control identity, glyph/label behavior and element visibility. The inherited viewport checks do not establish that text inside each choice fits. The next task explicitly adds nested-body overflow and complete label/cost fit checks at the actual final preview.

## Fresh independent checks

| Check | Result |
| --- | --- |
| Node 24.22.1 production build / TypeScript | Pass |
| Unit tests | 202/202 across 28 files |
| Asset catalog | 71 unique families pass |
| Fresh HTML, CSS and JS | Exact handoff hashes and byte lengths |
| Packaged source entries | 193 match |
| Selected media files | 58 hashes and lengths match |
| Protected pre-existing sources | 52 byte-identical to 8052cfc |
| Tracked review checkout | Unchanged |

Dependencies were reused only after byte-identical lockfile and matching dependencies/devDependencies were established. The existing bundle-size advisory remains. These checks are fresh; the contributor's 24 browser passes remain contributor evidence. No independent browser, physical Android or listening result is claimed here.

## Inventory disposition

The 71-family catalog is structurally consistent. Update `ui.component.panel`, `ui.component.passenger-choice`, `material.cove-ui-tokens`, `ui.surfaces` and `ui.dialogs`. The corner motif belongs naturally as another editable source of the existing panel family. Do not create parallel catalogs or duplicate families per menu.

Keep the user's favorable button feedback, the unaccepted panel refinement and technical verification as distinct facts. Retain the prior constrained card/dock overlap, heading observation and rapid-touch limits.

## Sources

- [PR #1](https://github.com/EDLMGit/Lastferry/pull/1)
- [Contributor review](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/reviews/cove-ui-assets/REVIEW.md)
- [Shared material/choice CSS](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/src/ui/cove-ui.css)
- [Base layout CSS](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/src/style.css)
- [Dialog rendering](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/src/main.ts)
- [Preview copy](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/src/ui/presentation.ts)
- [Capture sequence](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/tools/capture-cove-ui.mjs)
- [Canonical catalog](https://github.com/EDLMGit/Lastferry/blob/a4325353cf11cd4edba8d5384b58fe138e4772e3/assets/catalog.json)
