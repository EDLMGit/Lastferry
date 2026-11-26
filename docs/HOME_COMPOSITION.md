# Live Home composition

HOME_PLAY_FLOW_01 uses the existing Holding Pier World as a reusable authored title composition. Source: `showHome` / `updateViewport` in `src/main.ts`, `src/campaign/home.css`, and `World.setHomePresentation` / `setStoryFraming` / `indicate` in `src/scene/world.ts`. Inventory: `ui.home-composition`.

The camera fits the actual lighthouse group, ferry and aboard-passenger bounds. It uses the measured menu exclusion rectangle: the right side on landscape; between the title and lower actions on portrait. Safe areas and the visual viewport remain authoritative. The camera stays stationary after layout. Puzzle coordinates, materials, lighting and state are unchanged. Existing warm lantern base illumination is used without a won state, sweep, arrival event or victory music reduction.

Dependencies are the existing ferry, lighthouse, water shader, serif typography, action capsules, round utilities and Settings/Sound/fullscreen icon families. The title is HTML, not baked art. Options/Practice reuse the same World. The gallery links the actual root and displays shared control specimens; it does not create a second simulation.

Home owns route/marker suppression through every `indicate()` call. The gameplay seascape is inert, its controls hidden and `blocked()` also rejects gameplay input while a journey surface owns presentation. Native secondary dialogs remain inside the common fullscreen app root. Returning to gameplay restores decoration and its normal camera/pan ownership.

Normal Motion retains accepted water and subtle boat motion; Reduced Motion uses the existing still presentation. The illustrated story covers/suspends World rendering. Home creation/idle/options never create or acknowledge a checkpoint. Entry, replacement and return policies remain owned by JourneyProgress and explicit UI actions.

Layout targets: 390×844 and 320×740 portrait, 780×320 and 844×390 landscape, and desktop. Human acceptance of reused source assets does not establish approval of this new composition. Actual frames, original failures and device limits are in `reviews/home-play-flow/REVIEW.md`.
