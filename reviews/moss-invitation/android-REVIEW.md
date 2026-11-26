# Moss’s invitation on Android

The private v0.1.6 playtest is version code 6, built from `86a4e7b7c2b993630444c696068c1789f13a582d`. Its APK SHA-256 is `119a352c1fbf9d614dea897e883f2c39b178d71825e72739ba94a39f118341e6`. The package uses the same private signer as v0.1.5. All 13 bundled web files match the independent production build. [Package receipt](android-package.json) · [Install instructions](android-INSTALL.md)

## Saved captain

The previous build was the shipped v0.1.5 APK. The captain had earned both illustrated pages and a three-lantern Holding Pier rescue in the earlier installed playtest. On v0.1.5 the captain played all ten turns of Bellwater, earned its three lanterns and saved *A light at the yard*. After force-stop, the test recorded the Journey, both bests, both entries and the reduced-motion preference. [v0.1.5 gameplay and saved values](android-v5.json) · [Original Home](android-v5-captain.png)

An in-place `adb install -r` preserved the application ID, install time, every native save and every Last Ferry WebView storage value. Continue opened the pending story and then Driftwood Yard at turn zero. Both builds ran offline on the same Android 16 SDK phone emulator with WebView 133. The AVD used a disposable read-only overlay. [Replacement receipt](android-upgrade.json) · [Upgraded Home](android-v6-captain.png)

## Installed arrival choices

A new captain rescued everyone in nine actions. Rue’s first keepsake showed **3/3 lanterns**, Moss’s complete wish, the replay button and the page reward. The captain chose **Continue to Bellwater**, entered *Another bell* and reached Bellwater Cove at action zero. A cold launch then opened the Harbor log, where Moss still offered the replay. [Portrait offer](android-rue-portrait.png) · [Landscape offer](android-rue-landscape.png) · [Available log request](android-request-in-log.png) · [Direct route](android-direct.json)

Taking that log request, the captain delivered Pip and Rue at action eight and brought Moss home separately at action twelve. The page showed **1/3 lanterns**. Opening Details showed the stronger accepted best of three lanterns in nine actions. After leaving this result unaccepted and relaunching, the captain still had Rue’s page and the Bellwater checkpoint. [Portrait page](android-moss-portrait.png) · [Expanded Details and best](android-moss-details-portrait.png) · [Provisional trip](android-portrait.json)

Starting a new Journey kept Rue’s page and the best rescue. The nine-action rescue then showed the ordinary **Everyone home.** card with Pip, Rue and Moss, three lit lanterns and **Replay for Moss**. We checked both offers and the earned page at 320×740 portrait and 780×320 short landscape, with Android system bars, a font scale of 1.0 and native frames of 800×1850 and 1950×800. The buttons stayed inside the native safe area and had exposed centers. The onward button held initial focus in all six card captures. Both offer variants showed the complete wish, both actions, the book caption and the utilities at scroll zero. Their replay targets measured at least 44 CSS pixels high. [Ordinary portrait](android-ordinary-portrait.png) · [Ordinary landscape](android-ordinary-landscape.png) · [Ordinary arrival measurements](android-ordinary.json) · [Earned landscape](android-moss-landscape.png)

## Recorded replay

The original Android screen recording holds on the ordinary offer before a real **Replay for Moss** touch. It shows the full twelve-action trip, including the rabbit delivery at action eight and the final separate Moss delivery. The captain reads the **1/3 lanterns** page, then touches **Continue to Bellwater**, opens *Another bell* and enters Bellwater Cove at action zero. A subsequent force-stop restored that checkpoint, both earned pages and the three-lantern best. [Recorded controls, actions and saved values](android-film.json)

The 30.54-second review movie keeps the offer, replay tap, final delivery, earned page and onward taps at real speed. A **Voyage at 4x** caption marks the accelerated middle, from 8 to 39 seconds in the source. It includes every portion of the original recording. Both movies have no audio track. The accompanying private APK folder contains the full 53.81-second original as `Moss-invitation-full-Android.mp4` (SHA-256 `cdff9fce67595d57692a01726ed6a43f20012bf3a27a1c842a2dbf978ecccadb`) and the short copy as `Moss-invitation-short-Android.mp4`. [Watch the review movie](android-offer-to-bellwater.mp4) · [Recording dimensions, durations and hashes](android-short-film.json)

## Reproduce the phone walks

Point `ADB` and `ANDROID_SERIAL` to the emulator, and `ANDROID_ADB_SERVER_PORT` to its server if using a private adb server. Install the original v0.1.5 APK on a disposable captain at Bellwater with both pages and a three-lantern Holding Pier best. In that profile, launch the game to Home and run the first two commands below from the repository root.

```powershell
node reviews/moss-invitation/android-play.mjs v5
node reviews/moss-invitation/android-play.mjs upgrade "<path-to-v6-apk>"
```

Create a separate Android user for the offer choices and enable the installed package with `adb shell cmd package install-existing --user <id> com.lastferry.playtest`. Set display density 400, force-stop the app after switching users and launch it to the new user's Home. For recording, set `FERRY_MOVIE_OUT` to an existing directory for the original MP4, or create `.cache/moss-invitation`. Use the following phases in order.

```powershell
node reviews/moss-invitation/android-play.mjs direct
node reviews/moss-invitation/android-play.mjs portrait
node reviews/moss-invitation/android-play.mjs ordinary
node reviews/moss-invitation/android-play.mjs film
```

The direct phase uses the first offer's onward button, then checks that the log still offers the request. The portrait phase sails it from the log and inspects the provisional result. The ordinary phase starts a new Journey on the same disposable captain with Rue already earned and Moss’s page still available. It leaves the ordinary invitation on screen for Android's unbroken screen recording. All four phases use the installed player interface with normal text size. The captain selects reduced motion in Options.

To reproduce the viewing copy, install FFmpeg with libx264 and drawtext, then run `python reviews/moss-invitation/android-short-film.py <original-mp4> 8 39 --speed 4` with the original named in the recording receipt.
