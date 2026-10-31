# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> responsive 1024x600 touch: local card, forecast, breakpoint resize and nine-action rescue
- Location: tests\e2e\responsive.spec.ts:94:5

# Error details

```
Test timeout of 60000ms exceeded.
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
        - generic [ref=e13]: 06 actions · Tide 1 · Home 0/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [ref=e15] [cursor=pointer]
        - button "Wait · 1 action" [ref=e16] [cursor=pointer]
        - button "Menu" [ref=e17] [cursor=pointer]
    - navigation "Map stops":
      - generic [ref=e18]:
        - button "Sail to Harbor" [ref=e19] [cursor=pointer]:
          - generic [aria-hidden] [ref=e20]: ○
          - generic [ref=e21]:
            - generic [ref=e22]: Sail to Harbor
            - generic [ref=e23]: 1 action
        - button "Inspect passage to Harbor for free" [ref=e24] [cursor=pointer]: Inspect
      - button "You are at Stone Pier" [active] [ref=e26] [cursor=pointer]:
        - generic [aria-hidden] [ref=e27]: ●
        - generic [ref=e28]:
          - generic [ref=e29]: Stone Pier
          - generic [ref=e30]: You are here
      - generic [ref=e31]:
        - button "Sail to Shallows" [ref=e32] [cursor=pointer]:
          - generic [aria-hidden] [ref=e33]: ○
          - generic [ref=e34]:
            - generic [ref=e35]: Sail to Shallows
            - generic [ref=e36]: 1 action
        - button "Inspect passage to Shallows for free" [ref=e37] [cursor=pointer]: Inspect
      - 'button "Rabbit Pier: no direct passage" [ref=e39] [cursor=pointer]':
        - generic [aria-hidden] [ref=e40]: ◇
        - generic [ref=e41]:
          - generic [ref=e42]: Rabbit Pier
          - generic [ref=e43]: No direct passage
    - region [ref=e44]:
      - heading "Stone Pier" [level=2] [ref=e45]
      - generic [ref=e46]:
        - button "Board Moss" [ref=e47] [cursor=pointer]
        - button "Let Pip and Rue ashore" [ref=e48] [cursor=pointer]
    - button "Open tide and pier forecast" [ref=e49] [cursor=pointer]:
      - generic [aria-hidden] [ref=e50]: ≈
      - generic [ref=e51]:
        - strong [ref=e52]: Pip and Rue are safe aboard.
        - generic [ref=e53]: Moss waits safely at Stone Pier.
  - status [ref=e54]: 6 actions completed. Pip and Rue are safe aboard.
```