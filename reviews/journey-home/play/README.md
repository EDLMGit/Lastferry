# The whole Journey at the helm

[Enter through fresh Home](http://127.0.0.1:5420/). Direct cove links start independent Practice.

## The two invitations

| Real Journey frame | Native portrait, 390×844 | Native short landscape, 780×320 |
| --- | --- | --- |
| The last lights, after the ninth accepted delivery | [Cloth, table and waiting light](390x844/last-lights.png) | [Harbor table](780x320/last-lights.png) |
| A place for the captain, after the final delivery is accepted | [The place at the table](390x844/captains-place.png) | [The supper at rest](780x320/captains-place.png) |

[Uninterrupted supper replay and credits with runtime audio](390x844/supper-to-credits.mp4) · [Capture identity, timing and audio](MEDIA.json) · [All twelve rescues, checkpoints and frame hashes](voyage.json)

## Playing and checking the route

This run signs in to no service and begins with an empty browser storage area at Home. Each crossing uses the existing first solution witness as a route to try through named controls. On every committed action, the observed turn, tide, current stop, load and home count are checked against the production reducer. Each arrival lists all required neighbors. The route record includes the expected action, roster and deliveries along with the actual checkpoint read at each boundary. No development state hook or record injection is used.

The opening eight chapters use the system Reduced Motion preference. The final four use normal motion. The player pauses at Lantern Buoy for an extra action on the final trip, undoes the last delivery, then brings the same four neighbors home again. Before Continue story, the Journey checkpoint still belongs to the cove. The later arrivals are unrated and the previously earned mastery record stays byte-identical. After the supper is first seen, the browser reloads while it is still pending. The resumed scene holds for the player, who replays it, lingers, then explicitly enters credits and uses the independent Practice selector.

The first recording begins at Harbor after terminal Undo. The four neighbors disembark on the player’s command; the player accepts the rescue and the first supper unfolds. [Final delivery and first welcome](390x844/delivery-to-supper.mp4)

The second recording begins at the restored pending supper, after the twelve rescues. Both films sample the actual native Chromium viewport and record the game’s simultaneous stereo output. The measured intervals between screenshot requests are retained. The action and checkpoint log covers the complete rescue route.

In the first complete rehearsal, the event-driven screencast stopped delivering frames about five seconds into an eleven-second welcome. The audio, UI assertions and separate credits screenshot continued. For the release, timed native screen captures span each complete sequence, including the last held frame. The first capture attempt is excluded from the release movies.

The first complete build placed the small lantern landing against pink sky above the hills. The final composition puts water beneath the far bank. [First portrait](first-pass/last-lights-390x844.png) · [First short landscape](first-pass/last-lights-780x320.png) · [Original build and frame hashes](first-pass/evidence.json)

The first run on the frozen source played to the supper. Its image shows the beam crossing the table. The test read the canvas again after the screenshot request returned, by which time the shot had settled. Both later hashes matched and the assertion failed. The repeated fresh run started observing the real canvas before the player accepted the final delivery. It sampled during the welcome independently of screenshot encoding and checked that the held endpoint stayed still. [Original assertion](first-pass/frozen-first-capture-failure.json) · [Original frame](first-pass/frozen-first-sweep.png) · [Source and hashes](first-pass/frozen-first-evidence.json) · [Browser animation samples](welcome-motion.json)

## Verified on the release build

The fresh run reached credits, entered independent Last Ferry Practice at turn zero and reopened the acknowledged credits from Home in 259 seconds. It used 139 committed inputs and two successful Undos. It checked 40 checkpoint observations and 16 native screenshots. Drowned Orchard, Lantern Reach, Far Shore and Last Ferry finished in 13, 13, 13 and 8 actions respectively. There were no uncaught page errors. [Measured results and source identity](verification.json)

The browser observed 21 distinct moving supper images over 8.16 seconds of active playback, followed by the held endpoint. The 13.856-second delivery-to-supper film includes the passenger chooser, actual disembarkation, unrated arrival, explicit continuation, moving beam and held table. Its longest gap between native captures was 0.921 seconds. In the 19.074-second replay-to-credits film, the long gaps from 2.728 to 9.388 seconds and from 9.388 to 14.965 seconds span the replayed motion. That movie holds individual images during those intervals. Its explicit credits handoff remains visible at approximately 17 seconds and its final image shows the actual credits. Both files decoded completely with their original-level runtime audio in stereo. [Portrait credits](390x844/credits.png) · [Short-landscape credits](780x320/credits.png)

## Reproduce

With Node 24, install the locked dependencies and run `npm run build`. Serve that directory with `npm run preview -- --port 5420 --strictPort`. Set `REACH_DIST=dist` for that build, then run:

```sh
npx playwright test -c reviews/journey-home/play/config.ts
node reviews/journey-home/play/encode.mjs
```

The test also accepts `JOURNEY_HOME_URL` for an alternate minified preview and `LAST_FERRY_REVIEW_DIR` for an alternate output directory. Chromium touch emulation and software WebGL were used. Physical Android, assistive-technology listening and an independent fresh player's reaction are separate playtests.

The first driver rehearsal against the preceding eight-cove build tapped Next twice in the double-tap rejection window. The opening correctly stayed on its second shot. Checking the shot number and allowing distinct taps yielded a complete Home-to-Ternhaven rehearsal in 54.2 seconds. Those rehearsal results belong to the eight-cove build.
