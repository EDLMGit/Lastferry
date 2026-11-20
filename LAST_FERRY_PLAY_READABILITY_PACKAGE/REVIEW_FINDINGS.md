# Review of 7ae1d8a — readable play and campaign direction

Reviewed 1 November 2026. Evidence: exact repository source, the four screenshots supplied by the user, the pinned implementation report and a later publication-only commit. No fresh app run or physical-phone/audio check was performed for this review.

## 1. The next challenge has not earned its campaign slot

The larger ferry after Nell's rescue was in our written C4 plan. Codex followed that assignment; this is a correction to our direction and difficulty calibration.

The current full-group/deep-return strategy can be understood as collecting the first group, taking the available deep path, delivering and returning for the other group. The optional staging strategy does not force discovery of a new idea. More bodies, more actions and another valid witness do not establish a stronger puzzle than Driftwood. The user's report that Wide is easy and not fun is now evidence against its current campaign role.

Use CAMPAIGN_RECALIBRATION.md to revise future direction. Keep the present runtime and saves during this readability task. A compact replacement C4 must be proven and playtested independently before integration. Reuse the larger ferry later, after Orin gives capacity a clear purpose.

Sources: [campaign progression](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/campaign/PUZZLE_PROGRESSION.md), [Wide Berth data](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/data/wide-berth.level.json).

## 2. The HUD occupies more than its visible pixels

The continuous panel combines identity, status and frequent actions into a full-width bar. Separate the actual controls and hide secondary explanation behind expansion.

A CSS-only repair is insufficient. main.ts reserves the entire .hud bottom as the camera and map-placement top boundary. It also uses .hud for receipt obstacles, ResizeObserver and diagnostics. Removing the painted background while retaining those assumptions leaves an invisible strip and can keep the scene unnecessarily small.

Use independent obstacle rectangles and stable safe bounds. Camera and label placement must use the reclaimed space without placing animals, actionable markers or nearby controls under buttons. Expanded panels should avoid obscuring the selected place and should not make the camera jump on every toggle.

Sources: [main.ts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/main.ts), [view.ts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/scene/view.ts).

## 3. Safe Sail already commits directly; the card is the burden

The screenshot shows the free location-inspection card. renderLocation() executes ordinary safe sailing directly. A separate confirmation is used when a legal move would immediately lose.

Retain free marker selection, but make its ordinary presentation a compact nearby Sail action and optional Details. Collapse routine successful-depth prose. For a legal losing move, show the exact consequence inline before the same explicit Sail action, then commit once. No additional modal or acknowledgment checkbox. A blocked move remains blocked.

Continue through the existing preview/execute/Session flow. A selected marker must not move the boat, and the pointer release that selects it must not accidentally activate the new Sail control. Removing local-heading also requires deliberate focus recovery.

Sources: [main.ts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/main.ts), [location facts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/ui/location.ts).

## 4. Gameplay shallow banks are calculated but not displayed

coastalMask() derives a shallow-bank field from real edge depths and canonical curved paths. The red channel contains that field. water-shader.ts samples the texture but uses only green, for a subtle shore lap. Meanwhile createSeabedField() derives the visible bed from shore geometry and decorative patches, without route depths. This can leave an open-water depth-1 passage looking deep.

Connect gameplay bathymetry to the visible substrate/water response. The repair must be visible in an ordinary screenshot, not merely appear in a generated mask or a shader uniform.

Holding's node named Shallows and Driftwood's Shallow Bend node both have baseDepth 3; their shallow approach edges have baseDepth 1. Preserve the deeper turning pockets. Do not color every name containing “shallow” as one uniform sand disc. Boat loading changes draft and passage availability, not the geography.

Sources: [water.ts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/scene/water.ts), [water shader](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/scene/water-shader.ts), [seabed.ts](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/scene/seabed.ts), [Holding data](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/data/holding-pier.level.json), [Driftwood data](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/data/driftwood-yard.level.json).

## 5. The Harbor composition stretches while its subjects stop growing

harborShot() positions the desktop boat at 30% of viewport width and Rue/Pip/Moss at 66%, 79% and 91.5%. Their scales cap independently; the caption stays in the opposite corner. A wide viewport separates things that should form one scene.

Recompose a supported quay, nearby ferry, Rue's lantern, Pip and Moss inside one bounded foreground design box. Scale that group coherently and extend the atmospheric background independently. Preserve the visual relationship between the characters, lantern, ferry and distant light on portrait and short landscape. This does not require more dialogue or more unrelated motion.

The current another-bell shot lasts five seconds, with the caption at 1.05 seconds and lantern-contact cue at 3.2 seconds. Preserve those timings and the player/progress behavior while repairing the composition. Native 2048×930 evidence matters because phone-only bounds checks would miss this defect.

Sources: [story painter](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/story-painter.ts), [story view](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/story-view.ts), [story CSS](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/story.css), [scene registry](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/src/campaign/registry.ts).

## 6. Publication and verification are separate from acceptance

The handoff's version-12 statement was subsequently superseded. Commit 52f72d6cdb1caa292425511394f4a11efa024a61 adds publication/continuity records without runtime changes. Its receipt records private Site version 13, game 7ae1d8a and hosting c24aa6528675bc278de848e111ee73f9e22810ac. This review has not independently audited the live Site.

The implementation report records build/typecheck, 388 units, asset validation and 12 focused browser cases. Those are useful functional evidence. They do not override the user's latest visual and difficulty feedback. Keep inherited portrait-loading, overlap, heading, rapid-touch, physical-device and listening limits explicit; only close a specific item when the relevant new evidence supports closure.

Sources: [implementation report](https://github.com/EDLMGit/Lastferry/blob/7ae1d8ab211c73708d45f7cbbdecc1a7da6e1695/reviews/wide-berth-visual-repair/REVIEW.md), [publication receipt](https://github.com/EDLMGit/Lastferry/blob/52f72d6cdb1caa292425511394f4a11efa024a61/reviews/wide-berth-visual-repair/deployment-confirmation.json), [newer continuity](https://github.com/EDLMGit/Lastferry/blob/52f72d6cdb1caa292425511394f4a11efa024a61/docs/PROJECT_STATE.md).
