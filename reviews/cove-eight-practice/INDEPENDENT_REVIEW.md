# Independent Ternhaven review — 15 November 2026

## Disposition

**No blocker found in the scoped source and production-proof review.** Preserve Ternhaven's current puzzle and accept **14 actions** as its first efficiency target, **`ternhaven@1`**, in the next scoped arrival-UI implementation.

This recommendation combines the user's positive feedback on the last two levels and lantern mechanic with the independently rerun proof below. It does not assert a new physical Android test, acoustic listening, accessibility approval or a difficulty measurement. Ternhaven remains independent Practice; Journey integration is a separate task.

## Source and method

Reviewed commit: `291d8f2a9570d833709e10815db12bd5c1fe75cc`, repository `EDLMGit/Lastferry`, branch `m1-first-crossing`.

Retrieved sixteen source files through the GitHub connector and verified every local file against its Git blob SHA, including the nine level JSON files imported by the real loader, production rules, Session, mastery, the committed witnesses and audit. The complete manifest is [source manifest](INDEPENDENT_SOURCE_MANIFEST.json). No game source was edited.

Fresh execution used Node **v24.22.1** on Linux:

```text
node --experimental-transform-types reviews/cove-eight-practice/audit.mjs > fresh-audit.json
```

Exit code: **0**. The only stderr output was Node's experimental transform-types notice. The full fresh output is [fresh audit output](INDEPENDENT_AUDIT_RESULTS.json), SHA-256 `68535613b7ba6f22ffc6c9943fb63a308dfa04bc4984968c7cd76bcbd37aa607`.

This is an independent execution and source review of the contributor's checked-in production-rule audit, not a new alternate solver. It imports the shipped `legalActions`, `reduce`, `preview`, `Session` and current validator. Its graph construction, plateau equivalence, reverse distances, failure branches and counterfactuals were inspected. No dependency installation, browser run, full build or broad unit rerun was needed for this bounded puzzle/target decision.

## Reproduced results

- Complete graph: **347 canonical states**, **874 transitions**, **75 viable states** and minimum **13 actions**.
- The mechanical digest remains `1df013da332cb59b578134bd20503185d285d7d765fc641fc8c1b3e5d1960e01`, matching the implementation evidence.
- All three committed witnesses succeed through the real Session with preview/commit agreement, passenger conservation and terminal Undo/redelivery: safe high bank **14**, low deep-first **14**, low direct return **13**.
- The current candidate correctly returns no mastery result, because the target is not yet registered.
- The wrong early unloading branch exhausts **21 states / 45 transitions / zero wins**.
- The low-staging return via the buoy after action nine exhausts **5 states / 4 transitions / zero wins**.
- The high-staging heavy-first branch exhausts **15 states / 26 transitions / zero wins**.
- Session recovery from the actual early capacity loss uses three Undos to restore turn one and completes a fourteen-action rescue.

Exact time is kept through action ten. Thereafter all tide and current changes are final; state identity retains the boat, passengers, delivery, tide, status and loss while normalizing only irrelevant absolute turn. This permits complete continuation searches without an arbitrary move cap.

## Why target 14 is justified

The thirteen-action solution uses low staging, picks up Willow light and returns directly from Reed Landing to Tern Steps for the last dry pickup.

The two fourteen-action alternatives express different plans:

1. **High Bank:** leave Juniper and Fennel safely high, collect Willow light through the shallow approach, then retrieve the staged group after the low landings flood.
2. **Tern Steps / deep first:** retrieve Juniper and Fennel first, approach Willow through the deep link, board on the final dry action and leave fully loaded through that same deep link.

Both fourteen-action plans converge at Tern Buoy only after their consequential choices. They are not merely reordered equivalent pickups or added waits. A target of thirteen would exclude the safe high-bank plan; fourteen includes all three deliberate approaches. No longer plan was invented to justify the rating.

The exhaustive target-bounded set contains one high-bank sequence and eleven low-start sequences. Those counts are coverage, not a claim of eleven distinct strategies.

## Dependency and bypass checks

The two developer-only counterfactuals independently reproduce the intended effects:

- Raising Tern Steps' elevation from two to three rescues the otherwise losing low return via the buoy, while the wrong early load remains unwinnable.
- Raising the current's base depth from two to three permits the alternate early load, while the low approach still loses to its deadline.

No temporary unloading, no early partial delivery, and waiting until final tide before pickups each have no winning continuation. Avoiding the shallow edge still permits the low/deep fourteen-action plan; avoiding the deep link still permits the high fourteen-action plan. These legitimate choices were retained.

An opening Wait is unwinnable. The game permits unlimited inspection without spending an action, and the user has positively received the puzzle; this is recorded as a concrete timing property, not classified as a blocker or hidden real-time pressure.

## Boundaries for the next arrival-UI pass

- Register only `ternhaven: { revision: 1, target: 14 }`; preserve all eight existing targets and bests.
- Do not backfill fictional scores for earlier unscored candidate rescues; require a newly scored replay.
- Keep the nine Practice entries and seven-cove Journey/checkpoints. No Ternhaven Journey append or new story scene.
- Preserve the exact puzzle data and witnesses; source verification should show no rebalance.
- Display all actually rescued cove neighbors in the proposed arrival showcase, including early deliveries. Ternhaven's Sedge is already delivered before the final three arrive: the showcase must not use only the final unloading transaction.
- Keep current-result lanterns distinct from a previously accepted best, provisional win/acceptance boundaries, successful Undo history, and terminal Undo/redelivery.

## Presentation and evidence limits

The contributor's report documents that the normal Harbor arrival partly hides the sheep behind the beaver. Separately from the proof execution, the parent review inspected the committed [390×844 arrival](390x844/rescue.png) and [780×320 arrival](780x320/rescue.png) at their native sizes. Their Git blob SHAs are `64350edbc592584719f1f95af2dceabfc9714677` and `b7821304c315c06509bc9da700ab9c5412566f2c`, respectively. The portrait result is low on the screen; the landscape result is at the right. The small Harbor group lacks a clear view of every face, and the portrait capture also retains the final-action receipt. These observations support a centered, uncluttered result with an explicit full-cast showcase.

Those are independently inspected contributor screenshots, not freshly executed gameplay. No new browser/WebGL run or physical-device result is claimed. The user's three supplied reference images were inspected separately as design direction; their assets were not copied into this repository.

The reported build, TypeScript, 81-family catalog, 226-unit and six-browser results remain contributor evidence, with original harness failures retained. They were not rerun here. Physical Android, listening and spoken screen-reader checks remain open. No deployment was performed by this review.
