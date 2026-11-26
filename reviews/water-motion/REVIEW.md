# Last Ferry review — Boat wake and water response

## Disposition

**Ready for focused review.** The chosen treatment is a broken pearl/teal trail, hull-contact crests and finite docking fade at a calmer sailing pace. Build/typecheck,163 unit tests and18 distinct focused browser cases pass, with the original17/18 run and corrected1/1 affected rerun retained separately. Native temporal inspection covers the selected moving experience. No confirmed blocker remains in exercised coverage. This is contributor verification; physical Android/native-GPU approval and publication are separate.

## Source and scope

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), branch `m1-first-crossing`, existing [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1). Main remains `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Reviewed comparison/capture HEAD: **`0ee7d685071179b82ec2a599fac2f818251d0e54`**. Started clean; no newer/unrelated work was present. The root-supplied `NEXT_TASK_WATER_MOTION.md` is retained in the repository and is the only active scope.
- Final runtime/data/build-input capture hash: **`be1d42f21ba0b4f45687fda21c1db730254e5f68dfc7a0ccd7eba16956a8c62b`**. Final captures identify baseline HEAD plus working changes, not a later commit. Per-run `source.json` records file hashes, helper version, timestamp and exact command; each final run reports unchanged source.
- Final127-file verification snapshot: **`e84792307ccda2b3efea3b70f7846331a6c3cec9d6afce4cc0bccdca48d52804`**, [manifest](source-manifest.json). The earlier `965bfd…` build/unit snapshot changed only through environment e2e aggregation (`2d1c7d…`) and the new test's starting-node fixture correction. [Reuse audit](source-reuse.json) establishes identical runtime/build/unit inputs. Fresh TypeScript checking covers both test-only edits. Continuity/review metadata is outside the snapshot.
- Baseline runtime hash **`d943620659412c6af9a5254cb69c7277da9cded6641eaebf4ed5a4031c717d5b`** matches the reviewed runtime exactly. Initial natural recordings preceded edits. Accurate midpoint stills were recaptured from an isolated baseline copy under `.cache`, without resetting the working branch.
- Runtime changes: new `src/scene/wake.ts`, wake delegation in `effects.ts`, movement lifecycle in `world.ts`/visibility cleanup in `main.ts`, and selected `transitions.ts` timing. [Protected audit](protected-source-comparison.json): **44 protected files byte-exact unchanged**, including all audio, UI/CSS, levels/rules/paths, models and the accepted water shader/fields. Seven explicit lighthouse construction/lifecycle/telemetry blocks remain unchanged. No dependencies, production textures, new controls or code comments.
- Tested source patch, source-to-Git equivalence and final implementation identity are retained in `tested-changes.patch` and `packaging-audit.json`; final metadata SHA is supplied in the PR/handoff.
- Implementation commit: **`13d3b441c82a9ac67053d416ff4d7461810179af`**. All127 tested files match Git content exactly or by documented CRLF-to-LF normalization; all58 selected PNGs match exact captured/copied bytes. The following metadata-only commit records this identity without changing tested source. Final remote SHA is in the PR/handoff.

## Chosen treatment and actual comparison

One preallocated mesh now draws a restrained teal disturbance with diverging, broken pearl crests, a small bow crescent and compact stern disturbance. Its fixed96-point ring spatially resamples actual horizontal movement at0.055unit spacing, bounded by1800ms/3.6world units. Smooth joined side vectors remain bounded. Old samples stay in world space; drawn vertices follow animated water height. Actual hull heading anchors the contacts and stern; horizontal displacement governs emission/strength. Draft, bobbing and tide alone emit nothing.

Normal docking stops emission, leaves the trail to spread/dissolve and releases a small contact settlement within650ms. The existing completion callback unlocks controls immediately; there is no tail lock or cinematic pause. A new move uses a separate segment, while Undo/Restart/cove changes/discontinuous sync, hide/recovery and Reduced clear movement. Borrowing the existing coastal mask suppresses crests on exposed ground. Depth testing and disabled depth writes retain hull/dock/land occlusion. The mesh is excluded from picking/camera fitting. Its six fixed attributes total27,648bytes versus3,840 for the old wake; no new texture, render target or extra wake draw.

The first crest rhythm looked too much like continuous parallel rails in the long phone view. Reducing its opacity floor broke the crests while keeping the central body/width/contact. The retained trail is visible over roughly one to two hull lengths in the exercised crossings; yellow ferry, route dots, landmarks and submerged terrain remain readable. [Comparison index](COMPARISON.md) links native before/after and the rejected rail-like trial.

A localized bow/side normal perturbation was tested both enabled and disabled at the same slower pace. Native stills and ordered natural recordings did not demonstrate a useful consistent contact gain beyond the shaped geometry. **Reject that layer**; final `water.ts` and `water-shader.ts` are exactly the reviewed baseline. This is a visual-value decision, not a proven GPU regression. The initial runtime hash `c065255df2132ce3a74d57096fee99deda27d15fecf9de80767ddd42d1006f5b`, [candidate patch](experiments/tested-changes.patch) and [trial audit](experiments/source-audit.json) preserve the experiment. [Primary references/adaptation](research.md) explain the bounded approach.

Retain **clamp(1000+200×canonical path length,1600,3000)ms**. Existing easing stays unchanged. Compared actual UI short Stone↔Shallows empty at tide0 and long Bellwater East↔West with two rabbits at tide1, both directions, natural speed and at least2.25seconds after each docking:

|844×390 route|Baseline plan /actual out,return ms|Chosen plan /actual out,return ms|
|---|---|---|
|Stone–Shallows, length4.368|1411.55 /1478.3,1437.8|1873.64 /1924.2,1912.3|
|Bellwater outer curve, length9.115|2076.15 /2142.4,2139.1|2823.07 /2853.6,2879.3|

The new effect was first viewed at existing timing, then at the slower policy. The slower version gives departure/curve/deceleration more room without an added pause; repeated outward/return operation remains direct.780×390 final actual durations are1888.9/1896.1 and2895.2/2882.5ms;1440×900 are1916.3/1908.5 and2913.1/2925.9ms. These are observed presentation intervals, not frame-rate promises. Action costs, route geometry, tide/event order,520ms transfers/Wait,900ms successful unloading,30ms Reduced, capped550ms tide settlement and duration+1000ms recovery remain.

## Environment, commands and executed checks

Windows, Node **24.15.0**, npm **11.12.1**, Three **0.186.1**, Playwright **1.64.1**, Chromium **156.0.8078.4**, SwiftShader WebGL2, DPR **1**. Mouse/keyboard desktop **1440×900**; emulated touch landscape **844×390**, **780×390**; **780×320** short ending smoke. These are software-rendered emulated sizes, not physical phones.

Install/run with Node24: `npm ci`, then `npm run dev`. Production: `npm run build`, then `npm run preview`. This pass used dev5202, isolated baseline5203 and fresh production4189. Exact capture invocations are in each source manifest. Examples:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
node tools/capture-water-motion.mjs --base=http://127.0.0.1:5202 --phase=after --width=844 --height=390 --output=reviews/water-motion/after/844x390
node tools/capture-water-motion.mjs --base=http://127.0.0.1:5202 --phase=after-midphase --record=false --stills=true --targets=.5 --width=844 --height=390 --output=reviews/water-motion/after-midphase/844x390
node tools/extract-water-motion-frames.mjs reviews/water-motion/after/844x390
```

Natural recording runs contain no PNG readback, time scaling, cuts or state injection. Midpoint runs capture canvas and state in the same rAF; they are separate from natural recordings and omit DOM. Full-interface originals and selected temporal frames show the actual controls. The temporary external-server config is retained verbatim in [external-server-config.txt](browser-final/external-server-config.txt). Exact executed browser commands:

```powershell
$env:LAST_FERRY_DEV_PORT = '5202'
$env:LAST_FERRY_PRODUCTION_PORT = '4189'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/water-motion/browser-final'
npx playwright test environment.spec.ts homecoming.spec.ts victory-mix.spec.ts production.spec.ts fallback.spec.ts water-motion.spec.ts --config=.cache/water-motion-external.config.ts
$env:LAST_FERRY_REVIEW_DIR = 'reviews/water-motion/browser-rerun'
npx playwright test water-motion.spec.ts --config=.cache/water-motion-external.config.ts
```

|Check|Result|Observation/evidence|
|---|---|---|
|`npm run build` including TypeScript|**pass**|[Build](gates/build-results.txt): `index-Lu0wbyxo.js`,733.12kB raw/195.27gzip. Runtime/build inputs remain identical after test-only aggregation.|
|`npm run test:unit`|**pass163/163**,21files|[Units](gates/unit-results.txt). Six new wake tests cover horizontal suppression, frame-rate/distance consistency, joined curves/resource ownership, finite fade/segment separation, reset/reduced/gap behavior and depth/picking. Timing contract covers unchanged Reduced/transfers/delivery. Existing lighthouse/homecoming/audio/rules remain included.|
|Post-edit `npm run typecheck`|**pass**|[Aggregation](gates/typecheck-after-aggregation.txt), [fixture correction](gates/typecheck-after-fixture.txt). Final e2e source compiles.|
|Focused browser18 distinct cases|**pass17+1 affected rerun**|[Full run17pass/1fixture failure](browser-final/browser-results.txt), [corrected case1/1](browser-rerun/browser-results.txt). Environment4,homecoming8,victory-mix3,production1,fallback1,new water lifecycle1. This is not a clean18-in-one-run claim.|
|Natural before/after crossings|**pass capture assertions**|Baseline844; final844/780/1440. All4crossings per run complete normally, source stays unchanged, no browser page errors, every tail clears after2.25s.|
|Local water-normal on/off and rail trial|**completed visual comparison**|Source-attributed trial stills/recordings; normal layer rejected and restored water byte audit passes.|
|Matched low-overhead frame-tail repeat|**pass comparison; no repeated regression**|[Repeat](performance-repeat/comparison.json): same2076ms plan/load/tide/directions, no video/full geometry copying; both median33.4ms/p9550.1ms,566draws/305geometries/6textures/20programs. No Android/GPU inference.|
|Media decode|**pass15 originals**|[Media validation](media-validation.json);14crossing originals plus the passing41.08second844×390lifecycle/rescue recording, complete ffmpeg decode, native dimensions, silent full-interface streams.|
|Physical Android /other engines /native GPU /acoustic listening|**not run**|No corresponding device, speech, speaker or hardware result claimed. Accepted audio files remain unchanged; audio lifecycle is exercised by focused browser cases.|

Existing environment art assertions intentionally change31/720ms/1.8unit/old alpha to the new fixed design. Stern provenance is checked from stored interpolated birth center/heading, since distance samples can occur between rAF frames. Every drawn vertex, opacity and point still receives finite/height/range/age/course/ownership checks; reverse routes, game state, cleanup and meaningful viewport assertions remain.

## Original failures and affected reruns

- Video-end-clock extraction mislabeled journey phases; native inspection caught endpoint images presented as midpoints. Those PNGs/manifests/helper are retained under ignored raw paths and explicitly **inadmissible** for matching. The original natural videos remain valid. Separate same-rAF captures replace them.
- Multiple PNG readbacks in one crossing stalled later target phases; overshoot images are excluded, exact observed progress retained. One midpoint per crossing fixes the method. [Capture errors](development/capture-errors.json) preserves originals and resolution.
- A Playwright `--list` invocation wrote its default reporter into historical `reviews/m1/automation-results.json`. The generated output is archived locally and the historical file was restored byte-for-byte from the clean baseline. [Restoration audit](development/historical-output-restore.json); final runs use explicit current outputs.
- Initial18-case verification was interrupted after about5minutes without a first result. No runtime failure or CPU profile was captured. Per-value assertion/reporting overhead is a source-grounded hypothesis. [Original interruption](development/browser-initial-interruption.json), original test/source snapshot and partial output are retained. Assertions were aggregated over **all** original values with equivalent tolerances, without increasing timeouts or dropping samples. The final affected browser rerun is recorded separately; the initial run is **inconclusive**, not passed.
- The completed full browser run passed17 cases; the new lifecycle test failed only its final First Crossing smoke fixture, incorrectly expecting Harbor instead of the authored Cut. All prior rescue/tide/Undo/Reduced/hide assertions passed. Correcting this one test constant left runtime and other17 cases unchanged; the affected test then passed1/1 in42seconds. [Original fixture failure](development/first-crossing-fixture-failure.json) retains the old test/source and failed output.

## Rendered evidence and measurement limits

[Capture manifest](capture-manifest.json), [comparison index](COMPARISON.md), [selected natural frame sequence](SELECTED_FRAMES.md), [matched audit](matched-comparison.json), [native temporal inspection](native-temporal-inspection.json). Four baseline/final midpoint pairs match state/load/tide/route/direction/camera; maximum actual progress difference is0.004611 (0.461percentage points), so these are close phase comparisons, **not exactly frozen phases**. Water remains naturally animated.

58 selected unscaled PNGs are committed and readable in a clone/PR, including33 natural full-interface frames. They include native midpoint comparisons, ordered whole-interface departure/cruise/deceleration/docking/faded frames, tide/Undo, Reduced, success and the short-phone ending. Concept art is not gameplay evidence. Compact metadata derivatives identify their byte-exact ignored originals in [compaction-audit.json](compaction-audit.json). Unselected images remain local with an explicit archive map.

Uninterrupted local originals (silent, natural speed, setup and both directions included):

- `baseline/844x390/raw/{short,long}-natural-full-interface.webm`
- `after/844x390/raw/{short,long}-natural-full-interface.webm`
- Equivalent final780×390 and1440×900 paths.
- `browser-rerun/raw/water-motion-lifecycle.webm` for the successful natural actual-UI rescue, tide/Undo, device/manual Reduced, redelivery and simulated hide/cove-change sequence. The earlier failed-fixture run remains separately under `browser-final/raw/`.

Raw videos, dense traces and extraction originals are **local/ignored, not uploaded and unavailable in a fresh clone**. The media manifest is not a hosted attachment. Temporal extraction reports encoded video seconds only; it does not infer browser journey phase. Native temporal inspection is ordered rendered-frame review, not acoustic playback or an every-frame hardware assessment.

Warmed steady draws/resources match baseline: Holding625draws/322–323geometries/6textures/17programs; Bellwater566/305/6/20. The shaped wake adds bounded triangles/buffer bytes within the same draw. [Instrumented comparison](timing-render-comparison.json) records idle/active samples. Initial recorded Bellwater p95 shifted50.1→66.7ms, but the matched low-overhead repeat gives50.1ms for both. Full diagnostic copying/video and sample length differ; no repeatable attributable frame-tail regression or speedup is established. SwiftShader remains uneven and establishes no physical Android performance guarantee.

## Findings, remaining uncertainty and handoff

**No confirmed defects in the checks performed.**81 native ordered full-interface frames across all six final recordings show coherent curved travel, both directions, water contact and finite tails after controls return; no observed spike, gap, glare overlap, dry-land paint or detachment. The six recordings contain no >300ms rAF gap while active/wake-visible, so the discontinuity guard did not erase these inspected tails. Two-frame-per-second inspection can miss brief between-sample artifacts; it is not physical-phone approval or continuous acoustic playback. Preserve physical-device/other-engine/native-GPU/listening limits and existing bundle/software-renderer concerns. Additional ideas remain queued.

The authorized branch push/PR update keeps PR#1 draft; no merge or force push. **Not deployed:** the same private Site still contains game **`0ee7d685071179b82ec2a599fac2f818251d0e54`**, hosting source **`273aa4a9900ca8a302b8708f356a2dc83dac7acd`**, as confirmed by the task's publication handoff. This new boat/water pass awaits ChatGPT review and separate publication. GitHub push does not change the phone build.
