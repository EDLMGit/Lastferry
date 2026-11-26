# Android cove view on the installed APK

The two Harbor photographs show the same played Holding Pier position at action eight. Pip, Rue and Moss occupy four spaces, the boat requires depth three, Harbor water is five deep and zero of three passengers are home. Both captures are full Android framebuffers, including system affordances, at 2048 × 955. The emulator has an Android 16 AOSP image, Android System WebView 133.0.6943.137, 400 dpi, gesture navigation and Android’s hole-cutout overlay. The visible system clock and water phase vary between captures. The owner's physical handset has its own insets.

## Harbor

[Side-by-side comparison](harbor-comparison.jpg) uses the complete Back to boat PNGs below at the same reduced scale.

| View | Installed v0.1.2 | Installed v0.1.3 |
| --- | --- | --- |
| At the end of the ordinary route | [Before](before-harbor-eight.png) | [After](after-harbor-eight.png) |
| Same deliberate Whole cove → Back to boat input after docking | [Before](before-harbor-back-to-boat.png) | [After](after-harbor-back-to-boat.png) |

The v2 APK was `26cd6398d120997c3835c2ba68392014e83bad36d0dbaf42022009b1da4fba56`, built from `56228ef8174b2147aa7f397661f2a6f5801e86d2`. The v3 APK was `e2d080d1d5106fdb8c57533ba7e0cf268d82876e04125991302ab68f591ba4e9`, built from `faa3880c13835e1f9d566760bba8cf2b4d5c1e87`. The receipts contain the APK identity read back from Android, native window bounds and per-image SHA-256. [Baseline route](before.json) · [Baseline reframing](match-before.json) · [Final route, boarding and arrival controls](after.json)

## Save and cold launch

The emulator retained the captain from the previous APK handoff. Holding's two lanterns and Bellwater's chapter checkpoint were earned by play. The earlier handoff also included Motion, Tips, Sound and an explicitly prepared historical backup. We compared the six stored strings, installed v3 with `adb install -r`, force-stopped it and cold-launched offline. The six records matched byte-for-byte, and Android retained UID 10151 and the original install time. Practice showed Holding's two lanterns, and Continue reopened Bellwater at action zero. A pilot v3 went through the same procedure first. On this disposable emulator only, we put the signed v2 back with `adb install -r -d` and rechecked the original six values before installing the corrected final v3 over it. [Final replacement receipt](upgrade.json) · [Practice after final cold launch](updated-practice.png)

## Steady crossings

[Manual zoom, pan, sail, dock and Undo](pan-sail-undo.mp4) is one uninterrupted Android screenrecord clip of the final installed APK. The normal-motion recording uses the user's zoom controls, a continuous touch drag on open water and a tap on Shallows before sailing there. The final frames return to Stone Pier at action one. The native H.264 file is 1024 × 478 and 36 seconds, with original timing and no audio track. The emulator's variable capture cadence is visible in the clip.

The driver reads the installed WebGL renderer's view and projection uniforms and projects a fixed point on the Harbor lighthouse at world coordinates (−6.15, 1, −3.25). The fixed point can be checked during a committed move, even while the destination's selected marker is hidden. Inspector access reads camera data and dispatches input. Each turn, choice, sail and Undo goes through the game controls. A second check re-frames Harbor deliberately before measuring the longer Stone Pier–Harbor passage. Across 24 samples on the shorter passage and 20 on the longer one, peak lighthouse displacement was 0 CSS pixels. Eight short-route samples and six long-route samples fell during motion. The initial drag moved the projected point 36 CSS pixels right and 14 up. The driver switches Motion to Follow device for these checks and restores the original preference afterward. [Projection samples and both passages](camera.json)

## Viewport evidence

The measurements are in Android window pixels. WebView bounds are from the native view hierarchy. Projected canvas bounds are its DOM bounds multiplied by the measured device pixel ratio, then translated by the native view origin. Fractional CSS viewport rounding can extend the nominal DOM edge by up to two pixels. Android clips that edge to the WebView. The render buffer uses the game's independent graphics scaling.

[First portrait](portrait-first-open.png) · [Cutout on the left](landscape-cutout-left.png) · [Cutout on the right](landscape-cutout-right.png) · [Portrait after rotation](portrait-return.png) · [Fullscreen](fullscreen-menu.png) · [Back to ordinary system bars](returned-bars.png) · [Native retry](recovery-safe.png) · [Insets and control measurements](rotation.json)

At action eight, the former left, top and bottom gutters were 100.00%, 97.97% and 98.36% flat host color respectively on v2. The count was zero in all three regions on v3. The pixel comparison reads both original PNGs at full resolution. [Edge counts](edges.json) · [Script](edges.py)

## First-run findings

The pilot used the same signed v2 and the first signed v3 from `953b4b683976bf759f9938bd72aed37cacb2a512`. It caught the Sound button extending 10 physical pixels into the portrait Back gesture band and 12 pixels in both landscape directions. [Pilot bounds](first-run/rotation-probe-failure.json) · [Computed toolbar widths](first-run/first-portrait-tools.json)

At v2's close zoom the short-route driver found a destination via free place inspection. Its requirement for a direct marker tap therefore failed, and the original camera moved 151 CSS pixels after Undo. A pilot v3 short crossing passed. On its longer route the driver had first inspected an offscreen Harbor through the place index, which intentionally reframed the scene. The final longer check deliberately inspects Harbor, closes the card, and only then measures it as a visible destination. [v2 original measurement](camera-before-failure.json) · [First v3 camera run](first-run/camera-failure.json)

## Repeat on a disposable Android 16 emulator

Use the `reviews/android-playtest` handoff to earn its original v2 checkpoint. Set `ANDROID_SERIAL` and `ADB` to that emulator and its SDK. Enable airplane mode, disable Wi-Fi and mobile data, and select gesture navigation. The following commands configure the simulated owner-sized frame. The test expects the original earned strings and uses the Android framebuffer for its PNGs.

```powershell
& $env:ADB -s $env:ANDROID_SERIAL shell wm size 955x2048
& $env:ADB -s $env:ANDROID_SERIAL shell wm density 400
& $env:ADB -s $env:ANDROID_SERIAL shell cmd overlay enable --user 0 com.android.internal.display.cutout.emulation.hole
& $env:ADB -s $env:ANDROID_SERIAL shell settings put system accelerometer_rotation 0
node reviews/android-cove-view/device/play.mjs before
node reviews/android-cove-view/device/play.mjs upgrade <v3-apk-path>
node reviews/android-cove-view/device/play.mjs camera
node reviews/android-cove-view/device/play.mjs after
node reviews/android-cove-view/device/play.mjs rotation
python reviews/android-cove-view/device/edges.py
```

Set `FERRY_PLAY_OUT` to a separate directory for new captures. The pixel analysis uses Python, Pillow and NumPy. Physical-device touch, cutout handling, TalkBack and frame pacing still await the owner's handset retest.
