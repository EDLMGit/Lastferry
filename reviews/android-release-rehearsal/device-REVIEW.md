# Offline device checks

The test ran on a separate Android 16 AVD using the Google Play API 36 x86_64 image, revision 7, with Google WebView 133. The guest reported a `user/release-keys` build and `ro.debuggable=0`. The physical framebuffer was 800×1850 at 400 dpi. Airplane mode was enabled, Wi-Fi and mobile data were off and Android reported no active default network. [Device targeting specification](device-spec.json)

The shipped ordinary v0.1.6 playtest ran alongside the rehearsal, starting with **Play** and zero rescued coves. The shell could see the WebView debugging socket owned by the ordinary app's process. With the game rendered in the release WebView, the same socket check returned no matching socket for that release process. The driver read Android's accessibility hierarchy, touched visible controls with `adb shell input`, and captured Android's framebuffer with `screencap`. It used no game storage API, injected game state, browser debugger or account on Google Play. [Ordinary app control](device-ordinary-before.json) · [First release install and runtime](device-first.json)

Code 7 first opened with **Play** and an empty log. The captain changed Motion from **Follow device** to **Reduced**, rescued Pip, Rue and Moss in nine actions without an Undo, accepted Rue’s Lantern and reached Bellwater Cove at action zero. A force-stop and relaunch showed one rescued cove, Rue’s page, the three-lantern best and the reduced-motion setting before the update. [Fresh Home](device-fresh-home.png) · [Rue and three lanterns](device-rue-three-lanterns.png) · [Bellwater before replacement](device-before-bellwater.png) · [Action and observation receipt](device-rescue.json)

The code 8 split set replaced code 7 with the same app ID (10218) and original installation time. After a force-stop, the observations from Home, the Harbor log, its earned revisit row and Motion matched code 7 exactly. The log showed **Rue’s Lantern** and **Rescued coves → The Holding Pier** with three lanterns, nine actions and zero Undos. Continue opened **Bellwater Cove** at action zero. The ordinary v0.1.6 playtest retained its separate app ID (10217), original APK bytes and empty log. [Update and checkpoint](device-update.json) · [Rue’s page](device-updated-rue-log.png) · [Rescued coves](device-updated-rescued-coves.png) · [Motion](device-updated-preference.png) · [Bellwater after update](device-updated-bellwater.png) · [Independent playtest](device-ordinary-after.json)

## Reproduce the run

Set `ADB` to Android Platform Tools’ adb executable and `ANDROID_SERIAL` to a separate, unlocked Google Play AVD. Enable airplane mode, disable Wi-Fi and mobile data, and install the shipped ordinary v0.1.6 APK. Leave the rehearsal package uninstalled and the ordinary captain at the start of the Journey. Run from the repository root with Python 3.9 or later and the two verified device-targeted archives.

```powershell
python reviews/android-release-rehearsal/device-play.py ordinary-before
python reviews/android-release-rehearsal/device-play.py first "<path-to-code-7.apks>"
python reviews/android-release-rehearsal/device-play.py rescue
python reviews/android-release-rehearsal/device-play.py update "<path-to-code-8.apks>"
python reviews/android-release-rehearsal/device-play.py ordinary-after
```

The install phases extract the complete base, language and density split set from the archive and install them together using Android’s package manager. Code 8 replaces code 7 in place. Each receipt records the installed path digests against the corresponding archive entries. On each launch, the driver selects the exact package and activity. A cold launch force-stops that package first.
