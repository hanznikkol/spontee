# Spontee — AI Context & Architecture Reference

> **Stop arguing. Start deciding.**  
> Decision-making application for couples, friends, and groups.

---

## 1. Product Overview & Philosophy

Spontee is a real-time collaborative decision-making web application. It eliminates endless group discussions (*"Saan tayo kakain?"*, *"Ikaw bahala"*, *"Kahit saan"*) by letting a group enter a shared room and vote through nearby options using a Tinder-style swipe interface until the group reaches a clear recommendation.

### Core Philosophy
- **One voting session → One recommendation → End.**
- Simple, fast, playful, modern, and collaborative.
- Not an open-ended social network or a generic multi-purpose polling application.
- Mobile-first, designed for spontaneous social gatherings and hangouts.

---

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router, Server Actions, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4, `tw-animate-css`, OKLCH color design tokens
- **UI Components:** Radix UI / shadcn/ui (`radix-nova` style)
- **Database & Realtime:** Supabase (PostgreSQL, Realtime Postgres Changes, Anonymous Authentication)
- **State Management:** Zustand (with `sessionStorage` and `localStorage` persistence)
- **External APIs:** Google Places API (New `places:searchNearby`), `@vis.gl/react-google-maps`
- **Gestures & Animations:** Framer Motion (`useMotionValue`, `useTransform`, drag gestures)
- **QR Code Generation:** `qrcode.react` (`QRCodeSVG`)

---

## 3. Project Architecture & Directory Structure

```
spontee/
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # Root layout (Plus Jakarta Sans font, Providers)
│   ├── page.tsx                            # Landing page (/)
│   ├── providers.tsx                       # Google Maps APIProvider client wrapper
│   ├── globals.css                         # Tailwind v4 theme, OKLCH tokens, animations
│   ├── create/
│   │   ├── layout.tsx                      # Creation wizard layout with decorative background
│   │   ├── host/page.tsx                   # Step 1: Host display name entry
│   │   ├── room/page.tsx                   # Step 2: Room name, participant & option counts
│   │   └── preference/page.tsx             # Step 3: Categories, budget, location & room creation
│   ├── join/page.tsx                       # Guest join flow (room code/link input)
│   └── room/[code]/
│       ├── page.tsx                        # Main voting interface (swipe card deck)
│       ├── lobby/page.tsx                  # Room lobby (real-time participants, invite card)
│       ├── waiting/page.tsx                # Waiting room (waits for all participants to finish)
│       └── result/page.tsx                 # Final result display (winning recommendation)
│
├── components/
│   ├── ui/                                 # 15 shadcn/ui primitives (button, card, dialog, etc.)
│   └── custom/
│       ├── Landing/                        # Landing page sections (Hero, Features, Navigation)
│       ├── Modal/                          # Dialogs (ErrorLogDialog)
│       ├── ProgressBar.tsx                 # Reusable labeled progress bar
│       ├── Room/
│       │   ├── NameInput.tsx               # Reusable display name input field
│       │   └── Voting/
│       │       ├── SwipeCards.tsx          # Interactive Tinder-style swipe card
│       │       └── CardInfo.tsx            # Place details overlay (rating, price, address)
│       ├── RoomCreation/
│       │   ├── Host/                       # Host name header
│       │   ├── Setup/                      # Room setup controls (participants, options sliders)
│       │   └── Preference/                 # Category grid, budget selector, map & location picker
│       ├── RoomJoin/                       # Room link / code input
│       └── RoomLobby/                      # Lobby header, participant list, badges, invite card
│
├── lib/
│   ├── utils.ts                            # Tailwind class merge utility (cn)
│   ├── landing/text-metadata.ts            # Landing page copy
│   ├── supabase/
│   │   ├── client.ts                       # Browser Supabase client singleton
│   │   └── server.ts                       # SSR cookie-based server Supabase client
│   ├── user/services/auth.service.ts       # Anonymous Supabase authentication service
│   └── room/
│       ├── create/                         # Room creation module
│       │   ├── actions/create-room.ts      # Server Action: createRoomAction()
│       │   ├── helpers/room-helper.ts      # Room state update helpers
│       │   ├── payload/                    # DTO interfaces for room & option creation
│       │   ├── services/                   # Room, option, and Google Places search services
│       │   ├── stores/create-room-store.ts # Zustand store for 3-step wizard (sessionStorage)
│       │   ├── types/                      # Room, option, category, budget, location types
│       │   └── utils/                      # Price-level mapping, room code generation
│       ├── join/                           # Room joining module
│       │   ├── join.ts                     # URL / room-code parser
│       │   ├── hook/useJoinRoom.ts         # Hook handling guest join flow
│       │   └── service/join.service.ts     # Join service with room capacity checks
│       ├── lobby/                          # Lobby management module
│       │   ├── types/participants-types.ts # Participant types and status constants
│       │   ├── helper/participant.helper.ts# Realtime participant array reducer
│       │   ├── hook/useLobby.ts            # Core lobby state & realtime subscription hook
│       │   ├── hook/useClipboard.ts        # Timed clipboard copy hook
│       │   └── service/lobby.service.ts    # Supabase lobby queries and participant actions
│       ├── main/stores/room-session-store.store.ts # Active room session identity (localStorage)
│       ├── voting/                         # Voting module
│       │   ├── types/vote.types.ts         # Swipe and vote types ('go' | 'pass')
│       │   ├── helper/vote.helper.ts       # Deck array helpers (getCurrent, removeCurrent)
│       │   ├── hook/useVoting.ts           # Swiping state machine and progress tracking
│       │   └── service/vote.service.ts     # Fetch options & submitVote RPC wrapper
│       └── result/                         # Result calculation module
│           ├── result.types.ts             # ResultType ('consensus' | 'compromise' | 'no_match')
│           └── service/result.service.ts   # Recommendation calculation & tie-breaker logic
```

---

## 4. Core User Flows

### Flow 1: Host Room Creation
1. **Home (`/`)** → Host clicks *"Create a Room"*.
2. **Step 1: Host Name (`/create/host`):** Enter display name (min 2 characters). Stored in `useCreateRoomStore`.
3. **Step 2: Room Setup (`/create/room`):** Configure room name, max participants (2–25, default 2), and max options (5, 10, 15, 20, default 10).
4. **Step 3: Preferences (`/create/preference`):** Select 1–3 categories, budget (`any`, `low`, `medium`, `high`), location (browser geolocation, autocomplete search, or interactive map click), and search radius (500m–10km).
5. **Room Creation Execution (`createRoomAction`):**
   - Ensures an anonymous Supabase user session (`ensureAnonUser()`).
   - Inserts record into `rooms` table with generated `XXXX-XXXX` room code.
   - Inserts host into `participants` table (`is_host: true`, `status: "waiting"`).
   - Inserts host preferences into `room_preferences`.
   - Links selected categories in `room_categories`.
   - Calls Google Places API (`searchNearby`) to fetch nearby venues matching selected categories, budget, and radius.
   - Deduplicates and inserts venues into `options` table.
   - Saves active session identity (`roomId`, `roomCode`, `participantId`, `isHost: true`) to `useRoomSessionStore`.
   - Clears `useCreateRoomStore` and its `sessionStorage`.
   - Navigates host to `/room/[code]/lobby`.

### Flow 2: Guest Joining
1. Guest navigates to direct URL (`/join?room=XXXX-XXXX`) or manually inputs code/link on `/join`.
2. Code is sanitized and parsed via `extractRoomCode`.
3. Guest enters a display name (max 20 characters).
4. `joinRoom()` service executes:
   - Ensures an anonymous Supabase user session.
   - Validates room exists and is not `"closed"` or `"result"`.
   - Verifies room capacity (`participant_count < max_participants`).
   - Upserts record in `participants` table (`is_host: false`, `status: "waiting"`).
   - Saves session identity (`roomId`, `roomCode`, `participantId`, `isHost: false`) to `useRoomSessionStore`.
   - Navigates guest to `/room/[code]/lobby`.

### Flow 3: Lobby Coordination
1. Participants synchronize in real time via Supabase Realtime channel (`participants-{roomId}`).
2. Host sees invite details (room code with copy button, share URL, QR code modal).
3. **Opening Room:** Host clicks *"Open Room"* (enabled when participant count $\ge$ 2). Updates room status to `"active"`.
4. **Starting Voting:** When room status becomes `"active"`, participants see *"Start Voting"*. Clicking this updates participant status to `"voting"` and navigates them to `/room/[code]`.

### Flow 4: Swiping / Voting
1. Participants swipe through the options deck one card at a time.
   - **Swipe Right / "Go":** Vote value `"go"`.
   - **Swipe Left / "Pass":** Vote value `"pass"`.
2. Each swipe invokes `submitVote` via Supabase RPC (`submit_vote`).
3. Card deck animates out and the next card is presented.
4. When all cards in the deck are swiped, the participant is redirected to `/room/[code]/waiting`.

### Flow 5: Waiting & Result Determination
1. Waiting screen monitors voting completion across all room participants.
2. When all participants reach `status === "finished"`, the recommendation algorithm runs.
3. Participants transition to `/room/[code]/result` showing the winning recommendation, consensus level, and runner-ups.

---

## 5. State Management Architecture

Spontee intentionally uses **two distinct Zustand stores** with different lifecycles and storage engines:

| Store | Location | Storage Engine | Scope & Lifecycle |
|---|---|---|---|
| `useCreateRoomStore` | `lib/room/create/stores/create-room-store.ts` | `sessionStorage` (`"spontee-create-room"`) | **Ephemeral Wizard State:** Preserves multi-step room creation data across step navigation in a single browser tab. Explicitly reset and purged from storage upon room creation. |
| `useRoomSessionStore` | `lib/room/main/stores/room-session-store.store.ts` | `localStorage` (`"spontee-room-session"`) | **Active Session Identity:** Stores `roomId`, `roomCode`, `participantId`, and `isHost`. Persists across page reloads and tab closes so users can resume their active session. |

In-component real-time state (lobby participants, options deck, swipe progress) is managed by dedicated hooks (`useLobby`, `useVoting`) using React state fed by Supabase queries and Realtime streams.

---

## 6. Supabase Architecture & Database Schema

### Authentication
- Uses **Supabase Anonymous Authentication** (`supabase.auth.signInAnonymously()`).
- Implemented via `ensureAnonUser()` in `lib/user/services/auth.service.ts`.
- Both hosts and guests receive a unique Supabase auth `user.id` without requiring email/password registration.
- The auth `user.id` maps directly to `participants.user_id`.

### Database Tables

#### 1. `rooms`
| Column | Type | Description |
|---|---|---|
| `room_id` | UUID (PK) | Auto-generated room identifier |
| `room_code` | TEXT (Unique) | Formatted 8-character code (`XXXX-XXXX`) |
| `room_name` | TEXT | Room display name |
| `status` | TEXT | Room lifecycle: `'lobby'` \| `'active'` \| `'result'` \| `'closed'` |
| `max_participants` | INTEGER | Maximum allowed participants (2–25) |
| `max_options` | INTEGER | Number of place options fetched (5, 10, 15, 20) |
| `ends_at` | TIMESTAMPTZ | Optional session expiry timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### 2. `participants`
| Column | Type | Description |
|---|---|---|
| `participant_id` | UUID (PK) | Auto-generated participant identifier |
| `room_id` | UUID (FK) | References `rooms.room_id` |
| `user_id` | UUID | References Supabase Auth `user.id` |
| `display_name` | TEXT | User's chosen display name |
| `session_id` | TEXT | Optional session tracking identifier |
| `is_host` | BOOLEAN | `true` for the room creator, `false` for guests |
| `status` | TEXT | Participant lifecycle: `'waiting'` \| `'voting'` \| `'finished'` |
| `joined_at` | TIMESTAMPTZ | Timestamp when participant joined |

#### 3. `room_preferences`
| Column | Type | Description |
|---|---|---|
| `room_id` | UUID (FK) | References `rooms.room_id` |
| `budget` | TEXT | Selected budget tier: `'any'` \| `'low'` \| `'medium'` \| `'high'` |
| `address` | TEXT | Resolved human-readable address |
| `latitude` | DOUBLE PRECISION | Center coordinate latitude |
| `longitude` | DOUBLE PRECISION | Center coordinate longitude |
| `radius` | INTEGER | Search radius in meters (500 to 10,000) |

#### 4. `categories` & `room_categories`
- **`categories`**: Master catalog of supported activity categories (`category_id`, `name`).
  - Supported names: `food`, `coffee`, `dessert`, `drinks`, `entertainment`, `shopping`, `parks`, `bars`, `karaoke`, `sports`, `wellness`.
- **`room_categories`**: Join table (`room_id`, `category_id`) linking rooms to selected categories.

#### 5. `options`
| Column | Type | Description |
|---|---|---|
| `option_id` | UUID (PK) | Auto-generated option identifier |
| `room_id` | UUID (FK) | References `rooms.room_id` |
| `title` | TEXT | Place / venue name |
| `google_place_id` | TEXT | Google Places ID reference |
| `address` | TEXT | Formatted venue address |
| `latitude` | DOUBLE PRECISION | Venue latitude |
| `longitude` | DOUBLE PRECISION | Venue longitude |
| `rating` | NUMERIC | Google rating (e.g. 4.6) |
| `price_level` | INTEGER | Mapped numeric price level (0–4) |
| `image_url` | TEXT | Google Places photo media URL |

#### 6. `swipes`
| Column | Type | Description |
|---|---|---|
| `swipe_id` | UUID (PK) | Auto-generated swipe identifier |
| `room_id` | UUID (FK) | References `rooms.room_id` |
| `option_id` | UUID (FK) | References `options.option_id` |
| `participant_id` | UUID (FK) | References `participants.participant_id` |
| `vote` | TEXT | Recorded decision: strictly `'go'` or `'pass'` |
| `swiped_at` | TIMESTAMPTZ | Swipe timestamp |

### Supabase Stored Procedures (RPC)
- `submit_vote(p_room_id, p_option_id, p_participant_id, p_vote)`: Inserts or updates a vote record in the `swipes` table.

### Supabase Realtime Channels
- **`room-${roomId}`**: Subscribes to `UPDATE` events on `public.rooms` filtered by `room_id=eq.${roomId}`. Used to react when the host opens the room or when status changes.
- **`participants-${roomId}`**: Subscribes to all events (`*`) on `public.participants` filtered by `room_id=eq.${roomId}`. Synchronizes real-time participant join/leave/rename events and participant status changes.

---

## 7. Domain Lifecycles & State Machines

### Room Status Lifecycle
```
[Room Created]
      ↓
   "lobby"     (Participants join; invite link/QR shared)
      ↓         (Host opens room when participants >= 2)
   "active"    (Participants enter swiping deck)
      ↓         (All participants complete voting)
   "result"    (Winning recommendation calculated & revealed)
      ↓         (Session ended)
   "closed"
```

### Participant Status Lifecycle
```
[Joined Room]
      ↓
  "waiting"    (Inside lobby; waiting for room to open)
      ↓         (Clicks "Start Voting")
  "voting"     (Actively swiping cards)
      ↓         (Completes all cards in deck)
  "finished"   (In waiting room until others finish)
```

### Result Calculation & Consensus Rules
The recommendation algorithm (`calculateRoomResult`) follows these deterministic rules:
1. **Prerequisite:** All participants in the room must have `status === "finished"`.
2. **Scoring:** Count matching `vote === "go"` swipes for each option.
3. **No Match:** If highest score is `0`, result type is `"no_match"` with `optionId: null`.
4. **Consensus vs. Compromise:**
   - If `highestScore === totalParticipants` $\rightarrow$ `"consensus"` (unanimous agreement).
   - If `highestScore < totalParticipants` $\rightarrow$ `"compromise"` (majority / plurality pick).
5. **Tie-Breaking:**
   - If multiple options tie for highest score:
     1. Highest Google rating (`rating`).
     2. Distance from search center (future extension).
     3. Random selection among tied top candidates.

---

## 8. Important Domain Rules & Constraints

1. **Minimum Participants:** A room requires at least 2 participants before the host can open it.
2. **Host Authority:** Only the participant with `is_host === true` has permission to open the room.
3. **Category Bounds:** A host must select at least 1 and at most 3 categories during setup.
4. **Vote Value Canon:** Vote values must be strictly lowercase `"go"` and `"pass"`.
5. **Room Code Format:** 8-character codes formatted as `XXXX-XXXX` using an unambiguous alphanumeric character set (omitting easily confused characters like 0, 1, I, O).
6. **Deck Exhaustion:** Voting progresses through the entire option deck sequentially; completing the deck transitions the participant to the waiting state.
7. **Single Recommendation:** The session always concludes with one clear recommendation for the group.
