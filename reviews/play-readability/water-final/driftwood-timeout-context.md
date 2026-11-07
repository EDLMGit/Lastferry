# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: play-readability-water.spec.ts >> readability water: Driftwood three tides and stable load geography with Bellwater/Wide deep-route smoke
- Location: tests\e2e\play-readability-water.spec.ts:129:1

# Error details

```
Test timeout of 240000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Driftwood Yard" [ref=e4]:
    - generic "Driftwood Yard. Use the labeled waypoint controls to navigate." [ref=e6]
    - button "2 of 4 spaces · boat needs depth 2 · crossing status" [ref=e7] [cursor=pointer]:
      - generic: 2/4 · Depth 2
    - navigation "Crossing controls" [ref=e8]:
      - button "Undo" [ref=e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=e10] [cursor=pointer]
      - button "Menu" [ref=e11] [cursor=pointer]
      - button "Mute sound" [ref=e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent passage available; Home, delivery destination":
          - generic [ref=e13] [cursor=pointer]
          - generic [ref=e15] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select Driftwood Yard; adjacent passage available":
          - generic [ref=e17] [cursor=pointer]
          - generic [ref=e19] [cursor=pointer]: Driftwood Yard
      - generic:
        - button "Select High Mooring; current location":
          - generic [aria-hidden] [ref=e22] [cursor=pointer]: •
          - generic [ref=e23] [cursor=pointer]: High Mooring
      - generic:
        - button "Select Shallow Bend; adjacent, too shallow":
          - generic:
            - generic [aria-hidden]: ╱
          - generic: Shallow Bend
      - generic:
        - button "Select Reed Landing; no direct passage":
          - generic:
            - generic [aria-hidden]: ◇
          - generic: Reed Landing
    - navigation "Passenger actions at High Mooring" [ref=e25]:
      - button "Let Nell ashore" [ref=e26] [cursor=pointer]
    - button "Open tide and pier forecast" [ref=e27] [cursor=pointer]:
      - generic [aria-hidden] [ref=e28]: "!"
      - strong [ref=e29]: Reed Landing floods in 4 actions.
    - navigation "Cove view" [ref=e30]:
      - button "Whole cove" [active] [ref=e31] [cursor=pointer]
  - status [ref=e32]: 3 actions completed. Reed Landing floods in 4 actions.
```