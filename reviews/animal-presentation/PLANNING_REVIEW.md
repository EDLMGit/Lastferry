# Animal presentation — planning review · 17 November 2026

## Decision and scope

The user asks to improve the animal models/showcase and offboarding passenger cards after seeing the centered arrival. They explicitly have **not sent TERNHAVEN_JOURNEY_01 to Codex** and invite this work first.

[ANIMAL_PRESENTATION_01](../../NEXT_TASK_ANIMAL_PRESENTATION.md) is therefore the active assignment. The Ternhaven Journey brief stays queued. This commit contains planning, diagnostic evidence and the user's references; it implements no animal/UI change and makes no publication.

Reviewed runtime: `a2740e61ec5a782f558ea6caad4181466d04e9f7`. Repository guidance before this decision: `946fab5cc6288bfcfb8d78e796ea342449178328`. Current confirmed Site is version 21 with the same runtime and existing custom private audience.

## User references

- [Arrival: Holding Pier, Pip/Rue/Moss](baseline/user-arrival.png), 718×317.
- [Offboarding: Bring passengers home](baseline/user-offboarding.png), 448×405.
- [Exact reference hashes and dimensions](USER_REFERENCES.json).

These are user-provided images, preserved unchanged. Their dimensions are image dimensions, not an assertion about device viewport, browser zoom or capture method.

The arrival image shows small animals and names inside a large crew recess. The rabbit faces occupy very little of their tall silhouettes; the sheep dominates by width. The transfer image makes that contrast more pronounced beside names and ticks. These observations support improving both the art and the way each context frames it. No inaccessible control or gameplay defect is inferred solely from these screenshots.

## Source findings

The current [rabbit/sheep generator](../../cove-portrait-package/tools/render-portraits.mjs) frames head/upper-chest geometry while retaining ears. The [beaver/deer generator](../../tools/render-nell-portrait.mjs) fits the complete figure. Their manifests record different camera framing. Both produce model-derived offline SVG projections with simplified diffuse shading, subsequently rasterized; these are not screenshots of production WebGL shading.

The existing [image map](../../src/ui/cove-ui.ts) sends those same five images to passenger choices and the arrival. [Choice CSS](../../src/ui/cove-ui.css) uses 44px squares. [Arrival CSS](../../src/ui/arrival.css) uses 84px squares, with 80/72/64px landscape variants, and stretches a three-column crew region. The mismatched source crops therefore persist at every size. Enlarging identical boxes by itself would retain the difference.

The new assignment improves the actual animal factory and makes **two deliberate static profiles** from its five appearances: choice head/upper-chest portraits, and complete arrival figurines. This is a small derivative family, not per-neighbor artwork or another runtime renderer.

## Model boundaries

The production [animal factory](../../src/scene/models.ts) shares primitive/material helpers with the ferry and scenery. `ball()` currently uses a 12×8 sphere; `mat()` caches materials by color. Animal-specific changes prevent accidental global differences.

A read-only geometry diagnostic independently instantiated the existing factory using Node24.22.1 and Three186. [MODEL_BASELINE.json](MODEL_BASELINE.json) records exact source hashes, **precise local vertex bounds**, mesh/triangle/material counts and established world scales. This is geometry analysis, not a rendering, gameplay or performance test. Precise vertex bounds differ from transformed bounding-box estimates; compare like methods.

Current mesh counts are 12 per rabbit, 29 for sheep, 21 for beaver and 42 for deer. Refine contours/material treatment with a bounded resource budget; extra geometry is useful only where it improves native visibility.

Preserve feet, facing, world scale, deck/shore attachment and defining species cues. Two actual source dependencies deserve explicit coverage:

1. `World.presentStory()` identifies the legacy sheep head through direct child positions. A changed hierarchy needs either preserved semantics or a small tested head-attachment adaptation.
2. Wide-ferry support tests collect low meshes. A new merged body must not make that set empty and falsely pass foot checks. Require nonempty measured contacts.

Existing actual-mesh deck/transfer checks cover small and six-space ferries. They are relevant to this pass. Exhaustive puzzle enumeration is not needed when the rules, level data and witnesses are unchanged.

## Interaction and identity

The current transfer component uses one whole-tile native `aria-pressed` button; portrait descendants are decorative and ignore pointer events. Toggling changes only the preview; the separate named footer commits. Preserve these owners, fixed selected/unselected geometry, focus restoration, exact names/costs, free inspection and reachable confirmation on short screens.

The appearance resolver is based on the full level and passenger ID. Keep its five keys and cream/tan resolution. Arrival already walks required IDs intersected with delivered IDs, retaining earlier Sedge; preserve that logic while improving the composition.

The successful result's native dialog, safe bounds, lanterns, provisional acceptance, Settings/fullscreen and finite animation remain the accepted baseline. No Journey/save migration or scoring change is required.

## Completion evidence

The next implementation must show the revised actual models, both source-derived profiles and the native arrival/transfer consumers improving together. Matched source-tied comparisons and real Holding/Ternhaven rescues establish appearance and integration. Dense deck and six-neighbor cases supplement them; renderer fixtures remain labeled.

This planning review does not claim new build, unit/browser, physical-phone, listening or screen-reader results. Earlier arrival checks and deployment remain in [the independent arrival review](../arrival-bubble/INDEPENDENT_REVIEW.md). Human acceptance of revised animals follows their actual implementation evidence.
