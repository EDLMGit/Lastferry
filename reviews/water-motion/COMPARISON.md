# Water-motion review index

Actual game at native size. [Report](REVIEW.md), [source manifest](source-manifest.json), [capture manifest](capture-manifest.json), [matched-state/phase audit](matched-comparison.json), [selected natural frame sequence](SELECTED_FRAMES.md).

The midpoint PNGs are native844×390 **canvas-only** images captured in the same rAF as state/pose. Full-interface natural recordings are separate. Both requested normalized progress0.5; actual differences are at most0.004611. Same route, load, tide and camera; no exact frozen-phase or pixel-identical water claim.

|Route/direction|Reviewed baseline|Selected broken wake|
|---|---|---|
|Holding Stone→Shallows, empty/tide0|[Before](baseline-midphase/844x390/short-outward-progress-50.png)|[After](after-midphase/844x390/short-outward-progress-50.png)|
|Holding return, empty/tide0|[Before](baseline-midphase/844x390/short-return-progress-50.png)|[After](after-midphase/844x390/short-return-progress-50.png)|
|Bellwater East→West, two rabbits/tide1|[Before](baseline-midphase/844x390/long-outward-progress-50.png)|[After](after-midphase/844x390/long-outward-progress-50.png)|
|Bellwater return, same load/tide|[Before](baseline-midphase/844x390/long-return-progress-50.png)|[After](after-midphase/844x390/long-return-progress-50.png)|

Art trials: [continuous crest pair](trial-slower-midphase/844x390/long-outward-progress-50.png), [same trial with local-normal response disabled](trial-response-off-midphase/844x390/long-outward-progress-50.png). The final treatment breaks the crests and removes the unproven normal layer entirely. [Preserved candidate source](experiments/tested-changes.patch).

Natural-speed whole-interface originals are local and ignored:

|Coverage|Recording directory|
|---|---|
|Before, short/long both directions|`baseline/844x390/raw/`|
|New effects at original pace|`trial-current/844x390/raw/`|
|Slower pace, initial crests, normal response on/off|`trial-slower/844x390/raw/`, `trial-response-off/844x390/raw/`|
|Selected effect/pace, phone|`after/844x390/raw/`, `after/780x390/raw/`|
|Selected desktop|`after/1440x900/raw/`|

Files are named `short-natural-full-interface.webm` and `long-natural-full-interface.webm`. Each includes setup, outward/return sailing and at least2.25seconds after each docking. No cuts, export slowdown or state injection. Silent recordings; raw originals are **not available in a clone or as web attachments**. [Media decode/hash manifest](media-validation.json), [ordered native temporal inspection](native-temporal-inspection.json). Selected temporal PNGs and lifecycle captures are listed in the capture manifest.
