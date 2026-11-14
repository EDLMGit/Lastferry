# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: repair-composition.spec.ts >> matching phone views, revised launch and existing saved Wide Berth entrance
- Location: tests\e2e\repair-composition.spec.ts:6:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=f2e3]:
  - region "Wide Berth" [ref=f2e4]:
    - generic "Wide Berth. Use the labeled waypoint controls to navigate." [ref=f2e6]
    - button "0 of 6 spaces · boat needs depth 1 · crossing status" [ref=f2e7] [cursor=pointer]:
      - generic: 0/6 · Depth 1
    - navigation "Crossing controls" [ref=f2e8]:
      - button "Undo" [disabled] [ref=f2e9]
      - button "Wait · 1 action" [ref=f2e10] [cursor=pointer]
      - button "Menu" [ref=f2e11] [cursor=pointer]
      - button "Enable sound" [ref=f2e12] [cursor=pointer]:
        - generic: Sound
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; no direct passage; Home, delivery destination":
          - generic [aria-hidden] [ref=f2e14] [cursor=pointer]: ◇
          - generic [ref=f2e15] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select High Quay; adjacent passage available":
          - generic [ref=f2e17] [cursor=pointer]
          - generic [ref=f2e19] [cursor=pointer]: High Quay
      - generic:
        - button "Select Wide Berth; current location":
          - generic [aria-hidden] [ref=f2e22] [cursor=pointer]: •
          - generic [ref=f2e23] [cursor=pointer]: Wide Berth
      - generic:
        - button "Select Shell Landing; no direct passage":
          - generic [aria-hidden] [ref=f2e26] [cursor=pointer]: ◇
          - generic [ref=f2e27] [cursor=pointer]: Shell Landing
      - generic:
        - button "Select Outer Buoy; no direct passage":
          - generic [aria-hidden] [ref=f2e30] [cursor=pointer]: ◇
          - generic [ref=f2e31] [cursor=pointer]: Outer Buoy
    - navigation "Passenger actions at Wide Berth" [ref=f2e33]:
      - button "Board" [ref=f2e34] [cursor=pointer]
    - button "Wide Berth floods in 4 actions. Beacon Reef flows from High Quay to Harbor. After 4 actions, it turns toward High Quay. Open reef and tide forecast." [ref=f2e35] [cursor=pointer]:
      - generic [aria-hidden] [ref=f2e36]: "!"
      - generic [ref=f2e37]:
        - strong [ref=f2e38]: Wide Berth floods in 4 actions.
        - generic [ref=f2e39]: Beacon Reef to Harbor · turns in 4 actions
    - navigation "Cove view" [ref=f2e40]:
      - button "Whole cove" [ref=f2e41] [cursor=pointer]
  - status [ref=f2e42]
```