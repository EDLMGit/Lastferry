# Review and decision — Driftwood to Wide Berth

Review date: **31 October 2026**.

## Verified identity and scope

GitHub PR #1 was read directly through the repository connector. Its head was **7e324e88827857469bf348fca311548344d03da6**, branch `m1-first-crossing`, open and draft. Its base main was **386de54d20fdd4a513a06115471d70bf94738cc0**. The current task package does not change either branch or deploy a Site.

The review read source and canonical campaign documents at that exact SHA, the committed Driftwood report/media index, and three native handoff frames. The 33 text-source downloads were checked against their Git blob identities; all matched after correcting one transport-added terminal newline in the media index. `source-audit.json` records paths, hashes and origins.

Native images actually inspected:

- `reviews/driftwood-yard/handoff/780x320-overview.png`
- `reviews/driftwood-yard/handoff/390x844-full-deck.png`
- `reviews/driftwood-yard/handoff/780x320-driftwood-scene-middle.png`

The images show the compact controls, map overview, loaded old ferry and Nell's illustrated entry. A boat-selection marker partly covers the deck in the portrait frame, consistent with the report. This review did not run a fresh application browser session, listen to the complete recording or test a physical phone.

Sources:

- [PR #1](https://github.com/EDLMGit/Lastferry/pull/1)
- [Driftwood report at reviewed SHA](https://github.com/EDLMGit/Lastferry/blob/7e324e88827857469bf348fca311548344d03da6/reviews/driftwood-yard/REVIEW.md)
- [Puzzle progression at reviewed SHA](https://github.com/EDLMGit/Lastferry/blob/7e324e88827857469bf348fca311548344d03da6/campaign/PUZZLE_PROGRESSION.md)
- [Story scenes at reviewed SHA](https://github.com/EDLMGit/Lastferry/blob/7e324e88827857469bf348fca311548344d03da6/campaign/STORY_SCENES.md)

## Completed pass assessment

The implementation matches the intended Driftwood milestone: a real staging puzzle, Nell's beaver identity, stable Fern/Oat appearances, compact dock actions, illustrated entry and continuation from the previously complete campaign. The source supports the user's observed new challenge.

The supplied report records build/typecheck, 338 unit tests, 78 asset families, final browser 5/5 plus strengthened fallback and production checks, both rescue witnesses and losing alternatives. Those application results are contributor evidence, not rerun by this review. The 93.52-second capture is reported as a real boundary-to-rescue sequence; its start is a valid seeded Bellwater checkpoint, not a claim to have played the entire campaign in that file. Capture delivery rate is not gameplay FPS.

The user's acceptance is specifically positive gameplay feedback. It does not certify portrait-load intermittency, inherited Bellwater overlap, delivered-heading/rapid-touch timing, native-GPU performance or acoustic listening. Carry those limits forward. No new reproduced blocker in this source/evidence review requires another general Driftwood polish pass before the next playable milestone.

## Direction decision

Proceed to the already planned larger ferry. Revise the former wholly forgiving Wide Berth introduction to a clear capacity benefit followed by consequential planning. One substantial new cove is enough for this pass: the actual model, seating, transfers, draft-four contact, authored geometry, launch and historical-save support already form a meaningful milestone.

Do not claim that extra passengers or a 13-action witness make it harder than Driftwood. Driftwood requires discovering staging; Wide Berth allows a straightforward full-load route and makes staging a useful alternative. The intended advance is a new draft constraint and a choice between tight late rescue and earlier rescue with safe staging. Relative difficulty and satisfaction remain for the user's playtest. If it feels like automatic errands, treat that as a design calibration issue, not a reason to shorten a deadline blindly.

Keep Orchard Landing/Orin, Two Landings and later fixed/changing currents next. Future difficulty comes from interacting choices, with quiet interludes retained; it need not rise at every scene.

## New independent mechanical work

A fresh non-spatial Wide Berth proposal was tested against the unchanged production reducer and Session downloaded at the reviewed SHA. After source identity verification, the primary review independently reran the supplied harness with Node 24.22.1; exit status 0.

- Two distinct critical plans passed: full six-space delivery by the deep route, or staging both sheep and using the light shortcut.
- Two legal variations passed: five bodies/six spaces and recoverable entry pauses.
- Five losing alternatives, five blocked cases, both precise flood boundaries, conservation, preview/rejection immutability, busy-input rejection, full-state Undo and recovery passed.
- Reachability enumerated 7,620 normalized states, with 2,169 terminal losses and no cutoffs at bound 26. Every surviving first-rise path had already carried six spaces. One normalized win represents many action sequences, not one solution.

State keys sort passenger membership and clamp turn after the final rise while preserving actual reducer turns and a carried-six history flag. The proof contains no world coordinates. It establishes feasibility and the intended branches, not geometry, animation, UI, performance or fun.

An early exploratory assertion expected the ferry to remain full at the first rise. Valid staging disproved that wording. The final property correctly asks whether six spaces had been carried earlier; no game rule or deadline was changed to rescue the assertion. The final harness and results expose the corrected property.

## Concrete engineering risks included in the task

Current model construction, three effective passenger positions, fixed transfer offsets and wake/berth extents assume the smaller hull. All legal new subsets must fit; five bodies can actually travel together and six neighbors can wait at the safe quay. Capacity text alone is insufficient.

The current campaign accepts the exact historical two-cove completion, but appending C4 also needs deliberate support for the current three-cove complete shape. Current scene-predecessor and complete-world shortcuts must be generalized so older saves do not show a future cove as already rescued.

The task includes those requirements and source-derived limits without expanding into a fleet framework, new species, currents or a second cove.

## Publication

`deployment-confirmation.json` is copied byte-for-byte from the preceding package. It records the last confirmed private publication: version 12, game `1a85874883af5caa59f6294a75495eccf2afebbc`, hosting source `e87c5c5baa53a39001c5a89b07b59aab2ad150fc`. It is historical evidence, not a fresh check of the live Site. Driftwood and this future milestone are not declared deployed.
