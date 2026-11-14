# Direct passenger actions and result feedback

Supporting contract for **HOME_PLAY_FLOW_01**. The user explicitly includes easier pickup, drop-off and home delivery in this combined assignment. Implement it alongside Home and automatic story playback; it is not a later queued task and has no dependency on a previous Task 01 commit.

A straightforward transfer should use one intentional action. Several available passengers remain a meaningful choice, and relevant consequences must stay clear before commitment. Reuse the accepted cove controls, portraits, icons and transition pipeline.

The reviewed implementation opens a generic action dialog for every Board/Unload and reserves up to 380px height. This contract removes that routine friction while preserving rules, full in-session Undo and actual subgroup choices.

## 1. One passenger: one intentional action

When exactly one passenger is available for a transfer, the proposed action is valid, and its result does not end the crossing in loss, make the nearby dock button execute that transfer directly. Use the passenger's name: **Let Moss ashore**, **Board Moss**, or **Bring Moss home** at Harbor. Keep these three intents distinct with the existing board, unload and Harbor icon language. Remove the redundant single-person checkbox and generic confirmation step.

Show the cost and resulting boat requirement before the tap in a compact secondary treatment, for example:

**Let Moss ashore**  
`1 action · Needs depth 2 → 1`

Keep this readable at phone size without turning it into another large panel. The existing location inspection remains free and available for fuller information. Preserve current capacity, berth and flooded-pier restrictions; an unavailable action must not become executable through the direct branch.

For the exact canonical Holding example, Moss starts aboard at Stone. Letting him ashore must produce **turn 1, tide 0, load 0, boat needs depth 1**, with Moss waiting safely at Stone and one Undo entry. No second tap should be necessary.

A valid final delivery at Harbor may also execute directly when there is one passenger to transfer. Preserve the actual arrival presentation, victory sound, terminal Undo and explicit campaign continuation. Success is not a danger condition requiring an extra confirmation.

## 2. Several passengers: compact deliberate selection

When several passengers can be chosen, open a small, content-sized chooser near the dock control. Retain the existing portraits, full names and space costs. Let the player choose the subset for free, show resulting load/depth and any relevant consequence, and provide one named committing action such as **Board Pip and Rue · 1 action**.

That action is the commitment. Do not add a second generic Confirm step. Do not charge one action per animal, silently select the first legal subset or remove partial boarding/unloading. An empty or invalid selection cannot commit.

`locationFacts()` currently selects its `board`/`unload` candidate from the largest valid subset, while `boardOptions` includes the waiting group. That helper's candidate is not permission to choose a multi-passenger group on the player's behalf. Preserve an explicit choice and accurate selected names.

Remove the fixed 380px transfer height for this compact treatment. Reuse existing cove surfaces, icons, controls and placement helpers. Keep the chooser close to its trigger, within visible viewport/safe areas, with stable primary-action placement and readable touch targets. Avoid a new icon set, new illustration assets or a broad interface redesign.

## 3. Consequences stay before decisions

Use the actual `preview()` result to classify the candidate. A legal action can still strand passengers and end the crossing; `legalActions()` alone does not establish safety.

If `proposed.state.status === 'lost'`, retain a compact pre-action warning naming who will be stranded and where, with an explicit committing action and a free cancel. Do not reveal that consequence only after the transfer. Preserve the player's ability to explore and Undo a losing plan.

For nonterminal changes, disclose the relevant information concisely beside the action or inside the subset chooser: **Tide rises after this action**, a landing's post-action flood deadline, or a boat-depth change that blocks a passage. Keep the fuller forecast and passage inspection available. Avoid treating every ordinary tide rise as a reason for another generic confirmation.

Derive compact facts structurally from before/after state, action and level data. Do not parse English `previewCopy()` strings to decide safety. Preserve the reducer's ordering: transfer passengers, advance the action, apply the tide, evaluate flooding, then victory. The last safe boarding must still save the selected passengers before the rise.

## 4. Themed result feedback

After an accepted transfer visibly settles, show one brief receipt near the ferry/dock, for example:

**Moss ashore · 1 action used**  
**Needs depth 2 → 1**

Use **1 action used**, not **−1 action**: the game counts completed actions upward and does not have an action-point wallet. Use **Needs depth** so the player understands that the ferry's requirement changed, not the water's depth. Calculate the actual before/after draft bands; omit the depth-change line when load changes without a draft change.

Use the existing deep teal, warm cream and soft-border language. A small upward drift and fade is enough. Reduced Motion uses a static readable hold. Keep the receipt outside passenger faces, primary controls and screen edges. It must have no click target, no focus capture and no pointer interception. Show one receipt at a time instead of stacking them across the cove.

The persistent HUD remains authoritative after feedback disappears. Keep an accessible result announcement, coalesced with the existing status announcement so it is not read twice. Do not make transient text the only way to discover cost, depth or a warning.

Create receipt data only from a successful `session.commit()` transaction. Show it at the real transfer completion or existing settling-contact event, tied to the transition ID. Reuse `finish()` or the established presentation event; do not guess a separate animation timer. Invalid actions, cancelled selection and inspection produce no cost receipt.

Clear obsolete feedback on Undo, restart, hide, Home entry, cove/journey changes and teardown. Background settlement or a superseded transition must not queue an old popup for later return. Feedback must not delay the next legal input or alter animation, sailing or transfer-audio timing.

## 5. Keep the existing action and input owners

Route direct actions through the existing `execute()` pipeline. It owns Session commit, poses, audio reconciliation, animation, recovery and completion. Do not duplicate reducer calls or invent a parallel transfer implementation.

Apply `blocked()`, Session busy state, the commit fence and existing pointer/keyboard guards to the new direct branch. Recompute/validate against current state at commitment; do not queue stale candidates while busy. One intentional activation must produce at most one accepted transaction.

Direct actions no longer obtain their return focus automatically from `openDialog()`. Set the focus target deliberately and use `focusAvailable()` when the action button disappears after transfer. Preserve visible keyboard focus, held-key protection and dismissal without click-through. Update `aria-haspopup` and accessible labels when a control executes directly rather than opening a chooser. Update help text that currently says every passenger action opens a preview.

Leave safe sailing, risky-route warnings, Wait, forecast and general location inspection intact. Preserve all three puzzles, full in-session Undo, passenger identities, accepted heading/wake behavior, water, sound and the Home/story work in this same combined assignment.

## 6. Completion and documentation

Update help that currently says every passenger action opens a subset preview. Direct controls must have correct accessible action names and must not advertise a dialog; group controls should truthfully advertise their chooser. Prefer the existing Board, Let ashore and Bring home vocabulary across the map, announcements and result receipts.

Use the combined task's verification and handoff. The exact Moss example, grouped rabbits, last-safe-boarding loss warning/cancel, mixed subsets, unchanged-draft transfer, partial Harbor delivery, final Bring home, Undo, repeated input and phone placement all need focused coverage. Receipt lifetime must also be tested across the newly added Home/story boundaries.

Preserve inherited constrained-layout, delivered-heading and precise rapid-touch limitations unless this pass actually resolves and verifies them. No separate publication or approval is required between this internal stage and the rest of the combined assignment.
