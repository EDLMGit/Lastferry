# Update Last Ferry to v0.1.4

On the Android phone that has v0.1.3, open **Last-Ferry-0.1.4-playtest.apk** in Files and choose **Update**. If Android asks, allow Files to install apps. Keep the existing installation and its storage to retain your Journey, settings and lantern bests. The app runs offline on Android 10 or later with WebView 111+ and WebGL 2.

Open **Harbor log** from Home. If you already rescued Holding Pier, Rue’s lantern marks the page for Pip, Rue and Moss. You can take Moss’s request there. After a new first rescue, **Take Moss’s request** accepts that rescue and saves the next Journey scene. Finish the request, keep the page, then choose **Continue** back at Home.

## Developer install

With Android Platform Tools installed and the phone connected, these commands install the update and start the game.

```sh
adb install -r Last-Ferry-0.1.4-playtest.apk
adb shell am start -n com.lastferry.playtest/.MainActivity
```

## Rebuild and verify

Use the source commit in [the package receipt](android-package.json), Node 24, JDK 17, Android SDK Platform 36 and Build Tools 36.0.0. Set `ANDROID_HOME` and `JAVA_HOME` and use the same private playtest signer. Run from the Git root on Windows.

```powershell
npm ci
npm run build
.\android\gradlew.bat -p android :app:assembleDebug
python reviews/harbor-log/android-package.py android/app/build/outputs/apk/debug/app-debug.apk <path-to-private-v3-apk> <source-commit>
```

The receipt includes the source commit, both package hashes, the signing certificate fingerprint and a comparison of the APK’s bundled game files with the independent web build.
