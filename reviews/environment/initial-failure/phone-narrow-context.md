# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> phone-narrow-contextual: full-width cove, free inspection, modal safety and tide-boundary subsets
- Location: tests\e2e\navigation.spec.ts:62:3

# Error details

```
Test timeout of 90000ms exceeded.
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
        - strong [ref=e12]: Depth 1 · 0/4 spaces
        - generic [ref=e13]: 09 actions · Tide 2 · Home 3/3
      - navigation "Crossing controls" [ref=e14]:
        - button "↶ Undo" [disabled] [ref=e15]
        - button "Wait · 1 action" [disabled] [ref=e16]
        - button "Menu" [disabled] [ref=e17]
    - navigation "Map stops":
      - button "You are at Harbor" [disabled] [ref=e19]:
        - generic [aria-hidden] [ref=e20]: ●
        - generic [ref=e21]:
          - generic [ref=e22]: Harbor
          - generic [ref=e23]: You are here
      - generic [ref=e24]:
        - button "Sail to Stone Pier" [disabled] [ref=e25]:
          - generic [aria-hidden] [ref=e26]: ○
          - generic [ref=e27]:
            - generic [ref=e28]: Sail to Stone Pier
            - generic [ref=e29]: 1 action
        - button "Inspect passage to Stone Pier for free" [disabled] [ref=e30]: Inspect
      - 'button "Shallows: no direct passage" [disabled] [ref=e32]':
        - generic [aria-hidden] [ref=e33]: ◇
        - generic [ref=e34]:
          - generic [ref=e35]: Shallows
          - generic [ref=e36]: No direct passage
      - 'button "Rabbit Pier: no direct passage" [disabled] [ref=e38]':
        - generic [aria-hidden] [ref=e39]: ◇
        - generic [ref=e40]:
          - generic [ref=e41]: Rabbit Pier
          - generic [ref=e42]: No direct passage
    - button "Open tide and pier forecast" [disabled] [ref=e43]:
      - generic [aria-hidden] [ref=e44]: ≈
      - generic [ref=e45]:
        - strong [ref=e46]: Everyone is safely home.
        - generic [ref=e47]: 3 passengers delivered in 9 actions.
    - status [ref=e48]: Finishing this action…
  - status [ref=e49]: 8 actions completed. Pip, Rue and Moss are safe aboard.
```