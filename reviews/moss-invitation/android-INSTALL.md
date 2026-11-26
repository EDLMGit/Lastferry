# Update Last Ferry to v0.1.6

Open **Last-Ferry-0.1.6-playtest.apk** on the phone where v0.1.5 is installed. Choose **Update**. If Android asks, allow Files to install apps. Keep the existing installation and its storage to retain the captain’s Journey, lantern bests and illustrated pages.

At Holding Pier, read Moss’s invitation and choose **Continue to Bellwater** or replay the crossing for his Harbor log page. The current trip’s lantern count appears on the arrival card. Details includes the previously accepted best.

With an authorized Android device and Platform Tools, run:

```sh
adb install -r Last-Ferry-0.1.6-playtest.apk
adb shell am start -n com.lastferry.playtest/.MainActivity
```

Version code 6 uses `com.lastferry.playtest`, the existing private signer and the existing local HTTPS origin. It requires Android 10 or later, WebView 111+ and WebGL 2. [APK, signer and matching web files](android-package.json)

To rebuild, check out the source commit in the package receipt. Supply Node 24, JDK 17, Android SDK Platform 36 and Build Tools 36.0.0, and the same private signer. Set `ANDROID_HOME` and `JAVA_HOME` and run in the repository root.

```powershell
npm ci
npm run build
.\android\gradlew.bat -p android :app:assembleDebug
python reviews/moss-invitation/android-package.py android/app/build/outputs/apk/debug/app-debug.apk "<path-to-v5-apk>" "<source-commit>"
```
