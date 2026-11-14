# Renderer comparison

Windows 11 Pro, Chromium156.0.8078.4, headless SwiftShader, DPR1. One browser/worker at a time. Each untouched overview records exactly120 intervals from121 `requestAnimationFrame` timestamps, with state/audio/renderer diagnostics outside the sampled frames. Audio remained uncreated; no simulation action occurred. These are software-renderer observations, not physical-device frame-rate guarantees.

The reviewed baseline was served from an exact Git archive of `dea5fdd1ed8b017d5112085d4964bab3122ea44f`. Final runtime SHA-256 is `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9`. Both matching runs use `tools/capture-selection.mjs --perf-only`: no video recording. Desktop samples collected during gameplay recording are separately labeled diagnostics, excluded from this comparison.

| Cove / viewport | Before median /p95 ms | Final median /p95 ms | Actual buffer before → final |
| --- | --- | --- | --- |
| Holding,1440×900 |83.3 /133.3 |83.3 /166.7 |1440×730 →1440×900 |
| Bellwater,1440×900 |66.6 /83.4 |83.2 /100.0 |1440×730 →1440×900 |
| Bellwater,844×390 |16.7 /33.4 |16.7 /33.4 |844×258 →844×390 |
| Bellwater,780×390 |16.7 /33.4 |16.7 /33.4 |780×258 →780×390 |

Full-canvas coverage intentionally adds23.3% desktop pixels and51.2% phone pixels. The final desktop tails are worse in these combined-presentation samples; phones retained the same measured median/p95. These samples alone cannot distinguish coverage from local scene costs or run-to-run software noise. The historical repeated Holding regression remains preserved; this result does not resolve it or attribute it to audio. Older refinement samples queried diagnostics each frame, so they are not protocol-identical to these timestamp-only measurements.

Accepted water/shader/contact source is unchanged. There is still one water draw, two256² fields (524,288bytes), no render target, no new scene pass, no global bloom and no shadow-casting lantern light. Panels use background alpha without backdrop filtering. A pale core and scoped local material receivers add a small amount of existing-style geometry/material work.

Exact timestamps, intervals, canvas dimensions, state/audio observations, metrics and source hashes: `before-performance/capture-manifest.json` and `after-performance/capture-manifest.json`. The actual final visual presentation uses the full viewport. Any temporarily smaller-canvas diagnostic is recorded separately and does not stand in for final visual or gameplay evidence.

One bounded diagnostic temporarily applied `#world { top:92px; bottom:78px; }` to the unchanged final desktop runtime. The actual canvas/buffer was asserted to match the baseline's1440×730 at y92. Holding measured **66.7/100.0ms**, Bellwater **66.6/133.3ms**, with120 intervals each, audio uncreated and zero errors. Holding's tail improved relative to both the final full canvas and this baseline sample; Bellwater's tail worsened despite equal coverage. The mixed tails prevent attributing the difference solely to either pixels or lantern changes. No renderer/audio change was made in response; physical-GPU performance remains unverified. [Diagnostic and raw intervals](matched-canvas/diagnostic.json), reproduced with `node tools/compare-selection-rendering.mjs --base=http://127.0.0.1:5191`.
