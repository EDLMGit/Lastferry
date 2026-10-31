# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phone-playability.spec.ts >> phone rotation: selected place, open subset and confirmed journey retain state and anchors
- Location: tests\e2e\phone-playability.spec.ts:446:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - region "The Holding Pier" [ref=e4]:
    - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - heading "The Holding Pier" [level=1] [ref=e9]
        - paragraph [ref=e10]: Bring all three passengers to Harbor
      - generic "Crossing progress" [ref=e11]:
        - strong [ref=e12]: Depth 2 · 2/4 spaces
        - generic [ref=e13]: 00 actions · Tide 0 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [disabled] [ref=e15]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
        - button "Mute sound" [ref=e18] [cursor=pointer]: ♫
    - navigation "Map stops":
      - generic:
        - button "Select Harbor; adjacent passage available; Home, delivery destination":
          - generic: Harbor · Home
      - generic:
        - button "Select Stone Pier; current location":
          - generic [aria-hidden] [ref=e20] [cursor=pointer]: •
          - generic [ref=e21] [cursor=pointer]: Stone Pier
      - generic:
        - button "Select Shallows; adjacent, too shallow":
          - generic [aria-hidden] [ref=e24] [cursor=pointer]: ╱
          - generic [ref=e25] [cursor=pointer]: Shallows
      - generic:
        - button "Select Rabbit Pier; no direct passage" [expanded]:
          - generic:
            - generic [aria-hidden]: ◇
          - generic: Rabbit Pier
    - navigation "Passenger actions at Stone Pier" [ref=e27]:
      - button "Let Moss ashore; choose passengers" [ref=e28] [cursor=pointer]:
        - generic [ref=e31]: Let ashore
    - region [ref=e32]:
      - generic [ref=e33]:
        - generic [ref=e34]:
          - paragraph [ref=e35]: Free inspection
          - heading "Rabbit Pier" [level=2] [ref=e36]
        - button "Close location card" [ref=e37] [cursor=pointer]: ×
      - generic [ref=e38]:
        - paragraph [ref=e39]: No direct passage from Stone Pier.
        - paragraph [ref=e40]: Pip and Rue wait here.
        - paragraph [ref=e41]: Rabbit Pier floods in 4 actions.
    - button "Open tide and pier forecast" [ref=e42] [cursor=pointer]:
      - generic [aria-hidden] [ref=e43]: "!"
      - strong [ref=e45]: Rabbit Pier floods in 4 actions.
    - navigation "Cove view" [ref=e46]:
      - button "Whole cove" [ref=e47] [cursor=pointer]
  - status [ref=e48]: Rabbit Pier selected. Inspection is free.
```