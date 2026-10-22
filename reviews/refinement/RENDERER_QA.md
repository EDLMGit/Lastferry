# Renderer comparison

The selected runtime has compact coast-attached sand/stone, a bounded shallow-field offset and a persistent Home glow. Native-size ordinary/flooded/Undo/loaded screenshots were inspected at desktop and both phone widths. The first candidate's broad bright tongues were rejected; the final images retain visible low-ground form without the stretched foreground blobs. Original exploratory source manifests and failures remain in ignored `raw/candidate*` directories.

## Method and source

Baseline runtime SHA-256: `b7d90007a64721c949c47b93e0e83e239a34cb52cbf4761c412367867f205f2d` (clean `31ad851a97907c8e86aa6f215b78b38caed7c48b`). Final runtime SHA-256: `f48aa67712f913a50af4d527e3936e9b568cbfac86ccddf13e79ab44ba0979f2`. Separate frozen source directories were served at 5182/5185, one browser at a time. Windows/Chromium 156/SwiftShader, 1440×900, DPR 1; no native-GPU or physical-phone claim.

The first sampler intended 120 idle intervals but used a separate rAF waiter and collected 121/122; the exact counts and raw intervals are preserved. The corrected sampler stops its own callback after 121 timestamps, discards warmup and produces exactly 120 intervals. Both matched repeats completed with source guards intact while other agent CPU/GPU work was paused. User application load and OS scheduling were not controlled. This is a bounded diagnostic comparison, not a benchmark certification.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
node tools/capture-refinement.mjs --phase=repeat-before --base=http://127.0.0.1:5182 --source=.cache/refinement-baseline --output=reviews/refinement/repeat-before
node tools/capture-refinement.mjs --phase=repeat-after --base=http://127.0.0.1:5185 --source=.cache/refinement-final --output=reviews/refinement/repeat-after
```

Full samples are retained locally in each run's `raw/capture-manifest.full.json`; compact committed manifests record path, SHA-256, counts and summaries. Construction timing is a separate synchronous CPU test: three `CoastalWater` instances with cached canonical paths, each disposed before the next; it is not a frame or startup-page measurement.

## Observed intervals

All entries are median / p95 milliseconds. Crossing samples cover actual UI sailing with audio running and have variable frame counts.

| View | First baseline → final | Strict-120 repeat baseline → final |
|---|---|---|
| Holding idle | 116.6 / 133.4 → 100.0 / 199.9 | 116.6 / 133.3 → 116.7 / 166.7 |
| Holding short crossing | 116.7 / 250.0 → 116.6 / 233.3 | 116.6 / 216.7 → 116.7 / 183.3 |
| Bellwater idle | 116.6 / 133.3 → 83.4 / 166.6 | 100.0 / 116.6 → 99.9 / 100.1 |
| Bellwater longest crossing | 100.0 / 150.0 → 100.0 / 183.2 | 100.0 / 183.3 → 100.0 / 166.7 |

**Holding idle p95 is worse in both pairs. Overall frame smoothness improvement is not established.** The second pair improves crossing tails and Bellwater idle, but does not erase the repeated Holding idle result. The software-renderer frame rate is low in both revisions.

The bounded investigation found unchanged water render-pass count (one), two 256×256 RGBA fields (524,288 total bytes), zero reflection targets, and no field rebaking in `update`. Ordinary totals change Holding 685→686 draw calls / 127,020→127,022 triangles and Bellwater 561→562 / 101,960→101,962: the additional draw and two triangles are the persistent existing glow. Hull/pile contact adds bounded material shader arithmetic, without extra contact meshes or passes. Static detail and vector normalization were removed from the water fragment path.

There is no added per-frame contact-mesh traversal: contact world positions are collected only by diagnostics. The idle sampler calls metrics/audio status, not environment traversal. Initial idle has no AudioContext, so the accompaniment scheduler cannot explain this result. Final audio status contains additional scalar diagnostics, but no measurement attributes the tail to those allocations, the glow, the shader or external load. The measured tail regression remains a limitation; no speculative renderer rewrite or third timing sweep was performed.

## CPU field construction

| Cove | First baseline → final (three samples, ms) | Repeat baseline → final (ms) |
|---|---|---|
| Holding | 3322.1, 935.9, 847.7 → 678.3, 643.4, 325.8 | 2532.8, 1166.0, 641.4 → 701.6, 789.7, 519.8 |
| Bellwater | 3147.7, 1118.5, 1002.1 → 829.1, 571.6, 250.8 | 3363.4, 1059.7, 943.2 → 961.4, 871.0, 693.7 |

Every matched construction sample is lower after precomputed contour/segment terms and bounding rejection. These reductions are distinct from steady-frame performance and do not prove a universal loading-time improvement.
