# Six connected coves

JOURNEY_SIX_COVES_01 connects the accepted coast on `m1-first-crossing`. The clean checkout at reviewed runtime `f23e9b087e80316c3884ed5fa83cce25cf6508a0` fast-forwarded to task and continuity commit `4de9b4431f4edbbb9d818252a509c2a2ff82e941`. The existing private Site serves the reviewed runtime as version 17. [Publication receipt](../optional-tips/deployment-confirmation.json)

Play the [local root Journey](http://127.0.0.1:5270/). Holding, Bellwater, Driftwood and Two Shelters use the small ferry. After Two Shelters, Nell launches the larger boat for Wide Berth and Reef Return. Accepting Reef’s rescue completes the available coast. First Crossing and the six Journey coves remain available independently in Practice.

## Returning players

| Existing checkpoint | What Continue does |
| --- | --- |
| Early scene or cove | Reopens the same recap or cove start. |
| Two complete | Starts Nell’s Driftwood entry. |
| Three complete or launch pending | Starts Two Shelters. The unseen launch follows its rescue. |
| Wide active | Starts Two Shelters. Wide then reopens with its launch already acknowledged. |
| Four complete, including Wide | Starts Two Shelters, retains the earned Wide rescue and continues to Reef. |

Home explains the changed resume point. Only deliberate Continue converts an affected record. Conversion first verifies and backs up its original bytes under a separate key, preserving an existing distinct backup. A changed primary, denied backup or failed write leaves the old stored progress available and allows this visit to continue in memory. Earlier saves, Options, Practice and direct cove links were exercised through the actual interface. Winning remains undoable until Continue story accepts the rescue. [Home with an earned Wide rescue](saves/780x320-legacy-home.png)

## Story and phone evidence

Among the reeds shows the two beavers riding the small ferry. Mica steps out at the reed landing and a beaver answers from the deck. Lights beyond the reef keeps Heather and Birch aboard while Flick raises a lantern and Dot answers from a separate shore. Each seven-second scene offers its final handoff immediately. A restored pending scene holds the recap. Both use the existing story player, music and finite Sound effects.

| Scene and viewport | Beginning | Visible action | Held endpoint |
| --- | --- | --- | --- |
| Two Shelters, 390×844 | [Beginning](phone/two-shelters/390x844-begin.jpg) | [Action](phone/two-shelters/390x844-action.jpg) | [Endpoint](phone/two-shelters/390x844-end.png) |
| Two Shelters, 780×320 | [Beginning](phone/two-shelters/780x320-begin.png) | [Action](phone/two-shelters/780x320-action.png) | [Endpoint](phone/two-shelters/780x320-end.png) |
| Reef Return, 390×844 | [Beginning](phone/reef-return/390x844-begin.jpg) | [Action](phone/reef-return/390x844-action.jpg) | [Endpoint](phone/reef-return/390x844-end.png) |
| Reef Return, 780×320 | [Beginning](phone/reef-return/780x320-begin.png) | [Action](phone/reef-return/780x320-action.png) | [Endpoint](phone/reef-return/780x320-end.png) |

Initial phone inspection led to more room at the larger ferry’s stern, clearer separation between the rabbits’ landings and the wheelhouse, and better clearance between the bow lamp and the beavers. The short-landscape captions on the two new scenes use darker ink. Contrast at the sampled water colors improved from 3.78:1 to 5.49:1 for Two Shelters and from 3.65:1 to 5.29:1 for Reef. All 36 pixel comparisons of the six earlier shots matched the starting painter at beginning, midpoint and endpoint, including the eight-second launch. [Scene inspection](SCENE_INSPECTION.md) · [Illustration comparison](illustration-parity.json)

The uninterrupted portrait recording begins at Home with Wide already rescued. Continue plays both new scenes and the actual Two Shelters and Reef rescues through the six-cove endpoint. It retains all 591 captured viewport frames over 84.33 seconds with their original timestamps and the stereo runtime mix at its recorded level. The audio tail brings the file to 84.78 seconds. Capture gaps are visible at natural duration. Both streams decoded successfully. [Play the recording](phone/continuation/two-shelters-to-reef.mp4) · [Timestamps and encoding](phone/continuation/two-shelters-to-reef-encoding.json)

The portrait action images come directly from the recording. Mica moves at 2.878 seconds within her greeting and Dot raises her light at 4.057 seconds within her answer. Both held endpoints recorded 7,000 ms with zero interruption gap. The extraction check passed against the authored movement windows. [Frame selection check](frame-recheck.txt)

## Verification record

The 125 focused unit checks cover the registry, version-1 saves, story presentation/staging/framing, independent Practice and optional Tips. The original 13 four-cove expectations were retained in the first run log, then updated for the new order. The first typecheck caught a test using an array method from a newer JavaScript library. The corrected test uses the existing ES2022 target. [Unit results](units.txt) · [Original unit run](iterations/original-route-units.txt) · [Original typecheck](iterations/first-build.txt)

Windows, Node 24.15.0 and Chromium 156.0.8078.4 with touch emulation, DPR 1 and SwiftShader were used. The production build passed TypeScript and Vite with the existing large-chunk warning. The inventory validator passed with all 79 IDs. Four families gained updated uses or descriptions: `story.illustrations`, `ui.story-presentation`, `ui.home-composition` and `audio.story-effects`. [Build](build.txt) · [Asset validation](assets.txt)

All 11 browser cases against the production build passed. They cover each of the five legacy forms, exact original bytes and backup order, reload into a settled recap, early checkpoints, malformed and future records, denied writes, and isolation through Home, Options and Practice. [Production results](production-saves.txt)

A fresh player completed all six rescues using the real controls, with Reduced Motion and Tips Off. The accepted witnesses took 9, 10, 12, 11, 12 and 10 actions in Journey order. Boat capacity was four through Two Shelters and six after the launch. A separate normal-motion continuation began with the historical four-rescue record. It completed Two Shelters and Reef, undid both a tide change and a terminal win in each, kept the original bytes, and reached the six-cove endpoint. The recorded runtime played all three new scene effects on a single Sound context. The short-landscape check also exercised Pause/Resume, keyboard Skip, pending-scene reload, immediate handoff and cue cleanup. [Fresh sequence](phone/fresh/rescues.json) · [Returning player](phone/continuation/390x844-result.json) · [Short-landscape result](phone/continuation/780x320-result.json)

The first route rehearsal triggered the existing repeated-tap protection. Development hot reload interrupted a subsequent rehearsal and a source edit invalidated another capture. On the final runtime the first three-case browser batch passed the fresh rescue. Two capture assertions read the Reef scene clock after the screenshot had returned and the scene had settled. The short-landscape recheck used the actual Pause control to hold the action. Portrait used timestamped frames from natural-speed gameplay. It reached the endpoint successfully, then the frame extractor rejected a Two Shelters action frame 408 ms from its requested midpoint. These runs retain their original outcomes. [Rehearsal](iterations/fresh-rapid-taps.txt) · [Hot reload](iterations/fresh-hmr.txt) · [Source change](iterations/fresh-source-change.txt) · [First batch](journey-browser.txt) · [Recheck](journey-recheck.txt)

The corrected portrait case passed again end to end in a separate output directory, including the selections from its own movie. The first full batch was 1/3, the two affected phone reruns were 1/2, the offline frame check was 1/1, and the final portrait rerun was 1/1. Together with the 11 production save cases, all 14 distinct browser cases have a passing run. The earlier successful gameplay recording remains the selected film. A separate TypeScript check passed after the capture helper changes. [Final portrait run](portrait-final.txt) · [Machine-readable result](portrait-final-results.json) · [TypeScript](typecheck.txt)

## Reproduction

From the repository root with Node 24, run `npm ci` and `npm run dev -- --port 5270`. Visit the root URL for the Journey. For the focused checks, install Playwright Chromium and use a fresh output directory for your evidence.

```powershell
npm run build
npm run check:assets
npm run test:unit -- tests/unit/story-progress.test.ts tests/unit/two-shelters-practice.test.ts tests/unit/story-presentation.test.ts tests/unit/story-staging.test.ts tests/unit/story-framing.test.ts tests/unit/optional-tips.test.ts --maxWorkers=1
$env:LAST_FERRY_REVIEW_DIR = 'test-results/six-cove-rerun'
npm run test:e2e -- journey-six-saves.spec.ts journey-six-coves.spec.ts --workers=1
```

The final phone capture ran on a local Vite server with hot reload disabled. The 98 runtime inputs are listed under identity `cd959f33d85986bb6d00664f48e2d4d43c08fc0b5c98c9eaf1aed5e70e97531e`. The evidence audit matched 94 committed inputs byte for byte and the other four after Git newline normalization. It also verified all 25 selected images/recordings and recorded the seven built file hashes. The 18 files under `data/` retain the reviewed Git tree `4fd5ebb56acf9cb0fcc1e249df7c245e811ca0d7`. [Source manifest](tested-source.json) · [Media and build manifest](MEDIA.json)

Human review of the new compositions, physical-phone performance and speaker playback remain open. Historical timing and layout limits are recorded in [project continuity](../../docs/PROJECT_STATE.md). Historical milestone browser suites were outside this focused run. The private Site still serves version 17.
