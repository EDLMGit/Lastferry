# ANIMAL_PRESENTATION_01 — independent review and publication

Reviewed 17 November 2026. Runtime: **`26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139`** on `m1-first-crossing`; comparison/task parent: `d7884445c35fc24ebdabc2790b168b68294bf0bd`.

## Decision and publication

**No blocking regression was found within the reviewed scope. Publish this animal pass and resume the bounded Ternhaven Journey integration.** The user says the result looks good for now and asks to continue. That is positive visual direction for this iteration; it does not establish physical-phone performance, acoustic or spoken screen-reader approval.

The exact reviewed game is now published as **Site version 22** at [the existing playtest](https://last-ferry-playtest.abumech.chatgpt.site), hosting source **`9bde1051ecdcab851c829473b75a82f73ace3be6`**. The native deployment returned `succeeded`; a fresh Site read confirms version 22 and byte-equal access policy. Existing custom private access, including the one authorized external viewer, is unchanged. [Publication receipt](deployment-confirmation.json)

This live build still has **seven Journey coves, nine independent Practice entrances and nine mastery targets**. Ternhaven is Practice-only at **target 14 / revision 1**. The accompanying guidance activates [TERNHAVEN_JOURNEY_01](../../NEXT_TASK_TERNHAVEN_JOURNEY.md); it does not implement Journey eight. GitHub main and the draft status of PR #1 remain protected.

## What the visual review establishes

Seven exact committed images were fetched and verified against their Git blob hashes before inspection. [Image source audit](independent/FRAME_SOURCE_AUDIT.json)

| Evidence | Observation | Scope |
| --- | --- | --- |
| Holding Bring home, [before](before/390x844/holding-bring-home.png) and [after](after/390x844/holding-bring-home.png), 390×844 | Close faces now use the card area consistently. Cream/tan rabbits and Moss remain distinct; full names, exact costs, selected checks, depth/load consequence and named commitment remain readable. | Contributor actual-play captures, independently inspected. |
| Holding arrival, [before](before/780x320/holding-everyone-home.png) and [after](after/780x320/holding-everyone-home.png), 780×320 | Complete figures share a clear shelf and nearby names. The large empty recess is gone; the lanterns and forward/Replay actions retain priority. Undo, Details, Settings and dismissal remain visible. | Contributor actual-play captures, independently inspected. |
| [Ternhaven arrival](after/780x320/ternhaven-everyone-home.png), 780×320 | Juniper, Sedge, Fennel and Willow are all shown, including the neighbor delivered earlier. The recorded run correctly displays 14 actions, one Undo and two current lanterns. | Contributor actual-play capture, independently inspected; not a three-lantern claim. |
| [Six-neighbor layout](components/fixtures/320x740-six.png), 320×740 | All six figures/names and the action/utility rows fit in the shown narrow layout. | Explicitly labeled isolated renderer fixture, not a played rescue or final-source browser run. |
| [Matched animal studio](art/matched-models.png) | The revised muzzles, eyes, ears, wool and silhouette are more coherent across the family while retaining the established identities. | Same-camera/light model comparison, not gameplay or phone-performance evidence. |

These observations support continuing the current visual direction. They do not close every inherited map overlap or establish subjective final art acceptance for all future scenes.

## Fresh source, build and execution

The publication checkout contains **541 exact non-review GitHub blobs**. The only deliberate source adaptation is the previously established `vite.config.ts` `server.allowedHosts: ['terminal.local']` setting for managed preview. The production base and test include remain unchanged. Hosting project identity/static directory are retained; historical media stay in GitHub. The source audit was repeated after packaging. [Exact source audit](independent/PUBLICATION_SOURCE_AUDIT.json)

Using existing dependencies with Node **24.22.1** and npm **11.9.0**, the Sites build helper ran the production build including TypeScript successfully. The ordinary Vite chunk-size advisory remains. Both production files reproduce the contributor's final minified build byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `index-BRpoi51i.js` | `62f20bc23b6812b15e8d91bdcdc51d1e6275729c4d90130e500ba904141d49e2` |
| `index-BzKh4zYF.css` | `afe58761c07a73d5476dc0cb1edf153ca6287725894c9b1384fb9bc26457f066` |

[Build log](independent/build.log) · [Built-file hashes](independent/BUILD_AUDIT.json)

**295/295 focused checks pass across 17 files:** the contributor's bounded 186 interaction/identity selection plus all 109 geometry checks. This covers the modified arrival/identity presentation, mastery/acceptance, transfers, existing progress compatibility, actual deck/shore clearances, seating, wide ferry and Moss's story movement. No gameplay code or test assertion was edited by this review. [Summary and suite counts](independent/VERIFICATION_SUMMARY.json) · [Fresh raw results](independent/fresh-units.json)

The fresh command was `node node_modules/vitest/vitest.mjs run` with the 17 named files in the summary and JSON output. There were no failing checks in this fresh run. The contributor's earlier geometry failures and driver corrections remain in the original [implementation review](REVIEW.md); they have not been removed or relabeled.

## Models, passenger identity and ownership

Source comparison independently verifies all **71 protected-file declarations**, including main, world, Session/rules/mastery, appearance resolution, transfer/placement/fullscreen, Journey progress/registry, puzzle data, audio and ferry profile. Shared primitive/material helpers, both ferry factories and the scenery suffix in `models.ts` are unchanged. The new factory is animal-local. [Source checks](independent/SOURCE_AUDIT.json) · [Evidence cross-check](independent/EVIDENCE_CROSSCHECK.json)

A separate exact-source model execution reproduces all five reported mesh/triangle counts and verifies finite positions/normals/colors, independent clone transforms and material isolation. The original support selector still finds **2/2/4/2/4** real contact meshes for cream rabbit, tan rabbit, sheep, beaver and deer; minimum local Y is zero. Moss retains a direct compatible head group. The changed story test adds eight moving facial-part and four stationary-foot assertions without deleting old assertions; seven existing geometry/support suites retain their exact Git blobs. [Model audit](independent/MODEL_AUDIT.json) · [Exact model inputs](independent/EXACT_SOURCE.json) · [Protected geometry suites](independent/PROTECTED_GEOMETRY_BLOBS.json)

The separate `portraitSources` and `arrivalFigureSources` maps cover all five stable appearances. Choices retain native whole-button selection, live full names/space costs, fixed selected geometry, named confirmation and loading/failure slots. Arrival retains its required-ID delivered roster, so earlier deliveries remain present. Its TypeScript change is the image-map lookup; result/save acceptance stays with the unchanged owners.

All ten actual 256px RGBA PNGs match catalog dimensions, bytes and SHA-256, totaling **446,629 bytes**. All six normalized bake-input hashes match exact source. Forty recorded served-image declarations agree with those outputs. [Actual image-byte audit](independent/PROFILE_BYTES_AUDIT.json)

The 82 family IDs remain unique, and all **176 catalog reference paths** exist in the exact committed tree. The independent review did not download every historical evidence file to rerun full filesystem validation; the full 82-family validation and six catalog-unit outcomes remain contributor evidence. The tree/reference audit and actual profile-byte checks are explicitly narrower. [Catalog reference audit](independent/CATALOG_TREE_AUDIT.json)

## Historical component provenance qualification

The full `components/source/5403abbde291ef6b9df0fde83b589515462ee590533b7786d58f7231875bc0c7.json` manifest contains 147 inputs. The independent checkout audit finds **139 exact matches**, **five CRLF-only matches**, the known preview-configuration adaptation (canonical Git config matches), and **two unresolved digest differences**:

- `src/dev/asset-gallery.ts`
- `src/scene/ferry-profile.ts`

Simple complete LF/CRLF conversion does not explain those two. Their recorded and actual hashes are preserved in the [full component provenance audit](independent/COMPONENT_PROVENANCE_AUDIT.json). Do not describe that entire historical development-component manifest as exact final-source evidence. The narrow six-neighbor image remains useful layout evidence with this qualification.

The shipping ferry profile is unchanged from the guidance parent, the bake provenance matches, protected inputs are exact, the relevant geometry checks pass freshly, and the fresh production bundle matches the actual-play build. No shipping defect follows from the historical digest discrepancy. Publication relies on those independently verified shipping sources/build, with the discrepancy retained for traceability.

## Resource cost and remaining limits

The independently executed per-model mesh/triangle accounting reproduces the reported values. The contributor's matched crowded Wide Berth rendered frame rises from **674 to 727 draws (+7.9%)** and **126,796 to 147,332 triangles (+16.2%)**, including shadow passes. One shared material is not one draw call. These whole-frame measurements remain contributor renderer accounting; this review did not freshly capture the frame or measure Android FPS.

The five animal templates and geometry remain cached; profiles are file-backed images, with no extra per-card WebGL context or perpetual portrait animation. The following Journey task preserves that approach and does not expand the model/profile rendering budget. If the physical phone later exhibits a reproducible slowdown, optimize that measured case while preserving the accepted appearance; this review does not predict either success or failure on-device.

Actual Holding/Ternhaven minified rescues, failed-image/fullscreen/rotation/storage/Undo cases and the uninterrupted runtime-audio recording remain attributed to the [contributor's report](REVIEW.md) and [actual-play record](ACTUAL_PLAY.md). This independent review does not claim a fresh browser rescue, acoustic listening, spoken screen-reader run or physical Android test. Opening the live URL in the review browser reached the expected private sign-in gate; no account/access change or login was attempted. Native deployment success and the unchanged audience are verified through Sites.

## Next contained implementation

Reactivate the existing **TERNHAVEN_JOURNEY_01** brief from this exact animal baseline. Its accepted puzzle, seven-second illustrated encounter, explicit handoff, completed-seven original-byte backup, earlier migration protection and Practice mastery isolation remain valid. Preserve the finished animals, both profile maps and resource approach. The required real Orchard → scene → Ternhaven → acceptance route also verifies all four final figures, including Sedge. C9–C12 remain future work.

The accompanying commit contains review/publication evidence and guidance only. Local Codex implements the next task, commits/pushes normally and returns evidence with PR #1 still draft and main unchanged. Publication remains a separate reviewed step.
