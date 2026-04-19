# Comprehensive Codebase Refactoring Plan

This document outlines the systematic refactoring plan for the IBC Website repository, balancing modern Next.js 16 conventions, manageable file architectures, and strict type safety.

## 1. Critical React & Architecture Fixes
These items address direct performance, correctness, and maintainability issues.

- [ ] **Fix Double-Fetch in Applications Page:**
  - **Location:** `src/app/admin/application/page.tsx` & `_components/ApplicationsList.tsx`
  - **Action:** Fetch data once in the server component (`page.tsx`), derive the tab counts, and pass the data down as props. Convert `ApplicationsList` into a pure layout component.
- [ ] **Consolidate `useMemberValidationTimer` Hook:**
  - **Location:** `src/hooks/useMemberValidationTimer.ts` & `src/app/membership/application/_hooks/useMemberValidationTimer.ts`
  - **Action:** Delete the global one in `src/hooks/` and use the route-local one as the single source of truth to prevent logic drift.
- [ ] **Extract Signed URL Logic (DRY where it matters):**
  - **Location:** Four separate server queries (e.g., `getApplications.ts`, `getMembers.ts`)
  - **Action:** Extract `signLogoUrl` and `signPaymentProofUrl` into `src/lib/storage/signedUrls.ts` as pure functions that accept a Supabase client.
- [ ] **Extract Magic TTL Values:**
  - **Action:** Define `SIGNED_URL_TTL_SECONDS` in `src/lib/constants.ts` (replacing hardcoded `60 * 60 * 24 * 30` math).
- [ ] **Separation of Concerns in Applications Page:**
  - **Action:** Move the 40-line count reduction logic out of `application/page.tsx` into a shared utility at `src/app/admin/application/_utils/applicationFiltering.ts`.
- [ ] **Standardize Client-Side Action States:**
  - **Location:** `SponsoredRegistrationList.tsx`, `CreateSRForm.tsx`, `EvaluationRow.tsx`, `EditMemberForm.tsx`
  - **Action:** Replace inline `tryCatch(mutation)` calls that use manual toast/loading state with `useAction(tryCatch(mutation))` to ensure consistent state management across the app.
- [ ] **Relocate Global Stores:**
  - **Location:** `src/hooks/*.store.ts`
  - **Action:** Move Zustand stores (`membershipApplication.store.ts`, etc.) to `src/stores/` to prevent folder ambiguity.
- [ ] **Extract `useInfiniteScroll` Hook:**
  - **Location:** `SponsoredRegistrationList.tsx`
  - **Action:** Extract the inline intersection observer into a generic `useInfiniteScroll` hook in `src/hooks/`.
- [ ] **Split `memberValidation` Zustand Store:**
  - **Location:** `src/hooks/membershipApplication.store.ts`
  - **Action:** Split the oversized `memberValidation` slice into logically independent slices (timer, rate-limit, validation status).

## 2. Unmanageable Files & Colocation
We are prioritizing manageable files over dogmatic DRY. Scroll-heavy files with mixed concerns will be split.

- [ ] **`src/app/admin/members/[id]/_components/ExportMemberPDFButton.tsx` (626 lines)**
  - *Action:* Extract the PDF document layout (`<Document>`, `<Page>`) into a separate `_components/MemberPDFTemplate.tsx`.
- [ ] **`src/app/admin/events/[eventId]/edit-event/_components/forms/EditEventForm.tsx` (517 lines)**
  - *Action:* Split field sections (e.g., Basic Info, Dates, Ticketing) into smaller sub-components inside the `_components/forms/` directory.
- [ ] **`src/app/admin/_components/ApplicationDetails.tsx` (492 lines)**
  - *Action:* Break down the display sections into granular components (`ApplicantInfo.tsx`, `BusinessInfo.tsx`).
- [ ] **`src/app/membership/application/_components/forms/Step5Payment.tsx` (485 lines)**
  - *Action:* Move the heavy validation and file transformation logic into `_utils/paymentValidation.ts`.

## 3. Renaming & Refactoring `tryCatch`
The `tryCatch` utility is currently tightly associated with server actions by convention, but it is a generic Result/Either pattern wrapper useful for any async client or server logic.

- [ ] **Rename the Wrapper & Types:**
  - **Action:** Rename the underlying generic return type (currently returning `{ success, data, error }`) to something domain-agnostic like `AsyncResult<T>` or `SafeResponse<T>`.
  - **Action:** Update the generic type parameters so it explicitly supports both Server Actions (which require specific serializable errors) and Client-Side async logic.

## 4. RPC Purge
Removing PL/pgSQL business logic in favor of maintainable TypeScript Server logic.

- [ ] **`get_sponsored_registration_by_id`**
  - **Action:** Drop the RPC in Supabase. Replace it in `getSponsoredRegistrationById.ts` with standard Supabase TS client chaining: `.from('SponsoredRegistration').select('*').eq('id', id).single()`.
- [ ] **`get_registration_list_stats`**
  - **Action:** Drop the RPC in Supabase. Replace it with a `Promise.all()` containing 4 parallel Supabase queries using `{ count: "exact", head: true }` to derive Total, Verified, Pending, and Participant counts.

## 5. RLS & Storage Policy Updates
Given the current assumption: `authenticated` users are Admins. Guests are `anon`.

- [ ] **`ProofImage` Table & Storage Buckets (`paymentproofs`, `logoimage`, `headerimage`)**
  - **Action:** Update RLS and Storage policies to:
    - **INSERT:** Allow `anon` and `authenticated` (Anyone can upload/insert).
    - **SELECT, UPDATE, DELETE:** Restrict strictly to `authenticated` (Admins only).
- *Note:* `Registration`, `Participant`, `EvaluationForm`, and `WebsiteContent` policies will remain as-is for now based on current business requirements.

## 6. Caching Strategy & Audit
Next.js 16 `"use cache"` requires both tags for invalidation and profiles for lifecycle.

### A. The `createActionClient` Exception
- Server functions imported and invoked directly by the client (Server Actions like `fetchApplicationsByIds` or `checkMemberExistsAndGet`) cannot accept `requestCookies` as arguments.
- **Action:** These functions will intentionally continue to use `createActionClient()` and should *not* use `"use cache"` if they rely on mutating cookies or strictly dynamic user-specific action contexts.

### B. Fixing the Cache Gap (`cacheLife`)
Over 90 queries use `cacheTag` but lack a `cacheLife` profile.
- [ ] **Action:** Audit `src/server/**/queries/*.ts`.
- [ ] **Apply `applyAdmin5mCache()`:** For admin-facing list queries (e.g., `getAllEvents.ts`, `getMembers.ts`, `getApplications.ts`).
- [ ] **Apply `applyPublicHoursCache()`:** For highly static public data (e.g., `getPublicEvents.ts`, `getWebsiteContent.ts`).

### C. Queries That Should NOT Be Cached
The following queries should explicitly opt-out of caching (remove `"use cache"` or use dynamic rendering) because they require absolute real-time accuracy:
1. **Event Day Check-In Lists:** (`getCheckInForDate`, live attendance trackers). Admins at the door need immediate feedback.
2. **Registration Payment Status Lookups:** Admin views for reviewing pending payments. Stale data here leads to double-approvals or missed rejections.
3. **Live Event Stats:** (What replaces `get_registration_list_stats`). If the admin is watching the dashboard close to event day, 5-minute staleness is too long.
4. **Individual Edit Pages (e.g., `getEventById` for the edit form):** When an admin clicks "Edit", they must fetch the absolute latest DB row, not a 5-minute stale cache, to prevent lost updates.
