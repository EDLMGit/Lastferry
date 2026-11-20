# Last Ferry review — <review-id>

## Disposition

**<Ready for M1 / Changes needed / Code reviewed; visual verification pending / Review blocked>**

<One paragraph: what was verified, the most important remaining issue, and next action.>

## Source and scope

- Repository / PR / branch: <URLs and branch>
- Reviewed HEAD: <full SHA, or no commit yet>
- Comparison base: <full SHA and selection method, or none for a new repository>
- Working tree at execution and capture: <clean / dirty; relevant paths and retained patch>
- Evidence source: <commit, or base HEAD plus identified uncommitted changes>
- Latest task and intended behavior: <summary>
- Reviewed scope: <M1 behavior or changed areas>
- Access or tooling limitations: <details, or none encountered>

If no first commit exists, link the tested source archive or file-hash manifest and record its capture time. Do not block local work for a missing SHA or relabel earlier captures as if they came from a later commit.

## Environment

| Item | Actual value |
| --- | --- |
| OS / browser / versions | <values> |
| Runtime / package manager | <values> |
| Desktop viewport / pixel ratio | <values> |
| Narrow landscape viewport / pixel ratio | <values or not exercised> |
| Input | <mouse / keyboard / physical touch / emulated touch; specify> |
| Launch and capture method | <commands or tooling> |

## Executed checks

Use `pass`, `fail`, `not run`, or `inconclusive`. Fill in observed results; delete unused placeholder rows. Reference-simulator checks must be labeled separately from implementation checks.

| Check and command or steps | Result | Observation / evidence |
| --- | --- | --- |
| Actual build launches and a rescue can be completed | <status> | <details> |
| Preview does not mutate state; commit matches preview | <status> | <details> |
| Tide/deadline and depth/load boundaries | <status> | <details> |
| Undo restores state; animals remain conserved | <status> | <details> |
| Replay and alternate action after undo | <status> | <details> |
| Touch commits once; desktop/narrow controls remain usable | <status> | <details> |
| Existing build/test commands relevant to the update | <status> | <exact commands and results> |

## Captured gameplay

Record each asset's capture time, source identity, viewport, input method, and capture method here or in a linked manifest. Mark missing captures explicitly. Concept/reference images belong in a separate section and do not count as gameplay evidence.

| State | Local path or authorized accessible URL | What it demonstrates / limitations |
| --- | --- | --- |
| Normal play | <path or unavailable> | <details> |
| Loading preview | <path or unavailable> | <details> |
| After tide advances | <path or unavailable> | <details> |
| Success | <path or unavailable> | <details> |
| Narrow landscape | <path or unavailable> | <details> |
| Short gameplay recording, if supported | <path / URL / unavailable> | <covered actions; any edits> |

Visual verification: **<complete for the stated coverage / pending; explain>**.

## Findings

Repeat for each confirmed defect. If none were found, say **No confirmed defects in the checks performed**, followed by any coverage limits.

### <ID> — <P0/P1/P2/P3> — <specific defect>

- Source: <file and relevant symbol or location at reviewed SHA>
- Reproduce: <initial state and minimal numbered action sequence>
- Expected: <agreed behavior>
- Observed: <actual result>
- Impact and evidence: <affected player decision or flow; capture/log/check reference>
- Proposed fix: <smallest change within scope>
- Resolution: <open / fixed at SHA or identified local diff; verification actually performed>

## Remaining uncertainty and next action

- Not run or not observable: <checks, reasons, and resulting limits>
- Optional suggestions: <clearly separate from defects; omit if none>
- Next action: <specific fix, capture, review, or authorized handoff>
- GitHub actions actually taken: <none, or authorized comment/approval/commit URLs>
