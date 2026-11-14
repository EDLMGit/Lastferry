# Independent review — three lanterns

**Reviewed:** 14 November 2026. **Implementation:** `14f128619267e2da81b4108ece2de4da07b50359`. **Comparison:** task/continuity baseline `19ac9654b9e974e79effee6d863edf9a2bd08f04`.

**Disposition: no blocking defect found in this scoped review; ready for continued development.** This is source review, fresh bounded core execution and inspection of committed native frames. It is not a new full build/browser run or human physical-phone, listening or screen-reader approval.

## What was checked

Read the new scoring/storage module, Session result lifecycle, actual navigation/acceptance handlers, result/list/criteria presentation, relevant tests, report and source comparison. Inspected these committed images at native size:

- [390×844 provisional result](390x844/three-provisional.png)
- [390×844 accepted Practice best](390x844/accepted-practice.png)
- [780×320 current versus best](780x320/best-comparison.png)
- [320×740 expanded criteria](320x740/practice-criteria.png)

The result uses the existing card and keeps the map free of a scoring HUD. Earned/unearned lanterns differ by filled glass and flame, with explicit text equivalents. The portrait Practice list keeps full cove names and an honest legacy “Rescued · not yet rated” label. The narrow criteria panel uses native scrolling. In the short-landscape comparison, the body is scrolled to expose current/best statistics while the primary action and Undo remain available. The stills support these layout observations, not a smoothness or spoken-accessibility conclusion.

## Fresh core verification

On Linux, Node **v24.22.1** and existing Vitest **5.0.5** dependencies:

- Exact committed `tests/unit/mastery.test.ts`: **44/44 passed**.
- Supplemental exact-source storage/validation probes: **8/8 groups passed**.
- Twenty-nine extracted source/dependency/test/evidence files matched their Git blob hashes byte-for-byte, without source adaptation.
- All twenty protected rule/loader/level/witness inputs match accepted `9933303178da04cac93ddc820ef55e181286d983`. No new difficulty search was needed.
- All twenty-four authored winning witnesses pass through the new Session.

The eight target values and revision-one identities are correct: First Crossing 8, Holding 9, Bellwater 10, Driftwood 12, Two Shelters 12, Wide 14, Reef 11, Orchard 13. Driftwood's fifteen-action route earns one; distinct longer accepted Wide/Reef/Orchard routes qualify for three without Undo.

[Exact source manifest](FRESH_SOURCE_MANIFEST.json) · [Committed-test results](fresh-mastery-results.json) · [Supplemental harness](independent-storage-checks.mjs) · [Probe results](independent-storage-results.json)

Reproduce from the reviewed runtime with its dependencies installed:

```sh
npm run test:unit -- tests/unit/mastery.test.ts --maxWorkers=1 --reporter=json --outputFile=/tmp/last-ferry-mastery-tests.json
node reviews/three-lanterns/independent-storage-checks.mjs --repo . --out /tmp/last-ferry-mastery-probes
```

The supplemental script verifies the exact mastery Git blob before importing it. It checks numeric/object bounds, prototype-looking identities, inconsistent ratings, unknown revisions, later corrupt/failed reads, failed write verification, defensive copies and whole-run preference. These checks validate local personal mastery records; they are not replay-based anti-cheat.

## Lifecycle and save findings

Successful Undo history is outside rewindable State. Busy/rejected inputs do not count. Only a real committed win becomes a result after presentation finishes; cosmetic restored Harbor states cannot award mastery. Terminal Undo withdraws the provisional result, and redelivery uses the accumulated successful Undo count. Result consumption is one-time; completed Restart resets the new attempt only after it succeeds.

In the application handlers:

| Existing action | Observed source behavior |
| --- | --- |
| Continue story | Validate/accept the Journey cove, keep mastery, then resume the next boundary. |
| Actual Practice/Next cove selection | Mount the new playable Session, then consume the departed Session's result. |
| Confirmed Home | Complete the transition and keep the departing Session's result. |
| Completed Restart | Accept the captured result only after successful restart. |
| Open cove menu, Settings, Escape or cancel Home | No result acceptance. |

In-app Practice navigation preserves an in-memory best and the Sound owner when storage is unavailable. Direct `?cove=` addresses follow the selected cove; root Practice remains at root. Returning Home lazily reads Journey when needed without constructor writes. The exact diff leaves registry/progress, puzzle data and production rules unchanged.

Bests store one actual run, ranked by lanterns, then actions, then successful Undos. They cannot be assembled from different attempts or reduced by a poorer replay. Unknown revisions remain stored without appearing as current bests. Invalid or inaccessible storage preserves original bytes, retains visit-only results and exposes the existing persistence notice. Mastery writes only its separate namespace. Earlier rescues remain completed and unrated.

## Asset and verification limits

The new `ui.mastery-lanterns` family has its original editable SVG, shared UI/CSS, gallery specimens and ledger provenance. It is the eighty-first family; the earlier eighty IDs remain. This inspection does not claim a fresh asset-validator run.

The implementation handoff reports production build/TypeScript, 123 relevant units, seven focused browser cases plus Practice isolation, actual phone-sized and minified rescues. Those broader checks remain [reported implementation verification](REVIEW.md), including retained original failures. This independent pass freshly ran only the bounded checks above. It did not replay the recording, rerun the browser suite, test a physical Android phone, listen to the output or use a spoken screen reader.

## Next assignment

[ORCHARD_JOURNEY_01](../../NEXT_TASK_ORCHARD_JOURNEY.md) appends the already accepted Orchard as cove seven, with its brief illustrated encounter and explicit continuation of exact completed-six saves. Preserve `orchard-landing@1`, target 13 and Practice-earned bests. Historical Journey extension must not confer mastery or bypass the new cove merely because Practice was completed.

The current validator requires full-registry identities for `complete`, so completed-six compatibility must be deliberate before appending the registry. Preserve original bytes/backups and the existing earlier migrations. Update the two current “Six coves are safe” Home/endpoint strings truthfully. The seventh cove is the available interim endpoint, not the final twelve-cove supper.

This review and task preparation make no runtime change or deployment. The private Site remains version 19/game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731`, with its existing custom private audience.
