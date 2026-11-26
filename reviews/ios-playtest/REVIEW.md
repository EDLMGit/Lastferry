# Last Ferry on iPhone

The phone playtest runs in Safari as a website. Open it with an invited account, choose **Play** at Home, and use **Continue** on later visits to return to the saved Journey. [Open the private playtest](https://last-ferry-playtest.abumech.chatgpt.site/)

## What changed

When a phone declines fullscreen, the explanation and support control now appear inside the open settings panel. Closing the panel clears the message from the play area. A focused audio test also exercises the existing recovery path for Apple's interrupted audio state, where the next trusted tap resumes the existing audio context.

The web build fixes the line endings of SVG source files that Vite embeds in JavaScript. This makes the production assets reproducible across Windows and macOS checkouts.

## Published version 32

All 13 files in the release archive match the production game build from `e59d661`. The ten portrait images and stylesheet also match the v0.1.6 Android release. The changed files are the player script and its HTML entry point. Type checking, all 803 unit tests and both focused Chromium fullscreen regressions passed.

Sites confirmed publication at the existing URL. An invited browser loaded the new script and stylesheet and showed **Play**, **Options**, **Harbor log** and the sound control at Home. An unsigned request received HTTP 401. The named-viewer policy matched the prepublication record. [Publication receipt and file hashes](deployment-confirmation.json)

## Touch playthrough in Windows WebKit

The iPhone 13 profile completed Holding Pier with one Undo across a tide rise. Rue awarded 2/3 lanterns. **Continue to Bellwater** opened *Another bell*. After reloading, the Harbor log showed Rue’s page, Reduced motion was still selected, and Continue reopened Bellwater at turn zero. Fresh portrait and landscape sessions rendered the cove. The Windows port lost the displayed 3D image when the same drawing buffer was resized mid-game. [Screenshots, limitations and repeat instructions](WEBKIT.md)
