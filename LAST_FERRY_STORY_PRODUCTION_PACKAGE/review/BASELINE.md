# Reviewed baseline and limits

Prepared 27 October 2026 for the approved Words and Light production integration.

## GitHub source

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry)
- Branch: `m1-first-crossing`
- Reviewed HEAD: **`6fc5a09dd4ef876ad96ad12d623532f0d13deb10`**
- PR: [#1](https://github.com/EDLMGit/Lastferry/pull/1), open draft when checked during package preparation.
- Observed main/base SHA: `386de54d20fdd4a513a06115471d70bf94738cc0`.

Read-only inspection covered the actual campaign registry, presentation/progress controller, main integration, story styles/staging, audio owner, Holding data, appearance mapping, inventory and campaign direction. `source-audit.json` records the inspected file identities. This package is not a fresh full production build or rerun of the historical game test suite.

The latest contributor handoff reports build/typecheck, 276 unit tests, asset validation and seven focused browser cases across retained runs. Preserve their original reports and limitations; do not re-label those as tests run while creating this package.

## Confirmed integration facts

- `opening` and `another-bell` already exist as stable scene IDs.
- Holding and Bellwater already form the journey; First Crossing remains practice.
- Per-shot Next cannot reuse the current whole-scene `continueStory()` acknowledgment unchanged.
- The story clock currently depends on the gameplay world's frame callback.
- One persistent `Sound` owner already manages audio intent, action effects, capture and accepted victory music reduction.
- The original Holding start has the ferry at Stone, Moss aboard, Pip and Rue at Rabbit Pier, tide 0 and turn 0.
- The catalog contains 73 families, including `ui.story-presentation`.
- Extending the two-cove registry later needs explicit save compatibility handling.

These findings ground the package. Exact source links use the baseline commit, not a moving branch:

- [Campaign registry](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/src/campaign/registry.ts)
- [Progress and checkpoint validation](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/src/campaign/progress.ts)
- [Application integration](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/src/main.ts)
- [Audio owner](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/src/audio/atmosphere.ts)
- [Holding data](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/data/holding-pier.level.json)
- [Campaign direction](https://github.com/EDLMGit/Lastferry/blob/6fc5a09dd4ef876ad96ad12d623532f0d13deb10/campaign/CAMPAIGN_DIRECTION.md)

## Accepted visual reference

The exact approved fragment is `reference/approved-opening.fragment.html`, SHA-256 `ff437f9e70675c8b532f2f774e9b9c766eb30e2cf9da73072d5b7e872fd22ce1`.

The reference was inspected as a local Chromium visual study at portrait, desktop and short-landscape sizes. All three finite shots and controls were exercised; final checks reported no script errors or horizontal overflow. The original inline wrapper can exceed 320px visible height. Production viewport fit, game integration, physical Android, actual scene audio and final Harbor art remain work to verify.

The standalone wrapper included here is a portable viewing aid. The approved fragment and painter are the source reference. It contains no production state, audio or networking.

## Last confirmed deployment

`deployment-confirmation.json` is copied unchanged from the inspected repository. It records:

- Private Site: [Last Ferry playtest](https://last-ferry-playtest.abumech.chatgpt.site)
- Version **12**
- Game SHA **`1a85874883af5caa59f6294a75495eccf2afebbc`**
- Hosting SHA `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`
- Published 25 October 2026 at 17:28:58 Europe/Madrid.

This is the **last confirmed receipt**, not a new live-site verification. No publication occurred during package preparation. Keep the receipt and earlier publication history intact. A GitHub push does not update the Site.

## Inherited limitations

The prior handoff still records constrained-layout overlap, a delivered-heading issue, rapid-touch timing limits and physical Android fullscreen rotation/performance verification. Preserve these in project continuity and distinguish unrelated inherited issues from any new regression. Do not claim they were fixed or cleared by a story package or by software-renderer screenshots.
