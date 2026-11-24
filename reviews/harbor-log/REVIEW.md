# Harbor log · private playtest 0.1.4

Home shows the captain what came back from Holding Pier. Rue’s Lantern brings Pip, Rue and Moss together at the lighthouse. Moss’s Own Crossing shows him aboard the ferry on the trip the captain made for him. The log keeps both illustrations, the strongest lantern rating, the current Journey count and the next destination. From the same log the captain can replay a completed cove, take the request, or enter any of the thirteen Practice crossings.

The private Android APK uses game source `29de344c886375b0524ed25026188993de7bb1eb`, on `m1-first-crossing`. The branch was clean when pulled from the v0.1.3 handoff to the commissioned baseline `4058ac58cc7c3aff531629e6fcf3f2afc4f0782c`. Subsequent handoff changes contain tests, evidence and documentation. [Install instructions](android-INSTALL.md) · [Android package identity and digests](android-package.json)

## What the captain can do

| At the helm or Harbor | Observed behavior |
| --- | --- |
| Inspect Shallows on the first turn | Moss’s face is on the deck gauge. Pip and Rue appear beside Rabbit Pier’s flood countdown. The free inspection shows that this loaded hull needs depth 2 and the passage has depth 1. [At the helm](web/01-helm.png) · [Shallows](web/02-shallows.png) |
| Bring everyone home together | The nine-action rescue earns three lanterns without Undo. Closing the result keeps it provisional. Reopening offers Bellwater or Moss’s request and explains that taking the request accepts the first rescue. [First choice](web/03-first-choice.png) |
| Take Moss’s request at the first arrival | The game saves the Journey at **Another bell**, keeps the ordinary best and opens a fresh Holding Pier Practice. The request remains available in Crossing details and the menu. |
| Bring the rabbits home, then undo | At action eight, both rabbits have reached Harbor and Moss waits at Stone. Undo restores action seven, tide one, both rabbits aboard and zero home. The player can redeliver or change the route. [Rabbit delivery](web/04-rabbits-home.png) · [After Undo](web/05-delivery-undone.png) |
| Collect Moss on his own trip | The twelve-action rescue earns a lantern and offers the illustrated page. Accepting keeps the page and the previous three-lantern best. A fresh Practice captain can also discover it independently and keep a zero-chapter Journey count. [Moss’s arrival](web/06-moss-arrival.png) · [Independent Practice log](web/portrait-practice-log.png) |
| Sail back with all three aboard instead | After undoing the rabbit delivery and changing route, unloading the rabbits and Moss separately from the same boat earns only the ordinary lantern result. The request page stays unearned. [Shared-boat result](web/desktop-shared-boat-result.png) |
| Return Home and continue | Home shows the best, one rescued cove and Bellwater. The log has both illustrated pages. Continue reopens **Another bell**, then the captain takes the helm at Bellwater on action zero. [Home](web/07-home.png) · [Log](web/08-log.png) · [Bellwater handoff](web/09-another-bell.png) |

The proof uses the existing reducer and legal actions. Exhausting 211 canonical states, including whether the promise still holds, gives a nine-action ordinary minimum and a twelve-action qualifying minimum. The search merges later turns only after the final tide rise. Neither route is shown to the player. [Search](../../tests/unit/holding-pier.test.ts) · [Request and persistence tests](../../tests/unit/moss-request.test.ts)

## Older captains and interrupted saves

The current Journey record supplies its accepted chapters, including the four unscored coves. The separate First Crossing contributes no Journey chapter. A previous Holding Pier best supplies its lanterns. Only a new, accepted rescue with the qualifying surviving passenger history can add Moss’s page. Replacing a Journey preserves previously earned keepsakes.

The in-place upgrade uses the same package name, local origin and certificate. The older Android profile had already earned two lanterns and reached Bellwater before this update. Its original Journey, best, preferences and backup were compared byte for byte. A separate emulator user supplies the fresh Journey. [Older save provenance](android-baseline.json) · [Installed upgrade](android-install.json) · [Native device walkthrough](android-REVIEW.md)

Review found that a successful checkpoint write followed by a single failed verification read could leave Undo open on a rescue that was already saved. The shipping build rereads the expected bytes before deciding whether to enter the detour. A genuine failed write leaves the result available for another attempt. The Harbor entry store also merges earned entries on a retry and preserves unrecognized records.

## Reproduce the web checks

Use Node 24 in the repository. Start the production preview in one terminal.

```powershell
npm ci
npm run build
npm run preview -- --port 5421
```

In another terminal, run the focused production journeys and the full unit suite.

```powershell
$env:LAST_FERRY_DEV_PORT='5421'
$env:LAST_FERRY_PRODUCTION_PORT='5421'
$env:LAST_FERRY_REVIEW_DIR='.cache/harbor-shipping'
$env:HARBOR_FRAMES='reviews/harbor-log/web'
npm run test:e2e -- harbor-log.spec.ts --output=.cache/harbor-shipping-browser
npm run test:unit -- --maxWorkers=1
npm run check:assets
```

The production browser checks run in touch-enabled Chromium with reduced motion and read the rendered controls. The 844×390 and 780×320 frames are emulated landscape, alongside 320×740 and 390×844 portrait checks and a 1440×900 desktop rescue. The Android screenshots come from the installed app on an Android 16 SDK phone emulator. [Browser environment and served bundle hashes](web/build.json)

The final production build and TypeScript check passed. All 786 unit tests across 67 files and all five Harbor log production-browser tests passed. The asset catalog validated 83 families. The 13 files in the portable web ZIP match the signed APK’s game files byte for byte, including the JS and CSS fetched by the browser tests. The APK SHA-256 is `595285d47abeabe5ce1907564f8718e7efb8b71617b77e134aa599b23f6211e2`. [Verification receipt](web/verification.json)

Early browser drivers tapped a covered control during the game’s 180 ms touch-through guard, or advanced before a single-passenger transfer had registered. The final driver leaves time between separate taps and verifies each committed turn.

## Voluntary playtest

The owner said they plan to play a full game. Their actual first-arrival choice and what they hope it will lead to are still open. The device and browser walks above were scripted. Let the captain play from fresh Home through the first arrival and record what they choose next. If they stop, ask what would have made another trip worthwhile. Use that response to decide whether another request or a release rehearsal should come next.
