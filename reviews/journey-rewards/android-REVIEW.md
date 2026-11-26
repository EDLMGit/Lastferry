# Journey rewards on Android

The private Android 16 phone emulator ran offline with WebView 133. The package manager installed version 5 over the shipped version 4 with `adb install -r` and retained app ID 10151 and the original install time. The installed v0.1.5 APK has SHA-256 `dba12159d6fdc3ffd37152d63c611e4957a635be7517be5834ee94b19ee5a5a4`. Its 13 bundled web files match the production build. [Package and signer](android-package.json) · [Install instructions](android-INSTALL.md)

## Upgrade

On the shipped v0.1.4 APK, a new captain played the nine-action Holding Pier rescue, took the request and brought Moss back on the separate trip. A second rescue at Bellwater saved *A light at the yard* as the next scene. The captain entered the update with both keepsakes, two three-lantern bests and reduced motion. After replacement and a force-stop, the upgrade check compared each native record and every Last Ferry WebView storage value with the originals. A second profile retained an older Bellwater checkpoint, its two-lantern best, preferences and original backup. [v4 route and saved bytes](android-v4.json) · [Before update](android-v4-captain.png) · [Upgrade comparison](android-upgrade.json) · [Upgraded log](android-upgraded-log.png)

## From Moss to Bellwater

The fresh captain saw Play even with a direct finale query. The empty log offered no cove or request, and the crossing menu had no picker. After a nine-action first rescue, **Take Moss’s request** opened his trip and saved *Another bell*. Both rabbits reached Harbor on action eight. Moss came home separately on action twelve. Opening Details, closing it and undoing the terminal delivery left the accepted saves unchanged. [Fresh log](android-fresh-log.png) · [Installed actions, touch coordinates and saves](android-fresh.json)

The 12.87-second native recording starts at action eleven with **Bring Moss home** visible. The captain delivers him, sees his illustrated page, touches **Continue to Bellwater**, watches *Another bell* and enters Bellwater Cove with zero actions used. The reward button visibly enters its pressed state before the scene appears. The Android touch coordinates for those three actions were (258, 1362), (400, 1108) and (400, 1613). The original H.264 recording is 800×1850, with Android touch indicators enabled and no audio track. Its SHA-256 is `42df4df400d2eba26e37ff5ac36d57238f558ee21d84800119605f4ba266c0ed`. [Uninterrupted installed recording](android-moss-to-bellwater.mp4)

After a force-stop, the fresh captain retained both keepsakes, the three-lantern best and the Bellwater checkpoint. The earned Holding Pier revisit opened from the log at action zero. [Cold earned log](android-cold-earned-log.png)

The upgraded captain took the request from the log with *A light at the yard* still pending. Bringing everyone home together at action nine offered **Try Moss’s request again** and **Continue to Driftwood**. On the retry, bringing Moss home separately showed an ordinary rescue for the previously earned page. Continuing opened the saved scene and then Driftwood Yard at action zero. Both keepsakes and both three-lantern bests stayed byte-identical. [Missed request](android-missed-request.png) · [Repeat result](android-repeat-ordinary.png) · [Later captain’s route and saves](android-later.json)

The four native screenshots show the system bars, painting, title, destination button and utility row. Each control's center was touchable and its entire bounding box was within the Android safe area, with the result panel at scroll zero. Portrait is 320×740 CSS pixels (800×1850 native). Landscape is 780×320 CSS pixels (1950×800 native).

| Illustrated page | Portrait | Short landscape |
| --- | --- | --- |
| Rue’s Lantern | [First arrival](android-rue-portrait.png) | [First arrival](android-rue-landscape.png) |
| Moss’s Own Crossing | [Separate trip](android-moss-portrait.png) | [Separate trip](android-moss-landscape.png) |

## Reproduce the installed checks

Use an offline disposable Android 16 emulator with WebView 111+ and WebGL 2. Set `ANDROID_SERIAL` and `ADB` to its serial and adb executable. Set `ANDROID_ADB_SERVER_PORT` when using a private adb server. The historic owner profile in the upgrade comparison comes from the earlier Android playtest. On a second empty Android user, install the shipped v0.1.4, set display density 400 and size 800×1850, then earn the v4 records with these commands from the repository root.

```powershell
$env:FERRY_PLAY_OUT = '.cache/journey-rewards/earned-on-v4'
node reviews/harbor-log/android-play.mjs
$env:FERRY_PLAY_OUT = 'reviews/journey-rewards'
node reviews/journey-rewards/android-play.mjs v4
node reviews/journey-rewards/android-play.mjs upgrade "<path-to-v5-apk>"
```

For the first Journey on v0.1.5, create a new Android user with `adb shell pm create-user FreshV5`. Use the returned user ID with `adb shell cmd package install-existing --user <id> com.lastferry.playtest` and `adb shell am switch-user <id>`. Wait for `adb shell am get-started-user-state <id>` to return `RUNNING_UNLOCKED`, dismiss the keyguard, set the new profile to display density 400, then run `node reviews/journey-rewards/android-play.mjs fresh`. Switch back to the upgraded captain and run `node reviews/journey-rewards/android-play.mjs later`. The driver uses touches on the installed interface, reads the committed saves, takes native screenshots and records the final trip with Android's screen recorder.

The recorded later-captain walk used `later --open-home` after the first automation connection stalled during Android user switching. The app had reached Home. The driver reattached there and compared the full saved records against the pre-upgrade captain before taking the request.
