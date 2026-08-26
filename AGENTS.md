<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Universal AI Coding Agent Guidelines for Spontee

You are working on **Spontee**, a real-time collaborative decision-making web application.

All AI coding agents (Claude, Gemini, Antigravity, etc.) must follow the rules, principles, and workflows defined in this document.

---

## 1. Information Priority & Source of Truth

When reasoning about Spontee, always follow this priority order:

1. **Actual source code & database schema** (the ultimate source of truth)
2. **`AI-CONTEXT.md`** (intended shared architecture, domain rules, and lifecycles)
3. **`AGENTS.md`** (this file — universal agent behavior and instructions)
4. **`CLAUDE.md` / `GEMINI.md`** (tool-specific execution adapters)
5. **`docs/CODEBASE_ANALYSIS.md`** (snapshot of current bugs, incomplete features, and debt)

If documentation contradicts the implementation in the source code:
- Verify whether the code is working as intended or represents a known bug.
- Treat the actual code as truth for current behavior.
- Use `AI-CONTEXT.md` for intended architectural and domain rules.

---

## 2. Core Operating Rules

### Rule 1: Read Context Before Modifying Code
- Always read `AI-CONTEXT.md` before making substantial architectural changes.
- Inspect the relevant existing source files before writing or editing code.
- Do not assume documentation is more accurate than the actual implementation.

### Rule 2: Preserve Existing Architecture
- **Do NOT rewrite the application from scratch.**
- **Do NOT replace working Supabase logic without justification.**
- **Do NOT create duplicate state management** (e.g. creating a new store when `useCreateRoomStore` or `useRoomSessionStore` can be reused).
- **Do NOT move files simply for aesthetic reasons.**
- Keep business logic separated from presentation: components render UI, while services handle Supabase and external APIs.

### Rule 3: Do Not Introduce Dependencies Casually
- The tech stack is fixed: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase, Zustand, Google Maps/Places API, Framer Motion.
- Do not introduce another library unless there is an unavoidable, documented technical requirement.

### Rule 4: Respect TypeScript & Code Quality
- Write strict TypeScript.
- **Avoid `any`** unless interacting with untyped external payloads, and even then prefer `unknown` with type guards.
- Prefer existing types and enums (e.g. `RoomStatus`, `ParticipantStatus`, `Vote`, `ResultType`) over raw string literals.
- Reuse existing components, hooks, helpers, and services.

### Rule 5: Mobile-First & Responsive UX
- Spontee is designed for friends and couples deciding on the go.
- Every screen must be fully responsive across mobile, tablet, and desktop.
- Always handle all UI states: **loading**, **error**, **empty**, and **active**.

---

## 3. Standard Development Workflow

For every feature, bug fix, or refactor, follow this 6-step workflow:

```
1. Inspect   → Read the relevant existing source code and identify dependencies.
2. Diagnose  → Understand the current behavior, root cause, or missing capability.
3. Plan      → Formulate the smallest clean change that solves the problem.
4. Implement → Make the targeted code changes respecting existing conventions.
5. Verify    → Test for TypeScript errors, lint errors, runtime breaks, and responsive issues.
6. Report    → Explain what changed, why, which files were affected, and what needs testing.
```

---

## 4. Architectural Boundaries

- **Server vs. Client Boundaries:**
  - Mark client components with `'use client'` only when using hooks, browser APIs, or interactivity.
  - Server Actions live in `lib/room/create/actions/` and must have `'use server'`.
  - SSR Supabase client (`lib/supabase/server.ts`) is for Server Components & Actions.
  - Browser Supabase client (`lib/supabase/client.ts`) is for Client Components & hooks.
- **State Segregation:**
  - Ephemeral multi-step creation state belongs in `useCreateRoomStore` (`sessionStorage`).
  - Active session credentials belong in `useRoomSessionStore` (`localStorage`).
  - Real-time room and participant data belongs in React hook state driven by Supabase Realtime subscriptions.
