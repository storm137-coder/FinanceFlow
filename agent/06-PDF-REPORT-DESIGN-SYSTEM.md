# FinanceFlow — PDF Report Design System

This governs the **exported PDF reports** only (statements, transaction history exports, budget/goal summaries) — a separate artifact from the live app covered in `02-DESIGN-SYSTEM.md`. The two are deliberately different registers: the app is a daily-use tool, the PDF is a document someone might hand to an accountant, a landlord, or keep for tax records. That's why this system reaches for a serif heading face instead of carrying Archivo over — a printed financial statement earns trust by reading like a formal document, not a dashboard screenshot.

---

## 1. Scope

Applies to every generated PDF: full account statement, filtered transaction export, single-budget report, goals summary, loan amortization schedule, investment portfolio summary. One system, instantiated per report type via the templates in §7 — not a different look per report.

---

## 2. Typography

| Role | Face | Weight/Style | Used for |
|---|---|---|---|
| Headings | **Times New Roman** | Bold (report title), Regular small-caps or Bold (section headers) | Report title, section headers ("Transaction History", "Budget Summary"), company/app name on cover block |
| Content | **Inter** | Regular 400, Medium 500 for emphasis | Labels, descriptions, merchant names, notes, footnotes, table column headers |
| Numbers | **JetBrains Mono** (same face as the in-app design system — deliberate continuity) | Regular 400, tabular figures | Every amount, date, percentage, account number, balance — anywhere a figure appears, in or out of a table |

### Sizes

| Token | Size | Face | Use |
|---|---|---|---|
| `pdf-title` | 20pt | Times New Roman Bold | Report title on cover/header block |
| `pdf-subtitle` | 11pt | Times New Roman Regular | Date range, account name, under the title |
| `pdf-section` | 13pt | Times New Roman Bold | Section headers within the body |
| `pdf-body` | 9.5pt | Inter Regular | Body text, table column headers (uppercase, letter-spaced) |
| `pdf-caption` | 8pt | Inter Regular | Footnotes, page footer, "generated on" stamp |
| `pdf-figure` | 9.5pt | JetBrains Mono Regular | In-table amounts and dates |
| `pdf-figure-total` | 10.5pt | JetBrains Mono Medium | Subtotal/total rows |

**Rule, carried over from the app system and non-negotiable here too:** anything that is a number renders in JetBrains Mono with tabular figures. Never let a PDF library's default body font slip onto a number because it was easier to leave a cell unstyled — in a printed, unchangeable document this is the single easiest "looks unprofessional" mistake to make.

---

## 3. Color & Print Discipline

- PDFs are designed to survive being printed in black and white. **No information is ever communicated by color alone.** Income/expense direction is shown by a `+` / `-` prefix on the figure itself (and optionally parentheses for negatives, following standard accounting convention: `(1,240.00)`), not by red/green text that disappears on a monochrome printer.
- Color palette is restrained to: `--ink` (near-black, `#14171F`, same token as the app) for all text and table rules, one accent (`--accent`, the same muted gold `#B8860F`) used only on the cover/header block — a thin rule under the title, nothing else. No accent color inside the data tables themselves.
- No gradients, same rule as the app system, for the same reason: this is a document about precision, not a marketing artifact.
- Background is pure white (`#FFFFFF`) — never the app's off-white `--background` token. Paper is paper.

---

## 4. Document Anatomy

```
┌─────────────────────────────────────────────────┐
│  FinanceFlow                          [Page 1/4] │ ← header band, pdf-caption, repeats every page
├─────────────────────────────────────────────────┤
│                                                   │
│   Transaction History                            │ ← pdf-title, Times New Roman Bold
│   Checking Account · Jan 1 – Mar 31, 2026         │ ← pdf-subtitle, Times New Roman Regular
│   ─────────────────────────────                  │ ← thin accent rule, cover block only
│                                                   │
│   [Summary block — see §7.1]                      │
│                                                   │
│   Transactions                                    │ ← pdf-section
│   [Table — see §6]                                │
│                                                   │
├─────────────────────────────────────────────────┤
│  Generated Jun 20, 2026 · FinanceFlow Statement   │ ← footer, pdf-caption, repeats every page
└─────────────────────────────────────────────────┘
```

- **Header band** (every page after the first): app name left, page number right, thin bottom rule. Keeps the document oriented if pages get separated or printed loose.
- **Footer** (every page): generation timestamp and a one-line description of what the document is, so a printed page found later is self-describing without needing the cover page.
- **Cover/title block** (first page only): title, subtitle (account + date range), thin accent rule — the only place the accent color appears.

---

## 5. Page Setup

- Size: A4 by default, Letter when the user's locale is US/CA — decide once per export based on the account's locale setting, don't make the user choose every time.
- Margins: 24mm top/bottom, 20mm left/right — generous enough that hole-punching or binding doesn't clip content.
- Orientation: Portrait for all reports except the loan amortization schedule and any table with more than 6 columns, which use Landscape to avoid forcing the table transformation described in §6.4.

---

## 6. The Table System

This is the part the request is really about — every table in every report follows this exactly, no per-report improvisation.

### 6.1 Structure

- Header row: `pdf-body` (Inter, uppercase, letter-spaced 0.04em), `--ink` text on a very light `--surface-sunken`-equivalent gray fill (`#F0F1F3`) — the only fill in the entire table system. No row striping below the header.
- Body rows: white background, separated by a single 0.5pt `--ink` hairline at low opacity (`#E2E5EA`) under each row — same hairline-row philosophy as the in-app table, carried into print.
- Column alignment: text columns left-aligned, every numeric/date column right-aligned, set in `pdf-figure`.
- Row height: minimum 22pt — tight enough to fit a full month of transactions on one or two pages, loose enough not to feel cramped on paper.

### 6.2 Example layout (transaction table)

```
┌────────────┬──────────────────────┬───────────────┬─────────────┐
│ DATE       │ DESCRIPTION          │ CATEGORY      │      AMOUNT │
├────────────┼──────────────────────┼───────────────┼─────────────┤
│ 2026-03-14 │ Whole Foods Market   │ Groceries     │     -84.21  │
│ 2026-03-12 │ Salary Deposit       │ Income        │   +3,200.00 │
│ 2026-03-10 │ Netflix              │ Subscriptions │     -15.99  │
├────────────┼──────────────────────┼───────────────┼─────────────┤
│            │                      │ Total         │   +3,099.80 │
└────────────┴──────────────────────┴───────────────┴─────────────┘
```

Date column uses ISO `YYYY-MM-DD` in print regardless of in-app display locale — unambiguous on a document that might be read by someone outside the app (an accountant, a foreign bank). Amount column width is fixed wide enough for the largest expected figure plus sign and thousands separator, so it never reflows mid-document.

### 6.3 Totals and subtotal rows

- A subtotal/total row gets a 1pt `--ink` rule above it (heavier than the standard 0.5pt hairline) and renders its figure in `pdf-figure-total` (Medium weight, slightly larger) — the one place weight, not color, signals "this number is a sum."
- Multi-section reports (e.g. transactions grouped by category) repeat this subtotal treatment per group, with a final grand-total row at the bottom of the table using the same rule but with a double rule (two 1pt lines, 1pt gap) above it to distinguish "sum of a group" from "sum of everything."

### 6.4 Tables that don't fit portrait width

If a table needs more than 6 columns (e.g. loan amortization: due date, payment number, payment amount, principal, interest, remaining balance), switch the page to Landscape per §5 rather than shrinking type below `pdf-body` size or abbreviating headers to the point of ambiguity. Never wrap a numeric cell's content onto two lines — that breaks the alignment discipline this whole system exists to protect.

### 6.5 Page breaks within tables

- A table header row repeats at the top of every page the table spans — never make the reader scroll/flip back to remember what a column means.
- A single transaction row is never split across a page boundary; if a row doesn't fit, it moves to the next page whole, even if that leaves a slightly short page above it.

---

## 7. Report Templates

### 7.1 Account Statement / Transaction History
Cover block → **Summary** (a small key-value block, not a table: Opening balance, Total income, Total expenses, Closing balance — each value in `pdf-figure-total`) → **Transactions** table (§6.2) → footer on every page.

### 7.2 Budget Report
Cover block → one table per budget period: columns Category, Limit, Spent, Remaining, Status — Status column renders as plain text (`On track` / `Near limit` / `Over`) never a colored badge, per the print color-discipline rule in §3.

### 7.3 Goals Summary
Cover block → table: Goal, Target, Current, % Complete, Target Date — percentage in `pdf-figure`, right-aligned, no progress-bar graphic (graphics don't survive black-and-white printing as reliably as a number does; the number is the source of truth here).

### 7.4 Loan Amortization Schedule
Cover block → Landscape table per §6.4 → grand-total row showing total interest paid over the full schedule, using the double-rule total treatment from §6.3.

### 7.5 Investment Portfolio Summary
Cover block → table: Holding, Units, Avg Cost, Current Value, Gain/Loss (signed figure, `+`/`-` prefix, no color) → total portfolio value as a `pdf-figure-total` summary line beneath the table, not inside it.

---

## 8. Metadata & File Naming

- PDF document metadata (Title, Author, Subject) is set programmatically to match the report — e.g. Title: "FinanceFlow Statement — Checking Account — Jan–Mar 2026" — so it's identifiable in a downloads folder or email attachment list without opening it.
- File naming convention: `financeflow_{report-type}_{account-or-scope}_{start}_{end}.pdf`, e.g. `financeflow_statement_checking_2026-01-01_2026-03-31.pdf` — lowercase, hyphenated dates, no spaces.

---

## 9. Implementation Notes

- Generate with `@react-pdf/renderer` (already React-based, fits the existing stack, supports custom font embedding) rather than a browser-print-to-PDF approach — browser print can't guarantee Times New Roman/Inter/JetBrains Mono render identically across the recipient's eventual PDF viewers, since it depends on what's installed on the machine that generated it. Embedding the fonts directly into the PDF file removes that risk entirely.
- Embed actual font files for all three faces (Times New Roman is a licensing question — confirm availability or substitute a metrically-compatible serif like Liberation Serif/Tinos if Times New Roman itself isn't licensable for embedding in your deployment).
- Generate PDFs server-side (Route Handler or Server Action using `firebase-admin` to pull the data), not client-side — keeps font files out of the browser bundle and avoids exposing the full dataset to the client just to render a document.
- Tag the PDF (PDF/UA-style tagging in `@react-pdf/renderer` where supported) so the table structure is screen-reader navigable, not just visually a table.
