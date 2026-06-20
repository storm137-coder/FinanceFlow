# FinanceFlow — Design System

No gradients, anywhere. This is a tool for trust — the design should read like a well-kept ledger, not a fintech marketing page. Built on shadcn/ui (Radix primitives + Tailwind), themed from scratch rather than left at shadcn defaults.

## Design Plan (read this before the tokens)

**Subject grounding.** The thing FinanceFlow's users actually do is reconcile numbers — check a balance, compare a budget to a limit, see if a goal moved. The one place a finance app must never fail visually is number alignment and number legibility. That becomes this system's organizing idea.

**Signature element: ledger numerals.** Every number in the product — balances, transaction amounts, percentages, dates in tables — renders in a tabular monospace face, so columns line up exactly the way they do in a paper ledger or a spreadsheet. UI chrome (labels, nav, buttons) uses a separate humanist grotesk. This single typographic rule does more for the "feels like a serious finance tool" goal than any color choice could, and it's the one place this system spends its boldness.

**Color discipline.** Color carries meaning, not decoration. Outside of the accent (used only for primary actions) and the income/expense semantic pair (used only for financial direction), the interface is neutral ink-on-paper. If a component reaches for color and it isn't one of those three jobs, it's wrong.

**What this avoids on purpose.** No warm cream background with serif display type. No near-black background with a single neon accent. No zero-radius broadsheet density. Backgrounds are cool neutral, not warm cream; the accent is a restrained gold used sparingly, not a glowing neon; radius is small and consistent rather than zero. Reduced-motion is respected throughout, and no shadow ever simulates a light source — elevation comes from a 1px border and a very slightly different surface tone, never a glow.

---

## 1. Color Tokens

Describe these as actual Tailwind CSS variables (`globals.css`), consumed via shadcn's `hsl(var(--token))` convention. Hex values given for clarity; convert to HSL in implementation.

### Light mode

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#F7F8FA` | App background — cool neutral, never warm/cream |
| `--surface` | `#FFFFFF` | Cards, panels, modals |
| `--surface-sunken` | `#EEF0F3` | Table header rows, input backgrounds |
| `--border` | `#E2E5EA` | Hairlines, dividers, card edges |
| `--ink` | `#14171F` | Primary text |
| `--ink-muted` | `#5B6573` | Secondary text, labels, captions |
| `--accent` | `#B8860F` | Primary actions, active nav state, focus highlights — used sparingly |
| `--accent-foreground` | `#FFFFFF` | Text/icon on accent surfaces |
| `--positive` | `#1F7A5C` | Income, gains, "on track" budget/goal state |
| `--negative` | `#C0392B` | Expenses, losses, over-budget state |
| `--warning` | `#B8860F` | Approaching-limit budget state (shares the accent hue deliberately — it's a caution, not a new color family) |
| `--ring` | `#B8860F` | Focus ring color, all interactive elements |

### Dark mode

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#0E1116` | App background — deep ink, not pure black |
| `--surface` | `#161A21` | Cards, panels, modals |
| `--surface-sunken` | `#1C2129` | Table header rows, input backgrounds |
| `--border` | `#262B35` | Hairlines, dividers |
| `--ink` | `#EDEEF0` | Primary text |
| `--ink-muted` | `#9AA3AF` | Secondary text, labels |
| `--accent` | `#D9A441` | Primary actions (brightened for dark-surface contrast) |
| `--positive` | `#34A37D` | Income, gains |
| `--negative` | `#E0584A` | Expenses, losses |

**Rule:** never introduce a gradient between any two of these tokens. A "highlighted" card gets a 1px accent-colored border or a flat `--surface-sunken` fill — never a gradient wash.

---

## 2. Typography

Three roles, three faces. None of these are the Inter-everywhere default — Inter appears, but only for one job.

| Role | Face | Where |
|---|---|---|
| Display / Headings | **Archivo** (600/700) | Page titles, section headers, stat card labels — geometric, slightly condensed, gives the UI a structural backbone |
| Body / UI text | **Inter** (400/500) | Paragraphs, nav items, form labels, buttons, descriptions |
| Numerals / Data | **JetBrains Mono** (400/500), tabular figures forced via `font-feature-settings: "tnum"` | Every currency amount, percentage, date-in-a-table, account number, transaction count — without exception |

### Type scale

| Token | Size / Line-height | Face | Use |
|---|---|---|---|
| `text-display` | 32px / 40px | Archivo 700 | Page title (e.g. "Dashboard") |
| `text-h2` | 22px / 28px | Archivo 600 | Section headers (e.g. "Recent Transactions") |
| `text-h3` | 16px / 24px | Archivo 600 | Card titles |
| `text-body` | 14px / 20px | Inter 400 | Default body text |
| `text-caption` | 12px / 16px | Inter 500 | Labels, helper text, table headers (uppercase, `tracking-wide`) |
| `text-figure-lg` | 28px / 32px | JetBrains Mono 500, tabular | Hero balance figures |
| `text-figure` | 14px / 20px | JetBrains Mono 400, tabular | In-table amounts, dates |
| `text-figure-sm` | 12px / 16px | JetBrains Mono 400, tabular | Percentages, secondary figures |

**Non-negotiable:** any element bound to a numeric financial value uses a `text-figure*` token, never `text-body`. This is the one typographic rule worth enforcing in code review.

---

## 3. Spacing, Grid, and Radius

- **Spacing scale:** Tailwind defaults (4px base unit), used consistently — `gap-2` (8px) inside tight clusters like icon+label, `gap-4` (16px) between form fields, `gap-6` (24px) between cards, `gap-8` (32px) between page sections.
- **Page grid:** 12-column CSS grid for dashboard widgets, `max-w-7xl` content container, `px-6` page padding on desktop, `px-4` on mobile.
- **Card grid example:** stat cards span `col-span-3` each (4 across) on desktop, `col-span-6` (2 across) on tablet, `col-span-12` (stacked) on mobile.
- **Border radius:** `--radius: 8px` everywhere — cards, inputs, buttons, dialogs. Not 0 (too austere for a daily-use dashboard), not 16px+ (too soft/consumer for a finance tool). Badges and avatar/icon containers may use `--radius-sm: 4px`.
- **Elevation:** no box-shadow with blur exceeding 8px, and never colored shadows. Default card elevation is a 1px `--border` outline on `--surface`. A single `shadow-sm` (subtle, near-black at low opacity) is reserved for floating elements only — dropdowns, popovers, dialogs — never for static cards.

---

## 4. Component Patterns (on shadcn/ui)

Use shadcn's CLI to generate these as owned components, then theme via the tokens above — don't leave any at default Tailwind/shadcn palette.

- **`Card`** — used for every dashboard widget and form section. Header uses `text-h3`, no icon-in-a-colored-circle decoration unless the icon itself is informative (e.g. account type icon).
- **`Table`** — transaction lists, loan schedules. Row separators are 1px `--border` hairlines, no zebra striping (it fights the ledger-numeral alignment goal rather than supporting it). Numeric columns are right-aligned and use `text-figure`.
- **`Badge`** — transaction category tags, budget status ("On track" / "Near limit" / "Over") using `--positive` / `--warning` / `--negative` as a 1px border + tinted text, never a solid filled background (keeps the interface calm; color marks state, doesn't shout it).
- **`Progress`** — budget and goal progress bars. Track is `--surface-sunken`, fill is `--positive` under 80%, `--warning` 80–100%, `--negative` over 100%. No gradient fill.
- **`Dialog` / `Sheet`** — Dialog for short, single-purpose actions (add transaction, confirm delete). Sheet (slide-over) for multi-step or detail-heavy flows (loan setup, investment detail).
- **`Tabs`** — used for time-range switches (Week / Month / Year) on charts and reports, not for primary navigation (that's the sidebar).
- **`Sidebar` nav** — persistent left sidebar on desktop (Dashboard, Transactions, Budgets, Goals, Loans, Investments, Wishlist, Settings), collapses to icon-only at `lg` breakpoint, becomes a bottom sheet/drawer on mobile. Active item marked with a 2px `--accent` left border + `--ink` text — not a filled background block.
- **`Stat Card`** — composite pattern: `text-caption` label, `text-figure-lg` value, small directional indicator (▲/▼ glyph in `--positive`/`--negative`, paired with `text-figure-sm` percentage) — this directional glyph + color pairing is the only place color is allowed to carry emphasis beyond text.
- **Charts (Recharts)** — line/area charts use `--accent` for the primary series only; multi-series charts (e.g. spend by category) use a defined categorical palette of 6 *desaturated* hues derived from the token set, never default Recharts rainbow colors. Axis labels and tooltips use `text-figure-sm`. Gridlines are `--border` at reduced opacity, horizontal only (no vertical gridlines — reduces visual noise on time-series).
- **Forms** — RHF + Zod + shadcn `Form` components. Every numeric input (amount fields) right-aligns text and uses the mono figure face while typing, not just on display. Inline validation errors appear in `--negative` text below the field, never as a red border alone (color-blind accessibility).
- **Empty states** — icon (outline, `--ink-muted`), one line of `text-body` explaining what belongs here, one primary action button. Written in the interface's voice: "No transactions yet. Add your first one to start tracking." — not "Oops! Nothing here :(".
- **Toasts (Sonner)** — bottom-right, auto-dismiss 4s for success, persistent-until-dismissed for errors. Success toasts use a `--positive` left accent bar on a neutral `--surface` background, not a filled green toast — keeps notifications calm rather than alarming.
- **Skeleton loading** — shape-matched skeletons (card-shaped, table-row-shaped) using `--surface-sunken`, never a generic centered spinner for data that has a known shape.

---

## 5. Motion (Framer Motion)

Used for orientation, not decoration:
- Page-level content fades/slides in once (`opacity 0→1`, `y: 8px→0`, 150ms) on route change — not on every re-render.
- Number changes (balance updates, progress bar fills) animate the *value* via a count-up/down transition, not the container — reinforces that the number is the thing that matters.
- List items (new transaction added) animate in with a 120ms height+opacity transition; deletions animate out, never just disappear.
- Respect `prefers-reduced-motion`: disable count-up and slide transitions, keep instant state changes, for any user with that OS-level preference set.
- No hover-scale on cards, no parallax, no scroll-jacking — this is a daily-use utility, not a landing page.

---

## 6. Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Topbar: [Logo]   [Date range ▾]  [Currency ▾]  [Avatar] │
├───────────┬───────────────────────────────────────────┤
│ Sidebar   │  Page content (max-w-7xl, 12-col grid)    │
│ Dashboard │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│ Trans...  │  │ Stat   │ │ Stat   │ │ Stat   │ │ Stat │ │
│ Budgets   │  └────────┘ └────────┘ └────────┘ └──────┘ │
│ Goals     │  ┌───────────────────────┐ ┌─────────────┐ │
│ Loans     │  │ Spend-by-category     │ │ Budget      │ │
│ Investmts │  │ chart (col-span-8)    │ │ alerts      │ │
│ Wishlist  │  └───────────────────────┘ └─────────────┘ │
│ Settings  │  ┌───────────────────────────────────────┐ │
│           │  │ Recent transactions table              │ │
└───────────┴───────────────────────────────────────────┘
```

Mobile: sidebar becomes a bottom tab bar (5 primary items) + "More" overflow; topbar collapses date-range/currency selectors into a single filter sheet trigger.

---

## 7. Accessibility Baseline

- All text meets WCAG AA contrast against its background at minimum (4.5:1 body, 3:1 large text) — verify both light and dark token sets, not just light.
- Every interactive element has a visible `--ring` focus state, including custom shadcn components — never rely on browser default outline alone, but never remove focus outlines without replacing them.
- Color is never the only signal: budget/goal status pairs color with text and/or icon (e.g. "Over" badge, not just a red bar).
- All charts have a text-based data table alternative or accessible summary available (even if visually hidden), since Recharts SVGs aren't reliably screen-reader friendly on their own.
- Forms use proper `label` association via shadcn `FormLabel`, error messages linked via `aria-describedby`.

---

## 8. Voice & Copy

- Active voice, present tense, names what the *person* does: "Add transaction," not "Submit entry."
- Errors state what happened and how to fix it, without apologizing: "That amount needs to be a positive number." not "Oops, something went wrong!"
- Empty states are an invitation, not a void: always pair the empty message with the one action that fills it.
- Numbers are never rounded silently in a way that could mislead — if a UI element shows a rounded figure (e.g. "₹12.4K"), the exact figure is available on hover/tap.
