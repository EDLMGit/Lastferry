# Windows WebKit phone-profile playthrough

The [receipt](webkit.json) identifies the tested JavaScript and CSS by SHA-256. Playwright 1.64.1 launched its Windows WebKit build 2370, which reports WebKit 27.2, with the iPhone 13 profile. The portrait viewport was 390 × 664 CSS pixels. Landscape was 750 × 342. The profile's device pixel ratio was 3.

The test tapped Play from an empty Home, chose Reduced motion in Options and sailed Holding Pier. It boarded Pip and Rue across a tide rise, tapped Undo, compared the restored turn, location, occupants and tide, then replayed the action. All three passengers arrived in nine actions. Rue’s Lantern awarded 2/3 with one Undo. Continue to Bellwater opened Another bell and reached Bellwater on turn zero. Reloading the page returned to Home. The Harbor log retained Rue’s Lantern, Options retained Reduced motion, and Continue reopened Bellwater. The receipt includes trusted touch events observed by a passive listener.

| Browser capture | What to inspect |
| --- | --- |
| [Fresh Home](webkit-home-portrait.png) | Play and Options, lighthouse and water |
| [Holding Pier in landscape](webkit-holding-landscape.png) | Moss at Stone Pier after disembarking, the ferry, crew and tap targets on a second fresh landscape launch |
| [Rue’s Lantern in landscape](webkit-rue-landscape.png) · [portrait](webkit-rue-portrait.png) | Award, lantern count, continuation and replay choices |
| [Returned Bellwater](webkit-bellwater-portrait.png) | 3D cove and the turn-zero crew after reload and Continue |

The Windows port reported zero environment safe-area insets. A separate layout check applied 47 CSS pixels at both landscape sides and 21 at the bottom, waited for the dialog to settle, and measured the hit targets for Continue, Replay, Undo and Details. Real taps and visual viewport dimensions were also checked at the profile's default insets. A physical phone can supply different browser chrome, insets and available height.

## Windows-specific observations

The Windows WebKit host did not expose a Web Audio context or an element-fullscreen method. The real sound button showed the retry message, Retry remained available, and Mute worked. Fullscreen explained that play could continue in the browser. These checks cover fallback behavior. Hearing the mix, physical sound-switch behavior and interruptions require Apple-device testing.

After resizing a live WebGL drawing buffer on this Windows port, the displayed 3D area became solid teal. The HUD, game, hit targets and 2D story art continued to work. A headed test captured the same result from the actual Windows test window. The resized framebuffer contained thousands of colors after a draw. A separate two-color WebGL example reproduced the same display issue on resize. Fresh portrait and fresh landscape launches painted the cove, as did entering Bellwater with a new canvas. The landscape cove capture above comes from its own fresh context. Rotated controls and the return to Bellwater were exercised in the original context.

## Repeat

Run these commands from the repository root in PowerShell. Use another terminal for the last command while the preview is running. The output directory below keeps repeat captures local.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.cache/ms-playwright'
node node_modules/@playwright/test/cli.js install webkit
npm.cmd run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5421 --strictPort
node reviews/ios-playtest/webkit.mjs http://127.0.0.1:5421/ .cache/ios-playtest/repeat
```
