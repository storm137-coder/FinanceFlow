# FinanceFlow — Mobile Refinement Agent Prompt

Copy everything below the line into your coding agent, run from the root of the **existing, already-built** FinanceFlow Next.js project. This is a refinement pass on real code, not a greenfield build — treat the current codebase as the source of truth for what exists, and `04-MOBILE-LAYOUT.md` (plus `02-DESIGN-SYSTEM.md` for tokens) as the source of truth for what the mobile experience should become.

---

You are doing a responsive-design refinement pass on FinanceFlow, an already-functioning Next.js finance app. Desktop (≥1024px) is considered correct and final — your job is to bring everything below that breakpoint up to the spec in `04-MOBILE-LAYOUT.md`, without regressing desktop.

## Before touching any code

1. Read `04-MOBILE-LAYOUT.md` in full, then re-read `02-DESIGN-SYSTEM.md` §1–4 (tokens and component patterns) since the mobile spec reuses them rather than redefining them.
2. Audit the current codebase: list every page/route, every `Dialog` usage, every `Table` usage, and the current sidebar/topbar implementation. This becomes your worklist — map each item to the section of `04-MOBILE-LAYOUT.md` that governs it before changing anything.
3. Confirm the current Tailwind config's breakpoints match the map in `04-MOBILE-LAYOUT.md` §2 (the `lg` = 1024px line is load-bearing for this whole pass — verify it, don't assume it).

## Operating rules

1. **Desktop must not regress.** Every change is additive at the breakpoint level — use Tailwind's responsive prefixes (`lg:` for desktop-only rules) rather than changing the base/mobile-first styles in a way that could leak upward. After each component, sanity-check it at both a 1280px and a 375px viewport.
2. **Reuse components, don't fork them.** A `Dialog` becoming a `Sheet` on mobile (per §6) should be one component with responsive behavior (shadcn's `Sheet` already supports this, or use a single wrapper that picks the right primitive by breakpoint) — not a `TransactionFormDesktop` and a `TransactionFormMobile` that have to be kept in sync by hand forever.
3. **The table → card transformation (§5) is one shared pattern, used everywhere a table currently exists.** Build it once as a generic `<ResponsiveDataList>` (or similarly named) component that takes the same data/columns a table would and renders either, switching on breakpoint — then replace every table usage with it, rather than writing one-off card markup per page.
4. **Numbers never lose their `text-figure*` tokens or right-alignment, on any screen size, in any layout.** This is the one rule from the original design system that must survive every transformation in this pass unchanged — check it explicitly on every card/list you touch.
5. **No new colors, fonts, radii, or shadows.** This is a layout and density pass, not a restyle — every value you use must already exist as a token in `02-DESIGN-SYSTEM.md`.
6. **Touch targets, safe areas, and gesture patterns (§7–8) are implemented as shared utilities/hooks** (e.g. a `useSafeAreaInsets` hook, a shared `SwipeableRow` wrapper) — not copy-pasted inline styles per component.
7. **Test against the Definition of Mobile-Ready (§10) per page before moving to the next one.** Don't do a single pass across all pages touching only navigation, then a second pass touching only tables — finish one page completely (nav context included) before starting the next, so you can verify the whole page against §10 in one go.
8. **Flag any page where the desktop table has more columns than will sensibly fit the card pattern in §5** (e.g. if a table has 6+ data columns) before improvising a denser card — ask whether some columns should move to a detail-sheet-on-tap instead of cramming into the card, since that's a product decision, not a styling one.

## Suggested order of work

1. Navigation shell first: bottom tab bar, FAB, mobile topbar, More sheet (§3) — everything else is easier to verify once you can actually navigate the mobile layout.
2. Build the shared `<ResponsiveDataList>` pattern (§5) against the Transactions page (highest-traffic table), verify it fully, then roll it out to Loans schedule, and anywhere else a table exists.
3. Convert dialogs to responsive sheets (§6), starting with Add Transaction since it's reachable from the new FAB.
4. Page-by-page pass through Dashboard, Budgets, Goals, Investments, Wishlist, Settings per the layouts in §4, applying the typography/density adjustments in §9 as you go.
5. Gesture and accessibility pass last (§7, §10) — swipe actions, pull-to-refresh, safe-area verification, reduced-motion check, screen-reader pass — once the layout itself is stable.

## First task

Start with the navigation shell (step 1 above): implement the bottom tab bar and mobile topbar per `04-MOBILE-LAYOUT.md` §3, gated behind the `lg` breakpoint so desktop's existing sidebar is untouched above it. Show me the result at 375px and 1280px before moving on to the Transactions table conversion.
