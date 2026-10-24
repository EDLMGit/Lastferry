# Reviewing Last Ferry

Review one identifiable build at a time. Milestone 1 (M1) is one polished, playable 3D cove with deterministic turns, passenger load and boat depth, rising tide, action previews, and undo. Keep reviews focused on that experience and the rules agreed for M1.

## How to request the next review

Once the repository exists, send this in the same chat after an update:

```text
Review Last Ferry M1.
Repository: <GitHub URL>
PR or branch: <PR URL or branch name>
Head commit: <full SHA>
Base commit or comparison target: <SHA or branch, if known>
Latest task and intended behavior: <what changed and why>
Known issue or reproduction: <steps, or none known>
Evidence: <repository paths or accessible, authorized URLs>
Run instructions and environment changes: <commands and relevant changes>
Requested action: review and report; fix reversible issues within this task if practical.
```

A repository URL does not establish access. Use an available authorized integration, checkout, or supplied archive. If access is unavailable, request the necessary source or access instead of implying that a private repository was inspected. Never put credentials in the request or report.

Reviews happen when requested in chat. This starter package does not configure an automatic watcher, GitHub Action, scheduled review, or notification service. A new commit alone does not initiate a review.

## Pin the source and evidence

Before running the game, record:

- Repository, branch, full HEAD SHA, and the comparison base SHA actually used. Record how the base was chosen; do not assume the default branch name.
- Whether the working tree is clean. If it is dirty, list relevant modified and untracked files and retain a small diff or patch identifying the tested changes.
- Browser, operating system, viewport, device-pixel ratio, input mode, and relevant runtime versions. Label emulated devices as emulated.
- Exact run, test, and capture commands, with their outcomes. Distinguish tests already present from tests added during the update.

Evidence generated before a commit belongs to the recorded base HEAD **plus the documented working-tree changes**. Do not relabel it as evidence from a later commit. Reuse it only after confirming that the relevant implementation is identical, and state that comparison; otherwise capture again. If source files change during a run, identify the change and repeat affected checks.

For a new repository with no first commit, record **no commit yet** instead of inventing a SHA. Retain the tested source as an archive or file-hash manifest with its capture time. Continue local implementation and review normally. When the first commit is created, record it separately and identify any changes since that snapshot before associating earlier evidence with it.

## Review the implemented game

Read the diff and agreed M1 rules, then run the actual implementation where tools permit. A standalone design verifier or reference simulation can help check the rules, but it does not establish that the playable build follows them. For every material conclusion, identify the code, executed check, or captured behavior that supports it.

Use existing checks and a short playthrough first. Add or broaden tests only to address a concrete risk or a required project gate. Record unavailable checks explicitly. Do not report a test as passing because its command exists, because another contributor says it passed, or because an expected result was calculated by hand.

### Acceptance risks

| Risk | What to establish in the implemented game |
| --- | --- |
| Preview changes the game | Opening, switching, and cancelling previews leaves authoritative state unchanged: turn, tide, boat position, passengers, delivered animals, and outcome. Temporary visual highlights are allowed. |
| Preview disagrees with execution | Committing a previewed valid action produces the displayed result, including load, depth, route availability, and tide effects. Invalid or cancelled actions do not consume turns. |
| Tide is one turn early or late | Check the turn immediately before, at, and after a tide or pier deadline boundary using the documented order of operations. One accepted action advances time exactly as specified; animation frames do not advance the simulation. |
| Depth boundary is wrong | Check exact channel-depth/draft equality and both sides of each documented passenger-load threshold. Preview and movement use the same rule. |
| Undo loses or duplicates state | Undo restores the entire prior simulation state, including tide/turn, passenger identities and locations, boat load, delivered animals, and terminal outcome. Animals remain conserved across boarding, delivery, undo, and a different subsequent action. |
| One touch causes two actions | With a real touch device or supported touch emulation, a tap commits once. Check pointer/click event overlap, rapid taps, and interaction during transitions. Mouse-only checks do not verify touch. |
| Scene or HUD hides decisions | At desktop and narrow landscape sizes, the ferry, useful piers, important depth/deadline information, preview, and undo remain visible and operable. Decorative 3D objects and overlays do not intercept intended controls. |
| Replay differs | The same initial state and accepted action sequence produce the same state and outcome. Undo followed by a new action leaves no stale preview, animation, or queued action. |
| The cove cannot be completed | Finish an actual playable rescue route and reach the intended success state. Exercise a relevant blocked or losing situation and the specified recovery path. A solver finding a route is supplementary evidence. |

Prioritize the checks touched by an update, while retaining a short core playthrough. Do not repeat an exhaustive suite solely to make the report longer.

## Capture gameplay evidence

When browser capture tooling is available, ask the implementing developer to produce these four **in-engine screenshots from the actual build**:

1. **Normal play:** cove, ferry, animals, readable HUD, and available actions.
2. **Loading preview:** a proposed boarding action with its resulting load, depth, and passage availability clearly shown.
3. **After tide advances:** an executed action with the resulting tide and affected passages or piers visible.
4. **Success:** a completed rescue and the actual success UI.

Use a desktop viewport such as 1440 × 900, and also exercise a touch-enabled narrow landscape viewport such as 844 × 390. Retain one additional narrow landscape capture, preferably of loading preview, to show control and HUD fit. These sizes are useful starting points, not a claim about supported devices; record actual sizes and input methods used.

If recording is supported, include a short gameplay recording showing preview, commit, tide change, undo, and completion. Report which actions the recording covers; do not splice together an apparently continuous run without saying so.

Store a compact report and small optimized screenshots under `reviews/<review-id>/`, alongside a manifest containing capture filenames, source identity, environment, and capture method. Keep full-size videos out of repository history by default. Attach them to a PR or release only when that upload is authorized; otherwise retain them locally and report their availability. No credentials, new external service, or hosted recording account is required.

Label mockups, generated art, concept images, and design references separately. They cannot substitute for captured gameplay. If capture or rendering is unavailable, say exactly what could not be observed and use **visual verification pending**. A code review may still proceed, but it must not imply visual approval. Console output and screenshots of a reference simulator are not proof that the 3D game renders correctly.

Performance measurements are useful when a visible issue warrants investigation. Record the actual browser, hardware if known, scene, method, and measurement interval. Treat any suggested frame-rate or load-time target as optional until it is adopted explicitly; this starter package creates no performance or CI gate.

## Report issues and resolve them

Copy `reviews/REVIEW_TEMPLATE.md` into the review directory. Report concrete defects with reproduction steps, expected and observed behavior, affected source, and evidence. Separate observations from hypotheses and unverified risks. Severity follows demonstrated impact, not the amount of code involved.

| Priority | Meaning |
| --- | --- |
| P0 | Confirmed critical harm requiring immediate containment, such as exposed secrets or destructive behavior outside intended game state. Rare for this project. |
| P1 | A core M1 path is broken: the game cannot start or finish, state becomes invalid, or ordinary interaction repeatedly produces incorrect game outcomes without a reasonable workaround. |
| P2 | A reproducible, bounded gameplay, control, preview, or layout defect with a workaround or limited affected conditions. |
| P3 | A minor visual, wording, or interaction polish defect that does not obstruct play or misstate a consequential decision. |

Suggestions and preference differences are not defects. Do not inflate issue counts with speculative problems or implementation style preferences.

Reversible local fixes within the requested task may proceed without asking again for every commit. Record changes and verify the affected behavior. Preserve unrelated work. Do not expand the core design, overwrite other contributors' changes, push, merge, publish, or send GitHub comments beyond the user's existing authorization. If an action remains outside that authorization, prepare the concrete result before asking for the needed approval.

End with a precise disposition: **ready for M1**, **changes needed**, **code reviewed; visual verification pending**, or **review blocked**. State the reviewed source identity, remaining defects, unperformed checks, and the next concrete action. Local review completion does not imply that a GitHub approval, comment, or merge was submitted.
