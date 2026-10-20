# M1 production assets

All runtime geometry is original code authored for this project by Codex on 2026-10-20. No third-party models, images, fonts, audio recordings, or generated bitmap assets are loaded by the game. Project code remains subject to the project's chosen rights; this ledger does not assert a new distribution license.

| Family | Reproducible source | Treatment / provenance |
| --- | --- | --- |
| Yellow ferry and red cabin | `src/scene/models.ts`, `ferry()` | Curved extruded and beveled hull, open planked deck, rails, fenders, life ring, windows, chimney and flag. Original project geometry. |
| Two rabbits and sheep | `src/scene/models.ts`, `animal()` | Shared animal families with distinct rabbit coats/poses, wool clusters, limbs, ears and facial details. Original project geometry. |
| Lighthouse, cottage, piers and vegetation | `src/scene/models.ts`, `src/scene/world.ts` | Tapered lighthouse with lantern/balcony, cottage roof, boards, moorings, lanterns, shrubs, flowers, pines, crates. Original project geometry. |
| Terrain and navigation | `src/scene/world.ts`, authoritative `data/first-crossing.level.json` | Rounded terraces inside authored polygons, faceted rocks, water shader, foam, route lines and buoy markers. The water is a stylized shader, not a fluid simulation. |
| Motion | `src/scene/motion.ts`, `src/scene/world.ts` | Polyline traversal with checked yaw; gangway passenger paths, hull draft, tide and arrival acknowledgment. |
| Sound | `src/audio/sound.ts` | Original Web Audio oscillators: quiet motor-like notes, boarding/docking notes and arrival arpeggio. No recorded samples. |
| Interface | `src/style.css`, `src/main.ts` | System Arial/Helvetica/Georgia fonts, DOM text and symbols. No downloaded fonts. |
| Library geometry helpers | npm `three`, `three/addons/geometries/RoundedBoxGeometry.js` | Three.js MIT-licensed library code. License retained at `node_modules/three/LICENSE` after installation. Exact versions in `package-lock.json`. |

The supplied images in `references/` remain generated concept references only. `first-crossing.png` was inspected for direction; it is never loaded by the runtime. Gameplay evidence lives separately under `reviews/m1/`.
