# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: play-readability-journey.spec.ts >> actual short landscape Driftwood rescue preserves subset warnings, tide Undo and practice isolation
- Location: tests\e2e\play-readability-journey.spec.ts:217:1

# Error details

```
Test timeout of 240000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - region "Driftwood Yard" [ref=f1e4]:
    - generic "Driftwood Yard. Use the labeled waypoint controls to navigate." [ref=f1e6]
    - button "0 of 4 spaces · boat needs depth 1 · crossing status" [ref=f1e7] [cursor=pointer]:
      - generic: 0/4 · Depth 1
    - navigation "Crossing controls" [ref=f1e8]:
      - button "Undo" [ref=f1e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=f1e10] [cursor=pointer]
      - button "Menu" [ref=f1e11] [cursor=pointer]
      - button "Mute sound" [ref=f1e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent passage available; Home, delivery destination":
          - generic [ref=f1e13] [cursor=pointer]
          - generic [ref=f1e15] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select Driftwood Yard; adjacent passage available":
          - generic [ref=f1e17] [cursor=pointer]
          - generic [ref=f1e19] [cursor=pointer]: Driftwood Yard
      - generic:
        - button "Select High Mooring; current location" [expanded]:
          - generic [aria-hidden] [ref=f1e22] [cursor=pointer]: •
          - generic [ref=f1e23] [cursor=pointer]: High Mooring
      - generic:
        - button "Select Shallow Bend; adjacent passage available":
          - generic: Shallow Bend
      - generic:
        - button "Select Reed Landing; no direct passage":
          - generic:
            - generic [aria-hidden]: ◇
          - generic: Reed Landing
    - region "High Mooring · free inspection" [active] [ref=f1e25]:
      - generic [ref=f1e26]:
        - generic [ref=f1e27]: You are here
        - button "Details" [ref=f1e28] [cursor=pointer]
        - button "Close location card" [ref=f1e29] [cursor=pointer]
    - button "Open tide and pier forecast" [ref=f1e30] [cursor=pointer]:
      - generic [aria-hidden] [ref=f1e31]: "!"
      - strong [ref=f1e32]: Driftwood Yard floods in 6 actions.
    - navigation "Cove view" [ref=f1e33]:
      - button "Whole cove" [ref=f1e34] [cursor=pointer]
  - status [ref=f1e35]: High Mooring selected. Inspection is free.
```