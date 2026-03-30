# Phase 0 — System Foundation Plan

## 1) System architecture

### Frontend
- **Stack:** Expo web + Expo Router with strict TypeScript.
- **Architecture style:** feature-based modules (e.g., `features/auth`, `features/transactions`) with a shared UI/design system and shared platform services.
- **Composition:**
  - Route layer (Expo Router) for page/layout orchestration.
  - Feature modules for screens, hooks, services, and domain logic.
  - Shared UI system for tokens, typography, spacing, tables, forms, and reusable interaction primitives.
  - Shared app services for auth session state, data access wrappers, telemetry, and error normalization.
- **State approach:** local UI state in components/hooks; server state synchronized through typed service APIs; avoid duplicating canonical financial state in client-only stores.

### Backend
- **Firebase products:**
  - **Auth** for identity/session and provider integration.
  - **Firestore** as primary operational data store.
  - **Cloud Functions (2nd gen)** for privileged business workflows, aggregation, and integrity checks.
  - **Storage** for user-owned artifacts (receipts, imports, exports) with strict ownership paths.
  - **App Check** enforced for client-facing resources and callable/function endpoints where supported.
- **Backend coding style:** modular functions by domain boundary with shared validation, auth context extraction, and audit logging utilities.

### Trust boundaries
- **Client (untrusted):**
  - Responsible for UX, input collection, optimistic rendering, and preliminary validation.
  - Never trusted for authorization decisions, cross-user access, or canonical metric computation.
- **Callable Cloud Functions (trusted application boundary):**
  - Enforce authentication, user isolation, role/policy checks, domain invariants, and mutation orchestration.
  - Perform sensitive operations (imports, reconciliations, report generation, metric recomputation triggers).
- **Security Rules (data perimeter):**
  - Enforce least-privilege document/object access directly at Firestore/Storage boundaries.
  - Validate owner scoping and write constraints as a second enforcement layer.
- **Rule of operation:** critical invariants must be enforced in both function logic and security rules (defense in depth).

## 2) Domain boundaries

The app is separated into explicit domain modules, each with clear responsibilities and data ownership:

- **auth:** identity lifecycle, session policies, provider linkage.
- **dashboard:** cross-domain summaries and KPIs sourced from server-computed views.
- **accounts:** cash/bank/wallet account entities, balances, and lifecycle controls.
- **categories:** income/expense taxonomy with user-level customization controls.
- **transactions:** ledger-like transaction records, tagging, attachments, and reconciliation status.
- **budgets:** period budget definitions, allocations, and pacing snapshots.
- **savings:** goal definitions, contribution progress, and target tracking.
- **investments:** holdings/positions, valuation snapshots, and performance-oriented rollups.
- **reports:** historical views, exports, and analytics slices from trusted aggregates.
- **settings:** profile, preferences, app configuration, and security posture controls.
- **audit:** immutable/semi-immutable audit trails for sensitive actions and data mutation provenance.

Boundary rule: each domain owns its service interfaces, validation schemas, backend handlers, and test fixtures; cross-domain access occurs via explicit interfaces, not direct internal coupling.

## 3) Data flow

### Standard mutation path
1. **UI form input** captured in feature component.
2. **Zod schema validation** (client-side) for shape, types, and user-friendly errors.
3. **Service layer call** through typed domain service method.
4. **Backend mutation path**:
   - Preferred: callable Cloud Function for privileged writes and invariant enforcement.
   - Scoped direct Firestore writes only where rules fully enforce safety and invariants are simple.
5. **Server response + normalized UI state update** with success/error semantics.

### Derived metrics policy
- Derived metrics (totals, trends, budget burn rates, monthly P/L, investment rollups) are recomputed server-side in Cloud Functions.
- Client may display transient estimations for UX, but canonical values are persisted and served from backend-computed records.
- No business-critical derived metric is accepted as client-authoritative.

## 4) Non-functional requirements

- **Strict TypeScript:** `strict: true`, no implicit `any`, strong DTO typing across client-service-function boundaries.
- **Testability:** domain-level unit tests, service contract tests, security rule tests, and callable function integration tests for critical money flows.
- **Auditability:** mutation provenance (who, when, what), correlation IDs for workflows, and durable event records for sensitive operations.
- **User isolation:** every read/write path scoped to authenticated user (or explicitly authorized shared context) and enforced by both rules and backend checks.
- **Scalability:** denormalized read models where needed, background aggregation, idempotent function design, and index-aware Firestore query patterns.

## 5) Web UX shell

- **Responsive shell:** desktop/tablet-first layout with graceful narrowing behavior.
- **Primary navigation:** persistent left sidebar nav for major domains and contextual section indicators.
- **Top bar:** quick actions (add transaction, transfer, add budget item), global search/command entry, notifications/profile access.
- **Premium patterns:**
  - Dense but readable data tables with sticky headers, sort/filter presets, and inline-safe actions.
  - Structured form layouts with clear hierarchy, defaults, validation messaging, and keyboard-friendly flow.
- **State handling standards:** every feature view defines polished **loading**, **empty**, **error**, and **success/updated** states; no blank screens.

## 6) Tradeoff notes (Expo web constraints + production-safe decisions)

- **Charting compatibility:**
  - Constraint: some React Native-focused chart libraries have partial/fragile web support.
  - Pattern: select chart packages with proven web compatibility and SSR-safe behavior; isolate charts behind adapter components to allow replacement without feature rewrites.
- **File upload handling:**
  - Constraint: browser file APIs differ from native pickers; large files and retries require careful handling.
  - Pattern: use resumable Storage uploads, typed metadata, size/type validation before upload, and server-side post-processing via Cloud Functions.
- **Router and deep-link behavior:**
  - Constraint: Expo Router on web must account for browser history/reload behavior.
  - Pattern: keep route segments stable, centralize auth guards, and avoid route-coupled business logic.
- **Environment/config safety:**
  - Constraint: web-exposed config cannot hold secrets.
  - Pattern: keep secrets only in backend/function config; enforce all privileged behavior server-side.
- **Performance and bundle risk:**
  - Constraint: finance dashboards can become heavy with tables/charts.
  - Pattern: route-level code splitting, lazy-load non-critical modules, virtualize long lists/tables, and precompute aggregates backend-side.
- **Security posture:**
  - Constraint: web clients are easy to inspect/tamper.
  - Pattern: App Check + Auth + Rules + callable verification + audit logging as layered controls.
