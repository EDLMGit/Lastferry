# Phone comparison and accessible media

All images are actual gameplay at native CSS-pixel size/DPR 1, not concept art. Baseline is isolated Git archive a93bed3897586fbfa66ed06e54ee2d9685c87be0 (runtime identical to accepted 80545cb). Current captures use the unchanged working-tree runtime **0d6bf4dc2707ef88b9b1402fa51e2a7aa23581dc0fce8f60b4aea4f278d91b89**. [Before](before/source.json), [after](final-capture/source.json) and [native video](native-sequence/source.json) retain exact file hashes and commands.

|Viewport|Before ferry px W×H|After ferry px W×H|Width ratio|
|---|---:|---:|---:|
|844×390|69.095 × 60.185|91.721 × 79.893|1.327×|
|780×390|61.226 × 53.331|91.721 × 79.893|1.498×|
|780×320|59.120 × 51.496|79.128 × 68.924|1.338×|
|390×844|46.607 × 38.785|91.721 × 76.327|1.968×|
|360×740|42.702 × 35.535|91.721 × 76.327|2.148×|

The 844×390 landscape choice is 1.327×; short landscape is 1.338×. Portrait uses a stable larger local view instead of fitting distant islands. Ferry dimensions come from actual projected renderer bounds at identical turn 0 with Moss aboard, tide 0 and normal motion. HUD primary/action text is 16px; new primary targets are 48px; actual viewport/geometry/font assertions passed at all five sizes.

Compare [844 before](before/holding-844x390-play.png) / [after](final-capture/holding-844x390-play.png), [780×320 before](before/holding-780x320-play.png) / [after](final-capture/holding-780x320-play.png), [portrait before](before/holding-390x844-play.png) / [after](final-capture/holding-390x844-play.png), and [360 portrait before](before/holding-360x740-play.png) / [after](final-capture/holding-360x740-play.png).

[Nearby landscape unload](final-capture/holding-780x320-unload-preview.png), [portrait sheet](final-capture/holding-390x844-unload-preview.png), [Whole cove landscape](browser-cache-final/layout-844x390-overview.png), [portrait](browser-cache-final/layout-390x844-overview.png), [critical boarding](browser-cache-final/rescue-844x390-critical-boarding.png) and [after rise](browser-cache-final/rescue-844x390-after-rise.png) show the decisions. Narrow portrait deliberately lets the bottom sheet cover lower Play while choosing passengers; Confirm stays reachable and the full scene returns when it closes.

[Harbor Play success landscape](final-capture/holding-won-play-844x390.png), [portrait](final-capture/holding-won-play-390x844.png), [short landscape](final-capture/holding-won-play-780x320.png), [Bellwater loaded West](final-capture/bellwater-arrived-west-buoy.png) and [East](final-capture/bellwater-arrived-east-buoy.png) show arrival and larger outer travel. [Independent actual 3D marker audit](marker-water-anchor-final.json) found maximum 0.01541 CSS px visible-center error through retained Bellwater moving/settled samples; terminal hidden controls are excluded.

[Open the natural-speed phone sequence](phone-journey.webp) — native 844×390, 15fps, 12.13 seconds, 1.58 MiB, silent. It shows local subset choices, Whole/Back, actual touch pan, crossings, boundary boarding and Undo without cuts or speed changes; only 1.5 seconds of raw screencast startup is trimmed. The full uninterrupted native ordinary-browser original remains at native-sequence/raw/phone-uninterrupted.webm (ignored/local).

Actual fullscreen and rotation have separate [real API results](browser-cache-final/fullscreen-actual.json), [external exit preview](browser-cache-final/fullscreen-actual-external-exit-preview.png), [rotation](browser-cache-final/rotation-open-preview-short.png), and the original final-capture/raw/phone-uninterrupted.webm. Its fullscreen/portrait segments are fitted into the fixed recording surface; do not treat those sections as native phone moving comparisons. [MEDIA.json](MEDIA.json) records hashes, probes and full VP9 decode results. Mocked rejection/unavailable/cutout tests are labeled separately.

[Native inspection](native-inspection.json) and [selected-file manifest](selected-evidence.json) identify the selected 31 PNGs and animation. Both full originals decode successfully. This is Chromium 156 touchscreen emulation with SwiftShader and DPR 1, not physical Android/native GPU/other-engine or fresh audio listening approval. The final 17 phone cases pass; three retained historical timing thresholds fail as documented in [verification history](VERIFICATION_HISTORY.md).
