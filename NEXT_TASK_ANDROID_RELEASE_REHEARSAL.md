# ANDROID_RELEASE_REHEARSAL_01 · Rehearse a Play release locally

**Deliver a release-mode Android App Bundle (AAB) for local testing and prove that an install from that bundle can finish a rescue offline and keep it across an update.** Use the reviewed v0.1.6 game. The owner and a fresh player can play the existing build while Codex rehearses the release package.

Start on `m1-first-crossing` with the [v0.1.6 handoff](reviews/moss-invitation/android-REVIEW.md). Its package receipt identifies game source `86a4e7b7c2b993630444c696068c1789f13a582d`, version code 6. The evidence head is `8d211cdec82ca2ff3e690606a175a157c6e3cb1a`. The earlier test bundle used `bundleDebug`. The present Gradle project uses a single playtest application ID and a playtest version name. [Build configuration](android/app/build.gradle) · [Earlier bundle instructions](reviews/android-playtest/INSTALL.md)

## Build and install the release variant

Use the existing game, local assets and Android project. Give the local rehearsal a distinct temporary application ID so it can coexist with `com.lastferry.playtest`. Preserve the ordinary playtest build and its upgrade path. Keep the installable release label distinguishable on a test device. Use local test signing material outside source control and private developer inputs for any credentials. Codex owns the smallest configuration change that makes the process repeatable.

Build the release AAB, verify its signature and validate it with bundletool. Generate device-targeted APKs from that bundle, sign the generated APKs with a stable local test signer, and install the generated set. Inspect the delivered manifest, effective release flags, WebView debugging state, permissions and bundled assets. Compare the shipped web files with the [v0.1.6 package receipt](reviews/moss-invitation/android-package.json). Exercise the normal player build with developer access disabled. State which signer was used for the bundle and which for the installed APKs. Actual Play distribution uses its own signing flow. [Android bundletool](https://developer.android.com/tools/bundletool) · [Play App Signing](https://developer.android.com/studio/publish/app-signing)

## Play it and update it

Start offline from an empty rehearsal install and reach Home. Use the normal controls to rescue Holding Pier, accept Rue’s page and earned lanterns, then reach Bellwater. Change a preference and record the checkpoint, page, best and preference as they stand before the update. Build a second release bundle with a higher version code and the same rehearsal identity. Install the second bundle's generated APKs over the first. Cold-launch offline. Open the Harbor log and show Holding Pier under Rescued coves with the same earned lanterns and Rue’s page. Confirm the preference and use Continue to open the saved chapter. Identify the installed version code before and after. Keep the rehearsal save independent of the installed playtest. Use a separate test profile or emulator for these checks. A short recording or a few settled device frames is enough. Keep release protections enabled throughout the gameplay proof.

## Handoff

Return the local test bundle through the existing private handoff, with its SHA-256, exact source, commands and a concise receipt identifying the tested device and artifacts. Explain how the owner will supply the permanent ID and privately provide the upload signer when ready. First installation and update **through Google Play** belong to the subsequent internal-track test. The owner controls Play Console setup, permanent identity, credentials and upload.

## Parallel playtest on v0.1.6

Let a new player start at Home on their phone with a fresh browser save or their own playtest installation. Watch what they do at the first dock and let them choose freely at the first arrival. Once they have chosen, ask what they expected that button to do and what made them choose it. If they pick Moss, see whether they recognize the page and their lantern count on return. If they head to Bellwater, find out whether they understood the offer and simply preferred to continue. Both are valid choices. Record the player's words and first hesitation before suggesting another interface or reward change.

[Private phone playtest](https://last-ferry-playtest.abumech.chatgpt.site/) · [Installed v0.1.6 evidence](reviews/moss-invitation/android-REVIEW.md) · [Launch plan](docs/GOOGLE_PLAY_LAUNCH.md)
