# Official technical references

Consulted 20 October 2026. These support the implementation workflow and selected tools. The game concept, level rules, visual targets, and scope are project design decisions developed in this conversation.

- [OpenAI: Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) — repository guidance discovery and concise code-review rules. This package uses one practical root file.
- [OpenAI: Building games with Astra](https://developers.openai.com/blog/how-to-build-games-with-astra) — an example of TypeScript/Vite/Three.js development using repeatable scenes, game-state inspection, screenshots, browser journeys, and human review. It is a workflow reference, not evidence that this game's art or mechanics are implemented.
- [Vite: Getting Started](https://vite.dev/guide/) — project setup and current runtime prerequisites. Preserve the starter documents when creating the app in a nonempty directory.
- [Three.js documentation](https://threejs.org/docs/) — renderer, orthographic camera, geometry, materials, animation, and asset-loading APIs. Consult the installed release's documentation during implementation.
- [Vitest: Getting Started](https://vitest.dev/guide/) — test setup and compatibility requirements.
- [Playwright: Visual comparisons](https://playwright.dev/docs/test-snapshots) — browser screenshot comparison workflow. Environment-dependent captures need consistent viewport and runtime information.
- [Node.js releases](https://nodejs.org/en/about/previous-releases) — Node 24 is an LTS line at the time of this package. The package selects it as a baseline, rather than assuming an unspecified newest version.

No model version, pricing, paid asset service, or account-specific capability is required by this package. Resolve actual package versions at implementation time and retain the lockfile.
