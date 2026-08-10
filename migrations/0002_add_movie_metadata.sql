-- Migration: Thêm metadata đầy đủ vào bảng movies
-- Cần thiết để frontend đọc từ D1 thay vì gọi thẳng API nguồn

ALTER TABLE movies ADD COLUMN slug TEXT;
ALTER TABLE movies ADD COLUMN origin_name TEXT;
ALTER TABLE movies ADD COLUMN type TEXT DEFAULT 'series';
ALTER TABLE movies ADD COLUMN thumb_url TEXT;
ALTER TABLE movies ADD COLUMN quality TEXT DEFAULT 'HD';
ALTER TABLE movies ADD COLUMN lang TEXT DEFAULT 'Vietsub';
ALTER TABLE movies ADD COLUMN episode_current TEXT;
ALTER TABLE movies ADD COLUMN episode_total TEXT;
ALTER TABLE movies ADD COLUMN content TEXT;
ALTER TABLE movies ADD COLUMN status TEXT;
ALTER TABLE movies ADD COLUMN categories TEXT DEFAULT '[]';  -- JSON: [{id,name,slug}]
ALTER TABLE movies ADD COLUMN countries TEXT DEFAULT '[]';   -- JSON: [{id,name,slug}]

-- Index để filter theo type (phim-le, phim-bo, hoat-hinh...)
CREATE INDEX IF NOT EXISTS idx_movies_type ON movies (type);

-- Index để filter theo slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_movies_slug ON movies (slug);
