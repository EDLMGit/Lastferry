# Last Ferry review — Wide Berth

## Disposition

**Ready for review within the exercised coverage.** WIDE_BERTH_01 implements Nell's launch, a physical six-space ferry, an authored fourth campaign cove and honest continuation of historical saves. Both principal strategies complete through actual controls. Human judgment of the stronger puzzle, launch art and quick transfer choreography remains pending. No deployment.

## Source and scope

- Repository: https://github.com/EDLMGit/Lastferry; draft PR https://github.com/EDLMGit/Lastferry/pull/1; branch `m1-first-crossing`.
- Comparison/reviewed baseline: `7e324e88827857469bf348fca311548344d03da6`. Initial checkout and fetched remote matched, with no tracked/unrelated local edits. No reset.
- Actual Git root: `C:\Users\ernes\Documents\last-ferry-codex-starter\Lastferry`.
- Exact supplied task initially resolved at `C:\Users\ernes\Documents\last-ferry-codex-starter\LAST_FERRY_WIDE_BERTH_PACKAGE\NEXT_TASK_WIDE_BERTH.md`; the full package is retained unchanged beside package.json. This does not substitute an older NEXT_TASK.
- Captures/checks belong to that baseline plus the recorded uncommitted implementation. Per-run `source-before.json`/`source-after.json`, `source-audit.json`, supplied-input hashes and the retained implementation diff identify that state. Commit/packaging identity is recorded separately in `packaging-audit.json`; captures are not relabeled as having been taken after a commit.
- Scope: active-level boat profiles/automatic seating, transfer and route geometry, capacity-derived Help/errors, free High Quay route inspection, the actual Wide Berth level, `a-wider-deck` and strict campaign continuation. Earlier four level JSONs, original ferry factory output, audio, water and accepted sailing policy remain protected.

## Implemented result

Wide Berth starts empty at Harbor. Two sheep and two rabbits occupy six spaces at its first pickup; the other pair wait at Shell Landing. Carrying six is useful and necessary before the first flood, while draft four prevents the tempting shorter routes. Players can deliver the first group by deep water or stage both sheep at High Quay and return the four rabbits by the depth-three shortcut. Five bodies occupying six spaces and six waiting neighbors are supported automatically, with no packing interaction or global action limit.

The larger yellow ferry has an actual wider hull/deck, aft red cabin, visible foredeck gate/gangway and stable ID seats. All 59 legal memberships, including empty, retain full-size animal geometry. Groups traverse a clear aisle in deterministic sequence within the accepted transfer duration; the last winning passenger disembarks before the existing visible-arrival cue. Wake release uses the new hull's real outline while old-profile behavior remains unchanged.

Nell releases the prepared boat, safe neighbors help, it glides and settles in the existing illustrated player. Exact caption: “Nell had a bigger boat ready. Now there are hands to launch it.” Only **Continue to Wide Berth** acknowledges it. Exact historical two-cove and three-cove completed records stay byte-identical on Home/Options/Practice until deliberate continuation; they show the actual previous cove, fresh new scene first and recap after a pending reload. Four actual rescues end the available slice honestly.

## Environment and commands

Windows; Node24.15.0/npm11.12.1; Chromium156.0.8078.4, SwiftShader, DPR1. Mouse, natural Tab/Shift+Tab/Enter/Escape and emulated touch; no physical Android claim. Native capture sizes390×844 and780×320, with fit checks320×740,844×390 and1440×900. Run from the Git root:

```powershell
npm ci
npm run dev -- --port 5270 --strictPort
npm run build
npm run preview -- --port 5276 --strictPort
npm run typecheck
npm run test:unit
npm run check:assets
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5270'
$env:LAST_FERRY_PRODUCTION_PORT='5276'
$env:LAST_FERRY_REVIEW_DIR='reviews/wide-berth/recheck'
npm run test:e2e -- wide-berth.spec.ts
npm run test:e2e -- wide-berth-production.spec.ts
```

The commands above reproduce focused coverage; the executed browser batches, original failures and affected reruns are itemized in [BROWSER_CHECKS.md](BROWSER_CHECKS.md). This is not a claim of a fresh whole historical suite.

## Executed checks

| Check | Result | Actual evidence |
| --- | --- | --- |
| Production build and TypeScript | pass | `gates/build-chooser.txt`, separate initial/integration typecheck logs; existing >500kB chunk advisory remains |
| Full unit suite | pass | 381/381 in41files, `gates/unit-handoff.txt` |
| Canonical asset validation | pass | 79 families, all78 former IDs retained; `asset-and-protected-audit.json` and final asset log |
| Actual-level mechanical contract | pass | Exact non-spatial proposal contract; witnesses13/14/17/16; flood-action boardings, subset/arrival loss, current-water validation, capacity, conservation, free rejection and full Session unwind |
| Bounded production search | pass | 7,620 normalized states,2,169 losses, shortest13, bound26/zero cutoffs; max6spaces/5bodies; every surviving first rise previously carried6. See `production-reachability.json`; this is not a player action limit or a difficulty measure |
| Actual ferry/transfer/route geometry | pass | Production model/profile/pier helpers; all legal memberships/selections, both berth headings, dry tides, draft4, stationary passengers, cabin/rails/shore and winning900ms arrival window. Actual occupied hull/pier meshes swept1,001samples per route direction/reachable heading; old clearance thresholds retained |
| Native moving and held phone inspection | pass for stated coverage | Launch beginning/release/glide/end at both phone sizes; actual full-deck, five-body, six-ashore, route decisions, tides and arrivals. Overview video frames show courses; close native stills show body placement. Marker partly masks one sheep face at rest |
| Both principal actual UI rescues | pass | Earned Driftwood→launch→deep13, plus separate portrait stage-both14; tide/terminal Undo, losing subset corrected and explicit endpoint |
| Five-body/six-neighbor UI and production rescue | pass | Actual17-action witness plus reachable six-neighbor staging; invalid8spaces rejected, legal6works, real failed-image fallback. Final production UI completes19-action safe variation with both legal/invalid chooser text and nested overflow at all5sizes |
| Historical-save and scene lifecycle | pass for documented scope | Raw bytes unchanged on Home/Options/Practice; fresh continuation, correct predecessor, pending recap, Pause/Replay/Skip/Reduced Motion, transcript/focus, shared mute/enable and controlled background settlement |
| Actual Restart/cove change/repeated handoff | pass | Separate final1/1check; exactly one scene acknowledgment, then actual board/Restart resets history/poses, actual cove-picker returns original4space Holding with clear wake and preserved campaign bytes. Delivered handoff taps494.5ms apart, not180ms |
| Repeated input | pass for busy lock; precise touch bound inconclusive | Trusted measured266.9ms second input sees busy and does not recommit. Requested35ms is not delivered35ms. Inherited universal≤180ms touch guarantee remains open |
| Fullscreen | pass in exercised browser | Actual app-root entry, emulated metrics/orientation and exit. Original native-window-resize protocol rejection retained; not physical Android rotation |
| Runtime audio/video artifact | pass technically | Two uninterrupted timestamped sequences with actual Sound master output, unchanged gain; all595/340video frames retained, full decode and Chromium playback/near-end seek pass. Human acoustic approval not run |

## Captured gameplay and presentation

See [MEDIA.json](MEDIA.json) for hashes, native dimensions, capture method, source snapshots, exact recording metadata and seed distinctions. All game frames come from actual UI; `launch-fixture/` is explicitly authoring-only. Images were inspected at native size. Selected highlights:

| State | Path | Scope |
| --- | --- | --- |
| Launch four beats, short landscape | `play-initial/780x320-launch-{begin,release,glide,end}.png` | Actual earned launch, complete caption and explicit handoff |
| Launch four beats, portrait | `close/390x844-launch-{begin,release,glide,end}.png` | Exact historical3 completion fixture, then actual continuation |
| Start | `play-initial/780x320-wide-start.png` | Actual new level, empty six-space boat |
| Four bodies/six spaces | `close/390x844-six-spaces.png` | Close Play view, draft4; current marker limitation visible |
| Five bodies/six spaces | `chooser/390x844-five-bodies.png` | Reachable actual variation, stable identities |
| All six ashore | `chooser/390x844-six-ashore.png` | Actual safe staging, full group on High Quay |
| Route comparison | `chooser/780x320-inspect-{harbor,outer-buoy,shell-landing}.png` | Free inspection, blocked short route, deep exit and remaining deadline |
| Legal six-option preview | `production-final/780x320-legal-six-chooser.png` | Actual final-production chooser before commitment; full names/capacity and nearby control |
| Narrow fallback | `chooser/390x844-six-chooser-fallback.png` | Real aborted portrait request, usable text/choice semantics |
| Both rises | `play-initial/780x320-deep-{first-rise,second-rise}.png` | Actual boundary boardings/state |
| Arrival and endpoint | `close/390x844-staging-arrival.png`, `play-initial/780x320-complete.png` | All six delivered; four-rescue campaign boundary |
| Uninterrupted actual sequence A | `play-initial/actual-launch-rescue.mp4` | 146.613s780×320, valid cove-start checkpoint labelled in manifest; earns Driftwood win, Undo/redelivery, launch, Wide deep rescue, boundary/terminal Undo and final acceptance |
| Uninterrupted actual sequence B | `close/actual-close-staging.mp4` | 85.314s390×844, historical3 fixture then fresh launch and full staging strategy with Undo; does not claim to earn Driftwood again |

Videos retain actual native compositor timing, not uniform-FPS motion or a native-device performance claim. CDP delivered36/44events out of timestamp order; rejected arrival-order exports are documented. Final encode sorts original native timestamps, retains all frames and aligns actual audio preroll. No internal cut, speed change, crop, gain boost, normalization or replacement music. Software capture yields roughly4delivered frames/sec and visible stalls. H264/AAC compression and millisecond timestamp rounding are disclosed; raw source files remain local/ignored.

## Original failures and corrections

- Initial unit run: two obsolete hardcoded four-space error strings failed synthetic capacities3/4. Copy now derives the actual active capacity; test expectations follow those capacities. New wide route initially clipped Shell/Quay. New spatial layout was corrected without changing mechanical values or old clearance thresholds.
- Using actual pier meshes exposed front lip/cap collisions missed by a rectangle proxy. Routes/berths now clear those meshes. Shore transfer paths initially crossed stationary sheep and the row extended beyond support; a front aisle, spaced row and actual extended pier resolve this. Logs retain the failed measurements.
- Wide wake contact initially had six directions inside the hull; new-only outline contact/margin fixes it. Winning sequential unloading initially outlasted the original arrival event; the sequence now finishes by that existing boundary without retiming audio or the action.
- Initial visual preflight mixed HMR and failed; it is not final evidence. Six-option capacity text was88.49%visible at780×320. Scoped large-group landscape spacing fixes it with unchanged16px labels/44px portraits/62px choices. Nested overflow/full-text assertions remain meaningful.
- Original fullscreen window-resize protocol refusal and broad `.requirement` locator failures are retained. Harness corrections use actual fullscreen app-root metrics and `#preview .requirement`; product behavior was not changed to satisfy them.
- Additional recovery fixtures first left the free forecast open after a second handoff tap, then queried the new cove's DEV bridge before document readiness. Both original outcomes remain; closing that forecast and waiting for actual URL/bridge readiness correct the fixture. The final actual recovery check passes without runtime changes.
- Initial media exports mishandled out-of-order delivered CDP frames and encoder time bases. Their audit/logs remain; final chronological frame counts, near-end browser seeking and decode pass.

## Remaining limits and next action

No confirmed blocking defect in the exercised Wide Berth rescue/save paths. User playtest should judge the strengthened puzzle and presentation. The partially obscured sheep face at rest remains visible in evidence. Inherited intermittent portrait loading, constrained Bellwater card overlap, heading step1.425683rad/99.9ms versus0.85, precise≤180ms rapid touch, software stalls and Windows runner teardown limits are not closed by unrelated passes. The final new portrait load/failure checks pass, without establishing the earlier intermittent cause.

Physical Android, other engines/platform fonts/screen readers, native GPU performance and hardware-speaker/human mix listening were not run. Controlled hide/show verifies settlement, not a new acoustic listening guarantee; shared audio implementation/gains are unchanged and prior unit/lifecycle evidence remains scoped. The score's earlier phone report is not declared solved anew. Narration, Orin, currents, six-space boats in old coves and additional coves are absent by scope.

Local journey: http://127.0.0.1:5270/ . Independent Practice: http://127.0.0.1:5270/?cove=wide-berth . PR remains draft; main unchanged; no force push. The last confirmed private Site remains **version12**, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. This milestone awaits review and is **not deployed**.
