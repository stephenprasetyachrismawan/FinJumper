# FinJumper Plans

## Route Map

### Public routes `(public)`
- `/sign-in` → `app/(public)/sign-in.tsx`
- `/sign-up` → `app/(public)/sign-up.tsx`
- `/forgot-password` → `app/(public)/forgot-password.tsx`

### Onboarding routes `(onboarding)`
- `/onboarding` → `app/(onboarding)/index.tsx`

### Authenticated application routes `(app)`
- `/_layout` (protected shell) → `app/(app)/_layout.tsx`
- `/dashboard` → `app/(app)/dashboard/index.tsx`
- `/transactions` → `app/(app)/transactions/index.tsx`
- `/transactions/new` → `app/(app)/transactions/new.tsx`
- `/accounts` → `app/(app)/accounts/index.tsx`
- `/budgets` → `app/(app)/budgets/index.tsx`
- `/savings-goals` → `app/(app)/savings-goals/index.tsx`
- `/investments` → `app/(app)/investments/index.tsx`
- `/reports` → `app/(app)/reports/index.tsx`
- `/settings` → `app/(app)/settings/index.tsx`
- `/settings/profile` → `app/(app)/settings/profile.tsx`
- `/settings/preferences` → `app/(app)/settings/preferences.tsx`

## Route Guards
- Unauthenticated users are blocked from all `(app)` routes and redirected to `/sign-in`.
- First-login users are redirected to `(onboarding)` before accessing `(app)` routes.
- Authenticated users are redirected away from `(public)` routes into the authenticated app flow.

## Future File Structure

```text
app/
  (public)/
    sign-in.tsx
    sign-up.tsx
    forgot-password.tsx
  (onboarding)/
    index.tsx
  (app)/
    _layout.tsx
    dashboard/
      index.tsx
    transactions/
      index.tsx
      new.tsx
    accounts/
      index.tsx
    budgets/
      index.tsx
    savings-goals/
      index.tsx
    investments/
      index.tsx
    reports/
      index.tsx
    settings/
      index.tsx
      profile.tsx
      preferences.tsx
```
