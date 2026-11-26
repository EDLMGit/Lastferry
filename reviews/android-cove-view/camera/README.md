# Steady play camera

The test played Holding Pier in Chromium 156.0.8078.4 with touch input, normal motion and a development build of `953b4b683976bf759f9938bd72aed37cacb2a512`. It read the projected upper-left corner of the lighthouse lantern core, which stays fixed in the world. The samples include the closed and open route card, moving ferry, docked ferry and Undo. The camera revision counter detects projection changes between samples. These measurements supplement the installed Android footage. [Raw samples](landmarks.json) · [Test](../../../tests/e2e/android-cove-camera.spec.ts)

| 844×390 crossing | Fixed lantern point in CSS pixels | Ferry travel on screen | Camera revision throughout |
| --- | --- | --- | --- |
| Stone Pier → Shallows, empty ferry | 140.54, 66.73 | 166.72 px | 2 |
| Stone Pier → Harbor, after zoom and touch drag | 119.99, 58.45 | 325.16 px | 4 |

Both sails and both Undos left the lantern exactly at the recorded coordinates. Unloading Moss kept the opening frame. After panning and zooming, boarding Moss, waiting and undoing each of those actions also kept the chosen composition. Whole cove opened, and Back to boat returned to the local view. With Harbor offscreen at the closest portrait zoom, tabbing to its marker revealed it without an action.

After rotation from 844×390 to 390×844, three internal projection calculations fitted the new window and controls. The first six animation frames with the resized canvas were frames 344–349. All six reported revision 10 and scale 29.65382170454593. The preceding landscape composition used revision 7.

## Reproduce

From the Git root with Node 24 and the project's Chromium installed, run the focused browser case and related unit checks. The browser test attaches the sample series to its result. The optional receipt directory below keeps a plain JSON copy.

```powershell
$env:LAST_FERRY_REVIEW_DIR = '.cache/android-cove-camera'
$env:FERRY_CAMERA_RECEIPT = '.cache/android-cove-camera'
npm run test:e2e -- tests/e2e/android-cove-camera.spec.ts
npx vitest run tests/unit/story-framing.test.ts tests/unit/story-staging.test.ts tests/unit/view.test.ts
```

The browser case passed in 22.6 seconds. All 31 focused unit cases passed. The first attempt to reach a separately started Vite dev server on port 5441 timed out before the measurement began. The successful run launched Vite and the Playwright runner together, used port 5456 and disabled filesystem watching. The driver read the existing development diagnostics and used the on-screen controls to change the game and camera.
