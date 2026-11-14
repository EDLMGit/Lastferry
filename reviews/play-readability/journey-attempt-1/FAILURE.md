# Original fixture failure

The fresh journey fixture issued three consecutive `story-continue` taps without allowing distinct gestures. The accepted repeated-click guard prevented all three transitions; the opening remained at Lantern. The initial reducer already held Holding's initial state behind the story, so the fixture's state/idle assertion was insufficient. `390x844-holding-start.png` truthfully shows the still-active opening, not gameplay. The test was interrupted before waiting its full action timeout. Raw partial screencast frames remain; runtime audio was not finalized on interruption.

Correction: separate deliberate Next gestures by 550ms, verify each new shot, and verify the story control has gone before starting the gameplay recording. This is a fixture/input-sequencing correction, not evidence of a product fix or a claim about the inherited precise repeat-touch guarantee.
