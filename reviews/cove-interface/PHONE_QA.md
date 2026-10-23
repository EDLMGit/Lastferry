# Native-size interface inspection

All **25 final PNGs listed below** were opened at their original resolution: 24 phone captures and one desktop sanity view. They come from the final passing browser run, whose before/after guards both match the 108-file source manifest `c2a5d5bdbd16104c753845a3b31a1e9129e6ff5788b84eabf60b6e1c0afa5220`, with no changed files. The run completed eight focused scenarios successfully. This inspection evaluates the actual rendered interface; it does not substitute a state assertion for visual review.

Environment: Windows, Chromium 156.0.8078.4, SwiftShader, DPR 1; phone viewports 844×390 and 780×320 with emulated touch. Desktop is 1440×900 with mouse/keyboard. Capture and source details are in `final/automation-results.json`, `final/*-checks.json`, `final/source-before.json`, `final/source-after.json` and the milestone source manifest.

## Images inspected

| Cove / size | Every inspected filename under `final/` |
| --- | --- |
| Holding, 844×390 | `holding-844x390-start-dock.png`, `holding-844x390-shallow.png`, `holding-844x390-remote.png`, `holding-844x390-safe-travel.png`, `holding-844x390-cancel-restored.png`, `holding-844x390-critical-subset.png`, `holding-844x390-flooded-departure.png`, `holding-844x390-success.png` |
| Holding, 780×320 | `holding-780x320-start-dock.png`, `holding-780x320-shallow.png`, `holding-780x320-remote.png`, `holding-780x320-safe-travel.png`, `holding-780x320-cancel-restored.png`, `holding-780x320-critical-subset.png`, `holding-780x320-flooded-departure.png`, `holding-780x320-success.png` |
| Bellwater, 844×390 | `bellwater-844x390-start.png`, `bellwater-844x390-both-directions.png`, `bellwater-844x390-critical-boarding.png`, `bellwater-844x390-success.png` |
| Bellwater, 780×320 | `bellwater-780x320-start.png`, `bellwater-780x320-both-directions.png`, `bellwater-780x320-critical-boarding.png`, `bellwater-780x320-success.png` |
| First Crossing, 1440×900 | `desktop-first-crossing.png` |

## Observations

The ordinary scenes retain recognizable islands, ferry and passengers, with the lighthouse roof fully in frame. Names sit near their own places; the buoy/channel labels use short local connectors where needed. Bellwater's six stops remain identifiable at the shorter size. The light markers distinguish current location, remote locations and blocked passages through shape as well as color. Selection uses a warm outline and name underline; keyboard screenshots show a visible focus outline on the marker and its associated name.

Holding's Let ashore launcher stays beside Stone's ferry through shallow, remote, safe and current-place inspections. It no longer jumps below the boat as it did in the development candidate. At Bellwater, Board and Let ashore form two separate, readable controls beside Low Pier, with opposing arrows and room between their hit areas. Neither blocks the waiting rabbit or ferry. The final passing geometry checks retain the 44px minimum, non-overlap and full-viewport assertions rather than merely checking configured CSS sizes.

The route callouts occupy the available right-hand space at both sizes. Safe sailing has a visible deliberate Sail control. The blocked inspection explains the depth comparison; remote inspection states that no direct passage exists. The short-phone Harbor callout no longer covers Harbor, the ferry, the existing dock action or its opening touch point. Map names and markers stay in the same positions across these inspection screenshots.

Critical boarding previews remain readable at 780×320. The passenger choices, selected subset, resulting depth, real loss warning and Confirm control fit inside the modal. In Holding's risky subset, the text explicitly says Pip boards while Rue remains at the flooding pier. Bellwater's safe boundary states that Lark boards before the rise and is safe aboard. The underlying location card and dock launchers are suppressed during modal presentation. At the shortest height, the modal necessarily overlays part of the scene and header; its own close, choices, consequences and confirmation remain fully visible. Cancel restores a usable current-place card and dock trigger.

After Holding's rise, the flooded Rabbit Pier no longer advertises a transfer. The departure callout states that the shallows now have enough depth, and the status panel replaces the expired danger emphasis with Pip and Rue safe aboard and Moss waiting safely at Stone. The two success layouts leave Harbor, the lighthouse, ferry and delivered passengers visible. Holding shows the next-cove action alongside Undo and Restart; Bellwater retains Undo and Restart. The dark teal surfaces, ivory text and warm borders remain consistent across the HUD, forecast, location cards, passenger preview and ending.

The First Crossing desktop sanity image keeps its complete route network and named stops visible. The final browser run additionally completed that original puzzle through both the development interface and production bundle; the image itself only demonstrates its ordinary desktop presentation.

## Result and limits

**No confirmed visual clipping or placement defect in these 25 final images.** The final browser checks cover the reproduced dock movement and repeated-cancel focus failures; the original failed development reports and comparisons remain in `development-results.json` and local `raw/` evidence. Their outcomes were not replaced by these passing results.

Color measurements are reported separately in [CONTRAST.md](CONTRAST.md). This inspection is limited to the stated captures and emulated viewports. Physical Android browser bars, cutouts, device fonts, real touch precision, native GPU performance and screen-reader speech remain unverified. Any later extra unloading-preview captures or gameplay recording require their own recorded inspection; they are not included in the 25-image count above.

## Additional final captures

Root inspected both fresh unload previews at native844×390 and780×320: Moss selection, resulting depth, safe waiting text, Close and Confirm all fit. Root and palette reviewer also inspected actual Shallows arrivals at turns2/5 in the uninterrupted780×320 journey. Visible name/backing remains clear of hull and rabbit ears; only transparent44px same-place padding intersects the current ferry by1.76/9.65px. No unrelated control overlap or visual coverage defect. The turn5 image is selected as `final/holding-780x320-shallows-arrival.png`. Final selected count is28. These extra images retain runtime hash `e622af75a2dce1400b263978ee985087da2269b0f31e64930157f4058396c1db`; the later full108-file hash changes only the legacy picking test fixture, as recorded in `evidence-reuse.json`.
