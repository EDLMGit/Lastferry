# Review and next package — passenger portraits

Reviewed on 2026-10-25. Implementation baseline: `23a644aba24e6479b9d82a106a745d15c3f8c7dc` from `EDLMGit/Lastferry`, branch `m1-first-crossing`, draft PR #1.

## Baseline conclusion

The panel refinement is a suitable baseline for the next contained portrait pass. The user's screen and the committed constrained phone previews show full names and space costs. The painted surfaces now fit the existing cove controls. No new blocking issue was found in the code/source audit.

Fresh verification under Node 24.22.1 passed the production build/TypeScript, 203 unit tests and the 71-family catalog check. The three freshly compiled production files exactly match the committed handoff's bytes and hashes. The audit also verified 219 packaged source entries, 52 unchanged protected files, 79 selected media files and the recorded capture source. The 38.75-second animated gameplay evidence decodes completely.

The contributor's five focused browser cases, six actual UI rescues and 272 contrast checks remain contributor evidence. Their source and media identities were checked; those browser scenarios were not freshly rerun here. See `BASELINE_AUDIT.md` and its adjacent logs/JSON for exact scope and commands.

## Publication completed

The reviewed panel build was subsequently published to the existing private phone Site:

- URL: `https://last-ferry-playtest.abumech.chatgpt.site`
- Sites version: **11**
- Game SHA: `23a644aba24e6479b9d82a106a745d15c3f8c7dc`
- Hosting source SHA: `d1fc7158d7b00717af18b7bc61ee4a33fe85bf2f`
- Publication succeeded: `2026-10-25T14:29:33.594800+00:00`
- Audience: owner-private, unchanged.

The hosting build's three production files matched the reviewed build exactly. The native deployment result confirmed success and the resulting version was read back. `deployment-confirmation.json` records that receipt; the source/build/archive audit files record the hosting preparation. No GitHub game source, branch, PR or main mutation was performed during this review/publication.

**The new portrait candidates are not in version 11.** The next local Codex task integrates them, pushes its review handoff and waits for the next review/publication. Treat version 10 statements in the pre-publication audit and contributor handoff as historical.

## Portrait decision and supplied work

Use static transparent portraits made from the existing original 3D model factory. Three shared appearances cover the nine current level/passenger combinations: cream rabbit, tan rabbit and sheep. Keep names and capacities sourced from level data. Resolve the appearance from the complete level and passenger ID so Rue/Lark stay tan in a partial selection.

The three supplied PNGs are 256×256 with alpha and total 99,394 bytes before any additional transport compression. Their original geometry, colors and world scales come from the reviewed source. The offline SVG renderer uses simplified diffuse lighting; these are model-derived artwork, not live WebGL screenshots. The generator, SVG intermediates and generation manifest are included.

The selected head/upper-chest framing retains complete rabbit ears and recognizable sheep wool. The style board was inspected at its 1120×850 logical size. The 40–44px specimens support recognition through silhouette and coat color; the name, full cost and check remain essential. The HTML specimen offers independent button selection without pretending to run the actual game.

No portrait runtime integration, actual game portrait screenshot, browser layout check or physical-phone test is claimed. The task requires those affected checks after integration, including image loading/failure, full text fit and stable Confirm placement.

## Remaining limits

The existing constrained card/dock overlap, delivered-heading observation and ≤180ms rapid-touch condition remain separately open. This presentation pass must preserve their status unless it actually resolves them with evidence. No fresh physical Android, native GPU, other-browser-engine or acoustic listening result is claimed. The existing bundle-size advisory remains.

## Sources

- [Contributor review](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/reviews/cove-panel-refinement/REVIEW.md)
- [Original models](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/src/scene/models.ts)
- [World identity and proportions](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/src/scene/world.ts)
- [Canonical inventory](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/assets/catalog.json)
- [Three.js SVGRenderer](https://threejs.org/docs/pages/SVGRenderer.html)
- [W3C guidance for redundant/decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)
