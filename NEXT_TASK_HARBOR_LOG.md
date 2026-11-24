# HARBOR_LOG_01 · Give the captain a reason to take another voyage

Build one playable progression experiment from Home through Holding Pier and back again. The owner reports that v0.1.3 runs well on their Android. Their question after a rescue was what to aim for and why they would play again. The local release-bundle rehearsal is queued. Codex owns the implementation, visual composition and firsthand play of this slice.

## The first trip and its payoff

At the helm, let a new captain connect Moss on the deck, the two rabbits at the low pier, and the approaching rise. Use the actual cove, faces and tide signal. Make the immediate problem readable in a glance and leave the route and passenger decision to the player. Inspecting an unavailable passage should make its immediate cause clear. Keep free inspection, Undo and the compact phone gauges.

When the player accepts Holding Pier's first Journey rescue, let the change be visible back at Harbor. Pip, Rue and Moss now have a permanent named place together in a small illustrated Harbor log. The lantern that Rue already sets down in the story is a natural marker for their page. Use the existing cast and art direction. A captain returning tomorrow should see who made it home, “1 of 12 coves rescued,” the next story destination and an obvious way to revisit a cove. Make the log reachable from Home. It may reuse or extend the existing Practice surface. Give a completed cove a direct replay action, keep existing Practice access to all thirteen crossings, show current bests where available, and distinguish the separate First Crossing from the twelve Journey chapters. Keep the four unscored coves countable as story rescues.

## One optional request, available at the first rescue

**Moss's request:** “Take Pip and Rue home first. I can wait at Stone Pier.” Offer this as a different way to replay Holding Pier, alongside continuing to Bellwater. Let the player find the same request in the log later. When they take it, keep its short objective findable while sailing. An accepted rescue fulfilling the request earns a permanent illustrated entry of Moss aboard the ferry on his own trip home. Give it a name, reuse Moss's existing artwork and make that moment the focus of the result. Keep the captain's strongest lantern best. Both achievements can coexist on the same page.

The challenge is a promise about **who is where**. Both rabbits must have reached Harbor while Moss was still waiting ashore at Stone Pier. The captain must then bring him home and accept the finished rescue. Check the actual surviving sequence of legal states so Undo can reverse the qualifying delivery. Unloading the rabbits before Moss from the same boat at Harbor does not fulfill this request. Allow Undo and any number of actions. Recognize a qualifying trip even if the captain discovered it independently on this build.

Two production-rule witnesses were checked during direction. The ordinary nine-action rescue delivers the group together and earns three lanterns without Undo. A second legal rescue delivers both rabbits on action eight with Moss at Stone, returns to collect him, and finishes on action twelve. A search of legal actions through turn twelve found no shorter qualifying rescue. Today's lantern rules give that win one lantern. These counts justify the design and belong in developer evidence. The player gets the promise and can discover the route. [Holding Pier](data/holding-pier.level.json) · [Ordinary witness](data/experiments/holding-pier-solution.json) · [Mastery](src/game/mastery.ts)

## Save the rescue before the detour

Offering the request on first arrival must be an honest choice. If the player takes the request directly there, make it clear that this accepts the first Journey rescue. Persist the normal next Journey checkpoint before opening the separate replay. On returning from Practice, Continue should still open the pending Bellwater scene. Closing the result or using terminal Undo before acceptance keeps the result provisional. A fresh Practice-only rescue can earn its eligible records without advancing the Journey.

Read earlier accepted story completions and lantern bests from their existing records. A v0.1.3 captain at Bellwater should find the first rescue group already home, the stronger saved best and the new request available. Historical bests carry no evidence of passenger order. Keep the optional entry independent and award it once, with the existing storage-failure behavior and safe retries. Reopening the log, replaying or taking a weaker win must preserve earned records. Keep routine updates compatible with the installed Android playtest.

## What to put in the handoff

Deliver the playable web build and the next in-place private Android APK, including version, source, SHA-256 and install instructions. Show a normal first completion, the different qualifying crossing and its illustrated reward still present after cold launch. Demonstrate stepping back across the rabbit delivery with Undo, a nonqualifying run, and returning to Bellwater after the optional Practice detour. Show the log from a genuine older checkpoint. Capture the first choice and the return to Harbor at actual phone size.

Judge this experiment by voluntary action. Give a player a fresh start, let them complete Holding Pier, then give them room to continue, take Moss's request or put the phone down. Record what they choose and what they hope will happen. If they stop, ask what would have made the next trip worth taking. A scripted replay establishes that the feature works. Interest in the next trip comes from watching a person choose it. Decide on additional requests and the next release milestone after this experiment.
