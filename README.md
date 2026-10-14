# Portfolio

Interactive portfolio of Juan Esteban Álvarez García: a PC motherboard whose components open the sections of his profile.

**Live site:** <https://juan-esteban-alvarez.pages.dev>

![The scene: a motherboard seen from above, with a power supply, a fan and a front panel around it](public/scene/scene-1920.dc169b385cc7.jpg)

## How it is built

The site is written with spec-driven development. Every behavior is first described in a specification, with numbered requirements and acceptance criteria, and only then implemented. Each automated test cites the criterion it verifies, and a traceability test fails if an implemented spec has a criterion that no test covers.

The specifications are the source of truth, and they are written in Spanish. Start at [`specs/README.md`](specs/README.md), which indexes them and records every decision taken along the way.

Some of what they ask for:

- **A static site.** No application server, no database and no cookies. The URL is the state: every section has its own address.
- **Two layers.** A plain page that works without JavaScript and on a phone, and over it, on a large enough screen, the interactive scene.
- **Accessible.** Keyboard navigation throughout, WCAG 2.2 AA contrast, reduced motion respected, and an automated audit of every state of the interface.
- **Two languages.** Spanish and English, with the same content.
- **A strict content security policy.** Inline scripts are allowed by hash, never with `unsafe-inline`.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, static export) and React 19
- TypeScript 6 in strict mode
- Tailwind CSS 4
- Zustand for the little state that does not live in the URL
- Vitest and Testing Library for unit and component tests
- Playwright, with axe, for end-to-end tests in Chromium, Firefox and WebKit
- Lighthouse CI for performance budgets
- pnpm, with exact versions and a minimum release age of seven days
- GitHub Actions for CI and Cloudflare Pages for hosting

## Commands

The project needs Node 24 and pnpm 11.

```bash
pnpm install    # install the dependencies
pnpm dev        # development server at http://localhost:3000
pnpm check      # the full gate: format, lint, types, tests, assets, build and end-to-end tests
pnpm build      # static export to out/
```

`pnpm build` needs `NEXT_PUBLIC_SITE_URL`, the public origin of the site; `.env.example` has the value for local work.

## Status

[![CI](https://github.com/Onstrax/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Onstrax/portfolio/actions/workflows/ci.yml)

Every push to `main` runs the gate in GitHub Actions, in the three browser engines, together with Lighthouse. Only a commit that passes it is published.

## License

The source code, configuration, scripts, tests and specifications are released under the [MIT License](LICENSE).

The content is not: all rights are reserved on the profile texts (`src/features/*/content/`), the résumés (`public/cv/`), the portrait (`design/portrait/`, `public/portrait/`) and the scene image and the files derived from it (`design/scene/`, `public/scene/`, `public/og/`).
