# Installed Android environment

The test ran on an isolated Android 16 AOSP phone image, API 36, with Android System WebView 133.0.6943.137. The device had a 780×1688 display at 320 dpi and gesture navigation. The Windows host supplied WHPX and accelerated OpenGL through the emulator’s RTX 4060 Ti backend. The first-install inventory contained no Last Ferry package. [Device receipt](environment.json)

Android’s audio service attributed an active, unmuted 48 kHz stereo stream to the installed game process on both builds sampled. Its native WebView occupied physical rows 48 through 1623 in portrait, between the status bar and bottom gesture area. [Corrected build and installed APK identity](final-device-sample.json) · [Earlier audio sample](audio-route.json)

A cumulative Android `gfxinfo` sample during the repeated automated playthrough counted 645 deadline misses in 1,351 frames. The median was 48 ms and the 95th percentile was 109 ms. This includes activity transitions, instrumentation and capturing the framebuffer. On the first build the sample was 433 of 1,032 frames. A physical phone is needed to judge touch feel, sustained frame pacing and speaker balance. [Corrected build sample](final-device-sample.json) · [Initial sample](frame-sample.json)

The final version 2 APK recovered from both a WebGL 2 initialization failure and the loss of the Android WebView renderer. Tapping the native **Try again** button returned to Home each time. The earned Bellwater checkpoint, mastery and preferences survived both recoveries and a final cold launch. All six original storage values matched byte for byte. [WebGL recovery screen](recovery-webgl-unavailable.png) · [Renderer-exit screen](recovery-renderer-exit.png) · [Recorded key and APK hashes](renderer-and-insets.json)

The Practice menu entered fullscreen on the app root. Android hid the status and navigation bars and retained the mandatory gesture areas. The WebView remained 390×788 CSS pixels throughout. Android Back returned to the same menu and restored the bars. [Installed fullscreen menu](fullscreen-menu.png) · [Before, during and after measurements](renderer-and-insets.json)

## Reproduce the renderer check

Run the installed rescue, update and ending checks first. Leave the earned save on the test emulator, with gesture navigation active and portrait orientation. From the repository root, set `ADB` to the SDK's adb executable and `ANDROID_SERIAL` to the test emulator serial.

```powershell
$env:FERRY_PLAY_OUT = 'reviews/android-playtest/device'
node reviews/android-playtest/device/recovery.mjs
```

The driver briefly denies WebGL 2 to one WebView document with a debugger hook, then exercises the WebView renderer-exit callback using the DevTools process-exit diagnostic. It uses the native retry button in both cases and compares all existing game storage bytes. The last check enters fullscreen from the installed game’s Practice menu, measures the WebView against the Android insets, and uses the Android Back key to return.

The first denial attempt timed out after 50 seconds. The debugging session had not enabled its Page domain, so its injected hook never ran. Inspection showed the native `getContext` and a healthy, ready game after reload. Enabling the domain reproduced the intended WebGL initialization error. On the first real fullscreen entry, Android put its own “Viewing full screen” prompt above the game. Back went to that prompt. Tapping the system’s **Got it** button let the test exercise the game's Back handoff. [First fullscreen introduction](android-fullscreen-introduction.png)
