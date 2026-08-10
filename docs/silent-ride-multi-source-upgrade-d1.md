# Hướng dẫn nâng cấp Silent Ride Movie — Gộp 3 nguồn (bản dùng Cloudflare D1)

> **🚨 ĐÃ TRIỂN KHAI:** Phiên bản này đã được implement. Xem `docs/D1_SETUP.md` để setup.

Bản cập nhật thay Supabase bằng **Cloudflare D1** cho phần lưu trữ phim gộp. Vì D1 chỉ hoạt động ngon trong runtime Cloudflare Workers/Pages, hướng này giả định bạn deploy theo **Cách 2 trong README** (Cloudflare Pages qua OpenNext) là kênh chính, không phải Vercel.

**Về Supabase:** dự án vẫn giữ Supabase như tính năng tuỳ chọn cho Profile/Yêu thích/Lịch sử đúng như README gốc — 2 việc này độc lập nhau. D1 chỉ đảm nhiệm phần **catalog phim gộp từ 3 nguồn**, không liên quan tới personalization.

## ⚠️ Thay đổi quan trọng so với plan ban đầu

1. **Schema D1:** Tách bảng `movie_episode_servers` riêng thay vì lưu JSON trong `movie_sources` để dễ query và xử lý phim bộ nhiều season.
2. **Normalize episodes:** Chuẩn hoá episodes từ 3 nguồn về `NormalizedEpisode[]` thống nhất trước khi lưu, tránh bug schema khác nhau giữa OPhim/NguonC/KKPhim.
3. **Sync thủ công:** Bỏ cron worker, thay bằng admin API route `POST /api/admin/sync` để kiểm soát chi phí và tránh vượt 100k writes/ngày.
4. **Batch support:** Hỗ trợ `?limit=500&page=1` để sync từng batch nhỏ qua nhiều ngày.

---

## 1. Tổng quan thay đổi

```
apps/web/lib/api/
  ├── ophim.ts (đã có)
  ├── nguonc.ts (đã có)
  ├── kkphim.ts (đã có)
  └── normalize.ts      (MỚI — giữ nguyên như bản trước, không đổi)

apps/web/lib/movies/
  ├── merge.ts            (MỚI — chuẩn hoá title, KHÔNG đổi so với bản Supabase)
  ├── sync.ts              (SỬA — dùng D1 binding thay vì Supabase client)
  └── source-health.ts    (MỚI — giữ nguyên, không phụ thuộc DB)

migrations/
  └── 0001_multi_source_movies.sql   (MỚI — cú pháp SQLite, đặt ở root theo chuẩn Wrangler)

wrangler.toml                          (SỬA — thêm D1 binding + cron trigger)
apps/web/app/api/cron/sync/route.ts   (SỬA — lấy D1 binding qua OpenNext context)
```

---

## 2. Cấu hình D1 trong dự án

### 2.1. Tạo database

```bash
npx wrangler d1 create silent-ride-movies
```

Lệnh này trả về `database_id` — copy lại để dùng ở bước sau.

### 2.2. Khai báo binding trong `wrangler.toml` (ở root monorepo hoặc `apps/web/wrangler.toml` tuỳ cấu trúc OpenNext hiện có)

```toml
name = "silent-ride"
compatibility_date = "2026-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "silent-ride-movies"
database_id = "<database_id_vừa_tạo>"

[triggers]
crons = ["0 3 * * *"]   # 3h sáng mỗi ngày, giống lịch cron cũ
```

### 2.3. Migration (cú pháp SQLite — khác chút với Postgres bản Supabase trước)

```sql
-- migrations/0001_multi_source_movies.sql

CREATE TABLE IF NOT EXISTS movies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  search_key TEXT NOT NULL,
  year INTEGER,
  poster TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_movies_search_key ON movies (search_key, year);

CREATE TABLE IF NOT EXISTS movie_sources (
  id TEXT PRIMARY KEY,
  movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_slug TEXT NOT NULL,
  episodes TEXT NOT NULL,          -- JSON.stringify, SQLite không có kiểu jsonb riêng
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE (source_name, source_slug)
);

CREATE INDEX IF NOT EXISTS idx_movie_sources_movie_id ON movie_sources (movie_id);
```

Khác biệt so với bản Postgres: không có `uuid`/`gen_random_uuid()` — D1 dùng `TEXT` cho id, bạn tự sinh UUID ở code (`crypto.randomUUID()` có sẵn trong Workers runtime). `jsonb` cũng không có — lưu `episodes` dạng `TEXT` chứa chuỗi JSON, parse lại khi đọc.

Chạy migration:

```bash
# Local (test trước)
npx wrangler d1 migrations apply silent-ride-movies --local

# Production
npx wrangler d1 migrations apply silent-ride-movies --remote
```

---

## 3. Chuẩn hoá dữ liệu 3 nguồn — không đổi

`lib/api/normalize.ts` giữ nguyên y hệt bản trước (map response OPhim/NguonC/KKPhim về `NormalizedMovie`), vì phần này độc lập với DB dùng bên dưới.

---

## 4. Chuẩn hoá title để match — không đổi

`lib/movies/merge.ts` phần `normalizeTitle()` giữ nguyên, không phụ thuộc DB.

---

## 5. Upsert vào D1 (`lib/movies/sync.ts`)

Đây là phần khác biệt chính so với bản Supabase — thay `supabase.from(...)` bằng D1 `prepare().bind().run()`:

```ts
// apps/web/lib/movies/sync.ts
import { normalizeTitle } from './merge';
import type { NormalizedMovie } from '../api/normalize';

export async function upsertMovieSource(db: D1Database, movie: NormalizedMovie) {
  const searchKey = normalizeTitle(movie.title);

  // 1. Tìm phim đã có cùng search_key + year
  const existing = await db
    .prepare('SELECT id FROM movies WHERE search_key = ? AND year = ?')
    .bind(searchKey, movie.year)
    .first<{ id: string }>();

  let movieId = existing?.id;

  // 2. Nếu chưa có, tạo phim mới
  if (!movieId) {
    movieId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO movies (id, title, search_key, year, poster)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(movieId, movie.title, searchKey, movie.year, movie.poster)
      .run();
  }

  // 3. Upsert source (D1 hỗ trợ ON CONFLICT như SQLite chuẩn)
  await db
    .prepare(
      `INSERT INTO movie_sources (id, movie_id, source_name, source_slug, episodes, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT (source_name, source_slug)
       DO UPDATE SET episodes = excluded.episodes, updated_at = excluded.updated_at`
    )
    .bind(
      crypto.randomUUID(),
      movieId,
      movie.sourceName,
      movie.sourceSlug,
      JSON.stringify(movie.episodes)
    )
    .run();
}

export async function syncAllSources(db: D1Database) {
  const { getOphimMovies } = await import('../api/ophim');
  const { getNguonCMovies } = await import('../api/nguonc');
  const { getKKPhimMovies } = await import('../api/kkphim');
  const {
    normalizeFromOphim,
    normalizeFromNguonC,
    normalizeFromKKPhim,
  } = await import('../api/normalize');

  const results = { ophim: 0, nguonc: 0, kkphim: 0, errors: [] as string[] };

  const sources = [
    { name: 'ophim', fetcher: getOphimMovies, normalize: normalizeFromOphim },
    { name: 'nguonc', fetcher: getNguonCMovies, normalize: normalizeFromNguonC },
    { name: 'kkphim', fetcher: getKKPhimMovies, normalize: normalizeFromKKPhim },
  ] as const;

  for (const src of sources) {
    try {
      const rawMovies = await src.fetcher();
      for (const raw of rawMovies) {
        const normalized = src.normalize(raw);
        await upsertMovieSource(db, normalized);
        results[src.name]++;
      }
    } catch (e) {
      results.errors.push(`${src.name}: ${(e as Error).message}`);
    }
  }

  return results;
}
```

**Lưu ý quan trọng về giới hạn ghi (100.000 rows/ngày free tier):** mỗi phim mới tốn 2 lượt ghi (1 insert `movies` nếu chưa có + 1 upsert `movie_sources`), phim đã tồn tại chỉ tốn 1 lượt ghi (update `movie_sources`). Với ~30-40.000 phim unique và 60.000 lượt xử lý nguồn/ngày, tổng lượt ghi thực tế nằm dưới ngưỡng — nhưng **chỉ nếu cron chạy đúng 1 lần/ngày**. Tuyệt đối tránh chạy sync nhiều lần thủ công liên tiếp khi test, dễ chạm giới hạn nhanh hơn dự kiến.

---

## 6. Cron Trigger — không cần route API riêng nữa

Khác với bản Vercel (phải tạo `app/api/cron/sync/route.ts` và cấu hình `vercel.json`), Cloudflare Workers có cơ chế `scheduled` handler riêng, tách khỏi Next.js request pipeline. Với OpenNext, cách gọn nhất là thêm 1 Worker phụ chỉ lo việc cron, dùng chung D1 binding:

```
apps/web/
  └── cron-worker.ts    (MỚI — Worker riêng cho scheduled sync)
```

```ts
// apps/web/cron-worker.ts
import { syncAllSources } from './lib/movies/sync';

export default {
  async scheduled(event: ScheduledEvent, env: { DB: D1Database }, ctx: ExecutionContext) {
    ctx.waitUntil(syncAllSources(env.DB));
  },
};
```

Thêm entry point này vào `wrangler.toml` (nếu OpenNext không hỗ trợ `scheduled` trực tiếp trong cùng Worker output, deploy Worker này như 1 Worker độc lập, riêng khỏi Pages project, cùng dùng chung D1 database qua `database_id`):

```toml
# wrangler.cron.toml — file cấu hình riêng cho cron worker
name = "silent-ride-cron"
main = "apps/web/cron-worker.ts"
compatibility_date = "2026-01-01"

[[d1_databases]]
binding = "DB"
database_name = "silent-ride-movies"
database_id = "<database_id>"

[triggers]
crons = ["0 3 * * *"]
```

Deploy riêng worker này:

```bash
npx wrangler deploy --config wrangler.cron.toml
```

> Nếu muốn đơn giản hơn, có thể thay bằng GitHub Actions chạy `schedule` gọi 1 route HTTP thường (không cần `scheduled` handler) — đánh đổi là route đó cần expose D1 qua Next.js API route (mục 7) thay vì gọi thẳng D1 binding từ Worker.

---

## 7. Đọc dữ liệu từ D1 trong Next.js (OpenNext)

Trong route handler/server component, lấy binding D1 qua `getCloudflareContext` của `@opennextjs/cloudflare` (gói OpenNext dự án đã dùng để deploy Cloudflare Pages):

```ts
// apps/web/app/api/movies/route.ts
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { env } = getCloudflareContext();
  const url = new URL(req.url);
  const keyword = url.searchParams.get('q');

  const query = keyword
    ? env.DB.prepare('SELECT * FROM movies WHERE search_key LIKE ? ORDER BY updated_at DESC LIMIT 40')
        .bind(`%${keyword}%`)
    : env.DB.prepare('SELECT * FROM movies ORDER BY updated_at DESC LIMIT 40');

  const { results } = await query.all();
  return NextResponse.json(results);
}
```

Trang chi tiết phim lấy `movie_sources` theo `movie_id` tương tự, rồi dùng `source-health.ts` (giữ nguyên như bản trước, không đổi vì chỉ làm HEAD request tới link video, không liên quan D1) để chọn nguồn còn sống.

**Nếu vẫn cần chạy local dev với `pnpm dev` (Next.js dev server thường, không qua Workers runtime):** dùng `wrangler pages dev` thay cho `next dev` khi cần test có D1, hoặc dùng `@opennextjs/cloudflare`'s `getPlatformProxy()` để giả lập binding D1 trong môi trường dev thường. Ghi chú việc này vào README nội bộ để tránh nhầm lẫn khi code chạy được lúc `next dev` nhưng lỗi thiếu binding lúc `wrangler dev`.

---

## 8. Checklist triển khai theo thứ tự

1. `npx wrangler d1 create silent-ride-movies`, lưu `database_id`.
2. Thêm migration `migrations/0001_multi_source_movies.sql`, chạy `--local` để test, sau đó `--remote`.
3. Cập nhật `wrangler.toml` (Pages project) với D1 binding.
4. Thêm `lib/api/normalize.ts` (không đổi so với bản Supabase).
5. Thêm `lib/movies/merge.ts` (không đổi).
6. Sửa `lib/movies/sync.ts` theo bản D1 ở mục 5.
7. Tạo `cron-worker.ts` + `wrangler.cron.toml`, deploy riêng bằng `wrangler deploy --config wrangler.cron.toml`.
8. Chạy sync thủ công 1 lần đầu: `npx wrangler d1 execute silent-ride-movies --remote --command "SELECT COUNT(*) FROM movies"` để kiểm tra sau khi cron chạy lần đầu, hoặc trigger `scheduled` thủ công qua `wrangler dev --test-scheduled`.
9. Thêm route `api/movies` (mục 7), sửa trang danh sách/tìm kiếm đọc từ D1 thay vì gọi trực tiếp 3 API nguồn.
10. Thêm `lib/movies/source-health.ts`, tích hợp vào trang chi tiết phim + nút chọn server.
11. Test trường hợp 1 nguồn die (sửa tạm URL sai) để chắc fallback hoạt động đúng.
12. Theo dõi usage qua `Cloudflare Dashboard → Workers & Pages → D1 → silent-ride-movies → Metrics` để canh giới hạn 100.000 writes/ngày trong tuần đầu vận hành thực tế.

---

## 9. So sánh nhanh với bản Supabase (để bạn cân nhắc lại nếu cần)

| | Supabase (bản trước) | D1 (bản này) |
|---|---|---|
| Storage free | 500 MB | 5 GB |
| Auto-pause khi rảnh | Có (7 ngày) | Không |
| Cần chạy trên Cloudflare Pages? | Không bắt buộc | Có (để dùng binding trực tiếp, nhanh nhất) |
| Cú pháp SQL | Postgres | SQLite |
| Auth/Storage tích hợp sẵn | Có | Không (vẫn giữ Supabase riêng nếu cần Profile/Yêu thích) |
| Giới hạn ghi/ngày | Không giới hạn cứng (chỉ tính egress) | 100.000 rows/ngày |

Vì dự án của bạn ghi ít (chỉ cron 1 lần/ngày), đọc nhiều (user browse/search), D1 phù hợp hơn — đúng use case "read-heavy, write-light" mà D1 được thiết kế cho.

---

## 10. Những gì vẫn giữ nguyên như bản trước (không đổi khi chuyển DB)

- Không dùng TMDB, không fuzzy match, không review queue.
- Không health-check định kỳ — chỉ check lúc user bấm play.
- Không search engine riêng — `LIKE` trên `search_key` là đủ.
- Frontend fallback khi thiếu Supabase (Profile/Yêu thích) vẫn giữ theo README gốc — không liên quan gì tới việc chuyển catalog phim sang D1.
