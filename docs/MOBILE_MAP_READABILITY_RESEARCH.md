# Mobile map readability — evidence and research

Prepared **11 November 2026** for [MOBILE_MAP_READABILITY_01](../NEXT_TASK_MOBILE_MAP_READABILITY.md).

## Player evidence

The player tested the connected Journey on a physical Android phone. Their story assessment is positive: it aligns and looks decent. Their current complaint is the crowded map, competing route/name lines, over-close Play framing and sometimes too-small Whole cove. This is useful physical-device visual feedback, not a comprehensive performance, acoustic or accessibility approval.

The three supplied JPEGs below are copied byte for byte. Each is **1536×716 image pixels**. Their CSS viewport, device pixel ratio, fullscreen state and exact action history were not supplied and must not be inferred from bitmap size alone. The file names describe the visible compositions.

| Reference | Observed problem |
| --- | --- |
| [Two Shelters Play](../references/mobile-map-readability/01-two-shelters-play.jpg) | Northern scenery is cropped; route/name/marker layers and large controls crowd the useful water. Animals remain recognizable at this scale. |
| [Wide Whole cove](../references/mobile-map-readability/02-wide-berth-overview.jpg) | The Harbor name sits visually below the central island. Board appears over that island although the ferry is at the northern landing. Whole-cove scaling makes fixed-size labels/actions dominate the smaller world. |
| [Wide at Harbor](../references/mobile-map-readability/03-wide-berth-harbor.jpg) | High Quay's name is on the opposite side of Harbor from its target. Its leader crosses the ferry/current route. Important geography is cropped. |

A non-overlapping label is not necessarily understandable. The name, navigation endpoint and physical landing must be recognizable as one place, and actions must have an unambiguous owner.

## Source review at the published game

Reviewed game: `1b7b4f05e576614f061ca4949bf5aca705dc5e0e`. Local hosting source: `805ade05e2d5b9eba2287ce77d55cd60911dcaea`. The reviewed local placement helper, Driftwood label helper, view math, main interface, world renderer and play-controls stylesheet were individually matched to the game's Git blobs. No fresh browser or physical-device reproduction was performed during this research; the visual observations come from the user's images.

- [`placeLocalCard()`](https://github.com/EDLMGit/Lastferry/blob/1b7b4f05e576614f061ca4949bf5aca705dc5e0e/src/ui/placement.ts) searches candidates derived from the whole screen and obstacles, selecting the closest available space without a maximum anchor distance.
- [`placeDriftwoodLabels()`](https://github.com/EDLMGit/Lastferry/blob/1b7b4f05e576614f061ca4949bf5aca705dc5e0e/src/ui/driftwood-labels.ts), used for Driftwood and Wide, limits cached leaders to 120px but does not impose that limit on newly found placements.
- [`positionMap()` and `updateViewport()`](https://github.com/EDLMGit/Lastferry/blob/1b7b4f05e576614f061ca4949bf5aca705dc5e0e/src/main.ts) then draw name leaders beyond 20px without an upper bound. Marker relocation also uses the unrestricted search. Dock controls reject a >56px separation in one six-space attempt, but a later fallback drops that guard. These code paths explain how the observed associations can be lost; the precise fallback taken on the user's phone was not instrumented.
- [`phonePlayScale()`](https://github.com/EDLMGit/Lastferry/blob/1b7b4f05e576614f061ca4949bf5aca705dc5e0e/src/scene/view.ts) forces at least 1.4 times Overview scale. There is no intermediate player zoom state. The existing unit assertion preserves that policy, rather than testing useful decision context.
- [`reframeView()` / `wideDockFrame()`](https://github.com/EDLMGit/Lastferry/blob/1b7b4f05e576614f061ca4949bf5aca705dc5e0e/src/scene/world.ts) additionally frame six-space Play around the ferry and current transfer subjects. Ordinary Play uses nearly the full safe rectangle; measured HUD obstacles are passed to the Overview avoidance path. This allows camera and overlay placement to compete for the same space.
- Routes already have selected/adjacent/background emphasis in `world.ts::indicate()`. Simply dimming unrelated routes again is not a sufficient repair.

The visible name text and its larger interactive rectangle also deserve separate treatment. Keeping comfortable marker targets does not require every persistent text label to occupy another large button-shaped collision area.

## Primary research and the design inference

The sources below describe established layout/input techniques. Applying them to this stylized 3D puzzle is a design decision, not evidence that the resulting game is already readable. Reuse the existing Three.js/DOM stack.

### Local, prioritized and stable labels

[Mapbox — Optimize map label placement](https://docs.mapbox.com/help/dive-deeper/optimize-map-label-placement/) explains ordered alternative anchors around a feature, omission when those anchors cannot fit, priority between labels, and retrying the previous anchor after zoom changes.

**Application:** use bounded nearby candidates and a stable priority policy. When secondary text cannot fit, retain the marker and make its full identity available on selection/focus. Keep selected/current/Harbor identity clear. Do not imitate omission blindly: a puzzle must still expose every place, route and factual constraint for free. Do not add a mapping SDK.

### Adapt to the available height as well as width

[Android Developers — Use window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes) classifies available width and height separately and explicitly calls out landscape phones, which can be wide but short. The available app window can change during use.

**Application:** compose for real usable CSS dimensions and controls, including rotation, browser chrome and fullscreen. Treat the Android guidance as an adaptive-layout principle, not a direct conversion of Android dp breakpoints to this web game's CSS. Do not shrink everything proportionally or preserve a close-up multiplier just because it passed an old test.

### Separate visual compactness from target size

[W3C — Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) uses 44×44 CSS-pixel targets, subject to its exceptions. [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) uses 24×24 with spacing/other exceptions. The 44px target in this task is a deliberate touch-usability goal, not a claim that WCAG AA requires 44px or that this project is certified.

**Application:** reduce duplicated wording, decorative containers and secondary text, while preserving separated comfortable marker/action hit areas. Do not fix clutter by shrinking all fonts and buttons.

### Optional gestures need simple alternatives

[W3C — Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) explains the single-pointer alternative to dragging. [W3C — Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) explains alternatives to multipoint gestures such as pinch.

**Application:** pan/pinch may remain useful, but tap-based framing, focus/return and scale adjustment must remain available. A keyboard alternative alone is not a touchscreen alternative. Gesture release must not accidentally activate a destination.

## Chosen product direction

Use a shared policy that keeps names/actions near their owners, gives route lines a clear job, frames meaningful local context and lets the player choose an intermediate scale. Adapt how much secondary detail is shown as scale changes. Whole cove remains a planning view; closer play retains recognizable passengers. Compact controls must leave room for the world and for factual warnings.

Do not trade readability for invisible puzzle information. Tips stays Off by default; current depth/load, routes, reef direction, deadlines and actual loss explanations remain available. Avoid a new minimap, model overhaul or more coves in this pass.

The decisive evidence is matched normal-size images plus a continuous interaction sequence. A rectangle-overlap count cannot establish that a player knows which island is High Quay or whose passengers a Board button will move.
