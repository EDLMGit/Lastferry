# ANDROID_RELEASE_REHEARSAL_01 · Rehearse a Play release locally

**Deliver a release-mode Android App Bundle (AAB) for local testing and prove that an install from that bundle can finish a rescue offline and keep it across an update.** v0.1.3 stays on the owner's and friend's phones for playtesting. The current priority for game direction is seeing what a player understands at their first dock.

Start on `m1-first-crossing` with the [v0.1.3 handoff](reviews/android-cove-view/REVIEW.md). The tested APK source is `faa3880c13835e1f9d566760bba8cf2b4d5c1e87`. The earlier test bundle used `bundleDebug`. The present Gradle project uses a single playtest application ID and a playtest version name. [Build configuration](android/app/build.gradle) · [Earlier bundle instructions](reviews/android-playtest/INSTALL.md)

## Build and install the release variant

Use the existing game, local assets and Android project. Give the local rehearsal a distinct temporary application ID so it can coexist with `com.lastferry.playtest`. Preserve the ordinary playtest build and its upgrade path. Keep the installable release label distinguishable on a test device. Use local test signing material outside source control and private developer inputs for any credentials. Codex owns the smallest configuration change that makes the process repeatable.

Build the release AAB, verify its signature and validate it with bundletool. Generate device-targeted APKs from that bundle, sign the generated APKs with a stable local test signer, and install the generated set. Inspect the delivered manifest, effective release flags, WebView debugging state, permissions and bundled assets. State which signer was used for the bundle and which for the installed APKs. Actual Play distribution uses its own signing flow. [Android bundletool](https://developer.android.com/tools/bundletool) · [Play App Signing](https://developer.android.com/studio/publish/app-signing)

## Play it and update it

Start offline from an empty rehearsal install and reach Home. Use the normal controls to rescue Holding Pier, accept earned lanterns and reach Bellwater. Change a preference. Build a second release bundle with a higher version code and the same rehearsal identity. Install the second bundle's generated APKs over the first. Cold-launch offline, open Practice and Continue, and show the earned lanterns, saved chapter and preference survived. Use a separate test profile or emulator for these checks. A short recording or a few settled device frames is enough. Keep release protections enabled throughout the gameplay proof.

## Handoff

Return the local test bundle through the existing private handoff, with its SHA-256, exact source, commands and a concise receipt identifying the tested device and artifacts. Explain how the owner will supply the permanent ID and privately provide the upload signer when ready. First installation and update **through Google Play** belong to the subsequent internal-track test. The owner controls Play Console setup, permanent identity, credentials and upload.

## Parallel playtest on v0.1.3

Give the friend an ordinary start at Home on their own installation. At first control ask, **“What are you trying to do, and what do you expect to change first?”** Let them attempt the rescue. Capture the first moment they hesitate, what they thought the tap would do, and what happened. On the owner's existing save, Holding Pier is available from Practice. Use a concrete observation to decide whether the game needs another UI change before internal testing. [Android phone build](reviews/android-cove-view/INSTALL.md) · [Launch plan](docs/GOOGLE_PLAY_LAUNCH.md)
