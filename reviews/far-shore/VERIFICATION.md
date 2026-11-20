# Far Shore verification

The test host ran Node 24.15.0 on Windows. The reviewed parent was `b329a271a2bf17cc3d964620a900f282aee03d1d`. The prototype and final phone rescues have separate level and production-build records.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed. |
| `npm run build` | Passed TypeScript and the minified Vite production build. |
| `npm run test:unit -- --maxWorkers=1` | Passed all 735 checks in 62 files in 151.65 seconds. |
| `npm run check:assets` | Passed, 83 unique families. |
| Production rules | Exhaustive search reached 241 states and tested 588 legal transitions. Minimum 13 actions. [Search and witness](proof.json) |
| Two phone rescues | Passed at 390×844 and 780×320 on the production bundle. The eight-action loss, all eight recovery Undos, winning return, terminal Undo and redelivery ran through the real interface. [Browser report](play/browser.json) |

The published runtime at `5f28d71566463462b9407e34b0bf236bb05e20c6` supplied the baseline blobs. Git matched all 39 prior files under `data/`, `src/game/`, `src/audio/` and `src/campaign/progress.ts` against the working files after normal Git text conversion. The comparison covers all eleven existing level definitions, the reducer, session, mastery rules, Journey storage code and the score. [Per-file blob IDs](continuity/baseline.json)

The continuity checks exercise root Home → Practice and the direct URL with an existing completed-seven save or an eight-cove completion recorded through actual play. Both use a previously earned mastery record and original-byte backup fixtures for the pre-six, pre-Orchard and pre-Ternhaven Journey records. The checks detect storage writes, removals and clears and compare each stored value byte for byte. [Continuity test](continuity.spec.ts)

The 320×740 run completed its final storage assertions and wrote its observation before the Codex Desktop update interrupted the combined runner during the desktop test. The first 1440×900 attempt reached the start screenshot. It produced no final result. [320×740 observation](continuity/320x740/observed.json)

The desktop test passed on its own rerun with the original 360-second timeout. At both sizes Home offered twelve Practice cards, including the three unscored candidates. Tab and Enter opened the forecast. Escape returned focus to its trigger, the close control fit in the viewport, and the forecast body had no horizontal overflow. Restart restored turn zero with Undo disabled. Desktop also delivered all four neighbors on action 13, left the unrated arrival for Home, and reopened the direct cove URL. At both sizes all five protected keys retained their exact bytes with zero mutations. Both runs loaded JavaScript SHA-256 `1272be7ae76333e09d495ec7d874cf5574ba2b1be911f45406d8712eb173925a`. [Desktop observation](continuity/1440x900/observed.json) · [Desktop rerun report](continuity/results.json) · [Desktop arrival](continuity/1440x900/arrival.png)

The original geography check exposed a small lighthouse foundation overhang. Its inward correction passed all 16 focused Far Shore geometry checks, including loaded hull and berth clearance and passenger support. [Initial failure and corrected measurements](world.md)

The four viewport checks used desktop Chromium 156.0.8078.4 with touch input and software WebGL. Physical Android performance and whether a first-time player discovers the distinction from the forecast await a phone playtest. Browser coverage in this pass concentrates on Far Shore, its entry points and protected storage.
