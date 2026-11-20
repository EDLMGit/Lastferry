# Approved reference inspection and production painter parity

The six PNGs here are **design-reference captures, not gameplay evidence**. The supplied `LAST_FERRY_STORY_PRODUCTION_PACKAGE/reference/approved-opening.html` was opened in Chromium and advanced through all three shots using its real controls. Each finite action was allowed to finish before its endpoint was captured. `inspection.json` records the browser, native CSS viewport, shot clock and canvas dimensions. All six images were inspected at native size before porting the art.

At 390×844, the wrapper provides a 358×350 illustration above a deep teal reading area. Rue remains tan on the left and Pip cream on the right; the close lantern greeting and ferry/Moss composition remain recognizable. At 780×320, the 748×230 landscape illustration uses the quiet top-left text area. The reference's transcript extends below the available viewport; this is the known reference-only limitation and is not accepted for production.

`painter-parity.json` compares original and typed production Canvas2D pixels at matching dimensions and DPR 1. All 27 combinations—three opening illustrations, beginning/midpoint/endpoint, and portrait/short-landscape/desktop drawing dimensions—have zero differing RGBA channels. This establishes preservation of the supplied drawing equations and palette, not approval of production layout or new Harbor artwork.

The new Harbor drawing reuses the same backdrop, coastline, lighthouse, rabbits, sheep, ferry and lantern helpers. Rue lowers the lantern from 0.6–3.2 seconds and retracts her hand from 3.4–4.5 seconds; Pip turns toward the empty waiting ferry from 1.7–3.4 seconds; Moss settles from 0.5–2.5 seconds. The frame holds at five seconds. Development drawings under `../development/` are standalone painter fixtures, not actual journey captures. Their purpose is to inspect the new composition before the application integration.

Original development issues are retained:

- The first reference harness searched the wrapper document for `Play story` and timed out after 30 seconds. The supplied standalone wrapper places the reference inside an iframe; the corrected inspection targets that frame. No production iframe is used.
- The first parity harness tried importing the production module inside the supplied wrapper's restrictive document and received `Failed to fetch dynamically imported module`. Running the same pure-drawing comparison in a local empty development fixture resolved the harness restriction. The task's reference files were not changed.
- The first Harbor portrait drawing let the pier cover the ferry's bow. `../development/original/harbor-portrait-ferry-occlusion.png` preserves that result. The ferry was moved left, then bounded by viewport width, so its empty passenger deck and complete bow remain visible. Moss gained a small right margin. These changes affect only the new Harbor illustration.

The port contains no frame loop, observer, campaign mutation, puzzle action or sound owner. The app supplies the current illustration and elapsed seconds. The original opening and all shared defaults remain pixel-identical in the measured fixtures. The production port, new Harbor composition and actual audio mix still await human review.
