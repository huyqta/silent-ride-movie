-- Migration: Multi-source movies aggregation với D1
-- Lưu ý: SQLite không hỗ trợ UUID native, dùng TEXT + crypto.randomUUID() ở code
-- JSONB không có, dùng TEXT chứa JSON.stringify

-- ─────────────────────────────────────────────────────────────────────────────
-- Bảng chính: movies (phim đã merge từ 3 nguồn)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  search_key TEXT NOT NULL,           -- normalizeTitle(title) để match giữa nguồn
  year INTEGER NOT NULL,
  poster TEXT,                        -- URL poster — ưu tiên OPhim nếu có nhiều
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_movies_search_key ON movies (search_key, year);
CREATE INDEX IF NOT EXISTS idx_movies_updated_at ON movies (updated_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Bảng sources: mỗi phim có thể có 1-3 sources (ophim, nguonc, kkphim)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS movie_sources (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,          -- 'ophim' | 'nguonc' | 'kkphim'
  source_slug TEXT NOT NULL,          -- slug trên API nguồn đó
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (source_name, source_slug)
);

CREATE INDEX IF NOT EXISTS idx_movie_sources_movie_id ON movie_sources (movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_sources_source ON movie_sources (source_name, source_slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- Bảng episode servers: mỗi source có nhiều server/season
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS movie_episode_servers (
  id TEXT PRIMARY KEY,
  movie_source_id TEXT NOT NULL REFERENCES movie_sources(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,          -- "Vietsub #1" | "Season 1" | "NguonC"
  server_index INTEGER NOT NULL,      -- thứ tự server trong nguồn đó
  episodes TEXT NOT NULL,             -- JSON.stringify(NormalizedEpisode[])
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (movie_source_id, server_index)
);

CREATE INDEX IF NOT EXISTS idx_episode_servers_source ON movie_episode_servers (movie_source_id, server_index);
