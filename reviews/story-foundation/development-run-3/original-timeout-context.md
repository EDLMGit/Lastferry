# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: story.spec.ts >> story full phone journey: actual rescues, explicit acceptance, tide and terminal Undo, checkpoint endpoint
- Location: tests\e2e\story.spec.ts:38:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "Bellwater Cove" [ref=e4]:
    - generic "Bellwater Cove. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "Bellwater Cove" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring Tansy, Lark and Bram to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 2 · 2/4 spaces
        - generic [ref=e13]: 03 actions · Tide 0 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "Undo" [ref=e15] [cursor=pointer]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
        - button "Mute sound" [ref=e18] [cursor=pointer]
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; no direct passage; Home, delivery destination":
          - generic [aria-hidden] [ref=e20] [cursor=pointer]: ◇
          - generic [ref=e21] [cursor=pointer]: Harbor · Home
      - generic:
        - button "Select Shallows; adjacent, too shallow":
          - generic [aria-hidden] [ref=e24] [cursor=pointer]: ╱
          - generic [ref=e25] [cursor=pointer]: Shallows
      - generic:
        - button "Select Low Pier; current location":
          - generic [aria-hidden] [ref=e28] [cursor=pointer]: •
          - generic [ref=e29] [cursor=pointer]: Low Pier
      - generic:
        - button "Select West Buoy; no direct passage":
          - generic [aria-hidden] [ref=e32] [cursor=pointer]: ◇
          - generic [ref=e33] [cursor=pointer]: West Buoy
      - generic:
        - button "Select East Buoy; adjacent passage available":
          - generic [ref=e35] [cursor=pointer]
          - generic [ref=e37] [cursor=pointer]: East Buoy
      - generic:
        - button "Select Bell Pier; no direct passage":
          - generic [aria-hidden] [ref=e40] [cursor=pointer]: ◇
          - generic [ref=e41] [cursor=pointer]: Bell Pier
    - navigation "Passenger actions at Low Pier" [ref=e43]:
      - button "Let Tansy and Lark ashore; choose passengers" [ref=e44] [cursor=pointer]:
        - generic: Let ashore
    - paragraph: Select a place to see its options.
    - button "Open tide and pier forecast" [ref=e45] [cursor=pointer]:
      - generic [aria-hidden] [ref=e46]: "!"
      - strong [ref=e48]: Bell Pier floods in 5 actions.
    - navigation "Cove view" [ref=e49]:
      - button "Play view" [active] [pressed] [ref=e50] [cursor=pointer]
      - button "Back to boat" [ref=e51] [cursor=pointer]
  - status [ref=e52]: 3 actions completed. Bell Pier floods in 5 actions.
```