> Historical pre-publication audit. Publication subsequently succeeded as version 11; see `REVIEW.md` and `deployment-confirmation.json` for the current confirmed status. The statements below describe the audit before that action.

# Independent handoff verification — 23a644a

Reviewed exact GitHub source `23a644aba24e6479b9d82a106a745d15c3f8c7dc` on 2026-10-25, comparing protected files with `a4325353cf11cd4edba8d5384b58fe138e4772e3`. No tracked repository files were edited. No browser, Site or GitHub mutation was performed.

## Fresh checks

Using Node **24.22.1**:

| Check | Result |
| --- | --- |
| `npm run build`, including `npm run typecheck` | PASS |
| `npm run test:unit -- --maxWorkers=1` | **203/203 PASS**, 28 files |
| `npm run check:assets` | **71 unique families PASS** |
| Fresh production HTML, CSS and JavaScript | All three hashes and byte lengths exactly match the committed handoff build identity |
| Packaged source | All **219 entries** match the packaging audit's committed hashes |
| Protected pre-existing source | All **52 files** byte-identical to the prior baseline |
| Selected media | All **79 files** match hashes and lengths: 78 PNGs and one animated WebP |
| Capture provenance | All **78 runtime source entries** and both capture/measurement helpers match the recorded source |
| Animated WebP decode | All **300 frames** decode at 844×390, total **38,750 ms** |
| Tracked working tree | Clean |

Dependency reuse is supported by byte-identical `package-lock.json` and `package.json` against the prior reviewed checkout. The installed modules are reused through an ignored symlink. Fresh output is under ignored `dist/`. No installation or dependency change was required.

The existing bundle-size advisory remains. The npm environment's proxy deprecation warning did not affect these checks.

## Scope and evidence limits

The contributor's five focused browser passes, six actual UI rescues and 272 contrast checks remain contributor evidence. Their source and media identities were independently verified; the browser scenarios themselves were not rerun here. No physical Android, new acoustic listening, native GPU or cross-browser result is claimed.

The user-provided screen and the committed native 780×320 and 320×740 Harbor previews show readable full passenger labels and capacity costs. I inspected the latter two images directly. On constrained sizes, the existing 62px tiles occupy two rows and the lower consequence/details require intentional vertical scrolling. Close and Confirm remain in the fixed header/footer in those images. This observation does not replace interaction testing.

The new per-line `Range.getClientRects()` measurement in `tests/e2e/cove-panel-measure.ts` checks text inside each choice and nested horizontal overflow. The capture sequence now saves the actual three-passenger Harbor preview before confirmation. This specifically closes the prior evidence gap; it is not merely another screenshot of the two-rabbit screen.

## Relevance to the requested animal portraits

No new blocking issue was found in this code/source audit. The current implementation is an appropriate baseline for the next contained portrait pass.

The portrait layout must account for the constrained vertical budget rather than assuming the transfer sheet has spare height. Preserve full names, space costs, selected checks, complete warning reachability and the fixed confirmation target. Reuse the current text-fit/overflow measurements after adding images, and ensure each image's loaded or failed state cannot move the controls.

The prior card/dock overlap, delivered-heading observation and rapid-touch timing condition remain open. The portrait task should preserve their status unless it separately resolves them with evidence. The last confirmed private Site remains version 10, game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, hosting source `f9ada70cbd093bf52c105f2287558381b3b7c83c`; this audit does not publish the handoff.

## Audit files

- `build.log`, `units.log`, `catalog.log`: fresh code-gate output.
- `dependency-reuse.json`: exact dependency compatibility.
- `build-audit.json`: fresh production identity.
- `source-audit.json`: 219 packaged source entries.
- `protected-audit.json`: 52 unchanged protected files.
- `media-audit.json`: 79 selected media identities.
- `capture-audit.json`: capture runtime/helper provenance and full WebP decode.
- `identity-summary.json`: counts and result summary.

## Source references

- [Contributor review](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/reviews/cove-panel-refinement/REVIEW.md)
- [Packaging audit](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/reviews/cove-panel-refinement/packaging-audit.json)
- [Measured comparisons](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/reviews/cove-panel-refinement/matched-comparisons.json)
- [Text-fit measurement helper](https://github.com/EDLMGit/Lastferry/blob/23a644aba24e6479b9d82a106a745d15c3f8c7dc/tests/e2e/cove-panel-measure.ts)
