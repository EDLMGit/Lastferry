# Phone audio and fullscreen browser verification

The new checks pass across bounded runs, with one rapid-touch timing precondition still unverified. These results do not establish physical Android or speaker approval.

## Source and environment

Started from `291fb4fa24d02dbab84dfe6eca2abc5c29b6d411`. All runs retain their exact source lists under their review directory. Final test source is `d01b2d45871890df6c0267327ed1fc15eeede2dcb9c07f30bd52d220574815b4` (149 inputs). Runtime/data/build inputs are identical between the successful smoke, remaining checks, native-rapid follow-up and final cold-pan run; later differences are test fixtures only. [Structured results and reuse](BROWSER_CHECKS.json).

Node 24.15.0, Playwright 1.64.1, Chromium 156.0.8078.4, SwiftShader WebGL, DPR 1. Phone sizes are touchscreen emulation. The audio file explicitly launches with `--autoplay-policy=document-user-activation-required`, removes any permissive autoplay flag, and records the actual browser command line. `--enable-automation` permits command-line introspection; it is not an audio bypass.

Cold setup, readiness, state reads and first-touch coordinates use raw CDP `Runtime.evaluate` with **`userGesture:false`**. The first interaction is native CDP touch. This matters because the installed Playwright evaluator sends `userGesture:true`; normal `page.evaluate()` can itself invalidate a cold-start precondition. The separate calibration fixture confirms an unmodified native `AudioContext.resume()` remains pending before interaction and resolves after a trusted touch.

## Executed runs

| Directory | Result | Meaning |
| --- | --- | --- |
| `browser-initial` | 1 passed / 18 failed | Initial fixture run. Fifteen cases aborted before game checks because command-line introspection lacked `--enable-automation`; one calibration read granted activation; two early rapid callbacks ran before target handlers. Strict existing fullscreen passed. Logs, source and structured errors remain. |
| `browser-policy-calibration` | 1/1 passed | Corrected passive reads prove actual interaction-required native audio policy. Minimal fixture, separate from the game documents. |
| `browser-smoke` | 4 passed / 2 failed | Both cold native coves, controlled resume/Mute, and held-Space intent passed. Rapid mouse measured 180.7ms and touch 622.5ms, exceeding the unchanged 180ms requirement. |
| `browser-remaining` | 13/13 passed | Twelve remaining new cases plus the tightened existing supported-fullscreen case. |
| `browser-rapid-native` | 1 passed / 1 failed | Mouse active fence verified at **112.6ms**. A native touch-gesture command produced no clicks, so its timing precondition was not exercised. |
| `browser-cold-pan` | 1/1 passed | First consumed touch drag starts native audio, produces no click and preserves puzzle state. |
| `browser-cold-pan-history` | 1/1 passed | Affected rerun adds explicit history equality: 0 → 0. This is the same distinct cold-pan case. |

There are **18 distinct passed new cases**, including the native-policy calibration, plus the existing strict fullscreen case and mouse active-fence case. This is not one clean historical-suite run. The valid raw-touch driver is retained after the unsuccessful gesture experiment. Its actual three trusted clicks and correct later state were observed at 622.5ms, so the active ≤180ms touch window remains unverified. No threshold, animation pace or game rule was relaxed.

The previous delivered-heading failure remains open: 1.425683 radians over 99.9ms exceeded 0.85 radians per delivered sample. Heading/camera design was not changed or rerun to conceal it.

## Audio outcomes

Cold direct entries to **Holding Pier and First Crossing** both start audio on the first completed trusted touch without a cove change, reload or Sound toggle. Before touch, there is no game audio context or scheduler and no previous document activation. Afterward, one context and one scheduler remain active:

| Cove | Audio clock advancement | Nonzero RMS samples | Peak | Maximum sources |
| --- | ---: | ---: | ---: | ---: |
| Holding Pier | 2.061s | 19/20 | 0.0500 | 7 |
| First Crossing | 2.888s | 19/20 | 0.0647 | 7 |

Saved mute stays silent during inspection and a cove change. One explicit Enable works, including keyboard activation. Controlled pending-resume cases verify a fresh Retry, newer promise ownership, stale success/rejection, explicit Settings Mute, late state changes between touch-down and release, and a held Space with a trusted repeat event. The controlled gate wraps one native graph and deliberately simulates delayed state/resume, preventing source-start auto-unlock from bypassing the test. Those cases are not claimed as real browser-policy or Android reproduction.

The cold-pan case starts with inactive touch-down, completes with an active touch-up, emits zero clicks, pans the camera, preserves the puzzle state and starts sustained nonzero output. Landscape and portrait full UI rescues include passenger subsets, tide Undo, terminal Undo/redelivery, persistent victory reduction, Restart, simulated background recovery and a real cove navigation.

[Actual runtime audio](cold-holding-runtime.ogg) is a 38,744-byte Ogg/Opus packet copy of the captured 38,936-byte original WebM. All 40 encoded audio packet hashes match; there was no normalization, gain change, remix or re-encoding. Full decode passed. [Audio source, hashes and probe](AUDIO_EVIDENCE.json). The original remains local under `browser-smoke/raw/`. No acoustic or physical speaker listening approval is inferred from the capture or RMS.

## Fullscreen outcomes

Controlled supported Chromium **must enter `#app`**; feedback alone cannot pass. Cold-muted, pending-audio and running-audio cases verify trusted activation, actual fullscreen state, dialog/root containment, dialog button center hit tests, actual Exit/reentry, external exit and an unchecked passenger subset surviving portrait rotation. Native screenshots confirm visible controls. This headless emulated viewport stayed 844×390 during entry; it does not prove browser-bar changes or Android resizing. The separate in-app-browser investigation and its real window-size change belong to the main review report.

A real `Permissions-Policy: fullscreen=()` response-header fixture verifies actual browser policy denial separately from mocked API absence/rejection. The two mocked cases at 780×320 verify specific diagnostic outcomes and reachable Copy support details/manual-copy fallback, without horizontal overflow. Clipboard interception is explicitly controlled and does not overwrite the user's clipboard. Support JSON includes the development artifact identifier and bounded diagnostic history.

## Commands

Every test command sets its review directory explicitly:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5222'
$env:LAST_FERRY_PRODUCTION_PORT='4192'
$env:LAST_FERRY_REVIEW_DIR='reviews/phone-audio-fullscreen/browser-smoke'
node tools/snapshot-evidence.mjs --review-dir reviews/phone-audio-fullscreen/browser-smoke --base 291fb4fa24d02dbab84dfe6eca2abc5c29b6d411
node node_modules/@playwright/test/cli.js test tests/e2e/phone-audio-fullscreen.spec.ts tests/e2e/selection.spec.ts --grep 'phone audio cold|phone controlled resume resolve|phone controlled held Space|selection regression'
```

The remaining invocation used `browser-remaining` and:

```powershell
node node_modules/@playwright/test/cli.js test tests/e2e/phone-audio-fullscreen.spec.ts tests/e2e/phone-playability.spec.ts --grep 'phone saved mute|phone controlled resume reject|phone controlled pending mute|phone controlled explicit touch intent|phone supported fullscreen|phone fullscreen real header|phone fullscreen mocked|phone audio rescue|phone fullscreen: real API'
```

The bounded follow-up used `browser-rapid-native` with `selection.spec.ts --grep 'selection regression'`. The final separate run used `browser-cold-pan-history` with `phone-audio-fullscreen.spec.ts --grep 'phone audio cold pan'`. Native calibration used `browser-policy-calibration` and `--grep 'native autoplay policy calibration'`. Each has its own results and source manifest. Headless test invocations used one worker and were not run in parallel. The signed-in IAB remained available for separate supported-surface UI checks; no exclusive-hardware performance claim is made.

```powershell
C:\ffmpeg\bin\ffmpeg.exe -v warning -i reviews/phone-audio-fullscreen/browser-smoke/raw/cold-holding-runtime.webm -c:a copy -y reviews/phone-audio-fullscreen/cold-holding-runtime.ogg
C:\ffmpeg\bin\ffmpeg.exe -v error -i reviews/phone-audio-fullscreen/cold-holding-runtime.ogg -f null NUL
```

The parent separately recorded the production build/typecheck and **200/200 unit tests across 27 files** with bounded workers. Focused test-source typechecking also passed after the final fixture changes.

## Selected evidence and limits

[Selected evidence manifest](selected-evidence.json) identifies eight new native gameplay PNGs, one reused baseline PNG and the audio sample. The PNGs were inspected at original resolution: cold running audio, blocked Retry, visible fullscreen menu, portrait subset after external exit, effective policy denial, short-landscape manual copy, portrait victory and first-pan activation. Full raw audio and unselected originals remain local.

Physical Android Chrome, the user's speaker path and other engines remain unverified. Local and in-app-browser success must not be described as proof that the user's exact Android fullscreen report is fully resolved. The private Site remains the published e788199/version9 build until ChatGPT publishes the reviewed correction.
