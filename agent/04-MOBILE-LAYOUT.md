# FinanceFlow — Mobile Layout Spec

This extends `02-DESIGN-SYSTEM.md` §6 (which only sketched the mobile shell) into a full spec for refining the existing Next.js app's responsive behavior. No new codebase, no new tokens — same colors, same Archivo/Inter/JetBrains Mono type system, same "no gradients, color carries meaning" rule. The only thing changing is layout, navigation, and density at narrow viewports.

---

## 1. The core problem with porting a ledger UI to mobile

The desktop design system leans on tables with right-aligned tabular numerals — that works because there's enough horizontal space for label, category, date, and amount to sit on one row. On a 360–428px viewport, a multi-column table either truncates into illegibility or forces horizontal scroll, both of which break the "numbers are always legible and aligned" principle this whole system is built on.

The fix is not to shrink the table — it's to **transform dense table rows into stacked card rows** below the `md` breakpoint, while keeping every number rendered in the same `text-figure*` tokens so the ledger-numeral discipline survives the layout change. Section 5 below defines this transformation precisely so it isn't reinvented per-page.

---

## 2. Breakpoint Map

| Range | Tailwind | Layout mode |
|---|---|---|
| < 640px | base (mobile) | Single column, bottom tab bar, full-screen sheets, card-based lists |
| 640–1023px | `sm`/`md` (tablet) | Two-column stat grid, sidebar collapses to icon rail, sheets remain full-height but narrower |
| ≥ 1024px | `lg`+ (desktop) | Existing layout from `02-DESIGN-SYSTEM.md` §6 — full sidebar, 12-col grid, tables |

Treat `lg` (1024px) as the line between "phone/tablet patterns" and "desktop patterns" — not `md`. A lot of mobile-web redesigns fail by switching to desktop table layouts too early on tablet-sized phones in landscape; don't.

---

## 3. Navigation

**Bottom tab bar (< 1024px), replacing the sidebar entirely — not collapsing it.**

- Fixed to viewport bottom, height 56px + safe-area-inset-bottom, `--surface` background with a top `--border` hairline (no shadow).
- Five items, icon + `text-caption` label, active item in `--accent` (icon + label), inactive in `--ink-muted`: **Dashboard, Transactions, Budgets, Goals, More**.
- **More** opens a bottom sheet listing Loans, Investments, Wishlist, Settings — these are lower-frequency than the primary four, so they don't earn permanent tab real estate. Re-evaluate this list after real usage data; don't guess forever.
- Minimum tap target per item: 48×48px hit area even though the visual icon is smaller — pad with invisible touch area, don't rely on the icon's own bounding box.

**Topbar (< 1024px):**

- Collapses to: page title (`text-h3`, left) + a single filter icon button (right) that opens a bottom sheet containing the date-range and currency selectors that live inline in the desktop topbar.
- Avatar/account menu moves into the **More** sheet rather than staying in the topbar — keeps the mobile topbar to one row, 48px tall.

**Primary action (Add Transaction):**

- A floating action button (FAB), 56px circle, `--accent` background, fixed bottom-right, **above** the tab bar with 16px clearance, persistent on Dashboard and Transactions screens only (not on every screen — a FAB that's everywhere stops meaning "the main thing to do here").
- Opens the transaction form as a full-screen sheet (§6), not a dialog — dialogs that don't use the full viewport read as cramped on a phone.

---

## 4. Page-by-Page Mobile Layouts

**Dashboard**
Single column, stacked in priority order: balance stat card (full width, `text-figure-lg`) → horizontally scrollable row of secondary stat cards (income/expense/savings-rate, swipeable, snap-scroll, peek of the next card to hint scrollability) → spend-by-category chart (simplified, see §5) → budget alerts list → recent transactions (max 5, card rows, "View all" link to Transactions tab).

**Transactions**
Sticky search/filter bar at top (below topbar). List is card rows (§5), grouped by date with a `text-caption` date-section header (sticky within the scroll, like a contacts-list letter header). Infinite scroll with skeleton card rows, not numbered pagination — pagination controls are a poor touch target on mobile.

**Budgets**
Each budget is a card: category name + icon, progress bar (full width), limit and spent amounts as a `text-figure` pair right-aligned on one line beneath the bar. Cards stack single-column; no side-by-side comparison grid below `lg`.

**Goals**
Same card pattern as Budgets, swapped progress semantics (current/target instead of spent/limit). "Add goal" reachable via a standard `+` button in the page header, not the global FAB (FAB is reserved for transactions specifically, per above).

**Loans**
List of loan cards (name, EMI amount, next due date). Tapping a loan opens its schedule as a full-screen sheet with a card-per-installment list (date, principal/interest split, status badge) — the amortization table from desktop becomes this stacked list on mobile, same data, no horizontal table.

**Investments**
Card per holding: name, current value (`text-figure-lg`), gain/loss as the directional-glyph pattern from the Stat Card component (§4 of the design system). Tapping opens detail sheet with the chart full-width.

**Wishlist**
Simple card list, priority shown as a small left-edge color bar (reusing the `--positive`/`--warning`/`--negative` tokens for priority level — same restraint rule: this is the *only* added meaning for those colors here, nothing decorative).

**Settings**
Standard stacked list of grouped settings rows (account, currency/locale, theme, notifications, sign out) — this is the one screen that was already mobile-shaped on desktop, so just remove the sidebar/topbar chrome around it.

---

## 5. Table → Card Transformation Rule

Apply this transformation to every data table from the desktop spec when the viewport drops below `lg`. Don't redesign each table ad hoc — use this rule consistently:

```
Desktop table row:
[Category icon] [Merchant — text-body]  [Category — text-caption]  [Date — text-figure-sm]   [Amount — text-figure, right-aligned]

Mobile card row (single row, two lines):
┌─────────────────────────────────────────┐
│ [icon]  Merchant name           Amount   │  ← line 1: text-body + text-figure (amount, right-aligned, colored by direction)
│         Category · Date                  │  ← line 2: text-caption, --ink-muted
└─────────────────────────────────────────┘
```

- The amount keeps its `text-figure` mono treatment and right alignment even inside a card — this is the one thing that must never collapse to a generic left-aligned proportional-font number, on any breakpoint.
- Card padding: 12px vertical, 16px horizontal. Divider between cards is the same 1px `--border` hairline used in the desktop table — visually it should read as "the same ledger, fewer columns," not a different component.
- Swipe gesture on the card (left swipe reveals Edit/Delete actions, `--surface-sunken` background, standard 64px action width) replaces the row-hover action icons that exist on desktop.

---

## 6. Forms & Modals on Mobile

- Every `Dialog` from the desktop spec becomes a full-screen `Sheet` (slide up from bottom, covers 100% of viewport height minus a small top reveal of the page behind, standard iOS/Android sheet pattern) below `lg`. Same form fields, same Zod schema, same shadcn `Form` components — only the container changes.
- Sticky footer save bar: primary "Save" button pinned to the bottom of the sheet, above the keyboard when it's open (use `env(safe-area-inset-bottom)` and visual-viewport resize handling, not a fixed px offset, since keyboard height varies by device).
- Amount fields use `inputMode="decimal"` to surface the numeric keypad, and the field itself right-aligns text and uses the mono figure face while typing — matches the desktop rule from `02-DESIGN-SYSTEM.md` §4, just confirming it's not lost on mobile where it matters even more (numeric keypad entry benefits from immediate aligned feedback).
- Date pickers use the native mobile date input or a bottom-sheet calendar — never a small desktop-style popover calendar that's hard to tap accurately.
- Multi-step flows (loan setup wizard) show a slim progress indicator (e.g. "Step 2 of 4") at the top of the sheet, not a desktop-style horizontal stepper with labels that won't fit.

---

## 7. Touch & Gesture Patterns

- Minimum interactive target: 44×44px (iOS HIG) / 48×48dp (Material) — apply the larger of the two, 48px, as the project default for every tappable element including icon-only buttons.
- Pull-to-refresh on Dashboard and Transactions lists (standard pattern, triggers a refetch of the React Query cache, not a full page reload).
- Swipe-to-action on transaction/loan-installment cards (§5) — left swipe only, right swipe reserved for nothing (avoid ambiguity with browser back-gesture on some Android devices).
- Long-press is not used for any primary action — it's not discoverable enough on a finance app where the action (edit/delete) should be visible via the swipe reveal instead.

---

## 8. Safe Areas & Viewport

- `viewport` meta: `width=device-width, initial-scale=1, viewport-fit=cover` — required for safe-area-inset variables to work at all.
- Bottom tab bar and FAB both add `env(safe-area-inset-bottom)` to their base spacing, so they clear the home indicator on notched devices.
- Topbar adds `env(safe-area-inset-top)` only when running as an installed PWA (standalone display mode) — in a normal mobile browser tab the browser chrome already handles this, so check `display-mode: standalone` in CSS before applying it to avoid double-padding.

---

## 9. Typography & Density Adjustments

| Token | Desktop | Mobile (< 640px) |
|---|---|---|
| `text-display` | 32px/40px | 24px/32px |
| `text-h2` | 22px/28px | 18px/24px |
| `text-figure-lg` | 28px/32px | 24px/28px |
| Card padding | 24px | 16px |
| Page horizontal padding | 24px (`px-6`) | 16px (`px-4`) |

Body, caption, and the smaller figure tokens stay the same size on mobile — shrinking already-small text hurts legibility more than it helps density. Save the reduction for headline-scale text and spacing only.

---

## 10. Definition of "Mobile-Ready" (per page)

A page isn't done with this pass until: it has no horizontal scroll at 360px width, every table has been transformed per §5, every dialog is a sheet below `lg`, every tap target measures ≥48px, the page respects safe-area insets, and it's been checked once with `prefers-reduced-motion` and once with a screen reader's swipe-navigation (VoiceOver rotor / TalkBack) to confirm the bottom tab bar and FAB don't trap focus.
