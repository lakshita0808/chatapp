# Tars Chat App

Realtime fullstack chat starter built with Next.js App Router, Convex, Clerk auth, Tailwind CSS, and shadcn-style UI primitives.

## Features implemented

- Clerk authentication with protected routes (`middleware.ts`)
- Convex data model for users, conversations, messages, typing, and presence
- User discovery with search
- One-on-one conversation create-or-get (deterministic member key)
- Realtime message subscription per conversation
- Send message mutation + optimistic UI
- Read receipts via per-user `lastReadAt`
- Unread counts in sidebar
- Typing indicator with debounce + recent typing window
- Online/offline presence updates on visibility/unload
- Timestamp formatting rules:
  - Today: `h:mm a`
  - Same year: `MMM d, h:mm a`
  - Different year: `MMM d, yyyy, h:mm a`

## Routes

- `/` dashboard + sidebar
- `/users` discover users and start chat
- `/conversations/[conversationId]` chat view
- `/chat/[conversationId]` legacy redirect to `/conversations/[conversationId]`
- `/sign-in`, `/sign-up` Clerk auth pages

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

Fill in Clerk + Convex keys.

3. Start Convex in one terminal:

```bash
npx convex dev
```

4. Start Next.js in another terminal:

```bash
npm run dev
```

5. Seed demo users/messages (recommended before demo recording):

- Open `/users`
- Click `Seed demo users`
- Start chat with `Alex Tars`

See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for a full 5-minute presentation script.

## Important notes

- Convex generated files are created by `npx convex dev`.
- Clerk IDs are used as app-level user IDs in conversation/message documents.
- This repo is scaffolded for iteration; optional features like reactions UI and group creation mutation are ready to extend.
