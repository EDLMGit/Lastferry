# Home screen — a quiet, living cove

**Design reference for `NEXT_TASK_HOME_PLAY_FLOW.md`**  
**Reviewed baseline:** `d532c62f0f25854387869466572a1ed0cf35a0ac`  
**Implementation environment:** Node 24

This document supplies the home-screen direction within the one combined current task. It is not a separate implementation assignment. The named task also includes automatic story playback, music investigation and simpler passenger interactions.

## 1. The first impression

Use the existing live 3D cove as an authored title composition. Let the accepted luminous teal water, yellow ferry with its red cabin, islands and warm lighthouse introduce the world before the player begins. Reuse the actual game assets; no new generated background image or second renderer is required.

The visible hierarchy is:

**LAST FERRY**  
*The Long Tide*

One prominent **Play** or **Continue** action, followed by quieter **Options** and **Practice** controls. Sound state stays easy to reach. Fullscreen remains available through the existing supported flow.

The home is a full-screen composition. Give the title and actions quiet space without placing a large opaque modal over the cove. A restrained local gradient or soft backing may support contrast. Keep the ferry, lighthouse and water visible around the controls. Omit feature lists, build details, advertising-style sections and unimplemented extras.

## 2. Compose for the phone

### Landscape and desktop

Reserve a quiet left-hand region for the title and menu. Frame the ferry and lighthouse within the remaining art area: the ferry should read in the foreground and the lighthouse should establish the destination. Use measured menu bounds and the camera's usable rectangle rather than moving puzzle objects to make room.

At **780×320**, use width deliberately: a compact menu column and scene beside it. Keep the complete primary action, secondary controls and necessary save-state copy within the visible viewport and safe areas. Preserve readable text and approximately 44–48px effective touch targets.

### Portrait

Place the title near the top, a substantial view of the cove through the middle, and actions in the lower portion. Options and Practice may share a secondary row. Recompose camera framing for the available art area instead of scaling a wide desktop layout down.

Protect both ferry and lighthouse from controls. Keep the background visually meaningful at **320×740** and **390×844**, including when Continue has a short destination/checkpoint explanation. More extensive recovery text can use the existing accessible secondary treatment; essential state and actions remain visible.

## 3. Type, color and controls

Render the title as real HTML text using the approved narrative serif direction, with a restrained subtitle. Use existing control typography and cove components for actions.

- **Play / Continue:** the existing warm rounded action capsule, clearly dominant.
- **Options / Practice:** quieter teal controls with the established soft raised treatment.
- **Sound / fullscreen:** existing utility icons, accessible names and adequate touch areas. A sound state that requires Enable or Retry needs an understandable action, not an ambiguous decorative icon.
- **Focus:** preserve the existing visible warm focus treatment and natural keyboard order.

Keep labels concise. The home should communicate a place and an invitation. Explain checkpoint behavior where it affects a decision, without making the normal screen a block of technical instructions.

## 4. Entry and navigation states

| State or action | Required presentation and meaning |
| --- | --- |
| No saved journey | **Play** begins the opening directly after the deliberate activation. Opening the home alone does not create progress. |
| Valid unfinished journey | **Continue** uses the existing checkpoint. Name the destination and state when it restarts a cove from its beginning; do not imply mid-puzzle resume. |
| New journey with existing progress | Offer **New journey** secondarily and preserve confirmation before replacing the saved journey. Sound/Motion preferences remain separate. |
| Both available coves completed | Show honest completion of the available content and offer **Play a cove** / Practice. Keep New journey available. Do not present the planned whole campaign as finished or playable. |
| Options | Open the existing shared Sound/Motion/fullscreen settings inside the app's established dialog/fullscreen surface. Closing returns focus to Options. |
| Practice | Preserve independent cove selection and `?cove=` review entrances. Practice does not overwrite campaign progress. |
| Sound | Expose current intent and Enable/Retry/Mute through the existing audio owner. Respect remembered mute. |
| Fullscreen | Reuse supported native behavior and honest unavailable feedback; never make it a prerequisite for Play. |
| Invalid/unavailable save | Preserve the existing recovery and storage disclosures, including confirmation before replacing retained invalid bytes. |
| Return home during a crossing | Preserve the current warning that leaving discards the in-session crossing and Undo history. Do not introduce or imply a new mid-puzzle save system. |

The main task defines exact continuation and story semantics. Keep the current save schema, explicit final story acknowledgment and rescue acceptance boundaries.

## 5. Restrained life and a clean transition

Use the accepted water motion and subtle ferry movement. Keep the home camera still after framing. Give the lighthouse a steady welcoming glow using its existing base illumination or a clearly owned home-only presentation treatment. Do not set the game to won, invoke homecoming, spin the victory sweep or play arrival audio to decorate the title.

Reduced Motion presents a composed static home. Home idle never advances the tide, sails the ferry, transfers passengers or produces travel/wake events. Pause unnecessary background work when hidden or fully covered by the story.

Play should provide a brief button response and clean transition into the illustrated opening. Avoid an extra tap-to-start screen, second Play prompt or forced camera flight. Request audio activation from that deliberate gesture, preserve the accepted continuous score, and retain visible retry behavior if needed.

## 6. Presentation ownership and inventory

The existing `.journey-screen` CSS hides DOM gameplay controls but does not hide Three.js navigation decoration. `setStoryFraming()` changes the camera; it is not a complete home mode. `World.indicate()` restores marker visibility during updates. Own home-only route/marker suppression across those updates, disable map interaction, then restore the exact gameplay presentation on departure. Use the existing subject bounds and usable-rectangle machinery; do not alter level geometry or Session state.

Record the background as an authored presentation recipe: source, camera/subject bounds, menu exclusion areas, decoration visibility, motion states and ownership. Reuse `model.ferry`, `model.lighthouse`, `shader.water`, `ui.typography`, `ui.component.action-capsule`, `ui.component.round-utility` and existing settings/sound/fullscreen icon families.

If a distinct implemented home family is warranted, register it with its consumers, dependencies, portrait/landscape layouts, Reduced Motion state and evidence. Update the canonical inventory/gallery/provenance while preserving existing IDs. This new composition needs review; reuse of accepted assets does not automatically establish human approval of the home screen.
