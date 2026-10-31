# Last Ferry — Phone audio and fullscreen correction

## Disposition

**Ready for review of the confirmed corrections, with phone reproduction limits.** Audio activation/retry is corrected and verified with controlled pending requests plus real interaction-required browser policy. The reproduced fullscreen defect—an already-open modal disappearing behind the fullscreen root—is corrected on the actual Windows in-app browser surface. This does **not** establish the cause of every Android Chrome fullscreen failure. No corrective publication was made.

## Source and scope

- Repository: [EDLMGit/Lastferry](https://github.com/EDLMGit/Lastferry), branch `m1-first-crossing`, [draft PR #1](https://github.com/EDLMGit/Lastferry/pull/1).
- Clean starting HEAD: `291fb4fa24d02dbab84dfe6eca2abc5c29b6d411`; its newer deployment documentation is preserved. Active scope: `NEXT_TASK_PHONE_AUDIO_FULLSCREEN.md`, copied unchanged from the supplied package root.
- Published game remains `e78819974a0487440e439ef87d24ba4bb1c2f454`, **Sites version 9**, hosting source `03720726f2d92cda0d5d66efb6749ccc755d22ee`, at the same owner-private [phone Site](https://last-ferry-playtest.abumech.chatgpt.site). Pushing this correction does not deploy it.
- All new evidence belongs to starting HEAD **plus the identified working-tree changes**, not a future commit. [Source manifest](source-manifest.json), [reuse comparison](source-reuse.json), tested patch and packaging audit retain that distinction.
- Final source hash, 149 entries: `d01b2d45871890df6c0267327ed1fc15eeede2dcb9c07f30bd52d220574815b4`.
- Runtime/data/build hash, 53 entries: `d76f3ea86d53f8affc7c1984f5737caca5819e63f46d191ed41a8e2e3c110c55`.

## What changed

### Audio startup, retry and explicit intent

Generic startup now follows a trusted completed click; a consumed water pan uses completed pointer-up. Touch pointer-down no longer calls audio activation. Keyboard uses its resulting trusted click. Sound controls are excluded from generic activation and explicitly Enable, Retry or Mute. The initial gesture captures that intent, including only the first nonrepeated keyboard down, so a context becoming running while a finger/Space is held cannot invert Retry into Mute. Requested playback visibly offers Retry; Settings also permits immediate Mute while a request is pending.

Each fresh deliberate activation can call native `resume()` even if an earlier request remains pending. One graph/context and scheduler are retained. Promise identity prevents an old completion from clearing the newer request; generation and enabled-state checks prevent stale success/rejection from stopping newer playback or restoring sound after mute, hide or disposal. No retry timer, autoplay bypass or silent-source workaround was added. Native context changes notify playback UI without polling every frame. Accepted score, gains, wood, arrival, victory ducking and scheduling remain protected.

The distinction matters because the [Web Audio resume algorithm](https://webaudio.github.io/web-audio-api/#dom-audiocontext-resume) can leave a blocked request pending, and [touch activation completes at pointer-up/touch-end](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation). The source defect is confirmed; its causal link to the user's particular speaker/Android report remains a diagnosis rather than claimed hardware reproduction.

### Fullscreen: a demonstrated rendering fix

On the signed-in **published** game, a native Settings fullscreen activation succeeded: root bounds expanded from 1806×1244 to 2560×1440 and the actual Exit state appeared. Settings still existed in AX/DOM with nonzero bounds, but the tab screenshot showed only the scene. The arrival dialog was similarly hidden. Closing the modal and opening Menu after entry restored visible UI; its visible Exit control restored ordinary bounds. This establishes an application presentation defect even though entry itself succeeds. The user’s won state and mute preference were restored afterward.

Fullscreen app insertion follows the [ordered top layer](https://fullscreen.spec.whatwg.org/#fullscreen-an-element), which [paints later entries above earlier ones](https://drafts.csswg.org/css-position-4/#top-layer). On actual `fullscreenchange` to `#app`, the correction closes/reopens the **same native dialog**, preserving DOM, mode, action/subset, return value, focused control and scroll. It does not use the app’s state-resetting close/render helpers. A temporary guard prevents focus restoration from activating map framing during promotion. Already-open `showModal()` alone would be a no-op under the [HTML modal algorithm](https://html.spec.whatwg.org/multipage/interactive-elements.html#show-a-modal-dialog).

The synchronous trusted `app.requestFullscreen()` and common app root remain. Actual state still determines the button. Final production `index-t90O8zhn.js` was checked in a fresh Windows IAB tab: its open Menu stays visibly above the scene on entry, and its visible Exit works. Earlier corrective Settings entry/reentry also visibly passed. [Actual supported-surface observations](supported-surface-observation.json). The original hosted observation is not a physical Android request/rejection trace.

Bounded diagnostics retain capability, top-level/policy state, actual activation, native error name/message, before/after viewport/root/dialog bounds, six attempts and eight samples. Build identity uses the real production artifact filename. Failure UI offers **Copy support details**, with a local manual-copy fallback, without credentials or telemetry. Known policy restrictions get specific copy; unknown rejections are not invented Chrome diagnoses. Old request callbacks cannot overwrite a newer result or update disposed UI. These diagnostics complement the rendering fix; messaging alone is not described as a fullscreen fix.

## Environment and executed checks

Node **24.15.0**, npm **11.12.1**, Windows. Automated cases use Playwright **1.64.1**, Chromium **156.0.8078.4**, SwiftShader, DPR 1 and touch-enabled phone emulation. The actual signed-in Windows IAB is a separate surface; its exact Chromium version is not claimed. No physical Android, other-engine, native-GPU or acoustic listening result is claimed.

| Check | Actual result |
| --- | --- |
| `npm run build` including TypeScript | **PASS**, 48 modules; JS 756,995 bytes, CSS 15,612 bytes. Existing large-chunk advisory remains. [Build log](build-results.txt). |
| `npm run test:unit -- --maxWorkers=1` | **PASS 200/200**, 27 files, 9.55s, including 44 audio cases. [Unit log](unit-results.txt). |
| Final `npm run typecheck` | **PASS** after all fixture/history assertions and documentation changes. [Log](typecheck-final.txt). |
| New focused browser cases | **18 distinct passes across bounded runs**, including the isolated native-policy calibration. |
| Tightened existing fullscreen case | **PASS**; supported local capability must actually enter `#app`. Generic failure feedback cannot pass it. |
| Trusted rapid mouse path | **PASS 112.6ms** against unchanged ≤180ms, with three trusted events and expected state/history. |
| Rapid touch path | **FAILED exercise/precondition; window unverified**. Valid three-touch outcome took 622.5ms. A native gesture experiment acknowledged commands but emitted zero clicks. Neither is a pass. |
| Actual UI rescues | **PASS** landscape 844×390 and portrait 390×844, subsets, tide Undo, terminal Undo/redelivery, Restart, background recovery and cove change. |
| Full historical suite / physical devices | **NOT RUN**; no all-history-green claim. |

There are **20 distinct current passes** (18 new + strict existing fullscreen + mouse fence), not a single clean combined run. Detailed commands, run counts and source identities: [browser report](BROWSER_CHECKS.md), [structured results](BROWSER_CHECKS.json), [final gates](final-gates.json).

Cold checks launch with actual interaction-required autoplay policy and no permissive bypass. Initial fixtures incorrectly used Playwright observations that grant activation; corrected cold readiness/state/geometry reads use CDP `userGesture:false`, with the first input a native trusted touch. A separate unmodified native-context calibration remains suspended/pending until that touch. This prevents a false cold-start pass caused by the test driver.

| Native cold cove | Clock advancement | Nonzero output samples | Peak | Maximum sources |
| --- | ---: | ---: | ---: | ---: |
| Holding Pier | 2.061s | 19/20 | 0.0500 | 7 |
| First Crossing | 2.888s | 19/20 | 0.0647 | 7 |

Both use one context and one scheduler. A first consumed pan also passes with zero clicks and unchanged turn/history. Controlled late-resume/state wrappers separately test pending identity, stale resolution/rejection, explicit Settings Mute, touch-intent races and held-Space repeat. Those controlled cases are labeled simulations, not native browser-policy reproduction. Late mute/hide/disposal ownership also has unit coverage.

Fullscreen coverage separates actual supported entry/Exit/reentry, root/dialog hit tests and native pixels, external exit with unchecked subset/portrait rotation, a real `Permissions-Policy: fullscreen=()` HTML-response fixture, and explicitly mocked rejection/unavailability/clipboard fallback at 780×320. Headless fullscreen retained its emulated viewport; only the separate IAB check demonstrated a real window-size expansion. The policy fixture is not a claim that the live Site has that restriction.

## Original failures and remaining timing limits

- `browser-initial`: **1 passed, 18 failed**. Fifteen cases aborted before game checks because command-line introspection required `--enable-automation`; one calibration observation granted activation; two rapid callbacks ran before downstream target handlers. These failures remain intact and are classified as fixture failures, not hidden passes.
- `browser-smoke`: **4 passed, 2 failed**. Mouse 180.7ms and touch 622.5ms missed the unchanged threshold despite correct action outcomes.
- `browser-remaining`: **13/13 passed**; `browser-policy-calibration`: **1/1**; cold-pan and strengthened history rerun: **1/1** each (one distinct case).
- `browser-rapid-native`: **1 passed, 1 failed**. Mouse now reaches 112.6ms. The touch experiment delivered no events; the valid raw-touch driver was restored and its missed-window evidence remains.
- An initial `--list` command overwrote the old default reporter. Its output is retained under `development/`; historical `reviews/m1/automation-results.json` was restored byte-for-byte from starting HEAD. Earlier evidence was not relabeled.

The three pre-existing limits remain individually recorded:

1. **Heading:** 1.425683 radians over 99.9ms exceeded 0.85. This is an observed delivered-frame smoothness failure, not merely a timeout. Planner agreement does not erase it. Steering/camera code is unchanged; it was not rerun or redesigned to conceal that software-renderer observation.
2. **Mouse:** prior 230.2ms miss remains archived; the current trusted 112.6ms run now verifies that window on the corrective runtime.
3. **Touch:** prior 377.6ms miss remains archived; current correct outcomes at 622.5ms still do not verify the ≤180ms condition.

Original published-build timing evidence: [retained failure summary](../phone-playability/browser-cache-timing/failure-summary.json). Current failures, contexts and samples remain in their per-run directories. No threshold, rule or sailing duration was relaxed.

## Evidence and protected behavior

- [Before fullscreen: actual covered modal](before-fullscreen-modal-covered.png), [unchanged baseline provenance](baseline-capture-reuse.json).
- [After actual entry: visible modal](browser-remaining/fullscreen-pending-entered.png).
- [Cold audio running](browser-smoke/cold-holding-pier-running.png), [pending Retry](browser-smoke/controlled-resume-resolve-two-pending.png).
- [Portrait subset after external exit](browser-remaining/fullscreen-running-external-exit-portrait-subset.png), [real policy denial](browser-remaining/fullscreen-header-policy-denied.png), [short-phone manual copy](browser-remaining/fullscreen-mocked-rejected-short-manual-copy.png), [portrait success](browser-remaining/audio-rescue-390x844-won.png).
- [Actual runtime audio, Ogg/Opus](cold-holding-runtime.ogg): 2.398s, 38,744 bytes, copied from the real master capture. All 40 encoded audio packets match the original WebM; no level change, normalization or re-encoding. Full decode passed. [Audio provenance](AUDIO_EVIDENCE.json). This is not speaker/listening approval.

Selected native images were inspected at original size; [selected files](selected-evidence.json). Full silent browser videos, original audio and unselected images remain local/ignored, unavailable in a clone unless supplied separately. Native IAB screenshots were inspected in tool output; committed images are separately identified headless captures. No concept art substitutes for gameplay evidence.

[Protected-source audit](protected-source-audit.json): 41 prior protected files plus 10 view/UI integration files are byte-exact to starting HEAD. Audio composition/graph/gains, transfer and victory scheduling remain unchanged outside the intended lifecycle. Twenty-eight gameplay/view/subset/Undo/layout functions remain exact after newline normalization. No new code comments. Accepted framing, panning, nearby previews, puzzles, headings, wake, pace, water and lighthouse are preserved.

## Remaining phone reproduction limit and next action

The supported hosted surface actually enters fullscreen. Its reproduced modal-order problem is fixed locally and in the final production build; the specific Android Chrome API-denial or browser-bar symptom has **not** been reproduced on hardware. Copy support details now retains the relevant real failure data for that phone without developer tools. No hosting policy, audience or Site configuration changed. These facts do not justify declaring the entire Android report resolved.

Use Node 24: `npm ci`, then `npm run dev`; production: `npm run build`, then `npm run preview`. The live private Site still runs e788199/version9. ChatGPT reviews the corrective GitHub SHA before publishing it there. Main stays unchanged and PR #1 stays draft. Further features remain queued.

## Packaging

[Packaging audit](packaging-audit.json) matches all149 tested source entries (144 byte-exact, five CRLF-to-LF normalization only) and all nine PNGs/one OGG byte-for-byte (1,429,111 bytes). [Tested source patch](tested-source.patch) identifies the working changes from291fb4f. No installed dependencies, build/test disposable directories, raw videos or local configuration are staged.

Twenty-five unselected original images were moved intact into ignored archives, identified by the [archive map](archive-map.json). Seven large JSON records remove formatting whitespace outside strings only; every token, numeric spelling, key, string escape and value is retained. Originals remain intact under ignored archives, with original/derived hashes in the [compaction record](json-compaction.json). Logs and source manifests retain their original contents. These files are derivatives, not rerun results.

Implementation commit **`d45d47332e2b02643f77d0ecd18b8d7149fa0dd8`** matches the tested source and selected media. The following commit changes continuity/audit metadata only; its final pushed SHA is supplied in PR #1 and the handoff. Evidence remains attributed to291fb4f plus recorded working changes, not retroactively recaptured from either commit.
