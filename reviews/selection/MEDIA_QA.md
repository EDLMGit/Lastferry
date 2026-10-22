# Gameplay evidence

The fresh evidence is actual WebGL gameplay from frozen working runtime `.cache/selection-input-final` on `http://127.0.0.1:5191`, based on HEAD `dea5fdd1ed8b017d5112085d4964bab3122ea44f` plus the recorded implementation changes. Its core runtime SHA-256 is `60617c88dec76b6232459953785cdb27890138cbbb33a9333a2ec05eb076c4d9`. `after/source-manifest.json` identifies every runtime file; `after/capture-manifest.json` records PNG hashes, UTC capture times, real state/history, viewport/input and the environment. The runtime remained unchanged across execution. These are not captures from a later commit and contain no concept-art substitution.

Windows 11 Pro; Node 24.15.0; Playwright 1.64.1/Chromium 156.0.8078.4; headless SwiftShader, DPR 1. Desktop is 1440×900 with mouse; phones are emulated touch at 844×390 and 780×390. The screenshot session ran from `2026-10-22T18:00:53.762Z` to `2026-10-22T18:03:18.792Z`. Ordinary screenshots are muted, unselected gameplay. No physical-device, native-GPU or speaker/headphone listening claim is made.

## Selected fresh views

All paths below are under `after/`, at native viewport resolution.

| View | Files |
| --- | --- |
| Ordinary overview | `holding-pier-ordinary.png`, `bellwater-ordinary.png` |
| Current / shallow / remote / safe | `holding-current-stone.png`, `holding-blocked-shallows.png`, `holding-remote-rabbits.png`, `holding-safe-harbor.png` |
| Real subset loss preview | `holding-passenger-subset-preview.png` |
| Tide boundary and Undo | `holding-after-first-rise.png`, `holding-first-rise-undo.png` |
| Harbor loaded / delivery / Undo | `holding-loaded-harbor.png`, `holding-delivery.png`, `holding-delivery-undo.png` |
| Bellwater loaded / delivery | `bellwater-loaded-harbor.png`, `bellwater-delivery.png` |
| Phone 844 open / closed / remote / loaded | `phone-844-current-harbor.png`, `phone-844-ordinary.png`, `phone-844-remote-low-pier.png`, `phone-844-loaded-harbor.png` |
| Phone 780 open / closed / remote / loaded | `phone-780-current-harbor.png`, `phone-780-ordinary.png`, `phone-780-remote-low-pier.png`, `phone-780-loaded-harbor.png` |

The capture helper completed the Holding rescue, including subset adjustment, first-rise Undo/recommit, delivery Undo/redelivery, and Bellwater rescues on desktop and both phone widths. Every action helper checks exactly one turn was committed. All four sessions reached the actual won state; no state injection was used. The final production browser test separately completed First Crossing without debug globals or external assets. Zero page errors were recorded during the screenshot session.

Two additional780×390 critical-boarding/after-rise PNGs in `phone-critical/` are exact byte copies from the passing final-runtime narrow contextual test. Their separate manifest retains original source, capture time and input instead of attributing them to this capture helper. Incidental earlier browser screenshots remain local/ignored; the compact versioned set contains28 gameplay images plus one original defect-probe image.

## Uninterrupted recordings

The raw videos remain ignored/local, rather than adding large binaries to Git. Both are original-speed Playwright recordings from the same actual desktop sessions: VP9, 1440×900, 25fps, one video stream and no audio stream. No cuts or state injection were used. They begin with the untouched overview and its 120-interval idle diagnostic; they are verification sessions rather than edited promotional clips.

| Local path | Duration / bytes | SHA-256 |
| --- | --- | --- |
| `after/raw/holding-pier-selection-rescue.webm` | 51.36s /17,999,329 | `26e7c646fcfede4f731bb5e1f9a3d09e5813b7b43a6e2b6818f0deea14c385f6` |
| `after/raw/bellwater-selection-rescue.webm` | 35.28s /11,908,583 | `942aa58520c40c3b655b21c179966022dfcadc32e0578d1de7ad98865c985e72` |

Holding shows an actual island click, current/blocked/remote/safe free inspection, explicit Sail, passenger subset preview, boarding both rabbits, tide change, Undo/recommit, the remaining rescue, delivery and terminal Undo/redelivery. Bellwater shows its full ten-action rescue with the changed selection/action contract. Raw test recordings and failed-attempt media remain in the source-separated run archives. The videos are silent; they do not verify the accepted music through listening.

Both complete streams were decoded without FFmpeg errors, and12 native-resolution frames were extracted without resizing or image editing. Metadata, commands, frame/video hashes and decode results are retained in `media-inspection.json`. All12 ordered frames were inspected individually; continuous real-time playback was not reviewed. Rapid-Confirm tests create their own unrecorded context (`recording:false`): their event/failed-context evidence is retained, but no reduced-rapid video is claimed.

## Native visual inspection

Native-size inspection covers the subset warning, executed first-rise state, success, 844 current Harbor and 780 loaded Harbor. The subset preview names the rabbit left behind and actual loss consequence; the risen state replaces the obsolete deadline with safe-aboard facts and flooded-pier transfer unavailability. Both phone widths keep the complete cove and six named Bellwater stops visible, with readable essential controls, an unobscured ferry and a lit Harbor lantern before selection. Current/remote cards and selection accents retain scene context without drawing a false continuous passage. The independent scene review individually inspected all 22 final PNGs, four selected baseline PNGs, two final-phone critical states and 12 native motion frames, reporting no new visual defect. `SCENE_QA.md` records that review and its separate source attributions; the final review report records video decoding and remaining playback limitations.

## Reproduction and performance separation

```sh
node tools/capture-selection.mjs --phase=after --base=http://127.0.0.1:5191 --source=.cache/selection-input-final --output=reviews/selection/after
node tools/capture-selection.mjs --phase=after-performance --base=http://127.0.0.1:5191 --source=.cache/selection-input-final --output=reviews/selection/after-performance --perf-only
node tools/compare-selection-rendering.mjs --base=http://127.0.0.1:5191 --output=reviews/selection/matched-canvas
```

`tools/capture-selection.mjs` is unchanged from the baseline protocol, SHA-256 `709427797b5d8ab2fe61fafd526cc75aefa03a7b4856fece0a3da2eb3dca0517`. Desktop samples in the screenshot/video session are recording-enabled diagnostics and are **not** compared with the no-video baseline. The separate `after-performance/` execution uses the same no-video/audio-uncreated timestamp-only protocol as `before-performance/`. `matched-canvas/` is explicitly a temporary CSS coverage diagnostic, not the final appearance or isolated proof of rendering costs. Actual dimensions and mixed results are in `RENDERER_QA.md`.

## Reused baseline

Four ordinary native PNGs in `before/` are exact reuse from the accepted refinement, with their original times/source identity intact. `before/source-reuse-audit.json` checks all 38 prior runtime files against the requested reviewed commit after line-ending normalization and verifies the archived commit source; `before/capture-manifest.json` retains original PNG hashes and environment. They are not presented as newly captured final gameplay.
