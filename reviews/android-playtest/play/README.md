# Android playthrough and signed update

Use a fresh disposable emulator. The driver installs the first APK, touches controls in its debug-enabled Android WebView, uses Android's native select popup and Back/Home keys, and captures the Android framebuffer. It reads the production DOM and stored game records. The test starts the installed activity from its local HTTPS origin.

## Earned in-place update

On Android 16 (API 36), airplane mode with no default network, a fresh version 1 install reached the actual Home with empty storage. Through touch controls it rescued Pip, Rue and Moss in nine actions, undid the first tide rise and final arrival, then accepted two earned lanterns and entered Bellwater. Android replaced the game using `adb install -r` with version 2. The package retained app ID 10151 and its original installation time. The exact strings for the Bellwater checkpoint, earned best, historical backup and three chosen preferences matched before and after the install and cold restarts. Continue restarted Bellwater at action zero. [Played rescue](earn.json) · [Package and byte comparison](update.json) · [Second cold-start comparison](after-update.json)

[Earned on version 1](08-earned-holding.png) · [Continue on version 2](10-updated-home-settled.png) · [Two lanterns on version 2](11-updated-best-settled.png) · [Restored Bellwater](12-cold-bellwater-settled.png)

With only Rue selected, rotating the app preserved the chooser, selection and turn. While Android Home was active, the corrected build's Web Audio clock held at 24.2507 seconds for 1.4 seconds. Returning resumed the existing context with the original choice. Android Back canceled the chooser without spending an action. A running output analyser during play measured RMS 0.00879 and peak 0.03574 at 48 kHz. [Portrait chooser](04-portrait-chooser.png) · [Landscape chooser](05-landscape-chooser.png)

The seven-action final rescue delivered Pipit, Rill, Mallow and Osier, followed by explicit continuation to supper and credits. Separate proof used a prepared eleven-rescue checkpoint. [Ending receipt](ending.json) · [Last Ferry arrival](13-last-arrival.png) · [Supper](14-supper.png) · [Credits](15-credits.png)

Two continuous Android emulator recordings include the guest speaker stream, with no added music or gain processing. Both captures are quiet. Holding's clip includes the approach, provisional arrival, Undo and redelivery. The last-cove clip includes the loaded approach, delivery, supper and credits. Physical handset performance, speaker balance and human listening remain unverified. [Holding Pier recording](holding-arrival.mp4) · [Last Ferry recording](last-ferry-supper.mp4) · [Video provenance and measured levels](media.json)

## Reproduce

From the repository root with Node 24, use the same local debug signer for both APKs. Install the locked Node dependencies. Set the serial and path to the Android SDK's ADB executable. These commands expect a new test emulator with the game absent. They change only that emulator's connectivity and rotation settings.

```powershell
$env:ANDROID_SERIAL = 'emulator-5582'
$env:ADB = (Resolve-Path .cache/android-playtest/sdk/platform-tools/adb.exe).Path
& $env:ADB shell cmd connectivity airplane-mode enable
& $env:ADB shell svc wifi disable
& $env:ADB shell svc data disable
node reviews/android-playtest/play/play.mjs earn .cache/android-playtest/artifacts/final/last-ferry-v1.apk
node reviews/android-playtest/play/play.mjs update .cache/android-playtest/artifacts/final/last-ferry-v2.apk
node reviews/android-playtest/play/play.mjs after-update
node reviews/android-playtest/play/play.mjs ending
```

Set `FERRY_PLAY_OUT` to an alternate directory for a fresh set of receipts. The actual APK outputs, their hashes and signer are identified in the parent review. The development connection is local ADB. The installed game reads its own bundled production files.

## What the first installed run found

The initial APK handled rotation but kept playing audio after the user pressed Android Home. Launcher was in the foreground. The WebView still reported a visible document, and three passive debugger samples measured its running audio clock at 85.837, 86.563 and 87.291 seconds. The driver’s initial wait on document visibility timed out. The corrected Activity informs the game of foreground changes directly. The repeated test checks the actual audio clock, task identity, turn and passenger choice. [Original device measurement](first-run/original-android-background.json) · [First failed playthrough](first-run/earn-failure.json)

The first final-build driver expected “Bellwater” where the UI correctly said “Bellwater Cove”. The driver resumed on that same earned save after correcting the assertion. During the update, the badge's DOM changed before Android's screenshot contained it. The original frames are preserved. The `-settled` frames above come from a subsequent force-stop, cold launch and real visit to Practice on the same updated app. [Name mismatch](earn-failure.json) · [Follow-up capture](after-update.json)

In the separately prepared ending test, an immediate force-stop after the debugger inserted a temporary fixture reopened the previous Bellwater checkpoint. The corrected test reloads the same-origin document and checks the Last Ferry title before playing. After reaching credits it restored and cold-verified all six original earned strings. [Original setup failure](ending-failure.json) · [Completed check](ending.json)

## Save fixtures

Holding Pier's rescue, best and Bellwater checkpoint are earned through gameplay. One historical Ternhaven backup string is copied into its own secondary key before the update so the test can check the original bytes. The exact string comes from [the archived original](../../ternhaven-journey/gameplay/390x844/route.json).

The separate ending check takes an earned eleven-rescue checkpoint from [the complete Journey recording](../../journey-home/play/voyage.json). It plays Last Ferry, delivers the four neighbors and explicitly continues first to supper and then to credits. It restores the first test's exact earned Bellwater record when finished.
