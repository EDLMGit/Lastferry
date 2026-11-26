# Harbor log on Android

The device walk uses an Android 16 SDK phone emulator with WebView 133 in airplane mode. Its historical profile contains the Bellwater checkpoint and two-lantern best earned during the original installed playtest. The archived storage values provide independent comparison data. The emulator ran with `-read-only -no-snapshot` so this session’s changes stay in a disposable overlay. A second Android user supplies an empty app profile for the first-arrival journey.

The corrected `0.1.4-playtest` APK installed over the shipped v0.1.3 with `adb install -r`. The app retained UID 10151, the original install time and all six saved values byte for byte. After force-stop and relaunch in airplane mode, Home showed one of twelve and the original two lanterns. Its log offered Moss’s request, with no optional entry earned. Continue reopened the original Bellwater Cove checkpoint. [v3 baseline](android-baseline.json) · [Replacement receipt](android-install.json) · [Migrated Home](android-upgraded-home.png) · [Migrated log](android-upgraded-log.png)

The fresh profile used a 320 × 740 CSS viewport with Android’s system bars and a native 800 × 1850 framebuffer. The nine-action Journey rescue earned three lanterns. Taking Moss’s request from the expanded first-arrival Details saved the pending Another Bell scene before Practice started. [First arrival](android-first-arrival-choice.png) · [Expanded Details](android-first-arrival-details.png)

The separate trip delivered both rabbits at turn eight. Undo restored turn seven, the previous tide and both passengers aboard. Delivering them again and coming back for Moss earned one lantern at turn twelve. After acceptance, the test immediately force-stopped the package. The next offline launch restored both illustrated entries and the stronger three-lantern best. Continue played Another Bell and opened Bellwater Cove at action zero. [Installed turn and save record](android-play.json) · [Moss’s crossing](android-moss-arrival.png) · [Cold Home](android-cold-home.png) · [Cold log](android-cold-log.png) · [Another Bell](android-bellwater-story.png) · [Bellwater helm](android-bellwater-helm.png)

The first touch on Sail at turn ten left Harbor selected, with Moss aboard at Stone. The driver timed out while waiting for turn eleven. We saved its partial record, reattached to the same live crossing and checked the destination, enabled button, passengers, turn, checkpoint and best. A second touch advanced to eleven exactly once. The cause of the missed touch was undetermined. The full reward heading wraps into two lines clear of the Close button on the final installed frame. [Original partial run](android-before-retry.json) · [Before the second touch](android-before-sail-retry.png)

## Reproduce the device walks

Set `ADB` to Android Platform Tools’ adb executable and `ANDROID_SERIAL` to the emulator’s serial. If using a separate adb server, set `ANDROID_ADB_SERVER_PORT` as well. Use the private v3 APK and the original saved test device for the upgrade walk. These scripts stop and start the game, read its public UI and browser storage, dispatch touches and take native Android screenshots.

```powershell
node reviews/harbor-log/android-upgrade.mjs baseline
node reviews/harbor-log/android-upgrade.mjs install "<path-to-v4-apk>"
```

For the first rescue, create a separate Android test user, then replace `10` in the following commands with the returned ID. Wait for the user state to reach `RUNNING_UNLOCKED`.

```powershell
adb shell pm create-user HarborLogPlaytest
adb shell cmd package install-existing --user 10 com.lastferry.playtest
adb shell am switch-user 10
adb shell am get-started-user-state 10
adb shell wm dismiss-keyguard
adb shell wm density 400
adb shell wm size 800x1850
node reviews/harbor-log/android-play.mjs
```

The gameplay walk starts from an empty profile and uses the installed app’s Home, story and gameplay controls. Its cold start uses `am force-stop` and an explicit launch of the same installed package. The saved progress and lantern result are read before and after each transition. The script also checks that the one-lantern trip leaves the three-lantern best intact.

The recorded continuation used `node reviews/harbor-log/android-play.mjs --resume-final-sail` on the same live session after preserving `android-before-retry.json`. The unmodified fresh-run command above includes the whole route.
