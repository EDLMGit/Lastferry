# Transfer audio: browser and recording verification

Evidence uses base HEAD `fa07368b803a992712a5126b85862c5b91dbcf3a` plus the recorded working tree. The final capture's 42-file runtime hash is `383ccdd71958e7668bf936a94ee3398ed38ee83c6f045091f3c2246899824ade`. [Source equivalence](verification-source-equivalence.json) confirms that the corrected normal check, final lifecycle/production checks and final capture share the same runtime. Documentation changes are excluded. Source archives and verbose traces remain locally under ignored `raw/` directories; compact reports retain their hashes.

Windows, Node 24.15.0, Playwright Chromium 156.0.8078.4, headless SwiftShader, DPR 1. Development server: 5193; production: 4183. Normal transfer checks use emulated touch at 844×390. Lifecycle checks use mouse at 844×390; production First Crossing uses 1440×900. No physical Android test occurred.

## Executed checks

| Run | Actual result |
| --- | --- |
| [Initial integration](browser-initial/output.txt) | 4/4 pass: normal audio, lifecycle/reduced motion, 780×320 and 844×390 phone checks. This source still had the second unloading contact, subsequently removed after the surface audit. |
| [Final affected run](browser-final/output.txt) | 2 pass / 1 fail: production First Crossing and lifecycle pass; normal check reaches success twice but fails its unconditional audible-contact assertion on terminal replay. |
| [Corrected normal check](browser-corrected/output.txt) | 1/1 pass, 50.1s. Verification correction only; runtime unchanged. |

Exact commands, source hashes and original test files accompany each run. Both phone results remain applicable to the unchanged layout, controls and visual paths; the final 844×390 capture also exercises the final audio policy. The unrelated full browser suite was not run.

The normal check covers free selection, a blocked passage, cancelled preview, an empty/invalid subset, temporary Moss unloading, two-rabbit boundary boarding, tide Undo/replay, boarding Moss, unloading only Pip at Stone, partial Moss delivery at Harbor, terminal Undo/redelivery and released tails. Committed-state/click observations show that contacts have not fired at commitment. World records establish selected passenger IDs, unique stages, valid progress windows and complete consumption. All eight actual transfers in the corrected run emitted their expected eleven grouped contacts; all eleven played, at most two transfer sources existed, zero score tones dropped, and one musical clock continued through Undo. Partial delivery did not trigger the arrival phrase.

The final lifecycle check consumes a muted contact without replay on unmute, cancels the remaining contact during **simulated document visibility change**, restores without stale sound, restarts silently, then completes a real-interface reduced-motion rescue. Each reduced transfer produces one compact cue. Five contacts played and one muted contact was skipped; one context, no score drops, no retained transfer tail. This is not a physical browser-background or Android test.

## Preserved failure and correction

In the first final-runtime normal run, the repeated final unloading had a 734.8ms gap between recorded observations. Its only contact was consumed as `stale` at progress **0.859222**, beyond its **0.37** expiry. The sound counter correctly stayed at ten, and the second arrival phrase still played. The first seven transfers, including the first final unloading at progress 0.262444, had emitted ten contacts. The failing test incorrectly required every transfer to remain audible despite the specified late-frame suppression.

The corrected check permits zero only when every mark is consumed as stale beyond its window, leaves the previous sound contact unchanged, and never increments the contact count afterward. It retains exact emitted-count equality, selected IDs, unique stages, ownership/clock checks and a requirement for actually played holding-unload, boarding and final-delivery contexts. The rerun happened to emit all eleven contacts. Original failure output, automation result, source archive and full trace are retained; no runtime change was made to satisfy it.

## Actual gameplay audio and media

[Final capture](capture-complete/capture.json) is an uninterrupted actual Holding rescue with the intended tide Undo/replay: nine final actions, eight played wood contacts, one delivery, one context/scheduler, at most two transfer sources and thirteen total owned sources, zero dropped score tones. No extra retry was needed. The tool permits at most two **real UI Undo/replays** when a required contact misses its window; every attempt would be logged, with no state injection or replacement audio.

- `capture-complete/raw/holding-transfer-runtime-audio.webm`: synchronous native canvas video plus the runtime master audio stream, 2,652,400 bytes, VP9 844×390 and Opus stereo 48kHz. Packet timeline ends at 40.059s; 468 variable video frames span 38.772s (about 12.07fps), with the last image held while audio finishes. The configured canvas capture rate was 25fps; actual software capture was slower. Canvas video excludes DOM controls.
- `capture-complete/raw/holding-full-interface-silent.webm`: the same full-interface session, silent, 44.36s at 25fps. Both streams decode completely without FFmpeg errors.
- [Contact observations](capture-complete/contact-events.json) identify the eight actual emitted cues. [Media analysis](capture-complete/media-analysis.json) records decoding and full-mix levels: mean −36.5dBFS, peak −22.1dBFS. These are signal measurements, not listening approval.
- Final native 844×390 screenshots: `capture-complete/phone-start.png`, `phone-critical-boarding.png`, `phone-after-rise.png`, `phone-success.png`. Root inspected all four at native size. Three native frames extracted from the actual audio/video at 3.2s, 13.9s and 33.15s were also inspected: real rendered Moss unloading, rabbit boarding and Harbor unloading, with no blank canvas. Continuous real-time playback was not reviewed.

Two preceding recording failures remain explicit. `capture/` exported only seven bytes because its Data URL parser split the comma in `vp9,opus`; the recorded Blob was 2,776,191 bytes. The parser now splits `;base64,` and checks exact byte length. `capture-final/` exports and decodes valid audio/video, but its first Moss contact was stale, so the required three-context evidence check failed. `capture-complete/` passed that requirement and decoded successfully. Earlier screenshot retention is recorded separately; their valid gameplay images are not evidence of a valid first audio export.

**Listening remains pending.** No speaker/headphone acoustic-listening capability was available. Actual procedural runtime music and effects are recorded for the user to hear; no offline or replacement audio was added. Phone-speaker balance, perceived wooden character, loudness and acoustic synchronization still require listening, preferably during the user's actual Android playtest. Raw video/audio and verbose traces are local and ignored, so they are unavailable from a fresh Git clone.
