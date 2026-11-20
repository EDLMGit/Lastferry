# Last Ferry — asset inventory

Audited against game `8052cfcd67f2e56cf3258243618c4ce125d51c4b`, accepted by the user after Sites version 10 publication. The catalog seed contains **40 current runtime families, 25 new UI candidates and 6 reference-only files**. New candidates are editable inputs awaiting integration and playtest.

## How the inventory stays useful

`assets/catalog.json` becomes the canonical registry after integration. This readable document explains the supplied seed; the implementation gallery should read the canonical registry and real sources. Keep `docs/ASSET_LEDGER.md` for provenance and historical changes. Do not create a second independently maintained asset list.

Use one stable ID per reusable family. A named passenger or one rock placement is an instance, not another asset. Record actual procedural factories, generated fields and audio scores as sources. Reuse before creating another near-duplicate.

When adding an asset: copy `ASSET_ENTRY.template.json`, choose its type requirements, fill real sources and provenance, add a gallery/evidence reference, and include the catalog update in the same change. Mark new sources candidate, then integrated after game verification; human acceptance remains separate. Keep retired entries with their replacement ID.

## Type-specific detail

| Type | Record in addition to the common fields |
| --- | --- |
| procedural-model | factory/source symbol; semantic unit/axis/pivot convention or authoritative source; named attachment points when relevant; material references; actual variant parameters; consumers and scale/placement owner; pick/framing role; disposal owner |
| procedural-geometry | authoritative geometry inputs; style/elevation parameters; mechanical versus decorative boundary; material/texture dependencies; generation and disposal owner |
| material-palette | exact tokens/semantic roles; color space and material type if applicable; roughness/alpha/blending behavior; shared versus scoped ownership; allowed component roles; measured UI contrast when used for text |
| shader-material | entry point/uniform inputs; color/data texture semantics; transparency/depth/render order; bounded allocation/pass needs; animation and reduced-motion behavior; reset/disposal |
| generated-data-texture | generator/seed/data source; dimensions/channels/data meaning; color space/filtering; generation frequency; consumers and disposal |
| effect | trigger/state owner; lifetime/capacity; world versus attached coordinates; blend/depth behavior; picking/framing exclusion; Reduced/Undo/reset/hide lifecycle |
| motion-recipe | trigger; duration source; canonical start/end transform ownership; variant/species parameters; Reduced/cancellation/recovery; associated audio events |
| procedural-audio | score/generator and seed; voices/buffers/envelope owner; event/timeline trigger; routing and relative mix owner; looping or finite duration; mute/hide/Undo/disposal behavior; listening evidence separate from generated-output evidence |
| generated-audio-buffer | generator/seed; channels/sample-rate rule/duration; buffer ownership/reuse; consumers and disposal |
| lighting-recipe | light types/source parameters; per-cove overrides; shadow and material response; dynamic event owner; scene exposure/palette dependencies |
| gameplay-indicator | canonical semantic fact; shape/text/color encoding; variants; free inspection versus action commitment; source geometry and update owner; accessibility and picking |
| css-component-family | component/selector sources; token and elevation roles; interaction states; size/hit target/layout behavior; text/icon contract; focus and disabled/warning semantics; mobile and reduced-motion evidence |
| dom-component-family | render/placement sources; semantic role/accessible name; icon and label mappings; interaction states; nearby placement and viewport contract; focus/cancel/fullscreen preservation |
| svg-icon | 24x24 viewBox and optical size; meaning and visible/accessible label rule; one-color fallback; state variants and permitted rotation; native owner hit area; source/sprite generation ownership |
| system-font-family | CSS stack and roles; weights/sizes; fallback behavior; whether any font file is redistributed |
| reference | origin/provenance; intended reference role; explicit non-runtime status; never authoritative gameplay data |
| inline-svg-and-glyph | existing source/renderer; glyph and transfer semantics; world-relative rotation ownership; replacement IDs when retired; native button name and event owner |
| reference-image | exact path and provenance; reference-only status; purpose and prohibited runtime/evidence substitution |

## Current world, sound and interface families

### model.ferry — Yellow ferry with red cabin

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/models.ts` — `ferry`; `src/scene/world.ts` — `World.boatRoot / hull / passengerAnchors`.

**Visual contract:** Curved yellow hull, warm red cabin, planked open deck, cream trim, dark fenders.

**Reuse and ownership:** One reusable geometry family per cove. Named deck-anchor-{passengerId} children belong to the animated hull. Shared matte materials; scoped water-contact hull material.

**Behavior/lifecycle:** Keep shaped bow, deck positions, passenger attachment, heading history and current pick/framing envelope.

**Variants:** empty and loaded draft; both safe berth headings.

**Provenance:** `original-project-code`; see catalog profile.

### model.rabbit — Rabbit passenger family

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/models.ts` — `animal(species, variant)`; `src/scene/world.ts` — `World.speciesIndex / passengerAnchors`.

**Visual contract:** Separated tall ears, compact body, tiny dark face and pink inner ears.

**Reuse and ownership:** Shared factory; names and gameplay identities come from level passengers. World scales rabbits 1.25 / 1.65 / 1.25.

**Behavior/lifecycle:** Coat and pose variation imply no abilities. Keep feet/contact, aboard attachment and canonical settled pose.

**Variants:** cream coat; tan coat; changed ear splay.

**Provenance:** `original-project-code`; see catalog profile.

### model.sheep — Sheep passenger family

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/models.ts` — `animal(species, variant)`.

**Visual contract:** Clustered cream wool, dark face/ears, four modest legs.

**Reuse and ownership:** Same factory per sheep identity. World scale 1.15 / 1.5 / 1.15.

**Behavior/lifecycle:** Keep larger passenger silhouette and true capacity semantics; presentation never determines passenger weight.

**Variants:** one cream wool family; instantiated with each level identity.

**Provenance:** `original-project-code`; see catalog profile.

### model.lighthouse — Harbor lighthouse and lamp

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/models.ts` — `lighthouse`; `src/scene/world.ts` — `World.home; landmark construction`.

**Visual contract:** Tapered cream tower, red roof, warm lens/core, thin gallery rail.

**Reuse and ownership:** One authored family, placed by sceneLayout. Returned group/lens/lamp/anchor/core/tower/gallery/roof are shared by effects and water reflection.

**Behavior/lifecycle:** Roof and rails occlude light; retain local illumination, home role from objective.deliveryPierId, and conservative framing.

**Variants:** ordinary steady illumination; won light response.

**Provenance:** `original-project-code`; see catalog profile.

### model.cottage — Warm coastal cottage

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/scenery.ts` — `cottage`.

**Visual contract:** Ochre wall, dark warm roof, pale window trim and amber windows.

**Reuse and ownership:** Reusable factory; placement in sceneLayout, not encoded in model.

**Behavior/lifecycle:** Keep silhouettes away from passenger/control anchors.

**Variants:** First Crossing sheep island; Holding Pier rabbit island.

**Provenance:** `original-project-code`; see catalog profile.

### model.bell — Bell Pier timber bell

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/scenery.ts` — `bellLandmark`.

**Visual contract:** Bronze lathed bell under thick timber frame and small roof.

**Reuse and ownership:** Reusable original factory, currently Bellwater landmark.

**Behavior/lifecycle:** Decorative landmark selection resolves to its authored pier; no separate bell action.

**Variants:** Bellwater bell island.

**Provenance:** `original-project-code`; see catalog profile.

### model.pier-kit — Boarded piers, piles, gangplank and lantern

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/world.ts` — `World.constructor: for (const p of this.level.piers)`; `src/scene/layout.ts` — `SceneLayout.stonePiers`.

**Visual contract:** Substantial rounded boards, four piles with pale caps, small warm mooring lantern.

**Reuse and ownership:** Generated from pier width, landAnchorXZ, elevation and positionXZ; no independent mesh file.

**Behavior/lifecycle:** Keep geometry-derived berth/gangplank positions, flood water height and land contact; both ferry headings support transfer.

**Variants:** wood boards; grey stone boards; water-contact vulnerable/home piles.

**Provenance:** `original-project-code`; see catalog profile.

### model.waypoint-buoy — Small open-water marker buoy

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/world.ts` — `World.constructor: non-pier marker buoy`.

**Visual contract:** Small amber tapered float with ivory stem.

**Reuse and ownership:** Instances generated from level nodes.

**Behavior/lifecycle:** Buoy decor must not create extra destinations or routes.

**Variants:** eligible non-pier nodes, excluding cut.

**Provenance:** `original-project-code`; see catalog profile.

### scenery.pine — Coastal pine family

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/models.ts` — `pine`; `src/scene/world.ts` — `World.island`.

**Visual contract:** Brown trunk and four staggered muted green conical crowns.

**Reuse and ownership:** Reusable factory and palette; placed by island style.

**Behavior/lifecycle:** Keep route, animal and control visibility.

**Variants:** several authored scales.

**Provenance:** `original-project-code`; see catalog profile.

### scenery.rocks — Shore rocks and crag

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/shore.ts` — `shoreRockPlacements / createShoreRocks`; `src/scene/world.ts` — `World.island: crag branch`.

**Visual contract:** Rounded/faceted grey-green coastal stones in grouped sizes.

**Reuse and ownership:** Instanced shoreline rock geometry per island; crag dressing is separate.

**Behavior/lifecycle:** Fit validated island footprints; tide contacts track real height.

**Variants:** garden; crag; reeds; rocky.

**Provenance:** `original-project-code`; see catalog profile.

### scenery.reeds — Reed beds and low-shore accents

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/shore.ts` — `createReedBeds`; `src/scene/world.ts` — `World.island: reeds branch`.

**Visual contract:** Sparse muted stems, brown seed heads and broad sand accents.

**Reuse and ownership:** Instanced stems and heads per authored reeds island.

**Behavior/lifecycle:** Preserve uncluttered low-pier silhouette and flooding visibility.

**Variants:** reed stems; seed heads; low sand accents.

**Provenance:** `original-project-code`; see catalog profile.

### scenery.garden-kit — Shrubs, flowers, stepping stones and crates

**Type / state:** procedural-model / existing-runtime.

**Source:** `src/scene/world.ts` — `World.island`.

**Visual contract:** Quiet green shrubs, cream flowers, sand path stones and warm small crates.

**Reuse and ownership:** Inline original geometry currently grouped by island style.

**Behavior/lifecycle:** No independent interactions; do not add all variants to every island.

**Variants:** garden; reduced sparse dressing for reeds/rocky; crag placement.

**Provenance:** `original-project-code`; see catalog profile.

### terrain.coast — Rounded island coast

**Type / state:** procedural-geometry / existing-runtime.

**Source:** `src/scene/shore.ts` — `buildCoastGeometry / Shores`; `src/scene/layout.ts` — `IslandStyle / sceneLayout`; `data/first-crossing.level.json` — `world.islands`; `data/holding-pier.level.json` — `world.islands`; `data/bellwater.level.json` — `world.islands`.

**Visual contract:** Rounded terraces with broad sand/stone/grass vertex color fields.

**Reuse and ownership:** Per-level authored footprints, generated coast lofts, shared vertex-color material per Shores.

**Behavior/lifecycle:** Terrain visual fields never replace canonical channel depth or flood rules.

**Variants:** garden; crag; reeds; rocky; authored elevations and tide states.

**Provenance:** `original-project-code`; see catalog profile.

### material.miniature-palette — Shared matte miniature palette

**Type / state:** material-palette / existing-runtime.

**Source:** `src/scene/models.ts` — `palette / mat`.

**Visual contract:** Soft matte painted color with roughness 0.88.

**Reuse and ownership:** mat caches MeshStandardMaterial by color; dedicated wetness/lighthouse effects clone scoped materials.

**Behavior/lifecycle:** UI may borrow colors/material cues; this pass need not recolor the accepted 3D scene.

**Variants:** wool #fff1d7; hull #e5ad37; red #b94e3f; wood #ac784b; dark #263d43; sand #e5d4a8; grass #91a578; stone #84938a.

**Provenance:** `original-project-code`; see catalog profile.

### lighting.cove — Shared warm cove lighting

**Type / state:** lighting-recipe / existing-runtime.

**Source:** `src/scene/world.ts` — `World.constructor: HemisphereLight / DirectionalLight / shadow plane`; `src/scene/layout.ts` — `SceneLayout.light / sceneLayout`.

**Visual contract:** Warm late-day miniature light, gentle local contact shadow and blue-green background.

**Reuse and ownership:** One hemisphere light, directional shadow source and shadow receiver per World; no imported HDRI.

**Behavior/lifecycle:** Keep accepted scene exposure, material response and water lighting. UI restyling does not change global lighting.

**Variants:** default First Crossing/Holding; Bellwater background, sky, ground and sun colors.

**Provenance:** `original-project-code`; see catalog profile.

### material.wet-contact — Water-height contact and wetness

**Type / state:** shader-material / existing-runtime.

**Source:** `src/scene/contact.ts` — `contactMaterial`; `src/scene/shore.ts` — `Shores.constructor wetness material`; `src/scene/world.ts` — `World.contactMeshes`.

**Visual contract:** Subtle darkening/contact at real animated water level.

**Reuse and ownership:** Scoped material patches reference shared water-height uniform.

**Behavior/lifecycle:** Undo, tide and draft remain aligned; do not introduce fake wave geometry.

**Variants:** hull; pile; coastal terrain.

**Provenance:** `original-project-code`; see catalog profile.

### texture.coastal-mask — Coast and land data field

**Type / state:** generated-data-texture / existing-runtime.

**Source:** `src/scene/water.ts` — `coastalMask`.

**Visual contract:** Non-display RGBA data for banks, coast, height and land mask.

**Reuse and ownership:** 256x256 RGBA unsigned-byte texture; linear filtering, NoColorSpace. Shared with water/wake masking.

**Behavior/lifecycle:** Generated once from actual level geometry, disposed with CoastalWater.

**Variants:** one field per level.

**Provenance:** `original-project-code`; see catalog profile.

### texture.seabed — Submerged albedo and height field

**Type / state:** generated-data-texture / existing-runtime.

**Source:** `src/scene/seabed.ts` — `createSeabedField / seabedHeightRange`.

**Visual contract:** Broad connected sand/stone detail beneath water.

**Reuse and ownership:** 256x256 RGBA generated field; paired with coast field, 524288 bytes combined.

**Behavior/lifecycle:** Decorative substrate independent of mechanical passage depths; retain disposal.

**Variants:** sand; connected stone forms; subdued ground.

**Provenance:** `original-project-code`; see catalog profile.

### shader.water — Luminous coastal water

**Type / state:** shader-material / existing-runtime.

**Source:** `src/scene/water.ts` — `CoastalWater / waterPresets`; `src/scene/water-shader.ts` — `waterVertexShader / waterFragmentShader`.

**Visual contract:** Deep #123e55, coastal #3e7e88, pearl #bbd8e2, amber #ffbf62 in luminous preset.

**Reuse and ownership:** One plane/render treatment, analytic normals, coast/substrate textures and local lamp reflection; no reflection render target.

**Behavior/lifecycle:** Freeze decorative motion under Reduced; view and water height update with accepted camera/tide. Do not treat restrained as an extra shipped level style.

**Variants:** luminous is runtime default; restrained is existing tuning preset.

**Provenance:** `original-project-code`; see catalog profile.

### effect.wake — Independently released ferry crests

**Type / state:** effect / existing-runtime.

**Source:** `src/scene/wake.ts` — `FerryWake / wakeLimits`; `src/scene/effects.ts` — `CrossingEffects.movement`.

**Visual contract:** Open pearl #d3e7df crests over muted teal #3b8889.

**Reuse and ownership:** One dynamic mesh; fixed 12-event pool, 1800ms lifetime, independent saved world pose and age.

**Behavior/lifecycle:** Pure yaw/bob/draft emit no wake; subsequent boat movement does not drag previous crests; reset/Undo/hide clear.

**Variants:** active displacement emission; finite docking fade; cleared recovery/reduced state.

**Provenance:** `original-project-code`; see catalog profile.

### effect.shore-contact — Sparse shore waterline accents

**Type / state:** effect / existing-runtime.

**Source:** `src/scene/shore.ts` — `Shores.contacts / update`.

**Visual contract:** Sparse broken pale grey-green contact, not complete route-like rings.

**Reuse and ownership:** Preallocated line buffer updates at changed water height.

**Behavior/lifecycle:** No floating accent around fully flooded ground.

**Variants:** tide/animated water heights.

**Provenance:** `original-project-code`; see catalog profile.

### effect.forecast — Tide forecast contours

**Type / state:** gameplay-indicator / existing-runtime.

**Source:** `src/scene/shore.ts` — `Shores.forecast / preview`; `src/scene/world.ts` — `World.setForecast`.

**Visual contract:** Thin warm amber real shoreline contours.

**Reuse and ownership:** Cached groups generated from level islands and actual tide heights.

**Behavior/lifecycle:** Inspection only; show canonical forecast and hide on exit/reset.

**Variants:** tide 0; tide 1; tide 2.

**Provenance:** `original-project-code`; see catalog profile.

### effect.harbor-glow — Lantern glow and local arrival warmth

**Type / state:** effect / existing-runtime.

**Source:** `src/scene/effects.ts` — `CrossingEffects.constructor / applyLight / reset`; `src/scene/water.ts` — `CoastalWater.setHarbor`.

**Visual contract:** Small warm source sprite, local lens/light warmth and broken water reflection.

**Reuse and ownership:** Locally generated 32x32 radial RGBA texture; sprite excluded from framing.

**Behavior/lifecycle:** Arrival ownership stays tied to visible delivery; Undo/reset restore ordinary state.

**Variants:** ordinary glow; brief delivery strengthening; settled won glow.

**Provenance:** `original-project-code`; see catalog profile.

### effect.harbor-sweep — Soft lighthouse victory shaft

**Type / state:** effect / existing-runtime.

**Source:** `src/scene/effects.ts` — `CrossingEffects.sweep / update`.

**Visual contract:** Soft view-faded amber shaft #ffdda3, with no hard far rim.

**Reuse and ownership:** One open cone proxy with additive shader, depth test on and depth writes off; excluded from picking/framing.

**Behavior/lifecycle:** 20-second authored turn while won; no extra bloom/pass or gameplay input delay.

**Variants:** slow won sweep; static Reduced.

**Provenance:** `original-project-code`; see catalog profile.

### indicator.routes — Canonical rounded navigation courses

**Type / state:** gameplay-indicator / existing-runtime.

**Source:** `src/scene/paths.ts` — `getLevelPaths`; `src/scene/world.ts` — `World.routes / indicate`.

**Visual contract:** Quiet curved dashed seafoam routes; same course used by ferry.

**Reuse and ownership:** One cached canonical course per level edge.

**Behavior/lifecycle:** No decorative shortcuts or new junctions; selection and move use same geometry.

**Variants:** ordinary shallow/deep; highlighted; blocked.

**Provenance:** `original-project-code`; see catalog profile.

### indicator.world-stops — Scene stop rings and relation marks

**Type / state:** gameplay-indicator / existing-runtime.

**Source:** `src/scene/world.ts` — `World.markers / indicate`.

**Visual contract:** Warm ring, cream current ring, caution cross, remote diamond.

**Reuse and ownership:** Groups correspond to real level node IDs.

**Behavior/lifecycle:** Status shapes remain derived from current load/depth/relation; no color-only distinction.

**Variants:** stop-ring; selection-ring; current-ring; blocked-cross; nonadjacent-diamond.

**Provenance:** `original-project-code`; see catalog profile.

### motion.transfer — Passenger boarding and unloading presentation

**Type / state:** motion-recipe / existing-runtime.

**Source:** `src/scene/deck-transfer.ts` — `sampleDeckTransfer / transferHeading`; `src/scene/transfer.ts` — `TransferTimeline`; `src/scene/world.ts` — `World.transferHistory / tick`.

**Visual contract:** Grounded gangplank travel and proper deck attachment.

**Reuse and ownership:** Shared paths/timeline for real changed passenger subset; crossing/settling contacts drive sound.

**Behavior/lifecycle:** One canonical action, cancellable transient presentation, both berth headings; new icon does not immediately transfer.

**Variants:** board; unload; compact Reduced.

**Provenance:** `original-project-code`; see catalog profile.

### motion.homecoming — Finite animal acknowledgment and arrival framing

**Type / state:** motion-recipe / existing-runtime.

**Source:** `src/scene/homecoming.ts` — `acknowledgmentPose / HomecomingTimeline`; `src/scene/world.ts` — `World.beginHomecoming / fitHomecomingCamera / updateHomecoming`.

**Visual contract:** One small staggered response settling within 1300ms and conditional gentle camera approach.

**Reuse and ownership:** State-owned finite timeline, shared accepted models.

**Behavior/lifecycle:** No replay when closing/opening menu or enabling normal motion; restore canonical poses on Undo.

**Variants:** rabbit hop; grounded sheep bob; Reduced static; short-phone fixed camera.

**Provenance:** `original-project-code`; see catalog profile.

### audio.score — Between the lamps

**Type / state:** procedural-audio / existing-runtime.

**Source:** `src/audio/score.ts` — `score / phraseEvents`; `src/audio/atmosphere.ts` — `Sound.graph / tone / pump`.

**Visual contract:** Original calm continuous 75-second phrase, 64 BPM, 80 beats.

**Reuse and ownership:** Synthesized oscillators/periodic waves under one context and scheduler, not an encoded track file.

**Behavior/lifecycle:** Preserve composition, accepted gains, completed-gesture startup and explicit Enable/Retry/Mute.

**Variants:** ten harmony cells; 21 motif notes/rests.

**Provenance:** `original-project-code`; see catalog profile.

### audio.accompaniment — State-aware restrained accompaniment

**Type / state:** procedural-audio / existing-runtime.

**Source:** `src/audio/arrangement.ts` — `arrangementForState / companionCells / companionNote`; `src/audio/atmosphere.ts` — `Sound.pumpCompanion`.

**Visual contract:** Sparse compatible notes supporting the accepted harmonic score.

**Reuse and ownership:** Uses existing graph and music reverb.

**Behavior/lifecycle:** Derived from canonical game state; no timer spending puzzle turns.

**Variants:** ordinary; deadline; homeward; won; lost.

**Provenance:** `original-project-code`; see catalog profile.

### audio.ambience-travel — Air/water bed and soft travel texture

**Type / state:** procedural-audio / existing-runtime.

**Source:** `src/audio/score.ts` — `makeNoise`; `src/audio/atmosphere.ts` — `Sound.noiseVoice / startBed / ensureTravel / startTravel / stopTravel`.

**Visual contract:** Quiet filtered noise under the score.

**Reuse and ownership:** Deterministic 8-second mono reusable noise buffer, owned voices.

**Behavior/lifecycle:** Mute/hide/disposal cancel correctly; travel starts/stops with current presentation.

**Variants:** ambient bed; moving travel layer.

**Provenance:** `original-project-code`; see catalog profile.

### audio.transfer-wood — Wood contact family

**Type / state:** procedural-audio / existing-runtime.

**Source:** `src/audio/wood.ts` — `makeWoodContact / TransferContact`; `src/audio/atmosphere.ts` — `Sound.transferContact`; `src/scene/transfer.ts` — `TransferTimeline`.

**Visual contract:** Full but restrained wooden body and soft transient.

**Reuse and ownership:** Generated short mono buffers cached by light/full weight; bounded owned sources.

**Behavior/lifecycle:** Follow visible crossing/settling marks; unchanged loudness/timing; stale contacts cannot replay.

**Variants:** light 225Hz / 0.22s; full 165Hz / 0.27s; settling; compact Reduced.

**Provenance:** `original-project-code`; see catalog profile.

### audio.arrival — Harmony-aware arrival cue and won music reduction

**Type / state:** procedural-audio / existing-runtime.

**Source:** `src/audio/arrival.ts` — `arrivalPhrase`; `src/audio/atmosphere.ts` — `Sound.delivery / arrivalVoice / setVictoryMix`.

**Visual contract:** Gentle audible three-stage resolution compatible with phrase position.

**Reuse and ownership:** Existing pad/pluck palette and shared reverb, fully cancellable tails.

**Behavior/lifecycle:** One visible-arrival cue; dry and wet music remain quieter while won; Undo/restart/cove exit restore.

**Variants:** opening; answer; settle; music duck/restore.

**Provenance:** `original-project-code`; see catalog profile.

### audio.reverb — Shared room/air impulse

**Type / state:** generated-audio-buffer / existing-runtime.

**Source:** `src/audio/score.ts` — `makeReverb`; `src/audio/atmosphere.ts` — `Sound.graph`.

**Visual contract:** Soft long tail joining score and arrival.

**Reuse and ownership:** Locally generated deterministic reusable impulse; no recorded source.

**Behavior/lifecycle:** Preserve dry/wet victory duck and mute ownership.

**Variants:** one 3.6-second stereo impulse.

**Provenance:** `original-project-code`; see catalog profile.

### ui.surfaces — Current teal surfaces and controls

**Type / state:** css-component-family / existing-runtime.

**Source:** `src/style.css` — `:root / button / .hud / #local-context / dialog / .dialog-footer`.

**Visual contract:** Dark teal panel #103a45f5, surface #194d58, ivory #fff3d9, foam #a9dcd0, amber #f6cf8a, sand border #d8be91.

**Reuse and ownership:** Existing shared DOM/CSS styling; new rounded raised family should consolidate rather than duplicate.

**Behavior/lifecycle:** Keep 16px primary text, 48px main actions/44px minima, measured placement and readable text opacity.

**Variants:** ordinary; hover/pressed as implemented; disabled; focus-visible; warning; terminal.

**Provenance:** `original-project-code`; see catalog profile.

### ui.typography — System typography

**Type / state:** system-font-family / existing-runtime.

**Source:** `src/style.css` — `:root / h1 / #local-heading`.

**Visual contract:** Plain readable action text and soft serif cove title.

**Reuse and ownership:** System installed fonts only; no external font file or network request.

**Behavior/lifecycle:** Do not bake essential text into icons or textures; labels remain localizable DOM text.

**Variants:** Segoe UI / Arial / sans-serif body; Georgia / serif title.

**Provenance:** `system-font-stack`; see catalog profile.

### ui.map-markers — Freestanding names and selectable marker buttons

**Type / state:** dom-component-family / existing-runtime.

**Source:** `src/main.ts` — `renderMap`; `src/style.css` — `.map-target / .map-hit / .map-symbol / .map-name / .map-home`.

**Visual contract:** Small 28px visual marker with larger stationary hit region and freestanding label.

**Reuse and ownership:** Name plus marker is one semantic button and one Tab stop for each real node.

**Behavior/lifecycle:** Preserve real status shape/text, free selection, collision/occlusion avoidance and no forced pan on selecting.

**Variants:** current; remote; too shallow; loss risk; selected; Home role.

**Provenance:** `original-project-code`; see catalog profile.

### ui.dock-icons — Current directional transfer SVG and Home glyph

**Type / state:** inline-svg-and-glyph / existing-runtime.

**Source:** `src/main.ts` — `renderDock / positionMap dock-arrow rotation`; `src/style.css` — `.dock-arrow / .dock-home`.

**Visual contract:** Current arrow is one 24x24 stroked SVG; Home uses U+2302.

**Reuse and ownership:** Actual screen-space pier-to-ferry angle rotates arrow; labels Board, Let ashore, Bring home carry meaning.

**Behavior/lifecycle:** Replacement icons must preserve unambiguous direction and action labels; fixed home icon must not become a main-menu metaphor.

**Variants:** board arrow; unload arrow rotated opposite; Unicode home glyph.

**Provenance:** `original-project-code`; see catalog profile.

### ui.utility-icons — Current utility symbols and labels

**Type / state:** dom-component-family / existing-runtime.

**Source:** `src/main.ts` — `app.innerHTML / renderSound / renderFullscreen / renderDialog`; `src/style.css` — `.tools / .view-controls / .settings-sound-controls`.

**Visual contract:** Mixed system text/symbol family currently visible.

**Reuse and ownership:** Good target for original consistent code-native icon family using shared rendering.

**Behavior/lifecycle:** Sound requested/running/muted intent, fullscreen actual state, undo/restart and free-view semantics must remain distinct.

**Variants:** Undo U+21B6; sound U+266A/U+266B plus Sound/Retry text; Menu; Wait; Whole cove; Back to boat; Fullscreen; Settings.

**Provenance:** `original-project-code`; see catalog profile.

### ui.dialogs — Local preview, forecast, Menu, Settings and completion

**Type / state:** dom-component-family / existing-runtime.

**Source:** `src/main.ts` — `renderDialog / renderLocation`; `src/ui/placement.ts` — `placeLocalCard / placeActionCard`; `src/ui/cove-layout.ts` — `endpointTargets`; `src/ui/fullscreen.ts` — `FullscreenSupport.changed`; `src/style.css` — `dialog / .dialog-body / .dialog-footer / .terminal-actions`.

**Visual contract:** Compact dark teal translucent card with stable nearby placement.

**Reuse and ownership:** Same native dialog preserves focus/subset/scroll during fullscreen promotion.

**Behavior/lifecycle:** Keep mobile anchors, cancellation/focus, 780x320 reachability, modal input safety and explicit cost/consequence labels.

**Variants:** passenger subset; tide forecast; crossing menu; settings; won; lost; support-details fallback.

**Provenance:** `original-project-code`; see catalog profile.

### ui.icon.board — Board

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/board.svg` — `SVG root / cove-board`.

**Meaning:** Arrow descends toward the open ferry deck. Keep the visible Board label for consequential transfer actions.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/board.svg` (not yet applied).

### ui.icon.unload — Unload

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/unload.svg` — `SVG root / cove-unload`.

**Meaning:** Arrow rises away from the same ferry deck. This means unload selected animals, never discard or delete.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/unload.svg` (not yet applied).

### ui.icon.sail — Sail

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/sail.svg` — `SVG root / cove-sail`.

**Meaning:** Compact ferry with trailing travel marks. Labels retain destination and action consequences.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/sail.svg` (not yet applied).

### ui.icon.harbor-home — Harbor · Home

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/harbor-home.svg` — `SVG root / cove-harbor-home`.

**Meaning:** The cove lighthouse identifies the rescue destination. It must not be used for Back to boat, a main menu or a free travel action.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/harbor-home.svg` (not yet applied).

### ui.icon.undo — Undo

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/undo.svg` — `SVG root / cove-undo`.

**Meaning:** Return to the previous complete action. Kept distinct from Restart.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/undo.svg` (not yet applied).

### ui.icon.wait — Wait

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/wait.svg` — `SVG root / cove-wait`.

**Meaning:** An hourglass marks an explicit turn-spending wait. The icon is not a countdown of real time.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/wait.svg` (not yet applied).

### ui.icon.whole-cove — Whole cove

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/whole-cove.svg` — `SVG root / cove-whole-cove`.

**Meaning:** Three islands and curved passages identify the entire cove framing.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/whole-cove.svg` (not yet applied).

### ui.icon.back-to-boat — Back to boat

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/back-to-boat.svg` — `SVG root / cove-back-to-boat`.

**Meaning:** Framing corners around the ferry recenter the camera only; this must not resemble Harbor Home.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/back-to-boat.svg` (not yet applied).

### ui.icon.menu — Menu

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/menu.svg` — `SVG root / cove-menu`.

**Meaning:** Two softly rounded slats for the Crossing menu.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/menu.svg` (not yet applied).

### ui.icon.settings — Settings

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/settings.svg` — `SVG root / cove-settings`.

**Meaning:** Two adjustable pins provide a familiar settings metaphor without ornate machinery.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/settings.svg` (not yet applied).

### ui.icon.close — Close

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/close.svg` — `SVG root / cove-close`.

**Meaning:** Dismiss the current surface without committing an action.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/close.svg` (not yet applied).

### ui.icon.confirm — Confirm

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/confirm.svg` — `SVG root / cove-confirm`.

**Meaning:** Commit the currently previewed selection; keep explicit visible action text and consequences.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/confirm.svg` (not yet applied).

### ui.icon.next-cove — Next cove

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/next-cove.svg` — `SVG root / cove-next-cove`.

**Meaning:** A curved onward path from an island identifies progression after arrival.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/next-cove.svg` (not yet applied).

### ui.icon.sound-on — Mute sound

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/sound-on.svg` — `SVG root / cove-sound-on`.

**Meaning:** Audio is currently playing; the action label is Mute sound.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/sound-on.svg` (not yet applied).

### ui.icon.sound-off — Enable sound

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/sound-off.svg` — `SVG root / cove-sound-off`.

**Meaning:** Audio is muted; the action label is Enable sound.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/sound-off.svg` (not yet applied).

### ui.icon.sound-retry — Retry sound

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/sound-retry.svg` — `SVG root / cove-sound-retry`.

**Meaning:** Sound was requested but is not running. The visible Retry label must remain; this is not mute.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/sound-retry.svg` (not yet applied).

### ui.icon.fullscreen-enter — Fullscreen

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/fullscreen-enter.svg` — `SVG root / cove-fullscreen-enter`.

**Meaning:** Expand the common app root using the existing trusted fullscreen path.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/fullscreen-enter.svg` (not yet applied).

### ui.icon.fullscreen-exit — Exit fullscreen

**Type / state:** svg-icon / candidate.

**Source:** `cove-ui-package/ui/icons/fullscreen-exit.svg` — `SVG root / cove-fullscreen-exit`.

**Meaning:** Leave actual fullscreen. Never infer state from an optimistic toggle.

**Visual contract:** 24x24 grid; 1.8px round-cap/round-join strokes; glyph size 24 or 28 CSS px

**Reuse and ownership:** Shared inline SVG inside a stable native button; button owns events and name; generate any sprite from this source

**Behavior/lifecycle:** No independent pointer events, text, focus or autoplay animation. Transfer pictogram stays upright; never inherit world-relative .dock-arrow rotation.

**Variants:** one-color; optional soft accent.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/icons/fullscreen-exit.svg` (not yet applied).

### ui.component.round-utility — Round utility control

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-button.cove-button--icon`.

**Meaning:** Small familiar utilities; 48px stable target, 24px glyph.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** quiet; focus; pressed; disabled.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### ui.component.action-capsule — Labeled action capsule

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-button`.

**Meaning:** Board / Let ashore / Bring home / Sail / Wait / Undo / confirmation; retain visible action labels.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** foam; warm; quiet; focus; pressed; disabled.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### ui.component.panel — Quiet cove panel

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-panel`.

**Meaning:** One rounded frame and a substantial dark text backing. Existing native dialog and measured positioning own behavior.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** location; subset; forecast; menu; settings; arrival.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### ui.component.passenger-choice — Inset passenger choice

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-choice`.

**Meaning:** Preserve existing choice button and aria-pressed state; show a check, name and space cost. Checkbox in the specimen demonstrates appearance only; a DOM conversion requires focus-trap changes.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** selected; unselected; focus; unavailable.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### ui.component.location-name — Freestanding location name

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-name`.

**Meaning:** Short dark text backing attached to existing single name/marker semantic selection target.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** ordinary; selected; current; risk.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### ui.component.harbor-mark — Harbor Home mark

**Type / state:** css-component-family / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-objective`.

**Meaning:** Lighthouse symbol and Home identity, distinct from camera framing and Menu.

**Visual contract:** Rounded matte surface, shallow lower edge and restrained top highlight; tokens in the same shared CSS

**Reuse and ownership:** Shared component appearance; existing game layout and native controls retain interaction ownership

**Behavior/lifecycle:** Stable measured bounds, no new continuous animation, no tap-through, no changed confirmation semantics; Reduced Motion removes decorative transitions

**Variants:** ordinary; selected; arrival.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### material.cove-ui-tokens — Cove interface material tokens

**Type / state:** material-palette / candidate.

**Source:** `cove-ui-package/ui/cove-ui.css` — `.cove-kit custom properties`.

**Visual contract:** Deep teal and cream retained from current UI; softened foam and lantern action faces derived from the miniature palette

**Reuse and ownership:** One semantic token set shared across components; world materials keep existing source

**Behavior/lifecycle:** Do not recolor the accepted world or use opacity-only states; validate actual composites

**Variants:** dark quiet surfaces; seafoam action; warm objective; warning; focus.

**Provenance:** `original-package-vector-and-css`; see catalog profile.

**Proposed integration target:** `src/ui/cove-ui.css` (not yet applied).

### reference.first-crossing-png — first-crossing.png

**Type / state:** reference-image / reference-only.

**Source:** `references/first-crossing.png` — `reference file`.

**Meaning:** Primary original concept direction; never runtime background

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.

### reference.original-concept-png — original-concept.png

**Type / state:** reference-image / reference-only.

**Source:** `references/original-concept.png` — `reference file`.

**Meaning:** Supporting generated concept mood

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.

### reference.drowned-orchard-png — drowned-orchard.png

**Type / state:** reference-image / reference-only.

**Source:** `references/drowned-orchard.png` — `reference file`.

**Meaning:** Future chapter mood; not implemented level or asset

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.

### reference.sanctuary-ending-png — sanctuary-ending.png

**Type / state:** reference-image / reference-only.

**Source:** `references/sanctuary-ending.png` — `reference file`.

**Meaning:** Future ending mood; not current sanctuary asset

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.

### reference.first-cove-layout-svg — first-cove-layout.svg

**Type / state:** reference-image / reference-only.

**Source:** `references/first-cove-layout.svg` — `reference file`.

**Meaning:** Authored geometry schematic, not an art target

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.

### reference.first-cove-layout-png — first-cove-layout.png

**Type / state:** reference-image / reference-only.

**Source:** `references/first-cove-layout.png` — `reference file`.

**Meaning:** Raster schematic companion, not gameplay capture

**Visual contract:** Existing supplied art direction reference

**Reuse and ownership:** Reference only; no runtime load

**Behavior/lifecycle:** Never substitute this image for playable geometry or evidence of actual gameplay

**Provenance:** `supplied-concept-reference`; see catalog profile.
