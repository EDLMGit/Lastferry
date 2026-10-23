# Last Ferry review — Lighthouse light refinement

## Disposition

**Ready for focused visual review.** The clean soft shaft and existing luminous source replace the visible wedge boundary. Fresh build/typecheck, 156 unit tests and 12 focused browser cases pass. Actual UI captures cover a natural full rotation, four viewports and repeated Undo/redelivery. No confirmed blocker was found within that coverage. Physical Android and native-GPU judgment remain pending; this is contributor verification, not an independent approval or publication.

## Source and scope

- Repository / PR / branch: [Lastferry](https://github.com/EDLMGit/Lastferry), [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1), `m1-first-crossing`.
- Comparison base and capture HEAD: `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`, the user-specified reviewed and published homecoming build. Checkout was initially clean; no newer/unrelated work was present. Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Evidence was generated from that HEAD plus identified uncommitted changes, before committing. See [source manifest](source-manifest.json), [tested patch](tested-changes.patch) and final packaging audit. Do not relabel these captures as having been made from the later commit.
- Final 121-file verification snapshot: `a858591704abb3adb2a78f4dae6d8f9facffef459d35caa00528306e840f81d9`. Reports, STATUS and PROJECT_STATE are outside this source hash.
- Capture runtime/data/build-input hash: **`d943620659412c6af9a5254cb69c7277da9cded6641eaebf4ed5a4031c717d5b`**. Each run's `source.json` records its exact command, timestamp, environment and helper hash; all final runs report unchanged source.
- Baseline runtime hash: `ca00f2f217ca8060a49843eb5445cc1097aa57058d70681c9f36cee83b1f263c`. It is the reviewed runtime plus the read-only DEV phase diagnostic, identified in [baseline-diagnostic.patch](baseline-diagnostic.patch). The diagnostic is absent from production; natural recordings leave it unset.
- Scope: `NEXT_TASK_LIGHTHOUSE.md` only. Runtime changes are in `src/scene/effects.ts`, plus the DEV-only phase hook in `src/main.ts`. [Protected-content comparison](protected-source-comparison.json) confirms 44 other existing runtime/data/dependency files unchanged, including audio, camera, animal gesture, water, UI, rules, all three levels and sailing. No new dependency or code comments.

## Visual decision

The existing open tapered cylinder already supplied suitable geometry. The old circumference term maintained opacity at its silhouette. The replacement normalizes interpolated view-space normals and attenuates against the constant orthographic view direction. Longitudinal density decays smoothly and reaches zero before the far mesh rim. The warm Three Color retains the tone-mapping/color-space output path. Depth testing remains enabled, depth writes disabled, with DoubleSide and the existing explicit single pass.

Retain the **clean `.22` additive treatment**. Front and back each receive half the strength budget. The existing source sprite becomes additive only during arrived/settled won states; reset restores ordinary normal blending. Its position, size, opacity envelope, lamp intensity and lens behavior are unchanged. There is no added shell, noise, particle field, bloom, water decal or global exposure change.

The first `.16` candidate was too faint in native phone orientations. It is retained as a visual trial, not a failed gameplay check. Compare [faint](candidate-preview/844x390/matched-angle-0.png), [balanced trial](candidate-balanced-preview/844x390/matched-angle-0.png) and [final](after/844x390/matched-angle-0.png). Its runtime hash is `9f92d67d2498ddad31d4bccc39e7b5d694fde25af8168988eba0ea278d75fcc7`; the balanced trial already has the final `d943…` runtime. No density variation was needed.

The retained shaft has soft side edges, a dissolving reach and a visible lantern when foreshortened. It becomes appropriately quieter behind the roof/tower. Native known-angle and ordered temporal inspection found no solid boundary, end cap, hollow ring, seam, glare burst, distracting noise or visible opaque-object bleed. Roof/glass/rails remain recognizable; scenery remains visible through the shaft. This is a bounded appearance proxy with ordinary intersection limitations, not complete volumetric transport. [Primary references and orthographic adaptation](research.md) document the technique and tradeoffs.

## Environment and commands

Windows, Node **24.15.0**, npm **11.12.1**, Three **0.186.1**, Playwright **1.64.1**, Chromium **156.0.8078.4**, WebGL2 **SwiftShader**, DPR **1**. Desktop mouse/keyboard: **1440×900**. Emulated touch landscape: **844×390**, **780×390**, **780×320**. No physical touch device or acoustic listening.

Install/run from repository root with Node 24:

```sh
npm ci
npm run dev
```

Fresh verification commands were `npm run build` (includes `npm run typecheck`) and `npm run test:unit`. Dev ran with `npm run dev -- --port 5201`; the final production bundle ran with `npm run preview -- --port 4188`. PowerShell browser execution used:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5201'
$env:LAST_FERRY_PRODUCTION_PORT = '4188'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/lighthouse-light/browser'
npx playwright test homecoming.spec.ts victory-mix.spec.ts production.spec.ts --config=.cache/lighthouse-external-server.config.ts
```

The temporary external-server config is reproduced verbatim in [external-server-config.txt](browser/external-server-config.txt). It disables automatic servers while retaining the existing assertions and one worker. This is a focused 12-case selection, not a fresh full e2e suite. To repeat with ordinary managed servers, use the same three spec files with the repository config and fresh output/ports.

Capture command shape (each exact invocation is in its `source.json`):

```powershell
node tools/capture-lighthouse-light.mjs --base=http://127.0.0.1:5201 --phase=after --width=844 --height=390 --cycles=3 --output=reviews/lighthouse-light/after/844x390
```

Desktop uses width1440/height900/cycles3; nearby phones use width780/height390 or320/cycles1/recordfalse. Baseline uses phasebaseline/cycles0 at desktop and844. Comparison images use a diagnostic phase only after the uninterrupted natural recording has stopped. They are actual rendered gameplay, not concept art.

## Executed checks

| Check | Result | Actual observation / evidence |
| --- | --- | --- |
| Node24 production build + TypeScript | **pass** | [Build output](build-results.txt); final JS `index-CwCHRZ6Z.js`, 726.65kB raw /193.29kB gzip. No install/dependency change. |
| Unit suite | **pass 156/156**,20 files | [Unit output](unit-results.txt). Three new checks cover material/depth/picking, continuous seam/source anchoring and repeated owned-resource identity; existing 153 checks remain. |
| Focused browser selection | **pass 12/12**,0 skips/flaky | [Output](browser/browser-results.txt), [machine result](browser/automation-results.json): 8 homecoming,3 victory-mix,1 fresh production. Existing viewport assertions unchanged. |
| Real Holding UI rescue | **pass** | Local subset transfer, tide-boundary Undo/replay, final disembarkation, normal animation, Settings/Back, Close/Menu/Return, terminal Undo and redelivery. Final capture runs at all four sizes. |
| Start/lifecycle/audio preservation | **pass in exercised checks** | No sweep in ordinary/partial/lost state; starts at visible arrival. Restart/Next/reset, mute/lazy recovery, persistent dry/wet won reduction, hidden arrival/resume and one accepted cue per visible rescue. Source-identical audio reused; fresh lifecycle cases above. |
| Reduced / Follow device / focus / picking | **pass** | Manual Reduced mid-sweep stays steady; Follow device/OS preference/persistence; natural Tab/Enter/Escape; menu/settings focus recovery. Undo restores fitting and named picking. No effect intercepts controls. |
| Hide/context recovery | **pass simulated events** | Existing recovery checks settle finite motion and retain won intent without replay/catch-up. This is not a physical WebGL/device-loss test. |
| First Crossing + Bellwater | **pass** | Actual UI rescues and genuine Choose-a-cove ending. Fresh [First Crossing](browser/first-crossing-ending.png) /[Bellwater](browser/bellwater-ending.png), native inspection. |
| Full natural rotation | **pass rendered coverage** | Desktop6.335rad/39.859s;844phone6.325rad/20.169s. [Temporal inspection](native-temporal-inspection.json) and local recordings below. No diagnostic phase in the natural windows. |
| Repeated win/Undo ownership | **pass** | Three final warm cycles at desktop/844, one at each nearby phone; geometry330/texture6/program18/one sweep child remain stable. Unit repeats12 ownership cycles. |
| Acoustic listening /physical Android/nativeGPU/other engines | **not run** | No corresponding device, GPU or listening result is claimed. |

Original harness failure is retained in [development/capture-initial.json](development/capture-initial.json): optional missing `public/` caused ENOENT **before browser launch**. Filtering absent optional directories fixed it; baseline and every later capture passed. There were no runtime test failures in this pass. Historical failures remain in earlier review folders and are not relabeled. Capture summaries are explicit derivatives; [initial compaction audit](compaction-audit.json) and [final compact-review derivation](final-condensation-audit.json) identify byte-exact ignored originals and intermediate summaries. The supplied task is retained verbatim, including its extra blank EOF line; whitespace checking of implementation source is clean.

## Matched captures and moving evidence

[Comparison index](COMPARISON.md) links meaningful angles. [Matched comparison manifest](matched-comparison.json) verifies **16 pairs**, eight45° phases at desktop and844: identical authoritative state, camera and beam angle. Water and idle bob continue normally, so these are not pixel-identical scene snapshots. [Capture manifest](capture-manifest.json) records selected native PNG bytes, timestamp/source/input and local archives. All selected PNGs remain unscaled. No generated concept art counts as evidence.

| Coverage | Selected paths |
| --- | --- |
| Ordinary /visible arrival /natural sweep ending | `after/1440x900/`, `after/844x390/`: `ordinary.png`, `visible-arrival.png`, `natural-full-rotation-ending.png` |
| Matched side-on /foreshortened /diagonal /behind tower | `baseline/<1440x900 or844x390>/matched-angle-*.png` and matching `after/` files |
| Static Reduced /restored play | `after/<all four sizes>/reduced-ending.png`, `restored-play.png` |
| Short fallback /nearby landscape | `after/780x320/`, `after/780x390/`; native inspection confirms accepted controls and full lighthouse.780×320 keeps factor1.00. |
| Shared settings and other coves | `browser/phone-780x320-settings.png`, `phone-844x390-settings.png`, `bellwater-ending.png`, `first-crossing-ending.png` |
| Actual full-interface uninterrupted recording | `after/844x390/raw/holding-pier-lighthouse-full-interface-silent.webm` — completion card visible through a full natural sweep; **silent**. Afterwards it continues into explicitly diagnostic still phases/settings/repeated cycles. |
| Paired canvas +actual master audio | `after/844x390/raw/holding-pier-lighthouse-runtime-audio.webm` —56.839s recording window; UI rescue/tide Undo then full natural sweep; stops before diagnostic phases. Canvas omits DOM controls. No cuts, normalization or export-gain change. |

Equivalent desktop and baseline originals remain local. [Media validation](media-validation.json) records SHA256/streams and complete ffmpeg decode of eight originals. All decode. Videos and temporal PNG extraction originals are **local ignored files, unavailable in a fresh clone and not uploaded to PR/Site**. The committed media manifest is not a web attachment. Native inspection includes nine ordered844×390canvas frames spanning20.016s/6.304rad plus four full-interface frames with the completion card visible. See [temporal frame manifest](native-temporal-frames.json).

## Rendering measurements and limits

Same environment, warmed120rAF samples; measurements include normal software-renderer and recording noise:

| View /state | Baseline median /p95 ms | Final median /p95 ms |
| --- | --- | --- |
| Desktop ordinary |116.6 /283.3|100.0 /283.4|
| Desktop won |116.6 /233.4|116.6 /266.7|
|844phone ordinary |33.4 /100|33.3 /100|
|844phone won |33.4 /100|33.4 /100|

Baseline and final both report **626 ordinary /624 won draw calls**,318/330geometries,6textures,16/18programs. One sweep draw remains one draw; front/back fragments still incur overdraw. No speedup or reliable performance regression follows from these mixed samples. The desktop dual-recording rotation takes38.960s baseline and39.859s final under SwiftShader because the existing100ms advancement clamp drops long-frame excess; authored20s timing is unchanged. Phone completes20.180s baseline and20.169s final. Do not infer physical Android performance from this.

## Findings, remaining uncertainty and handoff

**No confirmed defects in the checks performed.** The proxy is intentionally quiet at foreshortened/occluded angles. Real-device motion, glare perception, touch/browser chrome, sustained native-GPU behavior, other engines and acoustic listening remain unverified. Existing bundle size/software-renderer limitations remain; no new performance claim. Additional art/audio/gameplay ideas stay queued.

Final commit identity and source-to-Git equivalence are recorded in [packaging-audit.json](packaging-audit.json) and the PR handoff. The authorized branch push and PR update keep PR#1 draft; no merge or force push. The private Site **still contains game `dafb445b8d769ff92b4390d06bf3ca92bbbe8b8b`**, hosting source `049c7998a8bd8afbd2e42c414c80ea0bad7d7e8d`. **This lighting refinement awaits review and separate publication to the same Site.** GitHub push does not update the phone build.
