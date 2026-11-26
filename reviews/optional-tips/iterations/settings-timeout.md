# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: optional-tips.spec.ts >> shared Tips keyboard access, persistence and blocked storage
- Location: tests\e2e\optional-tips.spec.ts:173:1

# Error details

```
Test timeout of 180000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - main [ref=f1e3]:
    - region "The Holding Pier" [ref=f1e4]:
      - generic "The Holding Pier. Use the labeled waypoint controls to navigate." [ref=f1e6]
    - status [ref=f1e7]
  - region "Last Ferry home" [ref=f1e8]:
    - generic [ref=f1e9]:
      - heading "Last Ferry" [level=1] [ref=f1e10]
      - paragraph [ref=f1e11]: The Long Tide
    - navigation "Home" [ref=f1e12]:
      - paragraph [ref=f1e13]: A wider deck · saved story.
      - button "Continue" [ref=f1e14] [cursor=pointer]
      - generic [ref=f1e15]:
        - button "Options" [ref=f1e16] [cursor=pointer]
        - button "Practice" [ref=f1e17] [cursor=pointer]
      - generic [ref=f1e18]:
        - button "Enable sound" [ref=f1e19] [cursor=pointer]
        - button "New journey" [ref=f1e20] [cursor=pointer]
```