# Original harness failure

The first attempt did not reach a browser check. The new source manifest helper assumed an optional `public/` folder existed and threw ENOENT in beforeAll and afterAll. The original Playwright context is retained as `original-context.md`. The helper now includes that directory only when present, matching the earlier capture convention.

Playwright's web-server teardown did not return promptly after this beforeAll failure. It was interrupted after preserving the error. A persistent preview on port 5271 was then started and reused for subsequent runs. No application defect or passed browser case is claimed for this attempt.
