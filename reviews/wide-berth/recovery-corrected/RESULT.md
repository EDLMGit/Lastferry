# Focused boundary and recovery check

Command (Node 24.15.0, Windows, Chromium/SwiftShader, emulated touch, 390×844):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='../.cache/ms-playwright'
$env:LAST_FERRY_DEV_PORT='5270'
$env:LAST_FERRY_PRODUCTION_PORT='5276'
$env:LAST_FERRY_REVIEW_DIR='reviews/wide-berth/recovery-corrected'
npm run test:e2e -- wide-berth.spec.ts --grep 'launch repeated handoff'
```

**Passed 1/1, 23.8 seconds**, in `../gates/browser-recovery-corrected.txt`. The source and executed-fixture manifests in this directory identify the exercised working tree. Fresh standalone TypeScript checking also passed (`../gates/typecheck-recovery.txt`). Runtime code was unchanged.

- From the exact historical three-cove completion fixture, Continue freshly starts the launch; the final explicit action is immediately available.
- Two actual trusted touch activations were delivered 494.5ms apart. The first hit `story-continue`; after the interface changed, the second hit the free `status-toggle`. Exactly one launch acknowledgment was stored and no gameplay turn was consumed. This does **not** verify the inherited ≤180ms bound. The fixture closes that free forecast before continuing.
- Actual group boarding followed by the actual Restart crossing control restores Wide Berth's initial state, history and pose history. The accepted cove-boundary checkpoint bytes remain unchanged.
- A direct Wide Berth Practice entrance preserves those bytes. The actual menu cove picker navigates to Holding Pier; after two seconds its original four-space profile, turn zero, passengers and empty history remain, with no story and no stale wake. Storage remains unchanged. No page errors were observed.

Originals retained: the first exploratory wrapper was explicitly stopped after its second tap opened the free forecast and blocked the next scripted map action. Its process tree was identified before termination; `../recovery/stopped-fixture-processes.json` records only that test tree. The subsequent `../recovery-final/` run passed Restart but failed when the fixture queried the development bridge during cove navigation before the new document initialized. Its log and `../original-failures/recovery-navigation-bridge.md` are preserved. Waiting for the actual target URL and new document bridge corrected the fixture; no application behavior or assertion was weakened.

This check complements the earlier uninterrupted rescues and unit recovery coverage. It does not establish hardware rotation, physical-phone audio, acoustic cancellation quality or a new universal rapid-input guarantee.
