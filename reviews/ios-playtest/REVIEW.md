# Last Ferry on iPhone

The phone playtest runs in Safari as a website. Open it with an invited account, choose **Play** at Home, and use **Continue** on later visits to return to the saved Journey. [Open the private playtest](https://last-ferry-playtest.abumech.chatgpt.site/)

## What changed

When a phone declines fullscreen, the explanation and support control now appear inside the open settings panel. Closing the panel clears the message from the play area. A focused audio test also exercises the existing recovery path for Apple's interrupted audio state, where the next trusted tap resumes the existing audio context.

The web build fixes the line endings of SVG source files that Vite embeds in JavaScript. This makes the production assets reproducible across Windows and macOS checkouts.

## Published version 32

All 13 files in the release archive match the production game build from `e59d661`. The ten portrait images and stylesheet also match the v0.1.6 Android release. The changed files are the player script and its HTML entry point. Type checking, all 803 unit tests and both focused Chromium fullscreen regressions passed.

Sites confirmed publication at the existing URL. An invited browser loaded the new script and stylesheet and showed **Play**, **Options**, **Harbor log** and the sound control at Home. An unsigned request received HTTP 401. The named-viewer policy matched the prepublication record. [Publication receipt and file hashes](deployment-confirmation.json)

## Mobile Safari on Apple’s simulator

An iPhone 16 running iOS 18.6 opened the production files in Mobile Safari. Native taps on **Play** and **Take the helm** reached Holding Pier with Moss aboard. The simulator used its own loopback server and loaded the same JavaScript and stylesheet as the published site. [Home in Mobile Safari](native/01-home.jpg)

After Moss stepped ashore, the phone rotated to landscape and back. The native screenshots show the ferry, islands, water and controls in all three views. [Watch the 17-second rotation](native/holding-rotation.mp4) · [Landscape capture](native/03-holding-landscape.jpg)

The player completed the nine-action rescue, earned Rue’s Lantern with a 3/3 best, continued through *Another bell* and reached Bellwater on turn zero. [Rue’s illustrated reward](native/05-rues-lantern.jpg)

After Safari terminated and relaunched, Home showed Rue’s page, the three-lantern best and the Bellwater checkpoint. Tapping the visible **Continue** button reopened Bellwater at turn zero. [Saved Home](native/06-saved-home.jpg) · [Restored Bellwater](native/07-restored-bellwater.jpg) · [Passing native test](https://github.com/EDLMGit/Lastferry/actions/runs/45892471289)

The seven stills come from the passing run. The continuous rotation clip comes from the preceding run of the same game build. That run completed the crossing and exposed a timing issue in the test after cold launch, when the accessibility label became available before Safari painted the button. The passing run waited for the button to appear before tapping. [Capture provenance](native/evidence.json)

The sound control reached its running state after a native tap. Listening through physical speakers, silent-switch behavior and interruptions on a handset were outside the simulator check.

## Touch playthrough in Windows WebKit

The iPhone 13 profile completed Holding Pier with one Undo across a tide rise. Rue awarded 2/3 lanterns. **Continue to Bellwater** opened *Another bell*. After reloading, the Harbor log showed Rue’s page, Reduced motion was still selected, and Continue reopened Bellwater at turn zero. Fresh portrait and landscape sessions rendered the cove. The Windows port lost the displayed 3D image when the same drawing buffer was resized mid-game. [Screenshots, limitations and repeat instructions](WEBKIT.md)
