# Update Last Ferry to v0.1.5

On the Android phone with the v0.1.4 playtest installed, open **Last-Ferry-0.1.5-playtest.apk** in Files and choose **Update**. If prompted, allow Files to install apps. Keep Last Ferry installed and keep its storage to retain your Journey, bests and illustrated keepsakes.

Choose **Continue** to resume the Journey. The Harbor log opens the coves you have rescued. On a first rescue at Holding Pier, **Take Moss’s request** saves the next chapter and opens his crossing. From his earned page, **Continue to Bellwater** opens *Another bell*. Later revisits lead back to your saved chapter.

## Developer install

With Android Platform Tools and an authorized phone, run the following commands.

```sh
adb install -r Last-Ferry-0.1.5-playtest.apk
adb shell am start -n com.lastferry.playtest/.MainActivity
```

The private build requires Android 10 or later, WebView 111+ and WebGL 2. Version code 5 retains the existing application ID, local HTTPS origin and private test certificate. [Source commit, APK digest and certificate](android-package.json)

## Reproduce the build

Check out the source commit in the package receipt. Use Node 24, JDK 17, Android SDK Platform 36, Build Tools 36.0.0 and the same private playtest signer. Set `ANDROID_HOME` and `JAVA_HOME` and run from the Git root.

```powershell
npm ci
npm run build
.\android\gradlew.bat -p android :app:assembleDebug
python reviews/journey-rewards/android-package.py android/app/build/outputs/apk/debug/app-debug.apk "<path-to-v4-apk>" "<source-commit>"
```

The package check compares all bundled web files with the independent production build, verifies the APK signature and alignment, and checks the v0.1.4 source artifact’s recorded digest.
