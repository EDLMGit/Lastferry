# Review — why Wide still feels wrong

Reviewed on 1 November 2026 against runtime 2e4f99268da4691b315fe8467d9e539cda15e927. This review inspected exact committed native images and source; it did not play a fresh browser session or test physical-phone/audio performance.

## Deployment is current

Sites version 14 was saved from hosting source d01264d26cb7b5abaf68920a9014718ab21d97b4 and its deployment succeeded. The matching repository receipt identifies game 2e4f992. The handoff's “not deployed / version13” statement was superseded by the later publication-only commit 98f9713.

[Current receipt](https://github.com/EDLMGit/Lastferry/blob/98f9713b1a69474b4066cca8f336cb8c4ca21a50/reviews/play-readability/deployment-confirmation.json).

## What the last task actually changed

PLAY_READABILITY_01 repaired HUD/Sail, visible shallow banks, camera obstacle handling and the Harbor scene. The current registry, progress validator and Wide level data match the preceding game. Wide plus the larger-ferry launch remains the fourth story cove.

Our previous task deliberately kept that runtime arrangement while documenting a later replacement. Codex followed that scope. Two Shelters has not yet been built.

[Review](https://github.com/EDLMGit/Lastferry/blob/2e4f99268da4691b315fe8467d9e539cda15e927/reviews/play-readability/REVIEW.md) · [Registry](https://github.com/EDLMGit/Lastferry/blob/2e4f99268da4691b315fe8467d9e539cda15e927/src/campaign/registry.ts).

## Visual assessment

The following are art-direction judgments from current native frames, not claims of automated visual approval.

### Holding establishes a hierarchy

Its lighthouse, cottage, waiting animals and small ferry each have a readable role. The landmarks give the islands a reason to exist. The middle island can remain quieter because the neighboring compositions supply character.

### Wide has weak places at both scales

Overview makes its animals and landmarks small. Closer Play increases their size but reveals a large nearly empty High Quay mound, broad masonry face and prominent timber gangway. The ferry's open floor and rectangular cabin dominate its occupants. There is no single zoom value that will author those relationships for us.

The larger model is not automatically wrong for the eventual game. Its current presentation and campaign timing remain unaccepted. Freeze further work on it while the smaller candidate establishes a convincing next place.

### Labels are carrying too much geography

In Wide's portrait loaded frame, the Outer Buoy and High Quay names are separated from their physical targets by long leaders. The short-landscape Harbor label is displaced far from Harbor. A player can trace the lines, but that weakens the immediate relationship between name, landing and island.

Some camera problems are shared: portrait Holding also has considerable empty upper water, and short-landscape Driftwood crops distant scenery. Do not attribute every framing weakness to Wide. Solve the new candidate's compact composition first and avoid a global camera rewrite.

## The new cove's visual contract

Create a small sheltered place with existing assets. Group a modest high stone refuge and a lower timber/reed landing around a coherent inlet; retain Harbor's recognizable home identity. The exact graph remains a puzzle-design decision, but each physical place should express its purpose.

- Reuse the original four-space ferry at its established proportions.
- Keep the passenger group readable in normal phone Play, with visible faces/ears/silhouettes.
- Give each main landing a short physical relationship to the ferry and animals.
- Use shaped coastlines, grouped vegetation and one meaningful landmark per important place. Avoid empty beige pads fronted by broad generic bars.
- Keep supports and water contact convincing; decoration must not obscure tide or route information.
- Group the scene deliberately. Adding many tiny rocks and plants cannot substitute for a clear main shape.
- Keep names associated with their places. Plan the layout so labels and leaders do not crisscross the boat or imply false routes.
- Use current calm water, shallow-bank cues, warm accents, music and motion. Do not add bloom, a new palette or a shader experiment.

This is a playable prototype in content status, not permission to return to raw block placeholders. Existing finished asset families should make it feel like the same game.

## Exact current reference frames

These files already exist in the repository. Open them at native size before editing.

| Role | Repository path |
| --- | --- |
| Established scene hierarchy | reviews/play-readability/final/1440x900-start.png |
| Existing portrait framing limitation | reviews/play-readability/final/390x844-start.png |
| Established Driftwood local assets | reviews/play-readability/final/water/driftwood-780x320-tide0-shallow-play.png |
| Rejected Wide Overview | reviews/play-readability/final/water/wide-berth-844x390-water-overview.png |
| Rejected Wide portrait proportions | reviews/play-readability/final/wide-full-six-390x844-play.png |
| Rejected Wide short-landscape proportions | reviews/play-readability/final/wide-full-six-780x320-play.png |

[All source-linked frames](https://github.com/EDLMGit/Lastferry/blob/2e4f99268da4691b315fe8467d9e539cda15e927/reviews/play-readability/MEDIA.json).

## Direction retained

The canonical documents already propose a four-space C4, Orin in the four-space boat at C5, then a larger-ferry launch before C6. This assignment produces only the first candidate. It does not silently claim that the proposed puzzle is proven, install it into the story or reassign existing completion.

[Campaign direction](https://github.com/EDLMGit/Lastferry/blob/2e4f99268da4691b315fe8467d9e539cda15e927/campaign/CAMPAIGN_DIRECTION.md) · [Puzzle progression](https://github.com/EDLMGit/Lastferry/blob/2e4f99268da4691b315fe8467d9e539cda15e927/campaign/PUZZLE_PROGRESSION.md).
