# Focused arrival integration review

Reviewed the working changes to `src/main.ts`, `src/ui/arrival.ts` and `src/scene/world.ts` against task base `107b18adedc4f59202eb105a35c2d9676d2752ee`. No blocking acceptance, cancellation, focus-owner or synthetic-award issue was found in this source review. Actual native browser layout and event routing remain separately verified in the main review.

- The current Session result supplies the large lanterns; an older accepted best is a separate option. The showcase walks required delivered identities, so Ternhaven's earlier-delivered Sedge remains present.
- Dialog close/Escape, Settings and chooser opening do not call the mastery or Journey acceptance owners. Actual cove navigation, successful Restart and Continue story retain their established acceptance functions. No new acceptance is attached to animation, dialog opening, rotation or visibility.
- Celebration is attached to the completed transaction ID and consumes its pending flag once. Dialog replacement/close, hiding and reduced-motion changes cancel unfinished visual animations. The outer dialog rectangle is not animated. A real terminal Undo/redelivery receives a new transaction and recalculated result.
- Initial terminal focus goes to its real forward control. Settings/Back targets the Settings control, Undo restores play focus, and the same native dialog remains the input owner. These are source findings, not a substitute for natural keyboard or device checks.
- Restored Harbor backgrounds synchronize only the world. Their Session remains an initial, uncommitted attempt, so they cannot create an earned terminal result. Isolated renderer fixtures intentionally supply a won state and must remain labeled as such.
- Centered completion bounds no longer reserve a thin side region for Harbor. Existing non-arrival behavior remains separate; terminal Undo resets completion layout and restores ordinary framing.

Three meaningful camera checks were added to the existing `story-framing.test.ts` fixture at 390×844, 780×320 and 320×740. They exercise the actual World framing methods, vary the centered card bounds without changing the canonical Harbor frame or camera revision, project the lighthouse/hull/animal bounds into the full safe viewport, retain the short-phone no-push rule, then reset to the exact original play frame. These are isolated geometric fixtures, not gameplay captures.

The focused Session/mastery/unscored/ternhaven/progress/homecoming/framing run passed **163/163 tests across eight files**:

```powershell
npx vitest run tests/unit/arrival-mastery.test.ts tests/unit/ternhaven.test.ts tests/unit/unscored-practice.test.ts tests/unit/mastery.test.ts tests/unit/story-progress.test.ts tests/unit/orchard-progress.test.ts tests/unit/homecoming.test.ts tests/unit/story-framing.test.ts
node reviews/arrival-bubble/verify-protected.mjs
```

[The retained result](progress-homecoming-unit-results.txt) includes the invocation's execution time. [The protected manifest](protected-source-manifest.json) confirms **51 unchanged Git blobs** against the task base, covering every tracked data file, production rules/loader, campaign/story, audio, sailing motion, appearance mapping and ferry/model source. This verifies no puzzle, witness, story, save implementation or accepted audio/boat source changes within those scopes. The result UI, target registration and narrowly scoped World framing are the intentional changes.

The new camera checks passed on their first run; no additional failure was hidden or repaired. The earlier scoring-test import mistake remains recorded in [SCORING_CHECKS.md](SCORING_CHECKS.md). This review does not claim physical Android, acoustic listening, screen-reader speech or visual acceptance from source/tests alone.
