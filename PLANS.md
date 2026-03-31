# PLANS.md

## PHASE 0 — Architecture & Delivery Blueprint (Only)

### 1) Scope

This phase defines the full production architecture and execution strategy **without implementing application code**.

Checklist:
- [x] Architecture summary (frontend, backend, trust boundaries)
- [x] Route map (Expo Router)
- [x] Folder structure (feature-based)
- [x] Firestore schema (interfaces, required fields, derived fields, validation, indexes, access patterns)
- [x] Security model (Auth, App Check, Firestore/Storage Rules, server validation)
- [x] Cloud Functions surface design for required 22 APIs
- [x] Milestone plan for Phases 1–10 with validation gates

---

### 2) Architecture Summary

#### Frontend (Expo Web + Expo Router)
- Framework: Expo + React + Expo Router + strict TypeScript.
- UI architecture: feature modules + shared design system.
- State management:
  - React Query/TanStack Query for async server state.
  - React Hook Form + Zod for all form boundaries.
  - Lightweight Zustand store only for ephemeral UI (filters, panel states), not financial source of truth.
- Data access:
  - Client does reads allowed by rules.
  - Sensitive/privileged writes go through callable Cloud Functions.
- Charting: Recharts via web-compatible chart adapter components in `features/dashboard/components/charts`.

#### Backend (Firebase)
- Auth: Firebase Authentication (Email/Password + Google).
- DB: Cloud Firestore user-rooted hierarchy.
- Compute: Cloud Functions v2 (callable + scheduled + event-driven hooks where needed).
- Files: Cloud Storage for receipts/import/export files.
- Abuse protection: Firebase App Check (web reCAPTCHA Enterprise or v3) for app + callable endpoints.

#### Trust Boundaries
- Client is untrusted for balance recomputation, integrity checks, and aggregate writes.
- Cloud Functions enforce invariant logic and auditable sensitive mutations.
- Firestore/Storage Security Rules enforce ownership isolation and reject invalid direct writes.
- Defense-in-depth: function validation + rules validation + audit logs.

---

### 3) Route Map (Expo Router)

```text
app/
  _layout.tsx                              # Theme/providers
  (public)/
    _layout.tsx                            # Public layout
    sign-in.tsx
    sign-up.tsx
    forgot-password.tsx
  (app)/
    _layout.tsx                            # Protected shell: sidebar + topbar
    onboarding/index.tsx
    dashboard/index.tsx
    transactions/index.tsx
    transactions/new.tsx
    transactions/[transactionId].tsx
    accounts/index.tsx
    accounts/new.tsx
    accounts/[accountId].tsx
    categories/index.tsx
    budgets/index.tsx
    budgets/new.tsx
    budgets/[budgetId].tsx
    savings-goals/index.tsx
    savings-goals/new.tsx
    savings-goals/[goalId].tsx
    projections/index.tsx
    investments/index.tsx
    investments/new.tsx
    investments/[investmentId].tsx
    reports/index.tsx
    reports/[reportType].tsx
    settings/index.tsx
    settings/profile.tsx
    settings/preferences.tsx
    settings/security.tsx
  +not-found.tsx
```

Route policies:
- `(public)` accessible only when unauthenticated.
- `(app)` guarded by auth state + onboarding completion.
- Server-trusted data checks still required even for guarded routes.

---

### 4) Folder Structure (Feature-Based)

```text
.
├─ app/
├─ src/
│  ├─ core/
│  │  ├─ config/                       # env parsing (zod)
│  │  ├─ firebase/                     # init app/auth/db/storage/functions/app-check
│  │  ├─ providers/                    # auth, query, toast, theme providers
│  │  ├─ routing/                      # guards, navigation helpers
│  │  └─ errors/                       # normalized app errors
│  ├─ shared/
│  │  ├─ ui/                           # buttons, cards, tables, modal, skeleton
│  │  ├─ forms/                        # RHF wrappers + reusable field components
│  │  ├─ validation/                   # primitive schemas + helpers
│  │  ├─ utils/                        # date/money/format helpers
│  │  └─ types/
│  ├─ features/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ accounts/
│  │  ├─ categories/
│  │  ├─ transactions/
│  │  ├─ budgets/
│  │  ├─ savings/
│  │  ├─ projections/
│  │  ├─ investments/
│  │  ├─ reports/
│  │  ├─ settings/
│  │  └─ audit/
│  │      ├─ components/
│  │      ├─hooks/
│  │      ├─schemas/
│  │      ├─services/
│  │      └─types/
│  └─ test/
│     ├─ unit/
│     ├─ integration/
│     ├─ rules/
│     └─ fixtures/
├─ functions/
│  ├─ src/
│  │  ├─ core/                         # auth guards, errors, idempotency, audit writer
│  │  ├─ modules/
│  │  │  ├─ transactions/
│  │  │  ├─ budgets/
│  │  │  ├─ savings/
│  │  │  ├─ investments/
│  │  │  ├─ reports/
│  │  │  └─ snapshots/
│  │  ├─ schemas/
│  │  ├─ repositories/
│  │  └─ index.ts
│  └─ test/
├─ firestore.rules
├─ storage.rules
├─ firestore.indexes.json
├─ firebase.json
└─ scripts/                            # seed + emulator utilities
```

---

### 5) Firestore Schema Design

## Root
- `users/{uid}` document fields:
  - `createdAt`, `updatedAt`, `onboardingCompleted`, `status`

All domain docs include baseline audit fields:
- `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, optional `deletedAt`.

### 5.1 `users/{uid}/profile` (single doc)
- Required: `displayName`, `email`, `photoURL?`, `timezone`, `locale`.
- Derived: `initials`.
- Validation: timezone IANA format, locale BCP-47.
- Access: user read/write self only.

### 5.2 `users/{uid}/settings` (single doc)
- Required: `baseCurrency`, `theme`, `weekStartsOn`, `numberFormat`.
- Derived: none.
- Validation: ISO currency code, enum checks.
- Access: user read/write self.

### 5.3 `users/{uid}/accounts/{accountId}`
- Required: `name`, `type(bank|ewallet|cash|credit)`, `currency`, `openingBalance`, `currentBalance`, `isActive`.
- Optional: `institution`, `icon`, `color`, `notes`, `archivedAt`.
- Derived: `lastTransactionAt`, `inflow30d`, `outflow30d`.
- Indexes:
  - `(isActive ASC, updatedAt DESC)`
  - `(type ASC, isActive ASC)`
- Validation:
  - balance numeric finite
  - currentBalance server-managed for transfer/transaction-sensitive paths
- Access: list/read user accounts, writes through guarded paths.

### 5.4 `users/{uid}/categories/{categoryId}`
- Required: `name`, `kind(income|expense|transfer|investment)`, `color`, `icon`, `isSystem`, `isActive`.
- Optional: `parentCategoryId`.
- Derived: `transactionCount` (async aggregate).
- Indexes:
  - `(kind ASC, isActive ASC, name ASC)`
- Validation: parent must belong to same user.
- Access: user scoped.

### 5.5 `users/{uid}/transactions/{transactionId}`
- Required: `type(income|expense|transfer|adjustment)`, `accountId`, `amount`, `currency`, `date`, `status(posted|pending|void)`, `categoryId`.
- Optional: `destinationAccountId`, `description`, `merchantOrSource`, `tags[]`, `notes`, `attachmentUrl`, `recurrenceRule`, `split[]`.
- Derived: `monthKey(YYYY-MM)`, `signedAmount`, `isDeleted`.
- Indexes:
  - `(date DESC, createdAt DESC)`
  - `(monthKey ASC, type ASC)`
  - `(accountId ASC, date DESC)`
  - `(categoryId ASC, date DESC)`
  - `(status ASC, date DESC)`
- Validation:
  - amount > 0, finite, within configured max
  - transfer requires destinationAccountId != accountId
  - account/category ownership integrity
- Access:
  - read/list by owner
  - mutation mostly through Cloud Functions to preserve balances + audit.

### 5.6 `users/{uid}/budgets/{budgetId}`
- Required: `periodType(monthly|yearly)`, `periodKey`, `categoryId`, `plannedAmount`, `rolloverEnabled`.
- Derived: `actualAmount`, `utilizationRate`, `remainingAmount`, `status(on-track|warning|over)`.
- Indexes:
  - `(periodType ASC, periodKey ASC)`
  - `(categoryId ASC, periodKey ASC)`
- Validation: one active budget per (periodType, periodKey, categoryId).

### 5.7 `users/{uid}/savingsGoals/{goalId}`
- Required: `title`, `targetAmount`, `currentAmount`, `status(active|completed|paused|cancelled)`.
- Optional: `targetDate`, `linkedAccountId`, `notes`.
- Derived: `progressPercent`, `monthlyRecommendedContribution`, `projectedCompletionDate`.
- Indexes:
  - `(status ASC, targetDate ASC)`
- Validation: targetAmount > 0, currentAmount >= 0.

### 5.8 `users/{uid}/savingsTransactions/{goalTxId}`
- Required: `goalId`, `type(contribution|withdrawal|adjustment)`, `amount`, `date`.
- Optional: `accountId`, `notes`.
- Derived: none.
- Indexes: `(goalId ASC, date DESC)`.
- Validation: goal ownership; withdrawal cannot exceed currentAmount (server enforced).

### 5.9 `users/{uid}/investments/{investmentId}`
- Required: `assetType`, `assetName`, `platform`, `quantity`, `averageBuyPrice`, `currentPrice`, `investedAmount`, `currentValue`.
- Optional: `symbol`, `linkedAccountId`, `totalFees`, `notes`.
- Derived: `realizedPL`, `unrealizedPL`, `returnPercent`, `allocationPercent`.
- Indexes:
  - `(assetType ASC, updatedAt DESC)`
  - `(platform ASC, updatedAt DESC)`
- Validation: numeric finite/non-negative; ownership of linked account.

### 5.10 `users/{uid}/investmentTransactions/{investmentTxId}`
- Required: `investmentId`, `type(buy|sell|dividend|fee|adjustment)`, `quantity`, `unitPrice`, `fees`, `date`.
- Derived: `grossAmount`, `netAmount`.
- Indexes: `(investmentId ASC, date DESC)`.
- Validation: sell quantity <= available quantity (server).

### 5.11 `users/{uid}/monthlySnapshots/{snapshotId}`
- Required: `monthKey`, `incomeTotal`, `expenseTotal`, `netCashflow`, `netWorth`, `budgetUtilization`, `savingsRate`.
- Derived: all values derived server-side only.
- Indexes: `(monthKey DESC)`.
- Access: read by owner, write server-only.

### 5.12 `users/{uid}/auditLogs/{logId}`
- Required: `eventType`, `entityType`, `entityId`, `action`, `before?`, `after?`, `reason?`, `ipHash?`, `userAgent?`, `at`, `actorUid`, `requestId`.
- Derived: none.
- Indexes:
  - `(eventType ASC, at DESC)`
  - `(entityType ASC, entityId ASC, at DESC)`
- Access: read owner, write server-only.

### 5.13 `users/{uid}/imports/{importId}`
- Required: `status`, `source`, `filePath`, `startedAt`.
- Optional: `finishedAt`, `successCount`, `errorCount`, `errorFilePath`.
- Derived: none.
- Indexes: `(status ASC, startedAt DESC)`.
- Access: owner read; writes through function pipeline.

### 5.14 `users/{uid}/exports/{exportId}`
- Required: `reportType`, `format(csv|xlsx)`, `status`, `requestedAt`.
- Optional: `completedAt`, `downloadPath`, `expiresAt`.
- Indexes: `(status ASC, requestedAt DESC)`.
- Access: owner scoped.

### 5.15 `users/{uid}/notifications/{notificationId}`
- Required: `type`, `title`, `body`, `isRead`, `createdAt`.
- Optional: `actionLink`, `severity`.
- Indexes: `(isRead ASC, createdAt DESC)`.
- Access: owner scoped; system writes allowed.

---

### 6) TypeScript Domain Interface Strategy

- Canonical interfaces in `src/features/*/types/*.ts`.
- Shared base types:
  - `AuditFields`
  - `SoftDeleteFields`
  - `CurrencyAmount` (minor units for precision, plus display helpers)
  - `MonthKey` branded type
- Function DTOs in `functions/src/schemas/*` (Zod source of truth).
- Frontend request/response types generated/inferred from shared zod schemas where possible.

---

### 7) Security Model

#### Authentication
- Required for all protected routes and all finance data operations.
- Providers: email/password + Google.
- Session persistence enabled (web local persistence).

#### Firestore Rules
- Enforce `request.auth.uid == userId` boundary for all user-rooted collections.
- Deny client writes to server-owned aggregates:
  - `monthlySnapshots`, `auditLogs`, server-managed summary fields.
- Validate immutable ownership and key fields on update.
- Restrict `deletedAt` toggling to authorized paths where needed.

#### Storage Rules
- Path design: `users/{uid}/receipts/{fileId}`, `users/{uid}/imports/{fileId}`, `users/{uid}/exports/{fileId}`.
- Read/write only for matching uid.
- Enforce file size/type via metadata + function revalidation.

#### App Check
- Enforce App Check on callable functions and Firestore/Storage where supported.
- Local development uses debug token in emulator profile only.

#### Server-side Validation (Cloud Functions)
- Zod input validation for every callable endpoint.
- Numeric validation (finite, safe range, no NaN/Infinity).
- Ownership validation for every referenced doc.
- Reference integrity checks (account/category/goal/investment belongs to same uid).
- Idempotency keys for bulk and retriable operations.

#### Auditability
- Sensitive mutations must write `auditLogs` record with before/after summary + reason.
- Required for delete/restore/balance adjustments/imports/investment sells.

---

### 8) Cloud Functions Surface Design (22 Required)

Each callable requires auth and App Check (production).

1. `createTransaction`
   - Input: transaction payload.
   - Validates account/category ownership, amount/date/type constraints.
   - Writes transaction + account balance delta + audit event.

2. `updateTransaction`
   - Input: transactionId + patch + reason when sensitive.
   - Reverses previous effects and reapplies new effects atomically.

3. `deleteTransaction`
   - Soft-delete + reverse balance effects + audit.

4. `transferBetweenAccounts`
   - Atomic debit/credit between owned accounts + paired transfer record.

5. `bulkImportTransactions`
   - Parses uploaded CSV, validates row schema, writes batch with idempotency key.

6. `generateMonthlySnapshot`
   - Computes month aggregates and writes server-owned snapshot.

7. `recalculateAccountBalances`
   - Rebuilds balances from ledger for a user or account subset.

8. `createBudget`
   - Creates budget with uniqueness constraints per period/category.

9. `updateBudget`
   - Updates planned/rollover fields and refreshes derived utilization.

10. `createSavingsGoal`
    - Creates goal and recommendation metadata.

11. `addSavingsContribution`
    - Adds contribution transaction, updates goal currentAmount, optional linked account delta.

12. `withdrawSavingsContribution`
    - Withdraws from goal with non-negative guardrails.

13. `createInvestmentAsset`
    - Creates investment asset baseline.

14. `recordInvestmentBuy`
    - Adds buy tx, updates quantity/cost basis.

15. `recordInvestmentSell`
    - Validates quantity available, computes realized P/L, updates holdings.

16. `updateAssetPrice`
    - Manual price update and unrealized P/L recomputation.

17. `recomputePortfolioMetrics`
    - Recomputes totals/allocation/returns for all assets.

18. `getDashboardSummary`
    - Returns trusted summary payload for dashboard cards/charts.

19. `exportUserFinanceReport`
    - Builds CSV/XLSX in Storage + creates export record.

20. `softDeleteEntity`
    - Generic guarded soft delete for allowed entity types.

21. `restoreEntity`
    - Restores soft-deleted entity with invariant checks.

22. `createAuditEvent`
    - Internal utility callable only from trusted contexts (or non-public HTTPS endpoint).

Function behavior standards:
- Return `{ success, data?, errorCode?, message? }`.
- Throw typed `HttpsError` for predictable client handling.
- Use Firestore transactions for all multi-document financial mutations.
- Include `requestId` and `idempotencyKey` where needed.

---

### 9) Milestone Plan (Phases 1–10)

## Phase 1 — Scaffold
- Expo app shell, router groups, providers, Firebase init, env parsing, base design primitives.
- Exit gate: lint + typecheck + smoke tests pass.

## Phase 2 — Authentication
- Sign-in/up/forgot password, Google auth, session persistence, onboarding gating, protected layouts.
- Exit gate: auth integration tests + route guard tests pass.

## Phase 3 — Accounts & Categories
- CRUD flows + list/detail screens + strict validation + ownership-safe data access.
- Exit gate: accounts/categories tests + rule tests for isolation.

## Phase 4 — Transactions & Transfers
- Core ledger operations via functions, filters/search/pagination, CSV import/export base.
- Exit gate: transaction/transfer integration tests and idempotency tests.

## Phase 5 — Dashboard & Charts
- Trusted summary endpoint + card metrics + chart suite + recommendation surface.
- Exit gate: dashboard query tests + chart rendering smoke tests.

## Phase 6 — Budgets
- Budget CRUD, utilization, overrun alerts, template support.
- Exit gate: budget overrun and period constraint tests.

## Phase 7 — Savings & Projection
- Savings goals, contributions/withdrawals, projection simulator.
- Exit gate: contribution and projected completion tests.

## Phase 8 — Investments
- Asset CRUD, buy/sell/dividend, price updates, P/L and allocation analytics.
- Exit gate: investment P/L correctness tests.

## Phase 9 — Reports & Export
- Report views (monthly + net worth + budget + investments), export pipeline.
- Exit gate: export generation tests and downloadable artifact checks.

## Phase 10 — Security Hardening & Final QA
- Firestore/Storage rules finalize, App Check enforcement, emulator e2e workflow, seed data, regression pass.
- Exit gate: full lint/type/test + rules suite + critical flow integration pass.

---

### 10) Phase Execution Protocol (Mandatory for all next phases)

For each phase from 1 onward:
1. Restate phase scope in a short checklist before coding.
2. Implement in small, reviewable commits.
3. Run:
   - `npm run lint`
   - `npm run typecheck`
   - relevant `npm run test:*`
4. Perform self-review for:
   - validation gaps
   - auth isolation issues
   - unsafe direct aggregate writes
   - missing audit events for sensitive mutations
   - regression risks
5. Summarize residual risks and mitigation.


---

### Phase 0 Reinforcement Notes (Execution Learnings)

- Tooling constraint discovered in execution: path aliases (e.g. `@/*`) must be explicitly mirrored in Vitest/Vite resolve config, otherwise tests can pass typecheck but fail runtime module resolution.
- Delivery guardrail update: each phase validation should include at least one executed test command to catch runtime configuration drift beyond lint/typecheck.

### Execution Status

- [x] Phase 1 — Scaffold completed (initial Expo Router web scaffold, Firebase init module, provider shell, base UI primitives, env schema, lint/typecheck/tests green).
- [ ] Phase 2 — Authentication
- [ ] Phase 3 — Accounts & Categories
- [ ] Phase 4 — Transactions & Transfers
- [ ] Phase 5 — Dashboard & Charts
- [ ] Phase 6 — Budgets
- [ ] Phase 7 — Savings & Projection
- [ ] Phase 8 — Investments
- [ ] Phase 9 — Reports & Export
- [ ] Phase 10 — Security Hardening & Final QA
