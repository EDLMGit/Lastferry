# Original attempt results

Two cases failed; the JSON report and copied error contexts retain the original results.

- Holding reached gameplay, with the story timeline `scene: null`, but the fixture incorrectly required the reusable hidden dialog's `story-continue` element to be detached. Corrected to require it hidden. No gameplay defect is inferred.
- Driftwood timed out after 240 seconds. A source comparison shows `src/scene/seabed.ts` changed during this development-server run, and browser logs show a Vite reconnection. This is not valid final same-source evidence. The final snapshot shows play at High Mooring; the rescue was not verified. The original error context is retained. A subsequent run uses frozen runtime inputs, bounded locator timeouts and per-action diagnostics.

The timeout is not claimed resolved merely by identifying source change. Only the subsequent actual rescue can establish the focused behavior.
