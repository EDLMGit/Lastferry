# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bellwater.spec.ts >> Bellwater 844x390 touch: six stops, actual subset loss, safe boundaries, complete Undo and rescue
- Location: tests\e2e\bellwater.spec.ts:294:3

# Error details

```
Test timeout of 60000ms exceeded.
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
        - strong [ref=e12]: Depth 3 · 4/4 spaces
        - generic [ref=e13]: 08 actions · Tide 2 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [ref=e15] [cursor=pointer]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
    - navigation "Map stops":
      - generic [ref=e18]:
        - button "Sail to Harbor" [active] [ref=e19] [cursor=pointer]:
          - generic [aria-hidden] [ref=e20]: ○
          - generic [ref=e21]:
            - generic [ref=e22]: Sail to Harbor
            - generic [ref=e23]: 1 action
        - button "Inspect passage to Harbor for free" [ref=e24] [cursor=pointer]: Inspect
      - 'button "Shallows: no direct passage" [ref=e26] [cursor=pointer]':
        - generic [aria-hidden] [ref=e27]: ◇
        - generic [ref=e28]:
          - generic [ref=e29]: Shallows
          - generic [ref=e30]: No direct passage
      - 'button "Low Pier: no direct passage" [ref=e32] [cursor=pointer]':
        - generic [aria-hidden] [ref=e33]: ◇
        - generic [ref=e34]:
          - generic [ref=e35]: Low Pier
          - generic [ref=e36]: No direct passage
      - 'button "West Buoy: no direct passage" [ref=e38] [cursor=pointer]':
        - generic [aria-hidden] [ref=e39]: ◇
        - generic [ref=e40]:
          - generic [ref=e41]: West Buoy
          - generic [ref=e42]: No direct passage
      - 'button "East Buoy: no direct passage" [ref=e44] [cursor=pointer]':
        - generic [aria-hidden] [ref=e45]: ◇
        - generic [ref=e46]:
          - generic [ref=e47]: East Buoy
          - generic [ref=e48]: No direct passage
      - button "You are at Bell Pier" [ref=e50] [cursor=pointer]:
        - generic [aria-hidden] [ref=e51]: ●
        - generic [ref=e52]:
          - generic [ref=e53]: Bell Pier
          - generic [ref=e54]: You are here
    - button "Open tide and pier forecast" [ref=e55] [cursor=pointer]:
      - generic [aria-hidden] [ref=e56]: ≈
      - strong [ref=e58]: Tansy, Lark and Bram are safe aboard.
  - status [ref=e59]: 8 actions completed. Tansy, Lark and Bram are safe aboard.
```