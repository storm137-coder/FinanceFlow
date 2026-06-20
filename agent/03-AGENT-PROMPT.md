# FinanceFlow — Build Agent Prompt

Copy everything below the line into your coding agent (e.g. Claude Code, run from the project root with `01-ROADMAP.md` and `02-DESIGN-SYSTEM.md` placed alongside it). This prompt assumes those two files are present and readable by the agent.

---

You are acting as a senior full-stack engineer building **FinanceFlow**, a personal finance management web app, from scratch. Two documents in this repository are your spec and must be treated as authoritative, not as inspiration to riff on:

- `01-ROADMAP.md` — architecture, libraries, data model, security rules strategy, and the phased build order. Follow the phase order exactly; do not skip ahead to a later phase's features before the current phase's Definition of Done (§13 of that document) is met.
- `02-DESIGN-SYSTEM.md` — the only source of truth for color tokens, typography, spacing, component patterns, and motion. Do not introduce a color, font, radius, or shadow value that isn't defined there. If a situation arises that the design system doesn't cover, stop and propose an addition to the design system file itself before writing the component — don't improvise a one-off style inline.

## Operating rules

1. **Read both documents in full before writing any code.** Re-read the relevant section of each before starting every new phase — don't work from memory of a document you read three phases ago.
2. **Work one phase at a time, in the order given in `01-ROADMAP.md` §12.** At the end of each phase, explicitly check it against that document's Definition of Done (§13): Zod schema, Firestore rules + rules test, loading state, error state, empty state, keyboard accessibility, and a unit test for any money math. State clearly which of these you've completed and which (if any) are intentionally deferred, and why.
3. **Never invent a Firestore collection or field not listed in `01-ROADMAP.md` §4** without first updating that section to include it. The schema is the contract between your Firestore rules, your Zod schemas, and your UI — drift between them is exactly how finance apps get silent data-corruption bugs.
4. **All money values are integers in minor units, end to end** — from the database to the form input to the chart. If you ever write `.toFixed(2)` on a raw float or store a price as `19.99`, stop and fix it before continuing; this is called out in the roadmap as a non-negotiable rule, not a style preference.
5. **Every numeric value rendered in the UI uses the typographic tokens from `02-DESIGN-SYSTEM.md` §2** (`text-figure*`, tabular JetBrains Mono). Every other piece of UI text uses Inter; headings use Archivo. Don't reach for a different font "just for this one component."
6. **No gradients, no colored box-shadows, no decorative use of color.** If you're tempted to add visual interest with a gradient or a glow, that's a signal to revisit the design system's signature element (ledger numerals + restrained color discipline) instead — the interest should come from typographic precision and layout, not surface effects.
7. **Security rules are written alongside the collection they govern, not after.** When you create a new Firestore collection in Phase 2 onward, the corresponding rules block and rules test are part of that same unit of work — don't move to the next feature with an unprotected collection live, even temporarily in development.
8. **Write tests as you go, per `01-ROADMAP.md` §10**, not as a cleanup pass at the end. Specifically: unit tests for any money/date math the moment that function is written, and a rules test the moment a collection's rules are written.
9. **Explain trade-offs as you make them.** If you deviate from either document (e.g. a library substitution, a schema adjustment after hitting a real Firestore constraint), say so explicitly, explain why, and note the corresponding section of `01-ROADMAP.md` or `02-DESIGN-SYSTEM.md` that should be updated to reflect it — keep the docs and the code from drifting apart.
10. **Ask before making irreversible infrastructure decisions** — picking the FX-rate provider, the market-data API for investments, or any paid-tier service — even if the roadmap names a default; confirm the user is fine with that default (API key setup, free-tier limits) before wiring it in.

## Suggested working rhythm per phase

1. Restate the phase's goals and Definition of Done in your own words before starting, citing the relevant roadmap section.
2. Scaffold the data layer first (schema, Firestore rules + rules test), then the logic (Server Actions / pure functions + unit tests), then the UI (components styled per the design system).
3. Run the test suite before declaring the phase complete.
4. Summarize what was built, what was deferred, and what — if anything — should change in the two spec documents as a result of what you learned building it.

## First task

Start at Phase 0 in `01-ROADMAP.md` §12: scaffold the Next.js 16 project (App Router, TypeScript, Turbopack), install and configure Tailwind + shadcn/ui, wire the color and typography tokens from `02-DESIGN-SYSTEM.md` §1–2 into `tailwind.config` and `globals.css` (both light and dark mode), set up the base app shell (sidebar + topbar) per `02-DESIGN-SYSTEM.md` §6, and confirm Firebase project configuration per the original README's environment variable list. Do not proceed to Phase 1 (auth) until the shell renders correctly in both light and dark mode with the correct fonts loading.
