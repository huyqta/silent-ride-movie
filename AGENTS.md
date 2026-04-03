# AGENTS.md - System State Status

## 📅 Last Updated: 2026-03-17

## 🚀 Recent Changes
- **Monorepo Migration**: Converted the project from a flat structure to a Turborepo monorepo.
  - `apps/web`: Main Next.js application.
  - `packages/database`: Shared database logic and Supabase client factories.
- **Supabase Integration**:
  - **Auth Removed**: Switched to a local-first profile system for personal/family use.
  - Added Tables: `sr_profiles`, `sr_favorites`, `sr_watch_history`.
  - Column `playback_time` replaces `current_time` in `sr_watch_history`.
  - Disable RLS for local-friendly data access across profiles.
- **Features**:
  - **Profiles Page**: "Who's watching?" screen on initial load.
  - **Profile Management**: Create/Delete profiles stored in Supabase but identified via localStorage.
  - **Cloud Sync**: Favorites and Watch History are now synced per profile.
  - **Header Switcher**: Easily switch between family profiles from the header.
- **Tech Stack Updates**:
  - Next.js 16.1.6 (renamed `middleware.ts` to `proxy.ts` for version compatibility).
  - Turbo 2.8.x.
  - Supabase SSR for session management.

## 🛠️ System State
- **Build Status**: `pnpm build` passed successfully in `apps/web`.
- **Database**: Schemas defined in `packages/database/migrations`.
- **Environment**: Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## ⚠️ Notes for Future Agents
- Use `pnpm --filter [package] [command]` for individual package operations due to `openpty` issues with global `turbo` runs in this environment.
- Next.js 16 requires `proxy.ts` instead of `middleware.ts`.
- Always verify Supabase RLS is active when adding new tables.
