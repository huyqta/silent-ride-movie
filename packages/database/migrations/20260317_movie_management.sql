-- Create tables for Movie Management (No Auth version for Personal/Family use)
-- 1. Profiles
create table if not exists public.sr_profiles (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  full_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Favorites
create table if not exists public.sr_favorites (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.sr_profiles(id) on delete cascade not null,
  movie_slug text not null,
  movie_title text,
  poster_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, movie_slug)
);

-- 3. Watch History
create table if not exists public.sr_watch_history (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.sr_profiles(id) on delete cascade not null,
  movie_slug text not null,
  movie_title text,
  episode_slug text,
  episode_name text,
  duration numeric, -- total length of video (seconds)
  playback_time numeric, -- current playback position (seconds)
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, movie_slug)
);

-- Disable RLS for easy family use (or keep it and use open policies)
-- For this use case, we just disable it since there's no auth context
alter table public.sr_profiles disable row level security;
alter table public.sr_favorites disable row level security;
alter table public.sr_watch_history disable row level security;
