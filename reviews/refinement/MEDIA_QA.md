# Gameplay and audio media

All media comes from the actual game UI/runtime. No concept image, offline score synthesis, replacement soundtrack, speed change or edited gameplay sequence is presented as capture. Large original media and decoded frames are retained locally in ignored `raw/` directories; Git contains the selected PNGs and compact manifests with their identities.

## Gameplay

| Original-speed silent recording | Duration | SHA-256 |
|---|---:|---|
| `after/raw/holding-pier-uninterrupted.webm` | 54.480 s | `06b62effbc26ab54f8553b71d1a5f33d2842bf90e4e995b6fd45da734a1c23f7` |
| `after/raw/bellwater-uninterrupted.webm` | 53.160 s | `22be6ce8beb5a9156ac0d8c587fd69acdd83c4628bd394f60009696b34fdca7c` |

Both recordings are uninterrupted Playwright captures at 1440×900. They include initial planning, sailing, rescue, tide Undo and delivery; Bellwater also includes an explicit UI restart after its initial long-crossing measurement. They retain the idle measurement and final CPU construction diagnostic while the success screen rests. Thus they are verification sessions, not shortened promotional clips. Source identity is the frozen final runtime `f48aa67712f913a50af4d527e3936e9b568cbfac86ccddf13e79ab44ba0979f2`; environment and exact action sequence are in `after/capture-manifest.json`.

FFmpeg decoded both complete streams without reported errors. Accurate-seek native PNG frames were extracted without resizing and inspected individually at original size:

- Holding: 1 s initial sheep aboard; 20 s empty departure with Moss ashore; 29 s Undo to turn 3/tide 0; 31 s recommitted boundary boarding; 41.5 s Undo to turn 7/tide 1 with everyone aboard; 43 s resumed Harbor crossing; 53.5 s completed rescue with all three passengers ashore and success card clear of the ferry.
- Bellwater: 1 s initial Harbor; 20 s long-route arrival; 31 s rabbit return; 39.5 s Undo to turn 7/tide 1 with Bram at Bell Pier; 43 s loaded Harbor crossing; 52.3 s completed rescue. Flooded low-ground detail remains visible, the Home label persists and the final ferry is clear of the card.

These thirteen ordered frame inspections and full decode checks establish intact media and the depicted states; they are not a claim of native-device real-time playback assessment. `media-inspection.json` records source hashes, FFmpeg version, probe metadata, exact seek commands and derived-frame hashes. All fifteen final screenshots were also independently inspected at native size.

## Actual adaptive mix

`affected/raw/adaptive-rescue-loop.webm` is the live post-master Opus/WebM stream covering the rescue, deadline and homeward states, tide Undo, terminal Undo/redelivery, idle and a full 75-second loop. Observed wall capture is 82.1134 s; SHA-256 `96fa5b885dc8cb1c85570f0b4146206b92a403d135abf85136d45abc98a45c13`. The compact metadata points to all 809 original samples with their file hash. See `AUDIO_QA.md` for the independent analysis.

For easy listening, `affected/raw/adaptive-rescue-loop.mp3` is a full-duration codec derivative (82.056 s including MP3 codec/container timing), SHA-256 `3b36d05c9a4066f0d687492d287f369b743400de593a522da42a823cfe37410e`. No trim, volume adjustment, normalization or time change was applied:

```powershell
ffmpeg -v error -y -i reviews/refinement/affected/raw/adaptive-rescue-loop.webm -vn -c:a libmp3lame -q:a 2 reviews/refinement/affected/raw/adaptive-rescue-loop.mp3
```

## Bounded accompaniment comparison

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
node tools/compare-refinement-audio.mjs --base=http://127.0.0.1:5185
```

`audio-comparison/raw/accepted-base.webm` and `audio-comparison/raw/companion.webm` record approximately twelve seconds each from the same actual UI homeward state (turn 7, all aboard), same page/context and master gain 0.65. The development switch changes only the accompaniment. They start at authored phase 15.472 s and 15.301 s on consecutive 75-second loops: **171 ms start offset**, so this is a matched phrase-cell comparison, not sample-aligned audio. Capture wall times are 12.2235/12.0155 s. No companion notes occur in the base excerpt; three occur in the candidate excerpt. Maximum sources are 11/12, maximum companions 0/1, with no dropped tones or skipped base events. Metadata/source guards passed.

The files and exact hashes are recorded in `audio-comparison/comparison.json`. Actual speaker/headphone listening is unavailable here. The implementation retains one restrained accompaniment proposal for playtest based on authored voicing, level and lifecycle evidence; audible improvement, timbre and masking remain listening-review limitations.
