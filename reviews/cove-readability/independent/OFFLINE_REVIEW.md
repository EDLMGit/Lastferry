# Standalone friend playtest file

I rebuilt the downloadable **Last-Ferry.html** from the reviewed production distribution for commit `29ed5dfb32f976b5de97ddfab0b701b3b3df0989`, using the repository’s `package-playtest.mjs` (Git blob `0efd7f198f30dd105133e15da663cc0ff951eb7c`). Both input bundles matched their recorded SHA-256 digests. The standalone output matches the contributor’s recorded artifact byte for byte by size and SHA-256. [Packaging script](https://github.com/EDLMGit/Lastferry/blob/29ed5dfb32f976b5de97ddfab0b701b3b3df0989/reviews/cove-readability/package-playtest.mjs) · [Recorded fingerprints](https://github.com/EDLMGit/Lastferry/blob/29ed5dfb32f976b5de97ddfab0b701b3b3df0989/reviews/cove-readability/source-audit.json)

| Download | Size | SHA-256 |
| --- | ---: | --- |
| `Last-Ferry.html` | 1,620,712 bytes | `d2055d51d9c2de3e76d5f9ff661d8877df032f8dc7285b77a1c6d36f9cc02861` |

A fresh parse found one inline JavaScript module and one inline stylesheet. The HTML has no linked resource attributes. The CSS has no imports or external asset URLs. All ten embedded PNGs decode to the exact bytes of the production choice portraits and arrival figures. The downloadable copy itself was hashed again after copying.

The contributor’s offline Chromium test used a fresh 390×844 browser context and a local file URL. It opened Home, advanced the illustrated introduction, entered Holding Pier, sailed to Rabbit Pier and opened the passenger chooser. Both real portrait images decoded. The test recorded zero HTTP(S) page requests and zero page errors along that path. This offline run stopped at the chooser. The longer rescue recordings used the served production bundle. [Offline test](https://github.com/EDLMGit/Lastferry/blob/29ed5dfb32f976b5de97ddfab0b701b3b3df0989/reviews/cove-readability/checks.spec.ts) · [Recorded result](https://github.com/EDLMGit/Lastferry/blob/29ed5dfb32f976b5de97ddfab0b701b3b3df0989/reviews/cove-readability/checks/results.json)

My independent verification covered the packaged bytes and asset structure. I also attempted to start local headless Chromium 156.0.8078.79. The execution environment denied the browser's startup socket before a page opened, so the browser result above is attributed to the contributor. Physical phone behavior and the friend's first impression remain open.

