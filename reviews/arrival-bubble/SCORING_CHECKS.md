# Ternhaven scoring registration

The sole target-table change is `ternhaven: { revision: 1, target: 14 }`. All eight earlier targets/revisions remain exact. The accepted 13/14/14-action puzzle/witness data and historical C8 audits are unchanged. There are still nine Practice entrances and seven Journey coves; registering a rating appends no campaign content.

On Node v24.15.0:

```powershell
npx vitest run tests/unit/arrival-mastery.test.ts tests/unit/ternhaven.test.ts tests/unit/unscored-practice.test.ts tests/unit/mastery.test.ts
node --experimental-transform-types reviews/arrival-bubble/scoring-replay.mjs > reviews/arrival-bubble/scoring-replay-results.json
```

The focused unit run passes **63/63** checks across four files. It covers all three real Session witnesses earning three lanterns, terminal Undo/redelivery producing two, exactly-once acceptance, earlier accepted bests, lack of historical backfill, a synthetic won background earning nothing, separate Journey bytes, current one/two results against a better prior best, failed persistence and the independent generic unscored fixture's null/no-write behavior. The existing Ternhaven mechanical/Undo tests continue to pass.

The new replay report hashes `src/game/mastery.ts` alongside Session, rules, loader, Ternhaven data, witnesses and the report script. It distinguishes `initialRescueResult` from `resultAfterTerminalUndoAndRedelivery`. The latter has **two lanterns and one successful Undo**. The older C8 output retains its historical `unscoredResult: null` and source provenance without relabeling or overwriting it. No new exhaustive puzzle search is claimed or needed.

Original failure: the first focused run reported **62 passed / 1 failed** because the new test imported a nonexistent `campaignCoves` export. Its assertion at `arrival-mastery.test.ts:45` failed with `Target cannot be null or undefined.` The actual registry exports `storyCoves`; correcting that test import fixed the check. No runtime campaign or save code changed. This is a new-test harness error, not a gameplay failure.

The corrected output is retained in [scoring-unit-results.txt](scoring-unit-results.txt), and source-tied Session replay output is [scoring-replay-results.json](scoring-replay-results.json). These checks establish result/storage behavior, not the visual card, browser event routing, physical Android or human listening acceptance; actual UI evidence is recorded by the arrival review.
