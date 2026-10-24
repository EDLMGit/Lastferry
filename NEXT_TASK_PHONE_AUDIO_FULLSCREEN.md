# Next task — Phone audio startup and fullscreen reliability

## Active scope and exact baseline

Implement **NEXT_TASK_PHONE_AUDIO_FULLSCREEN.md** as the current task. Read `AGENTS.md` and `docs/PROJECT_STATE.md` first. The prior phone-playability task is implemented; this is its focused functional correction, not another camera or visual redesign.

Repository: https://github.com/EDLMGit/Lastferry  
Branch: `m1-first-crossing`  
PR: https://github.com/EDLMGit/Lastferry/pull/1 — keep draft  
Current reviewed branch HEAD: **`291fb4fa24d02dbab84dfe6eca2abc5c29b6d411`**  
Published game/runtime: **`e78819974a0487440e439ef87d24ba4bb1c2f454`**

The newer HEAD only adds deployment/continuity documentation. Preserve it and any newer/unrelated work; do not reset to the older implementation.

The user reports silence in the first cove and fullscreen not working on Android Chrome. They like the motion and panning. Preserve that direction and the accepted sizing, nearby previews, both orientations, boat headings, wake, puzzles, audio composition/mix and lighthouse.

### Publication is already confirmed

The pasted handoff's “Not deployed” line is stale. The current Site is:

- URL: https://last-ferry-playtest.abumech.chatgpt.site
- Live game: `e78819974a0487440e439ef87d24ba4bb1c2f454`.
- Sites version: **9**.
- Site source: `03720726f2d92cda0d5d66efb6749ccc755d22ee`.
- Audience: unchanged owner-private.
- Deployment record: `reviews/phone-playability/deployment-confirmation.json` at `291fb4f`.

ChatGPT independently retrieved the authenticated game response and production JS. Live `index-BCc7XMds.js` is 749,990 bytes with SHA-256 `4121e54f3b5340e0675b9ab7aa04c5fcd2542607bb56ae47d469671187237636`, matching a fresh local build. No additional publication of identical bytes is needed.

## 1. Fix cold-entry audio activation

### Confirmed source defect

All coves use the same procedural Sound/score. No first-cove-specific missing track was found. Because “first cove” may mean default Holding Pier or optional First Crossing, verify both direct entries without asking the user to resolve that ambiguity.

The current failure chain is:

1. `src/main.ts` around 1290–1318 calls `sound.activate()` on trusted `pointerdown`, including touch. Touch/pen activation belongs to completed `pointerup`/`touchend`; mouse `pointerdown` is different. There is no matching completed-touch audio activation path.
2. `src/audio/atmosphere.ts` around 468–471 memoizes `context.resume()` with `this.resumePromise ??= ...`.
3. A browser-disallowed resume can stay pending, rather than reject. A later valid gesture only awaits the old promise and never calls native `resume()` again.
4. Music scheduling waits for running audio, so this can leave the first document silent indefinitely.
5. The UI only reflects the mute preference. “Sound on” can coexist with blocked playback, and tapping the existing sound toggle in that state first mutes instead of retrying.

A controlled harness using the actual current `Sound.activate()/reconcile()` with a simulated pending context demonstrated: first blocked call plus later permitted activation still produce **one resume call, suspended state, zero scheduler starts**. An explicit second native resume produces running state and one scheduler. This establishes the retry defect in application logic; it is not a physical Android reproduction. Current committed headless phone captures sometimes show running/nonzero output, so do not claim those runs reproduced the policy case.

### Required behavior

- Use a valid completed touch/click or keyboard activation for first audio startup. Preserve mouse and keyboard support and the existing gameplay input fences.
- With saved sound enabled, an ordinary first deliberate game interaction should start audio without requiring a cove change, reload or two sound-toggle presses.
- A fresh trusted user activation must be able to retry native `AudioContext.resume()` while an earlier attempt is pending.
- Keep one audio graph/context and one scheduler. No unbounded retry timer, repeated context creation, autoplay bypass flag or silent-source workaround that avoids the actual retry problem.
- Protect promise identity and generation. Completion of an old request must not clear a newer request, duplicate scheduling, restore sound after mute/hide/disposal, or replay stale movement/arrival/transfer effects.
- Keep saved mute authoritative. Ordinary selection/pan/keyboard interactions must not unmute it.
- Exclude explicit audio controls from generic activation where needed. Their own valid-gesture handler must honor intent: an intended Mute must not first start playback, and an intended Enable/Retry must not first turn the preference off.
- Distinguish user-muted, requested-but-not-yet-running and running states. Use concise, calm recovery copy such as **Enable sound** or **Retry sound** when needed; do not leave the player with a misleading enabled icon and no recovery.
- Preserve the score, gains, victory ducking, wooden contacts, sound ownership and cancellation. This task does not remix or replace music.

A browser legitimately requiring interaction is expected. Permanent silence after the player has interacted is the defect to correct.

## 2. Diagnose and correct fullscreen on the actual surface

### What is established

`main.ts` around 169–196 already calls `app.requestFullscreen()` synchronously from the fullscreen button's click handler. The selected root includes the scene and dialog. `fullscreenchange` reflects actual state. Do not replace these correct properties speculatively.

The committed `browser-cache-final/fullscreen-actual.json` records real localhost Chromium entry, exit and re-entry using touchscreen taps, including `element: app` and dialog containment. It is not a physical Android or hosted-Site result.

ChatGPT's authenticated request to the live game returned the actual 484-byte game HTML, no iframe element, and no `Permissions-Policy` or CSP response header. This rules out an obvious denial in that specific response; it does not establish the policy of an outer embedding page, the user's browser context, or successful fullscreen on their phone.

Interactive hosted verification in ChatGPT remained unavailable because its review browser had no signed-in Site session. No Android reproduction or successful hosted fullscreen test is claimed.

### Required diagnostic path

Determine which failure is happening before choosing a fix:

- Did the button handler run after the trusted user activation?
- Does the API exist, and is `document.fullscreenEnabled` true?
- Is the game a top-level document or embedded?
- Where supported, does the effective document policy allow fullscreen?
- What are `navigator.userActivation.isActive/hasBeenActive` at the request?
- Did the promise reject? Retain the actual error name/message.
- Did `fullscreenElement` become `#app` but the visible layout/browser bars fail to change as expected?
- What were the actual viewport and app bounds before/after and after `fullscreenchange`?

Store a bounded diagnostic result appropriate for development/tests. If the phone-only failure cannot be reproduced, make a small **Copy support details** action available alongside the failure message so the user can provide the relevant facts without developer tools. Keep technical diagnostics out of normal gameplay. Include an honest build identifier and capability/error fields; do not collect credentials or send telemetry.

### Correct behavior and failure handling

- Preserve the synchronous real-user request, full-root containment and actual-state listener.
- Give specific, nonblocking feedback where the cause is known. For an embedded restriction, explain that the game should be opened directly; for an unknown rejection, do not invent a Chrome/platform diagnosis.
- If the API enters fullscreen but layout stays stale, fix the actual viewport/root/reprojection issue. Do not report success only because the button changed text.
- Recompute safe layout on entry, exit and orientation change. Keep action/subset state, dialogs, touch targets, panning and audio coherent.
- Preserve ordinary browser play and the existing exit control, browser Back/Escape behavior and external exits.
- If a supported hosting configuration defect is actually identified, document the exact fix for publication. Do not change access/audience, weaken policy, switch hosts or use a fabricated fullscreen simulation.
- If an external restriction prevents fullscreen and cannot be fixed within the available platform, state that limitation explicitly. Improved messaging alone must not be labeled “fullscreen fixed.”

The current actual-entry browser test has a weak fallback at `tests/e2e/phone-playability.spec.ts` around 725–729: any failure can pass if generic feedback appears, even when capability was enabled. Tighten the controlled supported-local case to require actual entry. Keep unsupported/policy-denied cases separate and clearly identified. The existing committed successful result remains valid; improve the test's ability to catch future failures.

## 3. Keep the three timing checks accurately classified

These are separate from the sound/fullscreen reports:

- **Delivered heading:** a 1.425683-radian change over 99.9ms exceeded the 0.85 threshold. This is an observed frame-delivery/smoothness failure, not merely a timeout. Planner agreement does not erase it. The trace alone does not prove a new planner defect or Android regression.
- **Two rapid-input cases:** sequences took 230.2ms and 377.6ms, missing the intended ≤180ms window. Expected later action state is present, but the active-fence condition was not tested successfully.

Retain the original evidence and these open limits. Because this task changes activation/input handling, re-exercise the affected rapid-input paths with a driver that actually reaches the required trusted-input timing. Do not weaken thresholds, replace trusted events with synthetic DOM clicks, or relabel a missed precondition as a pass.

Keep the heading issue separate. Recheck proportionately if affected or if a concrete performance change is made; do not reopen accepted steering/camera design just to hide software-renderer stalls. Do not claim the whole historical suite is green.

## 4. Focused verification

Run Node 24 build/typecheck and the complete unit suite with the documented bounded worker setting. ChatGPT freshly passed **188/188 units across 27 files** and build/typecheck on the published runtime; this does not cover the newly identified blocked-resume case.

### Audio

1. A first resume that remains pending, followed by a valid retry, reaches running state with one graph/context and one scheduler.
2. Late success/rejection while muted, hidden or disposed cannot restore unwanted sound or stale effects; newer attempt identity remains correct.
3. Cold direct entry to Holding Pier and explicit First Crossing with saved sound enabled. Use trusted touch under a browser configuration that requires user interaction; no preceding mouse activation, pre-unlocked profile or permissive autoplay flag.
4. Verify running context, advancing audio time, scheduler/source bounds and sustained nonzero output over a suitable interval. A single `muted === false` check is insufficient.
5. Saved mute remains silent; one explicit Enable works; requested-but-blocked Retry works without toggling off first.
6. Cove changes, background/foreground, Restart, normal transfer sound, victory ducking and Undo remain correct.

Record whether checks use real browser policy, a controlled context stub or hardware listening. Do not equate graph measurements with speaker approval.

### Fullscreen and phone integration

1. Controlled supported Chromium context actually enters/exits fullscreen on a trusted activation; root and dialog are visible.
2. Separate unavailable, rejected and policy-denied coverage, with a real policy-restricted fixture if available. Label mocked cases.
3. Direct hosted build verification when a permitted signed-in browser is available. Record actual result and environment; local success is not a hosted result.
4. Test first fullscreen activation on a cold page and after audio activation, to catch ordering/input-fence interactions.
5. Rotation and external exit while a subset preview is open preserve choices and reachable Confirm/Cancel.
6. Actual UI Holding rescue, a tide Undo and terminal Undo/redelivery; phone landscape and portrait remain usable. Preserve accepted panning and nearby action behavior.
7. Re-exercise affected rapid-input fences within their stated window and retain unresolved timing evidence honestly.

Commit a compact, readable review under `reviews/phone-audio-fullscreen/`, with actual source/build identity, executed commands, original failures and the exact observed fullscreen outcome. Retain a short actual runtime-audio sample if available; do not manufacture listening approval.

## 5. Completion and workflow

Update `docs/PROJECT_STATE.md` and `STATUS.md` to record:

- The user's positive panning/motion feedback.
- The correct live e788199/version9 publication.
- The audio startup defect and implemented correction.
- The confirmed fullscreen cause/fix, or the exact remaining reproduction/platform limit.
- The separate timing-check status.

Make routine implementation decisions without repeated permission. Finish the audio correction and all supported fullscreen investigation/fixes before handing back. Do not declare full resolution if the phone fullscreen cause remains unknown.

Commit and push on `m1-first-crossing`. Update PR #1, keep it draft, leave `main` unchanged, and do not force-push. Return the exact final SHA, remote equality/working-tree status, evidence links and honest results.

The existing private Site already serves e788199. This new corrective SHA is separate: ChatGPT reviews it and publishes the reviewed correction to the same Site. Do not claim a GitHub push deployed it.

## Primary references

- [MDN user activation](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation) — mouse versus completed touch activation.
- [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay) — Web Audio startup after interaction.
- [Web Audio resume algorithm](https://webaudio.github.io/web-audio-api/#dom-audiocontext-resume) — a disallowed resume may stay pending.
- [MDN requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen) — user activation and request results.
- [MDN fullscreen Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/fullscreen) — effective server/frame restrictions.

The source findings establish the retry defect. The link between that defect and this particular physical phone report is a strong diagnosis to verify, not a claimed hardware reproduction.

