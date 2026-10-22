# Last Ferry — wooden transfer sounds and Android playtest

## Goal

Give boarding and unloading a small, satisfying physical presence: quiet wooden taps as the animals cross onto or off the ferry. Preserve the accepted score, accompaniment, water, camera, location selection, sailing pace and all three puzzles.

The current game is already published for the user's private Android playtest:

https://last-ferry-playtest.abumech.chatgpt.site

That deployment contains the current selection build, before this sound task. The user remains the playtester. Their first real-device observations should guide subsequent visual or performance work.

## Starting point and workflow

- Repository: https://github.com/EDLMGit/Lastferry
- Branch: `m1-first-crossing`; PR #1 remains draft.
- Reviewed starting commit: `fa07368b803a992712a5126b85862c5b91dbcf3a`.
- Use Node 24 and the existing architecture and dependencies.
- Read `AGENTS.md`, the current `docs/AUDIO.md`, and the relevant selection review. Preserve any newer user work; do not reset a checkout to this SHA if it has advanced.
- Implement, verify, commit and push normally to the existing branch, then update the existing draft PR with the review handoff. Do not merge or alter main.

Complete the scoped work autonomously. Make routine implementation and mix choices without requesting repeated approval.

## Creative direction

The boat should feel like a little wooden object carrying living passengers. Use a soft contact with a rounded body, followed where the motion supports it by a quieter settling tap. A rabbit may be lighter and a sheep slightly lower and fuller; use that distinction only if it improves the actual mix.

The sounds should be audible at a comfortable phone-speaker volume beneath the music. Keep them brief and dry, with just enough space to belong in the cove. Avoid sharp interface clicks, exaggerated creaks, cartoon animal voices, continuous footsteps, or another musical reward. The existing Harbor arrival phrase already provides the emotional resolution.

Tune by listening to the actual runtime mix. An original procedural effect using the existing audio graph is a good fit. Use cached resources and bounded short-lived voices; no new dependency or large audio framework is needed.

## Source findings to act on

At the reviewed commit, `src/main.ts` calls `sound.play()` for ordinary boarding/unloading from `world.onPresentationStart`, but `src/audio/atmosphere.ts` only handles `move` and `arrival`. The transfer actions therefore produce no sound. Final unloading is deliberately excluded from that start callback, so handling only those existing calls would miss the final delivery.

The committed state changes before the animation. The actual passenger transfer paths live in `src/scene/world.ts`, around the branch that animates passengers whose aboard membership changed. Use that visual timeline to emit a small contact cue at meaningful progress points. Do not bind the wooden sound to Confirm, the reducer, or a generic state change.

Normal transfers last 520 ms, final unloading 900 ms, and reduced-motion actions 30 ms in the reviewed timing definitions. Derive contact timing from the actual transition rather than duplicating wall-clock delays. Reduced motion should have one quiet compact cue, not a compressed burst of footsteps.

Passengers currently transfer concurrently. Combine near-simultaneous contacts or bound their total level so a group does not multiply the loudness. Do not change the animation or stagger passengers solely to serve the new sound.

## Implementation requirements

1. Cover boarding, temporary unloading at a holding pier, partial unloading, partial Harbor delivery and final Harbor delivery. Only the selected passengers actually transferring should contribute.
2. Place wood contacts while the animal crosses or settles on the wooden surfaces. Do not continue wooden steps after the animal reaches land.
3. Consume each visual contact once, including while muted. Unmuting must not replay missed contacts. A delayed frame or visibility recovery must not produce a catch-up burst.
4. Use the existing `Sound` instance, effects routing, master mute and owned-source cleanup. Do not add another AudioContext, music clock or interval scheduler.
5. Preserve the existing delivery timing and phrase. At present `delivery()` clears all sources tagged `effect`, and `arrivalActive` also treats that category as arrival. Refine ownership narrowly if necessary so arrival cannot accidentally truncate transfer sounds, transfer sounds do not masquerade as arrival, and cancellation can still stop both. Do not redesign the whole mixer.
6. Keep the new voices bounded and promptly released. The existing score has an owned-source limit; transfer effects must not cause score notes to be dropped or accumulate after repeated actions.
7. Integrate with Undo, Restart, interrupted/recovered transitions, live mute, tab hiding and teardown. Undo restores the scene silently. Repeating a real transfer after Undo plays its cues once again. Cancelling a preview produces no transfer cue.
8. Free selection, hovering, passenger-subset changes, invalid actions and opening dialogs remain silent with respect to these contact sounds.

## Android scope

Do not wait for physical-phone access to implement the sound task. Do not claim an Android pass without an actual device test.

There are two known verification gaps to keep explicit:

- Existing phone screenshots and timings use 780×390 or 844×390 at DPR 1. Real browser bars, display cutouts and display density differ.
- `.game` currently has `min-height: 360px` with a non-scrolling body. Check one shorter landscape viewport, such as 780×320, alongside the established phone size. Confirm the lower forecast, location actions and modal controls stay reachable. There is no safe-area inset padding despite `viewport-fit=cover`.

If this focused check reproduces clipping, make the smallest layout correction and verify it against the existing phone size. If the user supplies an actual phone problem, reproduce and fix that concrete issue. Otherwise preserve the interface and record the remaining device gap. Do not introduce speculative graphics settings, new shader effects, a PWA, offline caching, service workers or a native wrapper in this task.

## Verification proportional to this change

- Run the production build/typecheck and the unit suite. Extend the relevant audio/transition tests only where they protect a real new failure mode.
- Exercise actual UI boarding, temporary unloading and final Harbor unloading, including a passenger subset, one Undo/replay and reduced motion. Confirm contact events occur at most once and are tied to actual presentation rather than preview/commit.
- Check live mute and a hidden/interrupted transition for stale sounds, then verify source counts settle back after tails. Preserve the musical clock and delivery behavior.
- Complete one real-interface rescue and an Undo across a tide rise. Use the established phone landscape size plus the one short-viewport check if browser tooling permits.
- Listen to the actual mix. If recording is available, retain a short gameplay clip with runtime audio that includes boarding, holding-pier unloading and Harbor delivery. A silent recording or a synthetic oscillator trace is not listening evidence. Report an unavailable capture/listening capability honestly.
- Do not rerun unrelated broad visual or performance campaigns unless a concrete regression warrants them. Retain original failures and their actual status; do not label an incomplete suite as fully passing.

## Handoff

Update `docs/AUDIO.md` and `STATUS.md` as needed. Put a compact report under `reviews/transfer-audio/` identifying source SHA, changed behavior, exact checks, audio evidence and limits. Keep raw media out of Git, as before.

The handoff must include the pushed SHA, draft PR URL, current rules/music preservation, actual listening outcome, and any phone-specific issue observed. Include the actual phone model/browser only if a physical test occurred.

The existing Sites deployment is managed separately as a snapshot of reviewed GitHub commits. Do not create another Site or maintain a separate gameplay fork. After this handoff is reviewed, the same playtest URL can be updated to the new source. Do not describe the current live URL as containing these new sounds until that deployment has succeeded.
