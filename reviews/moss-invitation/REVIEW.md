# Moss’s invitation at Holding Pier · phone playtest v0.1.6

Moss now speaks before the captain taps. His portrait, wish, replay button and the book icon with **Earn a Harbor log page** appear together. **Continue to Bellwater** stays the primary action. Captains who go straight on can still find the invitation in the Harbor log. The same wish is available at the helm during the replay.

The comparison point is the [commission at ee79ada](https://github.com/EDLMGit/Lastferry/blob/ee79ada760528ed2a090a813a70e3836ed581dc6/NEXT_TASK_MOSS_INVITATION.md). The APK and matching browser game use source `86a4e7b7c2b993630444c696068c1789f13a582d` on [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). [Install over v0.1.5](android-INSTALL.md) · [Package identity and web file hashes](android-package.json)

## What the choices look like

The [31-second landscape clip](android-offer-to-bellwater.mp4) holds on the ordinary offer before the first tap. It follows the captain through all twelve replay actions, holds on **Moss’s Own Crossing** and its **1/3 lanterns**, then opens *Another bell* and enters Bellwater on turn zero. The middle of the voyage plays at 4×. The two decisions play at their original speed. The private handoff alongside the APK also includes the uninterrupted 54-second Android original, `Moss-invitation-full-Android.mp4`. [Installed run](android-film.json) · [Recording timings and hashes](android-short-film.json)

| Installed Android screen | 320 × 740 portrait | 780 × 320 landscape |
| --- | --- | --- |
| Rue’s first keepsake gives the full replay destination | [Rue’s invitation](android-rue-portrait.png) | [Rue’s invitation](android-rue-landscape.png) |
| The ordinary arrival names Holding Pier above Moss’s offer | [Everyone home](android-ordinary-portrait.png) | [Everyone home](android-ordinary-landscape.png) |
| The earned page shows one lit lantern and **1/3 lanterns** | [Moss’s Own Crossing](android-moss-portrait.png) | [Moss’s Own Crossing](android-moss-landscape.png) |

The ordinary offer can be reproduced through play. Rescue everyone, continue directly to Bellwater, then start a new Journey while Rue’s page is already in the log and Moss’s is still available. A nine-action win at Holding Pier shows the three rescued neighbors and the invitation.

For Moss’s page, leave him at Stone Pier, bring the rabbits home, then sail back for him. The request evaluates each rabbit’s first arrival independently. The twelve-action trip earns one lantern. The earlier nine-action, three-lantern best remains in **Details**. Opening Details, closing the card or undoing the last delivery leaves the reward provisional. **Continue to Bellwater** keeps the page and opens *Another bell*. [Best in Android Details](android-moss-details-portrait.png) · [Web Details](web/moss-details-best.png) · [Installed walks and reproduction steps](android-REVIEW.md)

## Existing captain

The in-place Android test started with the shipped v0.1.5 APK. That captain accepted Bellwater, then cold-opened with the next story pending. After `adb install -r` and another cold launch, the Journey, both illustrated pages, both three-lantern bests and Reduced Motion matched the original save bytes. Continue opened *A light at the yard* and reached Driftwood Yard on turn zero. [Before the update](android-v5.json) · [Installed v0.1.6](android-upgrade.json)

## Browser and accessibility checks

The TypeScript and production Vite build passed, along with 802 unit tests in 70 files, all nine production browser checks and the 83-family asset catalog check. All 13 files in the portable browser ZIP match the local preview and signed APK byte for byte. The web ZIP SHA-256 is `4bc9fbc7fc20814a2db639c8a86d12459465ee68ea20f9eef849708b4582ff63`. The APK SHA-256 is `119a352c1fbf9d614dea897e883f2c39b178d71825e72739ba94a39f118341e6`. [Verification receipt](web/verification.json)

The production browser walks use touch, Chromium with SwiftShader and Reduced Motion. Both choices start with a fresh captain using the real transfer and sailing controls. The ordinary offer comes from starting a new Journey in the same profile. Additional cases use explicit historical saves for later chapters, supper and credits. The tests also exercise a storage-write retry, Undo across the rabbit delivery and an earned revisit at Holding Pier. A fresh captain cannot open the all-coves picker through the log, crossing menu or a direct finale link. [Interaction tests](../../tests/e2e/harbor-log.spec.ts) · [Browser build and results](web/verification.json)

At 320 × 740 and 780 × 320, the quote, book caption, current count, primary and secondary actions, Undo and Details fit before scrolling. The primary and replay buttons are consecutive keyboard stops. Expanded Details keeps the covered buttons out of the tab order. The lantern artwork and its visible text expose a single accessible name for the current result. The ordinary, Rue and Moss cards were checked in Chromium’s accessibility tree with Details closed and open. Physical handset and spoken TalkBack playback remain for owner review. [Browser portrait](web/rue-320x740.png) · [Browser landscape](web/ordinary-780x320.png) · [Count tests](../../tests/unit/arrival-presentation.test.ts)

## Reproduce the web checks

From the Git root use Node 24, run `npm ci`, `npm run build` and `npm run preview -- --port 5421 --strictPort`. The portable web ZIP can also be extracted and served over HTTP from its root. To exercise the production build and record phone-size frames, use the following commands in PowerShell.

```powershell
$env:LAST_FERRY_DEV_PORT='5421'
$env:LAST_FERRY_PRODUCTION_PORT='5421'
$env:LAST_FERRY_REVIEW_DIR='.cache/moss-invitation/shipping'
$env:JOURNEY_REWARD_FRAMES='reviews/moss-invitation/web'
node node_modules/@playwright/test/cli.js test harbor-log.spec.ts '[/\\]production\.spec\.ts$' --output=.cache/moss-invitation/shipping-results
npm run test:unit -- --maxWorkers=1 --testTimeout=20000
npm run check:assets
```
