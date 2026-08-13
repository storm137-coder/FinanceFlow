# FinanceFlow — Engineering Roadmap

A senior-engineer review and build plan for FinanceFlow, a personal finance management app on Next.js 16 + Firebase. This is the companion to `02-DESIGN-SYSTEM.md` and is consumed directly by `03-AGENT-PROMPT.md`.

---

## 1. Critique of the Current README

Before adding anything, a few honest notes on the starting point:

**What's solid.** Next.js 16 App Router + Turbopack, TypeScript, Zod + React Hook Form, and Firestore on the Spark plan is a reasonable, low-cost stack for a solo or small-team build. Recharts is the right call for finance charts — it's composable and doesn't fight you on custom tooltips.

**What's missing or risky, and why it matters:**

- **No mention of Firestore security rules.** A finance app with no documented rules strategy is the single biggest risk here. Client-side Firebase SDKs mean your *rules are your backend*. This needs to be designed before a single collection is created, not bolted on after.
- **No server-side validation layer.** Zod + RHF validates in the browser, but a malicious or buggy client can still write bad data directly to Firestore unless rules *also* enforce shape, types, and ownership. Validation has to happen in two places: client (UX) and rules (truth).
- **No money-handling strategy.** Storing currency as floating-point numbers is the most common bug class in finance apps (rounding errors compound over thousands of transactions). This needs to be decided up front — store as integer minor units (cents/paise) or use a fixed-point library.
- **Multi-currency claims a feature ("automatically displays in your chosen currency") that implies live FX rates** — this needs an actual exchange-rate source and a caching/refresh strategy, or it's a feature that silently goes stale.
- **No state-management story.** App Router gives you Server Components by default, but a dashboard with live balances, optimistic transaction entry, and cross-page financial totals needs a deliberate client-state plan (covered in §6).
- **No error/loading/offline strategy.** Firestore has built-in offline persistence — worth using deliberately rather than accidentally fighting it.
- **No testing or CI mentioned at all.** For an app handling someone's real financial data, this is non-negotiable even at MVP stage — at minimum: unit tests on money math and budget calculations, and rules tests on Firestore security rules.
- **No rate limiting / abuse protection** on writes (Spark plan has hard quotas — a runaway loop or bug can exhaust your free tier or get you throttled).

The rest of this document fixes each of these.

---

## 2. Recommended Library Additions

Keep everything in the original README. Add:

| Library | Purpose | Why this one |
|---|---|---|
| `shadcn/ui` (+ Radix primitives) | Component layer | Accessible by default, unstyled enough to fully own the design system, codegen model (you own the code, not a dependency) |
| `lucide-react` | Icons | Already shadcn's default icon set, tree-shakeable, consistent stroke weight |
| `dinero.js` or `currency.js` | Money math | Never do currency arithmetic with raw JS floats. Store integers in minor units; format at the edges. |
| `date-fns` (not `moment`) | Date handling | Tree-shakeable, immutable, plays well with Recharts time axes |
| `zustand` | Client state | Minimal boilerplate for cross-page state (active currency, selected date range, modal/drawer state) — lighter than Redux, more structured than Context |
| `@tanstack/react-query` (or SWR) | Server-state caching | Even with Firestore's `onSnapshot`, you want a caching layer for derived queries (e.g. "this month's spend by category") so components don't re-fetch on every mount |
| `firebase-admin` | Server-side Firebase access | Needed for any Next.js Server Action/Route Handler that must write/read with elevated trust (e.g. recalculating budget rollups) |
| `next-themes` | Dark/light mode | Pairs cleanly with the Tailwind + shadcn dark mode convention, handles flash-of-wrong-theme |
| `recharts` | Already chosen — keep | Good fit |
| `react-hot-toast` or shadcn's `sonner` | Notifications | Needed for save/error feedback patterns described in the design system |
| `exchangerate-api` or `frankfurter.app` (free tier) | FX rates for multi-currency | Frankfurter is free, no key required, ECB-sourced — good fit for Spark-plan constraints |
| `vitest` + `@testing-library/react` | Unit/component testing | Faster than Jest under Turbopack, same API |
| `@firebase/rules-unit-testing` | Firestore rules testing | The only reliable way to verify your security rules actually do what you think |
| `playwright` | E2E testing | Test auth flow + transaction CRUD end to end before shipping |
| `react-pdf` or `jspdf` (later phase) | Statement/export generation | For "export transactions as PDF/CSV" — common ask in finance apps |
| `papaparse` (later phase) | CSV import/export | Importing bank statements is a near-universal request once users start using the app seriously |

**Explicitly do not add:** a heavy global state library (Redux), a second UI kit alongside shadcn, or `moment.js` (unmaintained, large bundle).

---

## 3. Money Handling — Non-Negotiable Rules

1. **Never store currency as a float.** Store every amount as an integer in the currency's smallest unit (cents for USD, paise for INR — note JPY has no minor unit, plan for that).
2. **One function does all formatting.** A single `formatCurrency(amountMinorUnits, currencyCode, locale)` utility, used everywhere a number touches the screen. No ad-hoc `.toFixed(2)` calls scattered through components.
3. **One function does all conversion.** A single `convertCurrency(amount, from, to, rates)` utility — conversion logic lives in exactly one place.
4. **FX rates are cached, not fetched live per-render.** Pull rates on a schedule (e.g. once daily via a scheduled Cloud Function or on first load per session), store in Firestore or local cache with a timestamp, show a "rates as of [date]" note in the UI. This avoids burning API quota and gives the user honest information instead of an illusion of live conversion.
5. **Every transaction stores its original currency and amount**, even after conversion for display. Never lossy-convert and discard the source value.

---

## 4. Firestore Data Model

Spark plan has no relational joins, so the schema is shaped around what you'll query, not normalized for its own sake.

```
/users/{uid}
  displayName, email, baseCurrency, createdAt, settings: { theme, locale }

/users/{uid}/accounts/{accountId}
  name, type (checking|savings|credit|cash), currency, balanceMinorUnits, archivedAt?

/users/{uid}/transactions/{transactionId}
  accountId, type (income|expense|transfer), amountMinorUnits, currency,
  categoryId, merchant, date, tags: string[], notes, createdAt, updatedAt

/users/{uid}/categories/{categoryId}
  name, icon, color, kind (income|expense), isSystemDefault

/users/{uid}/budgets/{budgetId}
  categoryId, periodStart, periodEnd, limitMinorUnits, currency, rollover

/users/{uid}/goals/{goalId}
  name, targetMinorUnits, currentMinorUnits, currency, targetDate, priority, status

/users/{uid}/loans/{loanId}
  name, principalMinorUnits, interestRateBps, termMonths, startDate, emiMinorUnits

/users/{uid}/loans/{loanId}/schedule/{installmentId}
  dueDate, amountMinorUnits, principalPortion, interestPortion, status (upcoming|paid|overdue)

/users/{uid}/investments/{investmentId}
  name, type (stock|mutualFund|crypto|other), units, avgCostMinorUnits, currentValueMinorUnits, lastPriceUpdate

/users/{uid}/wishlist/{itemId}
  name, estimatedCostMinorUnits, currency, priority, targetDate, link, status

/fxRates/{baseCurrency}
  rates: { USD: 1, EUR: 0.92, INR: 83.1, ... }, lastUpdated
```

**Composite index plan (decide these now, don't wait for the console errors the README mentions):**
- `transactions`: `(accountId, date desc)`, `(categoryId, date desc)`, `(date desc)` for dashboard recents
- `budgets`: `(periodStart, periodEnd)`
- `loans/schedule`: `(status, dueDate)`

**Denormalization decisions, made deliberately:**
- Account `balanceMinorUnits` is a running total, updated transactionally (Firestore transaction) whenever a transaction is written — not recomputed by summing all transactions on every read.
- Category name/color is duplicated onto each transaction at write time *only if* you need to avoid a join in list views; otherwise keep `categoryId` and resolve client-side from a small cached categories list (categories rarely number more than ~20-30, so this is the better trade-off — avoids stale denormalized data when a user renames a category).

---

## 5. Security Rules Strategy

Every collection rule should enforce three things, in this order:
1. **Auth required** — `request.auth != null`
2. **Ownership** — the document's path or a `uid` field matches `request.auth.uid`
3. **Shape** — required fields present, correct types, amounts are non-negative integers where applicable, currency is a valid 3-letter code

Example shape for transactions (write rule sketch):

```
match /users/{uid}/transactions/{txId} {
  allow read: if request.auth.uid == uid;
  allow create: if request.auth.uid == uid
    && request.resource.data.amountMinorUnits is int
    && request.resource.data.amountMinorUnits > 0
    && request.resource.data.currency.matches('^[A-Z]{3}$')
    && request.resource.data.type in ['income', 'expense', 'transfer'];
  allow update, delete: if request.auth.uid == uid;
}
```

Write a rules test (via `@firebase/rules-unit-testing`) for every collection that asserts: (a) an unauthenticated write is rejected, (b) a write to another user's path is rejected, (c) a malformed write (wrong type, negative amount) is rejected, (d) a valid write succeeds. Treat this test file as part of the definition of "done" for any new collection.

---

## 6. State Management Architecture

Three layers, used for different things — don't blend them:

1. **Server Components (default)** — initial data fetch for any page that doesn't need real-time updates (settings, historical reports, static lists). Fetch via `firebase-admin` in a Server Component or Route Handler.
2. **React Query** — wraps Firestore's `onSnapshot` listeners for anything that benefits from caching + background refetch + shared cache across components (dashboard totals, budget progress, account balances). Avoids the common bug of five components each opening their own duplicate snapshot listener.
3. **Zustand** — pure UI/client state with no server correlate: active date-range filter, selected currency for display, which modal/drawer is open, multi-step form progress (e.g. the "add loan" wizard).

Rule of thumb: if it's persisted, it's React Query (backed by Firestore). If it's ephemeral UI state, it's Zustand. Avoid `useState` + prop drilling past two levels — promote to one of the above instead.

---

## 7. Core Feature Build Notes

### Authentication
- Firebase Auth email/password + password reset flow as stated. Add: email verification gate before allowing transaction writes (reduces spam accounts), and a server-side session cookie (via Firebase Admin `createSessionCookie`) rather than relying solely on client SDK tokens, so Server Components can read auth state without a client round-trip.
- Rate-limit login attempts client-side with a simple backoff; Firebase Auth has its own server-side throttling but a friendly UI message avoids a confusing experience.

### Dashboard
- One Server Component shell (layout, nav) wrapping client components for anything live (balance cards, recent transactions, budget alerts).
- Compute "upcoming bills" by querying loan schedules and recurring transaction templates with `dueDate` in the next 14 days — don't infer this from past transactions, model recurrence explicitly (see Transactions below).

### Transactions
- Recurring transactions need their own lightweight model: a `recurringTemplates` collection with `frequency`, `nextOccurrence`, and a scheduled Cloud Function (or a check-on-load fallback for Spark plan, since scheduled functions have limited free quota) that materializes the next instance.
- Bulk import: CSV via `papaparse`, mapped through the same Zod schema as manual entry — never bypass validation for "trusted" bulk paths.

### Budgets
- Budget progress is a *derived* value: `spent = sum(transactions where categoryId & in period)`. Compute this with a Firestore aggregation query (`getCountFromServer`/`getAggregateFromServer`, available on Spark) rather than pulling every transaction document to sum client-side — this matters once a user has thousands of transactions.
- Visual alert thresholds (e.g. 80%, 100%, 100%+) are a config value, not a magic number buried in a component — define once in a constants file.

### Goals
- Progress bar percentage = `currentMinorUnits / targetMinorUnits`, clamped at 100% for display but allow `currentMinorUnits` to exceed target without erroring (people overshoot goals).

### Loans
- Generate the amortization schedule with a pure, unit-tested function: `generateAmortizationSchedule(principal, annualRateBps, termMonths)` → array of installments. This is exactly the kind of math that must have unit tests given it directly affects what a user believes they owe.

### Investments
- Spark plan has no built-in market-data feed. Either let users manually update `currentValueMinorUnits`, or integrate a free-tier price API (e.g. Alpha Vantage free tier) behind a scheduled refresh with caching — same pattern as FX rates. Don't poll a price API on every page load.

### Wishlist
- Straightforward CRUD; the only nuance is letting a wishlist item convert into a Goal with one action (pre-fills the Goal form) rather than forcing duplicate entry.

---

## 8. Validation & Forms

- One Zod schema per entity, colocated in `lib/schemas/`, imported by both the React Hook Form resolver (client) and any Server Action that touches the same entity (server). Never define the shape twice.
- Server Actions are the default mutation path in App Router — prefer them over client-side `fetch` to API routes for anything that's a straightforward form submission; reserve Route Handlers for things consumed by non-form clients (webhooks, scheduled jobs).

---

## 9. Error Handling & Resilience

- Every async mutation goes through a single `try/catch` wrapper pattern that maps Firebase error codes to user-facing messages (never show a raw Firebase error string to the user).
- Use Next.js `error.tsx` boundaries per route segment, not one global boundary — a failed chart shouldn't take down the whole dashboard.
- Lean into Firestore's offline persistence deliberately: enable `enableIndexedDbPersistence`, and design the UI to show an "offline — changes will sync" indicator rather than letting writes silently queue with no feedback.

---

## 10. Testing Strategy

| Layer | Tool | What to cover first |
|---|---|---|
| Pure functions | Vitest | Money formatting/conversion, amortization schedule, budget % calculations |
| Components | Vitest + Testing Library | Transaction form validation states, currency input behavior |
| Security rules | `@firebase/rules-unit-testing` | Every collection: auth, ownership, shape |
| E2E | Playwright | Sign up → add account → add transaction → see it on dashboard |

Set a rule: no new Firestore collection ships without a corresponding rules test. No money-math function ships without a unit test.

---

## 11. Performance

- Paginate transaction lists (Firestore `startAfter` cursors), never load a full collection into memory.
- Use Next.js `next/image` for any avatar/logo assets even though this is a data-heavy app, not a media one — it still matters for the few images you do have.
- Memoize derived chart data (`useMemo`) — Recharts re-renders are expensive on large datasets if you recompute aggregates every render.
- Code-split heavy routes (investments charts, loan amortization tables) with `next/dynamic` if they're not needed on first paint.

---

## 12. Phased Build Plan

**Phase 0 — Foundation (days 1-3)**
Project scaffold, Tailwind + shadcn install and theming, Firebase project setup, environment config, base layout shell, design tokens from `02-DESIGN-SYSTEM.md` wired into `tailwind.config` and `globals.css`.

**Phase 1 — Auth (days 3-5)**
Sign up, login, password reset, email verification gate, session cookie middleware, protected route layout.

**Phase 2 — Accounts & Transactions (days 5-10)**
Account CRUD, transaction CRUD with Zod schema, category management, transaction list with pagination and filters, Firestore rules + rules tests for both collections.

**Phase 3 — Dashboard (days 10-13)**
Balance summary cards, recent transactions widget, spend-by-category chart, upcoming bills widget — all wired through React Query over Firestore listeners.

**Phase 4 — Budgets & Goals (days 13-17)**
Budget CRUD with aggregation-based progress, alert thresholds, goal CRUD with progress bars, wishlist-to-goal conversion.

**Phase 5 — Loans & Investments (days 17-22)**
Amortization engine (unit-tested first, UI second), loan schedule view, investment portfolio tracker, manual or API-based price refresh.

**Phase 6 — Multi-currency (days 22-25)**
FX rate fetch + cache job, currency formatting/conversion utilities, currency selector wired through Zustand, "rates as of" UI indicator.

**Phase 7 — Polish & Hardening (days 25-30)**
Dark/light mode pass, empty/error states per `02-DESIGN-SYSTEM.md`, accessibility pass (keyboard nav, focus states, contrast check), Playwright E2E suite, performance pass on transaction list pagination, CSV import/export.

**Phase 8 — Launch readiness**
Firestore composite indexes confirmed in console, security rules reviewed end to end, environment variables audited (no secrets in client bundle — confirm everything in `.env.local` is genuinely public-safe `NEXT_PUBLIC_*` Firebase config, which it is by design, but double-check nothing else leaked in), basic uptime/error monitoring (Sentry free tier or Firebase Crashlytics-equivalent for web).

---

## 13. Definition of Done (per feature)

A feature isn't done until it has: a Zod schema, a Firestore rules entry + rules test, a loading state, an error state, an empty state, keyboard accessibility, and — if it touches money — a unit test on the calculation involved.
