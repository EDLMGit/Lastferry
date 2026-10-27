# Original development result

The original native-composition test reported one pass in 1.8 minutes. That establishes its executed geometry, complete-label, transcript/focus, viewport and state assertions only.

Independent inspection caught a missing temporal guard: `390x844-shot-0-begin.json` already reports elapsed 6000ms, settled true and draw count 5. Its PNG and the corresponding intermediate PNG depict the endpoint, despite their original filenames. They are retained unchanged as original evidence; they do **not** establish an observed beginning or complete Tide action.

The 390px portrait opening settled across a first covered-World rendering stall. The source manifest before/after is identical (`505d8441c2947a79266a115d6f7142eb601953b6294c56f63e41153bd57c7591`). Later shots and the 780px opening begin report unsettled timelines, but this run is not the final natural-motion acceptance.

The focused browser test is strengthened to require an unsettled beginning before 1050ms and an unsettled 2800–4000ms intermediate capture. A subsequent corrected-source run must establish the full movement; this original pass is not relabelled as such.
