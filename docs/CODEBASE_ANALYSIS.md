# Spontee — Current Codebase Analysis & Priorities

> **Document Status:** Snapshot of current implementation state.  
> **Last Updated:** August 2026  
> *Note: This document is expected to evolve and become outdated as features are completed and bugs are resolved.*

---

## 1. Executive Summary

The Spontee codebase has a solid foundation. The landing page, 3-step room creation wizard, Google Places API integration, room joining flow, real-time lobby, and Tinder-style swipe card voting are functional.

However, the session pipeline **breaks immediately after voting completes**:
- The waiting screen (`/room/[code]/waiting`) is an empty placeholder.
- The result screen (`/room/[code]/result`) is an empty placeholder.
- The participant status is not updated to `"finished"` when voting ends, blocking the recommendation calculation.

---

## 2. Incomplete Features

### 1. Waiting Room Screen (`app/room/[code]/waiting/page.tsx`)
- **Current State:** Minimal placeholder rendering `<div>WaitingPage</div>`.
- **Requirement:**
  - Display real-time voting progress across all participants.
  - Subscribe to the `participants-${roomId}` Realtime channel to track when each participant transitions to `status === "finished"`.
  - Automatically calculate results and redirect to `/room/[code]/result` once all participants have finished.

### 2. Result Screen (`app/room/[code]/result/page.tsx`)
- **Current State:** Minimal placeholder rendering `<div>Result page</div>`.
- **Requirement:**
  - Display the winning recommendation (place name, image, rating, address, and category).
  - Display the outcome type: **Consensus** (100% agreement), **Compromise** (top pick with majority agreement), or **No Match** (nobody agreed on anything).
  - Show runner-up options and vote distribution.
  - Provide actions to finish the session or start a new room.

### 3. Automated Phase Transition (Waiting → Result)
- **Current State:** No automated trigger to run `calculateRoomResult()` and update `rooms.status` to `"result"`.
- **Requirement:** When the final participant completes voting, trigger result calculation and transition room status to `"result"` so all participants navigate to the result screen simultaneously.

---

## 3. Known Bugs & Discrepancies

### Bug 1: Participant Status Not Updated to `"finished"`
- **Location:** `lib/room/voting/hook/useVoting.ts` (line 61–65)
- **Problem:** When a user completes all cards in the deck (`!loading && !currentOption`), the hook immediately calls `router.replace(`/room/${roomCode}/waiting`)` without updating the participant's status in Supabase from `"voting"` to `"finished"`.
- **Impact:** `calculateRoomResult()` in `result.service.ts` strictly checks:
  ```typescript
  const everyoneFinished = participants.every(p => p.status === "finished");
  if (!everyoneFinished) throw new Error("Not all participants have finished voting.");
  ```
  Because participant statuses remain `"voting"`, result calculation will always throw an error.

### Bug 2: Room Status Never Updated to `"result"`
- **Location:** `lib/room/create/types/room-types.ts` defines `ROOM_STATUS.RESULT = "result"`, but no service or hook currently writes this status to the `rooms` table upon session completion.

### Bug 3: TypeScript Import Error in `price-level.ts`
- **Location:** `lib/room/create/utils/price-level.ts` (line 1)
- **Problem:** Imports `GooglePriceLevel` from `../types/google-place`, but `google-place.ts` only imports it from `./budget` without exporting it.
- **Diagnostic:** `error TS2459: Module '"../types/google-place"' declares 'GooglePriceLevel' locally, but it is not exported.`
- **Fix Needed:** Either re-export `GooglePriceLevel` from `lib/room/create/types/google-place.ts` or change the import in `price-level.ts` to import directly from `../types/budget`.

### Resolved Item: Vote Casing Consistency
- **Status:** Verified in source code.
- **Details:** `lib/room/result/service/result.service.ts` (line 56) checks `swipe.vote === "go"`, which correctly matches `lib/room/voting/types/vote.types.ts`.

### Resolved Item: Room Visibility Deprecated
- **Status:** Verified in source code.
- **Details:** Legacy `RoomVisibility.tsx` component was removed; room visibility is not a field in the current room setup flow or database schema.

---

## 4. Technical Debt & Architectural Concerns

1. **Client-Side Result Calculation:**
   - `calculateRoomResult()` runs entirely on the client, querying all swipes and computing the winner in the browser.
   - *Recommendation:* Move result calculation to a server action or Supabase database function / RPC to prevent exposing raw swipe data to clients and avoid race conditions when multiple participants finish at the same time.

2. **Supabase Client Patterns:**
   - `lib/supabase/client.ts` exports a singleton initialized with `createClient` from `@supabase/supabase-js`.
   - `lib/supabase/server.ts` uses `createServerClient` from `@supabase/ssr`.
   - *Recommendation:* Align client-side usage with `createBrowserClient` from `@supabase/ssr` to ensure cookie-based auth sessions synchronize seamlessly across client and server.

3. **Non-Atomic Room Creation:**
   - `room.service.ts` performs 6 sequential operations (insert room, insert participant, insert preferences, insert categories, search Google Places, insert options).
   - If place generation or a subsequent insert fails, orphaned room records remain in the database.
   - *Recommendation:* Wrap the creation workflow in a database transaction or cleanup handler.

4. **Server Action Importing Client Supabase Client:**
   - `createRoomAction` (`"use server"`) delegates to `room.service.ts`, which imports `supabase` from `@/lib/supabase/client` instead of using `createClient()` from `@/lib/supabase/server`.

5. **Stale `.next` Cache:**
   - `.next/types/validator.ts` may retain references to old routes (e.g. `[id]` before it was renamed to `[code]`). Clearing `.next/` or running `next build` regenerates fresh route validators.

---

## 5. Implementation Priorities

### Priority 1: Fix TypeScript Import in `price-level.ts`
- Update `lib/room/create/utils/price-level.ts` to import `GooglePriceLevel` from `../types/budget` (or export it from `google-place.ts`).

### Priority 2: Fix Participant Lifecycle in `useVoting.ts`
- In `useVoting.ts`, when the card deck is empty, call `updateParticipantStatus(participantId, PARTICIPANT_STATUS.FINISHED)` before redirecting to `/waiting`.

### Priority 3: Build Realtime Waiting Room Screen
- In `app/room/[code]/waiting/page.tsx`:
  - Fetch room and participants list.
  - Subscribe to `participants-${roomId}` for real-time status updates.
  - Display progress indicator (e.g. *"3 of 4 participants finished"*).
  - When all participants reach `"finished"`, trigger result calculation.

### Priority 4: Connect Result Calculation & Room Status Transition
- When all participants finish voting:
  - Call `calculateRoomResult({ roomId })`.
  - Update `rooms.status` to `"result"`.
  - Navigate all participants to `/room/[code]/result`.

### Priority 5: Implement Result Screen UI
- In `app/room/[code]/result/page.tsx`:
  - Fetch the winning place option and result type.
  - Render celebration UI for consensus, or highlight best compromise.
  - Display venue card with photos, rating, address, and Google Maps link.
  - Provide "Done" or "Create New Room" navigation.
