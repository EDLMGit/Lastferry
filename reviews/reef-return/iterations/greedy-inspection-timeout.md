# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reef-return.spec.ts >> portrait greedy pickup, blocked loaded return and six-step recovery
- Location: tests\e2e\reef-return.spec.ts:22:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Reef Return" [ref=e4]:
    - generic "Reef Return. Use the labeled waypoint controls to navigate." [ref=e6]
    - button "3 of 6 spaces · boat needs depth 3 · crossing status" [ref=e7] [cursor=pointer]:
      - generic: 3/6 · Depth 3
    - navigation "Crossing controls" [ref=e8]:
      - button "Undo" [ref=e9] [cursor=pointer]
      - button "Wait · 1 action" [ref=e10] [cursor=pointer]
      - button "Menu" [ref=e11] [cursor=pointer]
      - button "Mute sound" [ref=e12] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent, This action will cut Birch and Dot off from Harbor. The ferry can only cross back for them after the homeward current ends.; Home, delivery destination":
          - generic:
            - generic [aria-hidden]: "!"
          - generic: Harbor · Home
      - generic:
        - button "Select Cairn Quay; current location":
          - generic [aria-hidden] [ref=e14] [cursor=pointer]: •
          - generic [ref=e15] [cursor=pointer]: Cairn Quay
      - generic:
        - button "Select Wrack Pier; adjacent passage available":
          - generic: Wrack Pier
      - generic:
        - button "Select Shell Pool; adjacent, too shallow":
          - generic:
            - generic [aria-hidden]: ╱
          - generic: Shell Pool
    - navigation "Passenger actions at Cairn Quay" [ref=e17]:
      - button "Let ashore" [ref=e18] [cursor=pointer]
    - button "Needle Reef flows from Cairn Quay to Harbor. After 6 actions, it turns toward Cairn Quay. Open reef and tide forecast." [ref=e19] [cursor=pointer]:
      - generic [aria-hidden] [ref=e20]: ≈
      - strong [ref=e22]: Needle Reef to Harbor · turns in 6 actions
    - navigation "Cove view" [ref=e23]:
      - button "Whole cove" [active] [ref=e24] [cursor=pointer]
  - status [ref=e25]: 2 actions completed. Heather and Flick are safe aboard.
```