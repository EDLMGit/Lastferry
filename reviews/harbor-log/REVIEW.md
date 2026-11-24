# Harbor log · private playtest 0.1.4

Home shows the captain what came back from Holding Pier. Rue’s Lantern brings Pip, Rue and Moss together at the lighthouse. Moss’s Own Crossing shows him aboard the ferry on the trip the captain made for him. The log keeps both illustrations, the strongest lantern rating, the current Journey count and the next destination. From the same log the captain can replay a completed cove, take the request, or enter any of the thirteen Practice crossings.

The private Android APK uses game source `b768be9ea0659240226aec957bc567c20772f343`, on `m1-first-crossing`. The branch was clean when pulled from the v0.1.3 handoff to the commissioned baseline `4058ac58cc7c3aff531629e6fcf3f2afc4f0782c`. [Install instructions](android-INSTALL.md) · [Android package identity and digests](android-package.json)

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

The fresh captain took Moss’s request with Details open on a 320×740 viewport, earned the second page and immediately force-stopped the app. Offline relaunch showed both pages and the original three-lantern best. Continue opened Another bell and put the captain at the helm on turn zero. [Cold Home](android-cold-home.png) · [Cold Harbor log](android-cold-log.png) · [Bellwater helm](android-bellwater-helm.png) · [Device receipt](android-play.json)

Review found that a successful checkpoint write followed by a single failed verification read could leave Undo open on a rescue that was already saved. The shipping build rereads the expected bytes before deciding whether to enter the detour. A genuine failed write leaves the result available for another attempt. The Harbor entry store also merges earned entries on a retry and preserves unrecognized records.

On an earlier APK we force-stopped the app as soon as the earned Home card appeared. WebView had reported a successful save, but the next launch was missing Moss’s entry. The final Android shell synchronously writes the accepted Journey, lantern and Harbor log records to three private atomic files. A cold launch restores any stale WebView copy from the confirmed file. The old v0.1.3 values continue to supply each record until its first native write. During the upgrade test, WebView returned a missing Java string to JavaScript as `undefined`. Both `null` and `undefined` now read the original bytes. The ordinary web build still uses browser storage.

## Reproduce the web checks

For the portable build, extract `Last-Ferry-0.1.4-web.zip`, run `python -m http.server 5422 --bind 127.0.0.1` from the directory containing `index.html`, and open [the local game](http://127.0.0.1:5422/).

To reproduce from source, use Node 24 in the repository. Start the production preview in one terminal.

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
npm run test:unit -- --maxWorkers=1 --testTimeout=20000
npm run check:assets
```

The production browser checks run in touch-enabled Chromium with reduced motion and read the rendered controls. The 844×390 and 780×320 frames are emulated landscape, alongside 320×740 and 390×844 portrait checks and a 1440×900 desktop rescue. The Android screenshots come from the installed app on an Android 16 SDK phone emulator. [Browser environment and served bundle hashes](web/build.json)

The final production build and TypeScript check passed. All five Harbor log production-browser tests passed. The asset catalog validated 83 families. All 13 files served by the playtest URL match both the portable web ZIP and the signed APK byte for byte. The APK SHA-256 is `103563516239937f4a7c821a435b6e98d8ce7692fce7c680ec56ed87e61c540d`. [Verification receipt](web/verification.json)

All 790 unit tests in 68 files passed. Under concurrent emulator and browser load the Two Shelters geometry sweep exceeded its default five-second limit. The full suite passed with a twenty-second limit and the same assertions. The subsequent phone title adjustment changed only CSS and its browser test.

Early browser drivers tapped a covered control during the game’s 180 ms touch-through guard, or advanced before a single-passenger transfer had registered. The final driver leaves time between separate taps and verifies each committed turn.

An additional real-interface regression opened Details at the first arrival on a 320×740 screen. The panel originally covered the two voyage buttons. It now occupies the space above them. The 320×740 and 780×320 checks verified button hit targets with Details open and closed, tide Undo and keyboard continuation. [Focused regression](../../tests/e2e/arrival-bubble.spec.ts)

The 320-pixel Android capture also showed the Close button covering the end of the optional reward’s title. On narrow screens the title now wraps above Moss’s illustration. The browser test measures the title’s right edge against the button and captures the result. [Portrait reward](web/portrait-moss-arrival.png)

## Voluntary playtest

The owner said they plan to play a full game. Their actual first-arrival choice and what they hope it will lead to are still open. The device and browser walks above were scripted. Let the captain play from fresh Home through the first arrival and record what they choose next. If they stop, ask what would have made another trip worthwhile. Use that response to decide whether another request or a release rehearsal should come next.
