# Harbor composition — actual native inspection

The `another-bell` shot now uses one local foreground coordinate system. A coherent scale moves the empty ferry, mooring, supported stone landing, Rue, Pip and Moss together; distant sky, land and water extend independently. Portrait has a deliberately narrower arrangement. Short landscape reserves a readable caption region beside the group, while desktop places the caption relative to the bounded composition. The existing painter assets, character identities and small acknowledgment motions are reused.

`story-painter.ts`, `story-view.ts` and Harbor-only CSS are changed. The registry, five-second duration, 1.05-second caption lead-in, 3.2-second lantern cue, progress and Sound owners are unchanged. The shared player assigns the illustration name, and only Harbor uses the new caption coordinates. Other illustrations do not consume these coordinates.

## Actual evidence and scope

`harbor-second/capture.json` records the exact five relevant source hashes, browser-visible game/campaign/timeline state before and after each capture, native viewport dimensions and explicit handoff results. `executed-capture.mjs` retains the executed driver. Chromium 1248 headless/SwiftShader, device scale factor 1, Node 24.15.0, Windows; local Vite at port 5282. These are actual app-root story captures, not a painter-only specimen.

The fixture is a legitimate pending `another-bell` checkpoint with Holding completed and only opening acknowledged. Home Continue restores the normal recap; the visible More → Replay scene control starts the real shot. Beginning and placement frames are held using the existing Pause control; Pause intentionally reveals the full caption. Therefore these held frames do not demonstrate the unpaused 1.05-second reveal timing. Final endpoints are naturally settled at 5,000ms. Continue to Bellwater remains visible throughout. Only its actual activation changes the checkpoint to Bellwater, at turn 0.

| Native viewport | Beginning | Lantern placed | Endpoint | Inspected result |
| --- | ---: | ---: | ---: | --- |
| 390×844 | 398.0ms | 3820.3ms | 5000ms | Complete ferry/landing and all three animals read as a compact group; full caption and controls fit. |
| 780×320 | 373.8ms | 4303.8ms | 5000ms | Ferry and high landing fit above the control strip; readable wrapped caption occupies its own left region. |
| 320×740 | 591.2ms | 3297.1ms | 5000ms | Narrow portrait keeps Moss inside the edge, the full name/caption and every control. |
| 2048×930 | 94.8ms | 3288.5ms | 5000ms | The group remains bounded instead of spreading to independent viewport fractions; the empty ferry and people share one scale. |

Representative beginning, placement and endpoint PNGs were opened at native size. The first desktop candidate put the hull/reflection against the lower canvas edge; `harbor-candidate/2048x930-begin.png` retains that original. The group was raised before the second capture. The final images retain space below the hull and a clear visible landing/water contact. Human visual acceptance remains separate.

Recorded checks pass for all 12 held frames and four explicit handoffs: no page errors, no horizontal document overflow, full caption bounds, every visible control at least 44×44 CSS pixels and fully inside the viewport, and unchanged committed game state across captures. The selected full text is “Pip, Rue and Moss are safe. Bellwater is still waiting.” No save acknowledgment occurs merely from Replay, Pause, Resume or waiting for the endpoint.

Focused existing story checks: 85/85 tests pass across story-presentation, story-progress, story-staging and story-framing. TypeScript passes after the concurrent main UI error was corrected by its owner. Final integrated build/unit/asset and actual uninterrupted journey evidence are recorded separately by the main pass.

## Original attempts and limitations

- The first browser launch used the nested checkout's absent `.cache/ms-playwright` and failed before opening the app. The installed matching Chromium 1248 was found in the parent workspace cache; no browser installation or product change was needed.
- The first capture driver used the historical `journey-continue` selector, then the ordinary `story-replay` selector for a restored recap. Both timed out because current Home uses `home-play` and a restored recap exposes `story-replay-scene`. These were fixture errors; the actual visible controls were used in the corrected run.
- The first wide second-frame Playwright screenshot timed out at 30 seconds. Its completed first frame is retained. The corrected driver uses CDP `Page.captureScreenshot` and writes results after every frame; it completed all four sizes. Native held frames are not evidence of physical-device FPS.
- The final capture uses actual Pause/Resume, not a fake clock or direct timeline setter. Capture latency means “placement” is the completed placement phase at the recorded time, not an exact 3200ms freeze. The uninterrupted actual UI sequence is separate.
- No new narration, physical Android run or human speaker/listening approval is claimed. The accepted audio code and timing remain unchanged.
