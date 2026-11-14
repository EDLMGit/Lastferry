# Publication review — mobile map readability

Reviewed and published **11 November 2026, 23:14 Europe/Madrid**.

## Result

Published exact game `f0ffe2c12f1cc0e42ad7ef10a4b57dd29097c731` as **Sites version 19** at https://last-ferry-playtest.abumech.chatgpt.site/. The hosting source commit is `1ea40b815911a0fc1131350ee34125ae3508396e`; these SHAs identify different repositories. The native deployment returned `succeeded`. [Receipt](deployment-confirmation.json)

The user explicitly requested access for one named person. Sites confirmed a viewer grant, and a subsequent read confirmed custom access with the owner and one external viewer. The Site is not public. Contact details remain in Sites and are not reproduced here. Future publications must preserve the custom allowlist and use the shared-Site flow.

## Independent review

Source review found no publication blocker. Local bounded name/marker placement replaces the previous cross-screen fallback. Passenger actions name their landing and Sail names its destination. The free stop index preserves inspection when secondary names cannot fit. Camera framing uses neighboring geometry and measured control obstacles. Zoom is bounded and stepped; two-finger cancellation is not pinch-to-zoom.

The comparison changes no puzzle data/witnesses, reducer/game or level modules, campaign/save logic, audio, canonical routes/reef rules, models/poses/water, portrait sources or dependency lockfile. The puzzle data tree remains `4fd5ebb56acf9cb0fcc1e249df7c245e811ca0d7`.

Four repaired phone images and two matched baseline frames were inspected at native size. Their hashes match Git and MEDIA.json. The High Quay name is local; the Board action belongs visibly to Wide Berth; Two Shelters includes both occupied shores; Reef portrait preserves the one-action reef deadline. Wider framing makes animals smaller, and Reef portrait leaves substantial open water. These remain appropriate perceptual questions for the requested phone test.

## Fresh verification and retained evidence

- Production build and TypeScript passed on Node **24.22.1** with the existing locked dependencies.
- All **seven generated output files** match the SHA-256 values recorded in the implementation's MEDIA.json.
- The source audit covered **299 files** across runtime, data, assets, cove asset packages, tests, tools and five root build inputs, excluding historical package verification archives. **298 exact Git blobs**; the sole adaptation is the previously retained Vite `server.allowedHosts: ['terminal.local']` for hosting preview. No unexpected scoped files.
- The same 16-file focused unit command reported **101 passed / 1 failed**, out of 102. The asset-catalog assertion reported **206 missing-reference errors for 29 unique paths, all under reviews/**, which are omitted from this deployment checkout. No other catalog errors or runtime assertion failures were reported. [Original independent unit log](publication/independent-units.txt)
- Codex's complete-repository **102-unit pass, 79-family asset validation, 28 scale sweeps and ten browser cases** are retained exact-source evidence. They are not represented as fresh runs by this publication review. [Original implementation review and failures](REVIEW.md)

The existing bundle-size advisory remains. No fresh browser, physical-phone, acoustic or spoken screen-reader run was performed during this review. Earlier captured rescues and lifecycle checks remain applicable to the byte-matching game build. The user's next Android comparison will assess map clarity, action ownership and comfortable scale.

The publication and named-viewer grant are complete. The next game change remains unassigned pending player feedback.
