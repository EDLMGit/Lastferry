# Story presentation — approved direction

## The feeling to preserve

The story is a little illustrated book that opens inside the cove. Its subjects are close enough to recognize, its movements have a visible purpose, and its words give the player a moment to understand the image. The art should feel related to the playable world: teal water, dusk lavender and peach, cream and tan animals, a yellow ferry with a red cabin, and small warm lights.

The approved opening is `../reference/approved-opening.html`. The exact fragment and editable painter are supplied beside it. Keep the reference's actual composition, forms, color relationships, finite motion and typography. This pass integrates an accepted design; it is not a request to invent another visual style.

## Three compositions, three readable actions

The opening moves from **the coast changing**, to **someone waiting**, to **your ferry answering**. Each shot has a different distance and focal point. The close view of the rabbits is essential: a small head movement on the far side of the gameplay map cannot do the same storytelling work.

1. Water covers a lower step and part of a marked post. The higher landing remains safe. This establishes the tide without putting the player under a real-time deadline.
2. Rue raises a lantern while Pip waits beside her. Warm light catches their faces. The greeting is broad enough to notice, then settles.
3. A larger view of the ferry and Moss approaches through open water, with the lighthouse present. The composition gives the task a destination.

Keep Rue tan and on the left, Pip cream and on the right across the opening. Keep Moss recognizable as the existing sheep. The scene conveys their identity and relationship; it does not introduce a new passenger pose or state into the puzzle.

## Text belongs to the composition

Use real HTML, not text baked into the canvas. Keep the approved serif treatment for narrative captions and the game's familiar control typography. The reference uses Georgia with a serif fallback; adopting it does not require a font download.

- On desktop and landscape, use the quiet area beside/above the focal action, as in the reference.
- On portrait, attach the deep teal reading area below the artwork. Recompose the art rather than shrinking the entire wide frame.
- Keep the whole current caption together. No typewriter, one-word-at-a-time reveal or text that disappears before the player chooses Next.
- In normal motion, allow approximately 1.05 seconds for the image to establish itself, then fade the complete caption in over approximately 240ms.
- Hold caption and finished image indefinitely. The caption is not an automatic timer for the next shot.
- Read story exposes all copy immediately. Reduced Motion shows the still endpoint and caption immediately.

The reference's body sizes are approximately 22px on portrait, 23px on short landscape and 27px on desktop. Treat these as visual anchors, not a reason to overflow the production viewport. Reflow, reserve caption space and simplify surrounding chrome before making essential text smaller.

## Controls and pacing

Use one primary Next or final handoff action in a stable location. Secondary controls are Replay, Skip animation and Read story. Preserve the existing Sound/Motion settings and native focus behavior. Keep settings within the app's existing modal owner; do not stack a new unrelated dialog over it.

The default story is player-paced. A shot performs one finite action, rests, and waits. Next is available immediately, including before the caption cue. Replay restarts that shot. Skip settles the scene and exposes the complete text; it does not silently enter gameplay.

The browser reference has Play story and Finish/Replay story controls to make it a self-contained study. Those controls do not belong to the real journey. Begin journey should enter the first picture directly; Take the helm should enter Holding.

## Motion and framing

Movement should be easy to name: water rises over a step; Rue lifts the light; the ferry approaches. Keep the soft wave and glow treatment subordinate to those actions. Avoid endless bobbing, particles or flashing that keep competing with the words after the shot is complete.

Retain the approved painter's finite endpoints. At a held endpoint, stop unnecessary drawing. A future scene can have its own purposeful action without repeating these three movements.

For short landscape, deliberately redistribute art, caption and controls across available width. For portrait, give the character or ferry enough image area to read. All primary controls must fit inside the actual visible game viewport with safe areas. The standalone reference is not proof that the phone game's fullscreen or browser chrome fits.

## What success looks like

From the real journey entrance, a phone player can tell what changed in each shot, recognize the waiting animals, read comfortably and take control without waiting for a timer. With sound off or motion reduced, the same story remains complete. Returning to the playable cove should feel like entering the world just introduced, with exactly the original puzzle state.
