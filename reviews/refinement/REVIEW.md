# Last Ferry — shallow detail and home refinement

## Disposition

**Ready for refinement playtest.** Implementation, native visual comparison and affected verification are complete. The accepted puzzles, base score and sailing pace remain intact. No confirmed outstanding gameplay/control defect was found in the performed coverage. Listening remains pending, the original uninstrumented Cancel failure's cause remains uncertain, and Holding's measured idle p95 cost remains an explicit limitation.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; branch `m1-first-crossing`; draft PR https://github.com/EDLMGit/Lastferry/pull/1.
- Starting checkout was clean at the task's reviewed base `31ad851a97907c8e86aa6f215b78b38caed7c48b`; remote matched. Main is `386de54d20fdd4a513a06115471d70bf94738cc0`.
- Final gameplay captures use that base plus the identified working tree, runtime SHA-256 **`f48aa67712f913a50af4d527e3936e9b568cbfac86ccddf13e79ab44ba0979f2`**, frozen on an isolated server. [Runtime file hashes](after/source-manifest.json). The initial browser snapshot is **`25ab25c9e7be71730492b5545098879e1f1dd67024974b5a7631d4d2eb1a090e`**; later test corrections retain separate identities. No precommit evidence is relabeled as a later commit.
- The final [85-file source snapshot](source-manifest.json) is **`1e5b542046859a129b77fbd1bc21237b6b3d91e1d85e614910975c60c3d18bd1`**. Its captured runtime remains byte-identical; later differences are identified test/tool corrections and documentation. The [preservation audit](preservation-audit.json) compares protected contracts with the reviewed base. The final Git commit is reported separately in the draft-PR handoff.
- The baseline is an exact isolated copy of the reviewed runtime, with fresh matched captures under [before/](before/). Exploratory candidates and their failures remain local under `raw/`; historical atmosphere results retain their original attribution.
- Level data, reducer/session, topology, navigation depths, tide/event order, canonical paths, motion/timing, score notes and dependencies are unchanged. No code comments, asset downloads, new levels or mechanics were added.

## What changed

The two existing 256² RGBA fields now describe a narrower, irregular shelf, compact coast-connected sand tongues and angular darker stone. Broad value/color variation is baked into the decorative bottom. Bounded view-ray displacement removes the stretched offshore blobs found in the first actual comparison; quieter distortion/caustics preserve ground detail beneath the moving water. Low shores retain their submerged outline and look deeper after the second rise. Decorative field depth never controls navigation.

Contour vectors, inverse lengths and rejection bounds are prepared once; field construction uses bounded candidates and squared distances, avoiding repeated work. Fields are not rebuilt by animation, inspection or Undo. Water retains one draw, two 256² RGBA textures totaling 524,288 bytes, no reflection target and no additional scene pass. Linear color handling, orthographic direction and actual animated water height remain intact.

Two lower hull surfaces and Harbor/the first vulnerable pier's piles receive cloned contact materials. Their narrow wetness follows world height, draft, bobbing, tide and Undo; cabin/house/shared materials are untouched. Broad vertex colors distinguish sand, subdued grass and stone without changing island geometry or silhouettes.

Harbor's explicit lighthouse lens/lamp/anchor replaces color-based mesh discovery and duplicated lamp coordinates. Its steady warm lens and soft glow survive ordinary play, resets, mute and reduced motion; the existing localized amber reflection uses the same anchor. The objective-derived **Home** label preserves current/adjacent/shallow/remote passage status, inspection and accessible names. Normal visible unloading strengthens the light once; cancellation/recovery settles to steady won light without replaying a flash. Undo/Restart restore the ordinary baseline.

The accepted “Between the lamps” score is byte-identical: 64 BPM, 80 beats/75 seconds, original harmonies, motif, rests and pace. One sparse soft companion uses pitches compatible with all ten cells and overlapping pad tails. A shared pure fact helper derives actual required-passenger pier deadlines: ordinary planning, one/two-action deadline, homeward, won and lost. Safe temporary holding is ordinary; exact-boundary boarding removes the appropriate threat. Only committed state reconciliation changes the desired arrangement; terminal presentation waits for visible consequences. One latest target, existing phrase clock/context/scheduler, at most two companion sources, music-owned cleanup and unchanged total source guard prevent queued moods or duplicate music. [Audio design and lifecycle](../../docs/AUDIO.md).

Astra's native visual comparison selected the final shelf/parallax and restrained warmer lens. The single accompaniment proposal is retained for playtest based on authored compatibility and bounded runtime behavior. Audible improvement is explicitly awaiting listening; no claim that it was heard is made.

## Environment and commands

Windows 11 Pro; Node 24.15.0/npm 11.12.1; Three 0.186.1, TypeScript 7.0.2, Vite 8.3.4, Vitest 5.0.5, Playwright 1.64.1/Chromium 156.0.8078.4. Browser evidence uses headless SwiftShader WebGL, DPR 1, 1440×900 mouse/natural keyboard and emulated touch at 844×390 and 780×390. No physical-phone/native-GPU claim.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Verification reused the installed lockfile dependencies and browser cache `../.cache/ms-playwright`; fresh `npm ci` was not repeated. Baseline frozen development server: 5182; final frozen server: 5185; tested production preview: 4180. The handoff preview is 4181. Review manifests record exact source roots, commands and capture times.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT = '5185'
$env:LAST_FERRY_PRODUCTION_PORT = '4180'
$env:LAST_FERRY_REVIEW_DIR = 'reviews/refinement/initial-browser'
npm run build
npm run test:unit -- --reporter=default --reporter=json --outputFile=reviews/refinement/unit-results.json
```

## Executed checks

| Check | Actual result |
| --- | --- |
| Production build / TypeScript | Pass. JS 692.74kB raw /183.56kB gzip; existing >500kB Vite chunk advisory. |
| Full unit suite | **92/92 pass in 11 files**, 1.75s. Includes exhaustive actual-reducer puzzle constraints, contact/home, field invariants and audio state/lifecycle checks. [Original output](unit-output.txt), [JSON](unit-results.json). |
| Fresh gameplay capture | Pass: Holding and Bellwater actual UI rescues, both rises/Undo and both emulated phone widths, zero recorded page errors. |
| Native visual inspection | All 15 final selected images inspected at original size, plus matched baseline and exploratory comparisons. |
| Initial affected browser run | **6 passed /6 failed**, exit 1, 5.5 minutes. Original [report](initial-browser/automation-results.json) and source are retained. |
| Corrected affected browser run | **5 passed /1 failed**, exit 1, 4.9 minutes. Both phone rescues, reduced contact/recovery, actual adaptive audio/loop and hidden winning recovery pass. The remaining navigation failure and original trace limitation are recorded below. |
| Instrumented narrow-navigation rerun | **1/1 pass**, 57 seconds. Trusted repeat taps measured 112.2ms apart; the existing 180ms fence retained one action and a closed dialog, with the original state/focus/subset assertions intact. No runtime fix. |

All 12 selected scenarios have passing coverage across these identified runs; this is not a clean full-suite result. The historical full browser suites were not rerun. Fresh coverage includes production First Crossing, both Holding losing alternatives, natural keyboard, phone touch, free inspection and passenger subsets, tide/terminal Undo, longest travel/visibility recovery, live mute/persistence and reduced motion.

## Captured gameplay

[Final capture manifest](after/capture-manifest.json) and [baseline manifest](before/capture-manifest.json) retain method, source, environment, states and hashes.

The [selected index](capture-manifest.json) contains **20 native PNGs**: two matched baseline views, fifteen final visual views and three narrow-phone navigation/boarding/success views. The [evidence audit](evidence-audit.json) verifies 34 source/media/archive relationships. [Browser detail](BROWSER_QA.md), [renderer measurements](RENDERER_QA.md) and [media derivation](MEDIA_QA.md) preserve exact commands and original outcomes. Surplus captures are retained locally with a [relocation map](relocated-evidence.json).

| View | Final path |
| --- | --- |
| Holding ordinary, shallows and home | [holding-pier-ordinary.png](after/holding-pier-ordinary.png) |
| Bellwater ordinary | [bellwater-ordinary.png](after/bellwater-ordinary.png) |
| First rise / restored state | [holding-after-first-rise.png](after/holding-after-first-rise.png), [holding-first-rise-undo.png](after/holding-first-rise-undo.png) |
| Flooded low shore / second-rise Undo | [bellwater-after-second-rise.png](after/bellwater-after-second-rise.png), [bellwater-second-rise-undo.png](after/bellwater-second-rise-undo.png) |
| Loaded Harbor at tide 2 / Undo | [holding-flooded-tide-2.png](after/holding-flooded-tide-2.png), [holding-tide-undo.png](after/holding-tide-undo.png) |
| Phone Home/current Harbor and loaded ferry | [844×390](after/bellwater-phone-844-loaded.png), [780×390](after/bellwater-phone-780-loaded.png) |
| Visible delivery / success | [Holding](after/holding-delivery.png), [Bellwater](after/bellwater-delivery.png) |

Local original-speed recordings: `after/raw/holding-pier-uninterrupted.webm` (54.48s) and `after/raw/bellwater-uninterrupted.webm` (53.16s). Both contain actual uninterrupted UI play, idle water, sailing, tide/Undo and delivery. Bellwater includes an explicit Restart after its long-crossing measurement. No state injection, cuts or speed changes. These gameplay videos are silent; actual master-output audio is recorded separately. Raw media remain ignored/local and unavailable in a fresh clone.

Both complete video streams decode cleanly; thirteen ordered native frames, including both tide Undo states and successful tails, were inspected. The actual post-master audio recording is `affected/raw/adaptive-rescue-loop.webm` (82.1134s wall capture), with a full-duration MP3 derivative alongside it. All 809 samples were inspected: one context/scheduler, peak 16 owned sources, zero dropped/deferred/skipped notes, conserved passengers, unchanged state during idle and correct visible-delivery gating. [Audio QA](AUDIO_QA.md).

The bounded comparison retains `audio-comparison/raw/accepted-base.webm` and `companion.webm`, approximately twelve seconds each in the same homeward state, same context and gain. Their consecutive-loop starts differ by 171ms within the same harmony cell; they are not sample-aligned. The candidate adds three companion notes with peak one companion, zero dropped/skipped events and no score restart. These are actual recordings; audible benefit and mix balance await listening.

## Original failures and corrections

[Water development record](development-water-results.json) preserves the initial patch-depth assertion failures and corrected actual patch placement. Existing assertions and timeout budgets were retained. [Audio development record](development-audio-results.json) preserves two 23-pass/2-fail runs: preactivation initially targeted the wrong next beat; new mock-clock checks then advanced discontinuously by one second instead of pumping at the real 100ms cadence. The preactivation code and new test timing were corrected; the final focused run passed 26/26. Intermediate hashes were not saved and are not invented.

An exploratory live-server capture was interrupted by HMR; the subsequent frozen candidate harness incorrectly sought a route Inspect button at the current Harbor, where local context is correct. Original attempts remain local, distinct from final successful captures. A read-only review also identified the winning-recovery light replay; steady terminal reconciliation fixed it before final-source verification.

The first 12-scenario browser run passed six and failed six. Two new checks expected “Not adjacent” instead of the preserved “no direct passage”; three new checks incorrectly treated the public `pendingTerminal` diagnostic as null/a string rather than its actual boolean; an existing navigation check expected the old exact Harbor accessible name. Corrections use exact current text and boolean values plus the explicit desired arrangement. Gameplay, visibility, input and outcome assertions were not weakened. Both changed test files and their correction patches are retained with the affected rerun.

The corrected run reached a later existing repeat-Cancel assertion: tapping the old Cancel coordinates reopened Harbor inspection, without changing simulation state. That run did not record its tap interval, so its cause remains uncertain. Four instrumented genuine rapid pairs (29–134ms) stayed closed; controlled later taps after the accepted 180ms guard opened the underlying Inspect target. A protocol double-tap experiment produced no compatibility clicks and was unsuitable. An initial instrumentation rerun accidentally placed trace assertions between the taps and is retained as a harness failure. The corrected trusted-input rerun passed with an observed 112.2ms pair and every original assertion. The product's accepted input fence is unchanged.

## Measurements and limitations

Idle rendering (audio uncreated), audio-enabled crossings and CPU field construction are measured separately. The first intended 120-interval comparison actually collected 121 intervals (Bell baseline 122); that original result is preserved. Its idle medians improved while p95 worsened. The corrected sampler collected exactly 120 intervals per idle sample for the second matched comparison:

| Scene / sample | Baseline median / p95 | Final median / p95 |
| --- | --- | --- |
| Holding idle | 116.6 /133.3ms | 116.7 /166.7ms |
| Holding short crossing, audio on | 116.6 /216.7ms | 116.7 /183.3ms |
| Bellwater idle | 100.0 /116.6ms | 99.9 /100.1ms |
| Bellwater long crossing, audio on | 100.0 /183.3ms | 100.0 /166.7ms |

Holding's idle tail is worse in both comparisons, including about **25% higher p95** in the strict repeat. Crossings and Bellwater improve in that repeat. This is mixed software-renderer evidence, not an overall smoothness improvement. Source/resource inspection finds no field rebake, active idle audio graph, new water pass or target. The persistent glow adds one sprite draw/two triangles: Holding 685/127,020 → 686/127,022; Bellwater 561/101,960 → 562/101,962. Contact shading adds small material work; its individual cost is not isolated. The remaining Holding idle-tail regression and native-device cost remain limitations.

Three sequential CPU water constructions, distinct from rendering, are lower in the matched repeat: Holding **2532.8 /1166.0 /641.4 → 701.6 /789.7 /519.8ms**; Bellwater **3363.4 /1059.7 /943.2 → 961.4 /871.0 /693.7ms**. The first comparison also improved all six construction samples. These observations support the local cached-field optimization without weakening field assertions or claiming native startup performance.

A soft coastal rim remains as part of the painterly approximation. The bottom is a decorative field, not rendered submerged geometry. Native images establish visual clarity for the stated sizes, not physical-device motion quality. Listening quality/balance/audible seams, physical devices/native GPU, Safari/Firefox, platform font variations, screen-reader speech and actual OS audio interruption policy remain unverified. Full historical suites are not relabeled as new passes.

The next step is the user's visual and musical playtest. The normal commit/push and draft-PR handoff report the final Git SHA and remote equality separately from these precommit captures. Main remains unchanged; no merge or ready-for-review action. [Verification summary](verification-summary.json), [tested changes](tested-changes.patch) and [packaging audit](packaging-audit.json).
