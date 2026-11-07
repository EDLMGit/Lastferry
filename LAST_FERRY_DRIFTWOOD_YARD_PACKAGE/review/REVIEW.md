# Review — Home/play handoff and next campaign slice

**31 October 2026, Europe/Madrid**  
**Reviewed game:** `da1f2686ce6aff8d754e13111447dabb6e1313f0`

## Decision

Retain the implemented Home, automatic illustrated story and direct-transfer framework. The user's supplied Bram screenshot identifies a presentation requirement to revise: routine dock buttons should be short actions, with optional planning detail and conditional danger warnings elsewhere. The next substantial deliverable is Driftwood Yard and Nell, the third rescue already selected in the campaign roadmap.

This review prepares the next Codex assignment. It does not modify the game, push to GitHub or publish the Site.

## Source identity

[PR #1](https://github.com/EDLMGit/Lastferry/pull/1) is open and draft against `main` at `386de54d20fdd4a513a06115471d70bf94738cc0`. The live branch head observed during review is `879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3`, six commits after the handoff.

The GitHub comparison reports no net changed files. Both commit objects point to the exact same tree, **`4aa851646f66cb0eda3ee9960ca9c5125170b0e0`**. The handoff's source is therefore the observed current source; this does not authorize resetting history. Preserve that newer head and any subsequent work.

Sources: [handoff commit](https://github.com/EDLMGit/Lastferry/commit/da1f2686ce6aff8d754e13111447dabb6e1313f0), [observed branch commit](https://github.com/EDLMGit/Lastferry/commit/879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3), [comparison](https://github.com/EDLMGit/Lastferry/compare/da1f2686ce6aff8d754e13111447dabb6e1313f0...879c9d1cfb6745ce8a294e4dbba4aa3d984ef4b3).

## What was inspected

The review read the current PR/report/original-failure record, 30 exact text-source/data/inventory files, the campaign direction/progression/scenes, current transfer code and campaign-save implementation. Transport-added trailing newlines were corrected in the local read-only snapshot so all 30 files match their Git blob identities exactly. `source-audit.json` records those identities.

Visual inspection covered the user's actual Bram screenshot and committed native portrait Home, short-landscape Home and portrait final-delivery chooser. These support the observed composition and button/chooser findings. They do not establish motion, speaker sound, device performance or every current UI state.

The contributor reports production build/TypeScript, 303 units, 76 asset families and nine distinct browser cases across documented runs, with actual Holding and Bellwater rescues and Undo. Those are retained contributor results; this review did not rerun the whole application build/browser suite or listen on a physical phone. The 108.8-second actual-journey recording is documented in the handoff but is not claimed as newly played/listened to here.

Sources: [handoff review](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/reviews/home-play-flow/REVIEW.md), [browser record](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/reviews/home-play-flow/BROWSER_CHECKS.md), [portrait Home](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/reviews/home-play-flow/handoff/390x844-home-fit.png), [landscape Home](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/reviews/home-play-flow/handoff/780x320-home.png), [chooser](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/reviews/home-play-flow/phone-final/390x844-final-chooser.png).

## Findings and selected response

### 1. The button verbosity comes from the brief and its implementation

`renderDock()` always appends `.dock-facts`; direct transfers also receive the full `transferFacts().detail`, sourced from `previewCopy().consequence`. The Home CSS makes both rows full-width. That produces the exact multi-line capsules in the screenshot, including the reassuring safe-aboard sentence.

The implementation followed the previous requirement to keep these facts visible on every action. The new task deliberately changes it: icon/name only on routine buttons, current state in HUD, forecast in its existing surface, predicted facts through optional free inspection/selection and actual feedback in the receipt. A real losing result still requires the existing pre-commit warning. No broad interface redesign is needed.

Sources: [application](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/main.ts), [transfer facts](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/ui/transfer.ts), [Home/dock CSS](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/campaign/home.css).

### 2. The next cove has an established story role

The canonical roadmap places Driftwood Yard and Nell after Bellwater, using the original four-space boat. Nell's later contribution is launching an already prepared larger ferry. Her present introduction does not need a special power or a simultaneous new water rule.

The supplied mechanical proposal uses Nell and two new rabbits, Fern and Oat. It asks where to stage a rescued neighbor before reaching the other low landing. The full group still fits the existing four spaces. The larger hull and Wide Berth remain the following coherent milestone.

Sources: [campaign direction](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/campaign/CAMPAIGN_DIRECTION.md), [puzzle progression](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/campaign/PUZZLE_PROGRESSION.md).

### 3. Campaign extension must preserve completed saves

`validateJourney()` currently compares completed records against the complete current registry. Appending Driftwood without compatibility would reject legitimate two-cove completions. The task specifies recognition of the exact historical record, no write merely from Home, and an explicit Continue that first plays the newly available scene fresh. Later restored pending scenes retain the existing recap behavior.

Initial URL routing, cove pickers, completion wording and scene-background dispatch also contain current-content assumptions. Help unconditionally looks up a sheep, and transfer sound distinguishes sheep from the smaller contacts. Those shared consumers need careful adaptation for Nell without changing accepted effects or old puzzles.

Sources: [progress](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/campaign/progress.ts), [registry](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/campaign/registry.ts), [application](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/main.ts).

### 4. Nell needs a complete species/identity implementation

The current animal factory sends nonrabbits through its sheep branch, and portraits know only rabbits/sheep. Nell needs a real beaver model and matching stable appearance/portrait. Two rabbits plus one beaver stays within the existing anchor-count pattern, but her tail and transfer paths still require actual visual/geometry checks. Reordered subsets must not recolor her or the new rabbits.

Sources: [models](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/scene/models.ts), [appearance](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/game/passenger-appearance.ts), [portrait integration](https://github.com/EDLMGit/Lastferry/blob/da1f2686ce6aff8d754e13111447dabb6e1313f0/src/ui/cove-ui.ts).

## New design proof performed in this review

The included Driftwood candidate was replayed and independently rerun against the byte-exact production `rules.ts` and `Session` from the handoff, through a Node 24 loader adaptation. The unchanged reducer accepted 12- and 15-action successful witnesses; the latter is a different delivery order sharing the same critical staging rescue. Three tempting losing plans, a blocked shallow return spending nothing, preview/commit equality, passenger conservation, transfer-before-rise and full mechanical Session Undo passed.

Bounded production-rule search used horizon 24 and turn-key normalization after the last rise at action 11, visited 237 unique states and found a first winning sequence of 12 actions. These are design-proof observations, not a game action cap, playtime estimate or subjective difficulty claim. Evidence and source hashes are in `design/driftwood-proof/`.

The proof has no world coordinates, models, audio or browser. It does not establish final route clearance, presentation/pose Undo, phone fit or fun. Those remain part of the Codex implementation and the user's subsequent playtest.

## Remaining limits and publication

Missing phone music did not reproduce in the contributor's stricter first-input score-output checks. It is not declared fixed on physical speakers. The unexplained later portrait-load timeout, software-capture stalls, inherited Bellwater overlap, delivered-heading discontinuity, precise rapid-touch timing and physical-device/other-engine limits remain documented. The next task focuses on changed consumers and does not claim to close unrelated issues.

The supplied publication receipt still records private Site version 12/game `1a85874883af5caa59f6294a75495eccf2afebbc`. This review did not audit or change that live Site. GitHub push and publication remain separate. The next task keeps PR #1 draft, leaves `main` unchanged and returns for review before publication.
