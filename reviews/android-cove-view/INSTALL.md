# Update the Android playtest to v0.1.3

Copy **Last-Ferry-0.1.3-playtest.apk** from the private handoff to the phone where v0.1.2 is installed. Open the file in Android Files and choose **Update**. If prompted, allow Files to install apps. Keep Last Ferry installed and keep its app data. Uninstalling or clearing storage erases the app’s local progress.

Open the game, choose **Practice** to check an earned lantern best, then choose **Continue** to return to the saved Journey chapter. A cold start opens that chapter at its entrance. The app can start in airplane mode, including on a fresh install. Browser and installed-app saves are separate.

The app requires Android 10 or later, WebView 111 or newer and WebGL 2. Version code 3 uses the same package, local HTTPS origin and debug certificate as version code 2. The APK digest and certificate fingerprint are in the [package receipt](package.json).

## Reproduce the build and update

Install Node 24, JDK 17, Android SDK Platform 36 and Build Tools 36.0.0. Set `JAVA_HOME` and `ANDROID_HOME`. Rebuilding a compatible update requires the same private playtest signer. With it present in the Android developer user directory, run the following from the Git root.

```powershell
npm ci
npm run build
.\android\gradlew.bat -p android :app:assembleDebug -PplaytestVersion=3
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell am force-stop com.lastferry.playtest
adb shell am start -n com.lastferry.playtest/.MainActivity
```

The last two commands simulate a cold launch. For an independent package audit, run the following with the private v2 and v3 APK paths and the tested source commit recorded in the review.

```powershell
python reviews/android-cove-view/verify-package.py --source <tested-source> --previous <v2.apk> --apk <v3.apk> --web dist --out package-check.json
```
