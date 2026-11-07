# Authored scenes for this task

These are the complete scenes in `STORY_PRODUCTION_01`. Line breaks below are intentional reading groups; layout may wrap within a group. The future campaign is direction only.

## Opening — `opening`

**Title:** The first evening  
**Destination:** `holding-pier`  
**Final action:** Take the helm

### Shot `tide` — approximately 6 seconds

**Image:** The lower shoreline steps, a marked post and quiet water. The water rises to cover the low step. Pip and Rue remain on a visibly higher, safe landing. Follow the approved wide composition and its portrait recomposition.

**Caption:**

> Your first evening at the helm.  
> A high tide ahead.

**Sound:** One soft finite tide wash tied to water reaching the lower step. The event is illustrative; it must not invoke a gameplay tide change.

**Held endpoint:** The change in the waterline is clearly visible, the caption remains, and Next is available. Do not leave the animals apparently stranded in newly simulated danger.

### Shot `lantern` — approximately 6 seconds

**Image:** Close view of Rue, tan on the left, and Pip, cream on the right. Rue lifts the lantern deliberately. Its warm light catches both faces; Pip responds through the reference's modest attentive pose. Preserve the actual supplied art and gesture.

**Caption:**

> Pip and Rue have kept a light for you.

**Sound:** One soft wooden/handle contact on the lift or its visible settling point. It should support the gesture rather than sound like a passenger boarding.

**Held endpoint:** Rue holds the lantern; both faces are recognizable. No perpetual bouncing.

### Shot `ferry` — approximately 7 seconds

**Image:** The yellow ferry with its red cabin approaches through open water. Moss is aboard. The lighthouse remains a clear destination, with warm light reflected in the water. Follow the approved framing and finite approach.

**Caption:**

> Moss is aboard.  
> Bring everyone to the lighthouse.

**Sound:** One finite hull/water approach, using the accepted sound texture. Do not set the persistent gameplay travel flag or play the arrival cue.

**Held endpoint:** Ferry, Moss and the lighthouse read together. **Take the helm** is available immediately on this shot, even while its action is running. Activating it acknowledges the scene once and starts the original Holding state.

### Opening continuity

The three pictures are a narrative prelude, not a reconstruction of three puzzle turns. Do not animate a rabbit boarding, unloading or walking along a newly invented path. The illustrated ferry's approach does not relocate the puzzle ferry.

Cut cleanly into the actual Holding start: ferry at Stone; Moss aboard; Pip and Rue together at Rabbit Pier; tide 0; turn 0. A short visual transition is acceptable, but do not distort geography to manufacture a continuous camera move into a different scene.

## Harbor connection — `another-bell`

**Title:** Another bell  
**Destination:** `bellwater`  
**Final action:** Continue to Bellwater

### Shot `harbor` — approximately 5 seconds

This is one new composition using the approved visual language. It follows explicit acceptance of Holding's completed rescue.

**Image:** A close view of the protected Harbor landing, with the warm lighthouse welcome readable in the background. Pip, Rue and Moss are safe. Rue lowers the lantern onto the high landing, preserving her ownership of it from the opening. Pip turns toward the ferry and open water; Moss settles nearby. The ferry is empty and waiting. A small distant light suggests the next community rather than a new active puzzle objective.

**Caption:**

> Pip, Rue and Moss are safe.  
> Bellwater is still waiting.

**Sound:** One finite lantern contact as Rue places it. Preserve the music lifecycle. Do not replay the victory cue or the preceding rescue's unloading contacts.

**Held endpoint:** A quiet little gathering, lantern placed, ferry waiting. Let the image rest. **Continue to Bellwater** is available immediately and explicitly acknowledges the scene once.

**Continuity:** Pip, Rue and Moss remain rescued. They do not board again for Bellwater and do not become its waiting group. The next puzzle already has its own neighbors and rules.

## Shared caption and timing rules

Normal motion: current caption begins around 1,050ms and becomes fully visible over approximately 240ms. Reduced Motion: caption and composed endpoint are immediate. For both modes, all text is available from the first frame in Read story.

These visual durations are not lockouts or narration durations. The player can proceed immediately or read as long as they want. A later recording must be auditioned at a natural pace; it must not be sped up simply to fit the visible motion. A held shot can continue to hold after its animation stops.

Stable narration IDs and the exact recordable copy are in `../audio/narration-script.json`. Voice assets are absent in this package.
