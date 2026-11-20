# Install the Android playtest

Copy **Last-Ferry-0.1.2-playtest.apk** from the private handoff to the phone. Open the APK in Files and allow that app to install unknown apps if Android asks. Tap **Install** and then **Open**. You can turn on airplane mode before the first launch. A fresh installation starts at Home with **Play**.

The playtest requires Android 10 or later, an enabled Android System WebView based on Chromium 111 or newer, and WebGL 2 graphics. The installed test ran on Android 16 with WebView 133. The native recovery screen explains what to update and offers a retry. Your phone's browser and the installed app each keep their own progress.

For an update, install the new APK over the installed playtest. Keep the existing app and its data. If Android rejects a different signing identity, obtain the matching signed build. Uninstalling or clearing app storage erases the app’s saves. Updates resume at the last accepted cove boundary. Moves within an unfinished crossing restart when the process has been closed.

| Private handoff | Use |
| --- | --- |
| `Last-Ferry-0.1.2-playtest.apk` | Install this build for normal play. |
| `Last-Ferry-0.1.1-update-fixture.apk` | First install for repeating the upgrade proof on a fresh test device. |
| `Last-Ferry-0.1.2-validation.aab` | Unsigned test bundle for local bundletool validation. |

The APK SHA-256 is `26cd6398d120997c3835c2ba68392014e83bad36d0dbaf42022009b1da4fba56`. The two APKs use application ID `com.lastferry.playtest`, origin `https://appassets.androidplatform.net` and the same machine-local debug signing certificate. [Both versions and signing fingerprint](package/verified.json)

## Build from source

Use source commit `56228ef8174b2147aa7f397661f2a6f5801e86d2`, Node 24, JDK 17, Android SDK Platform 36 and Build Tools 36.0.0. The checked-in Gradle 8.11.1 wrapper resolves Android Gradle Plugin 8.10.1 and AndroidX WebKit 1.13.0. Enable the Android SDK licenses for these packages and point `ANDROID_HOME` and `JAVA_HOME` to their installations. The initial developer build downloads dependencies. The resulting installed app runs offline.

Run from the Git root in PowerShell. Use the same Android user directory and preserve its debug keystore across builds. The first debug build on a different machine normally generates a different signer.

```powershell
npm ci
npm run build
.\android\gradlew.bat -p android :app:assembleDebug -PplaytestVersion=1
Copy-Item android/app/build/outputs/apk/debug/app-debug.apk Last-Ferry-0.1.1-update-fixture.apk
.\android\gradlew.bat -p android :app:assembleDebug :app:bundleDebug -PplaytestVersion=2
Copy-Item android/app/build/outputs/apk/debug/app-debug.apk Last-Ferry-0.1.2-playtest.apk
Copy-Item android/app/build/outputs/bundle/debug/app-debug.aab Last-Ferry-0.1.2-validation.aab
```

On macOS or Linux invoke `./android/gradlew -p android` with the same tasks and version property. Gradle builds the Vite assets from source when packaging. Both APKs and the test bundle contain every output from the separate web production build.

## Reproduce the update

On a fresh test device with USB debugging enabled, turn on airplane mode and turn Wi-Fi off. Use ADB to install version 1. Launch the app, complete Holding Pier, choose **Continue story**, and take the helm in Bellwater. Use the following commands with the matching APKs. The replacement and force-stop preserve installed app data.

```sh
adb install Last-Ferry-0.1.1-update-fixture.apk
adb shell am start -n com.lastferry.playtest/.MainActivity
```

After earning the save, install the update and cold-launch it.

```sh
adb install -r Last-Ferry-0.1.2-playtest.apk
adb shell am force-stop com.lastferry.playtest
adb shell am start -n com.lastferry.playtest/.MainActivity
```

At Home, Practice shows the earned Holding Pier best. Continue opens Bellwater at its cove boundary. [Installed-device driver and receipts](play/README.md)

## Validate the test bundle

Using bundletool 1.18.3, the following commands validate the local AAB and generate an installable universal APK set. Keep the debug keystore local. The owner chooses the permanent Play identity and release signer before store distribution.

```sh
java -jar bundletool-all-1.18.3.jar validate --bundle=Last-Ferry-0.1.2-validation.aab
java -jar bundletool-all-1.18.3.jar build-apks --bundle=Last-Ferry-0.1.2-validation.aab --output=last-ferry.apks --mode=universal
```

[Package and local-content audit](package/README.md) · [Android local assets](https://developer.android.com/develop/ui/views/layout/webapps/load-local-content) · [Android update rules](https://developer.android.com/google/play/app-updates) · [Bundletool](https://developer.android.com/tools/bundletool)
