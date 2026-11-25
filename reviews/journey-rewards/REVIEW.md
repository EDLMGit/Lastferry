# Journey rewards · private Android v0.1.5

The owner’s v0.1.4 playtest ended Moss’s trip at Home. This update gives the illustrated page a single destination button. On the first detour it opens *Another bell*. Later in the game it follows the captain’s current Journey checkpoint.

The game source is `89a05f41a8f96a0c4f2f2b2045d9dca077de3269` on `m1-first-crossing`. The clean v0.1.4 handoff was fast-forwarded to the commission at `a5baf15857f0631cb0eb86c08c645f44361fab09`. [Brief](../../NEXT_TASK_JOURNEY_REWARDS.md) · [Install over v0.1.4](android-INSTALL.md) · [Signed package identity](android-package.json)

## What changed for a captain

- The first Journey rescue shows Rue, Pip and Moss at Harbor. Its two choices accept the rescue. **Continue to Bellwater** opens the next scene. **Take Moss’s request** saves the same checkpoint and opens Holding Pier for his trip.
- The first qualifying result gives the solo illustration the largest space on the card. **Details** holds the counts and lantern comparison. Closing, reading Details and using Undo keep the result provisional. Keeping the page preserves the stronger best.
- Missing the request offers another try or a return to the saved Journey. A repeat win shows the rescued neighbors. A saved cove reopens at its beginning, a saved scene opens at that scene, a pending supper opens at the lighthouse table, and a completed Journey returns to the log.
- The Harbor log opens rescued Journey coves. Older lantern bests stay readable. A saved First Crossing best opens the standalone crossing without adding a thirteenth Journey chapter. Unreached direct links open Home. After credits the log remains available.

## Production web checks

The browser walks use touch-enabled Chromium with Reduced Motion. The first rescue and the twelve-action request run from fresh Home. The later-captain, supper, credits and historical-best cases use explicitly initialized browser saves. Each crossing is played using the rendered controls.

The production build typechecked. All eight browser checks and 799 unit tests in 70 files passed. The asset catalog validated 83 families. All 13 files served at the preview URL match the portable web archive and the signed APK byte for byte. APK SHA-256 `dba12159d6fdc3ffd37152d63c611e4957a635be7517be5834ee94b19ee5a5a4`. Web ZIP SHA-256 `b69a45cdeda2e32bfd0b17056246527e7c16d154bca3851a83e3fe677c316786`.

| What the check exercises | Evidence |
| --- | --- |
| The illustrated card and its primary action fit on first paint in portrait and short landscape. The request choice, Undo and Details are also fully visible. | [Rue · 320×740](web/rue-320x740.png) · [Rue · 780×320](web/rue-780x320.png) · [Moss · 320×740](web/moss-320x740.png) · [Moss · 780×320](web/moss-780x320.png) |
| Taking Moss’s request saves Bellwater. The qualifying run undoes the rabbit delivery and later undoes the terminal win. After redelivery, two taps at the destination leave the next story control for the captain. | [Another bell](web/another-bell.png) · [Bellwater at turn zero](web/bellwater-zero.png) |
| A fresh profile given a finale link with QA query parameters enters Home with zero earned coves. The log offers no revisit, and the crossing menu has no all-coves picker. | [Fresh log](web/fresh-log.png) · [Fresh crossing menu](web/fresh-menu.png) |
| A missed request preserves the eligible best. Retrying, qualifying and continuing return to Driftwood for a later captain. A qualifying original rescue awards both pages with one celebration. Supper and credits remain reachable after revisits. | [Production interaction tests](../../tests/e2e/harbor-log.spec.ts) |
| When a real browser storage write throws, the destination shows the saving issue. Retry writes the keepsake, clears the message and retains the pending story. | [Browser results and artifact hashes](web/verification.json) |

### Reproduce

Use Node 24. From the Git root run `npm ci`, `npm run build` and `npm run preview -- --port 5421 --strictPort`. The portable web ZIP can also be extracted and served with `python -m http.server 5421 --bind 127.0.0.1` from the directory containing `index.html`. The preview uses the same local origin as the v0.1.4 handoff, so an existing browser profile can continue its save.

```powershell
$env:LAST_FERRY_DEV_PORT='5421'
$env:LAST_FERRY_PRODUCTION_PORT='5421'
$env:LAST_FERRY_REVIEW_DIR='.cache/journey-rewards/shipping'
$env:JOURNEY_REWARD_FRAMES='reviews/journey-rewards/web'
node node_modules/@playwright/test/cli.js test harbor-log.spec.ts '[/\\]production\.spec\.ts$' --output=.cache/journey-rewards/shipping-results
npm run test:unit -- --maxWorkers=1 --testTimeout=20000
npm run check:assets
```

For level-authoring checks, an explicitly enabled QA web build accepts direct links to every cove. In PowerShell, set `$env:VITE_LAST_FERRY_QA='1'` for that development server and open an explicit cove link. The normal web build uses earned access, and Android packaging pins the QA flag off. Archived playtest scripts in earlier reviews describe their source-pinned builds.
