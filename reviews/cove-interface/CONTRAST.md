# Runtime contrast check

Both phone viewports passed the focused audit: **844×390** and **780×320**, each with 11 actual UI states and 237 checks. The helper read the rendered WebGL canvas during an animation frame and combined actual local, bright-scene and dark-scene samples with computed browser color layers. It exercised Holding and Bellwater ordinary views, free route inspection, natural keyboard focus, menu, temporary unloading, safe and risky rabbit subsets, forecast and a nine-action success through the real controls.

| Measured content | Checks per viewport | Lowest observed ratio | Threshold |
| --- | ---: | ---: | ---: |
| Ordinary text | 139 | 5.801:1 | 4.5:1 |
| Icons and marker glyphs | 26 | 7.280:1 | 3:1 |
| Focus indicator against its solid keyline | 9 | 9.326:1 | 3:1 |
| Borders against the inner surface | 63 | 4.207:1 | 3:1 |

Ratios were compared before rounding. Border measurements are supplemental; visible text/icons can identify a control without a separate contrasting boundary. The selected and focus cues also retain shape differences.

The source was the working tree based on `ab8ff33fb1471aacb0dd7a22acbf90be3a4b1db6`, with runtime/data/lock manifest `f7875468f2d5dbd8c265a09c112ffb6289128a95d9c1a95b6dc8c50eaf536735`. Both runs confirmed that source remained unchanged. This manifest has a narrower scope than the milestone's full source snapshot. No page errors or failed checks occurred. Both actual UI journeys finished at turn 9 with all three passengers delivered.

`contrast-summary.json` retains the environment, exact run times, selected canvas samples, per-category minima, helper hash and hashes of the original reports/logs. The detailed originals remain locally under `raw/contrast-initial-844x390.*` and `raw/contrast-initial-780x320.*`. No result was replaced or rerun.

Environment: Windows, Node 24.15.0, Chromium 156.0.8078.4, SwiftShader, DPR 1 and touch emulation. This is a focused color audit, **not blanket WCAG certification or physical Android approval**. Computed foreground colors avoid treating antialiasing as the design color. Native-size screenshot review and practical placement checks are reported separately.

Method references: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
