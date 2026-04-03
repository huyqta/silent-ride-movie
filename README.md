# Silent Ride Movie

Ứng dụng xem phim trực tuyến miễn phí, xây dựng bằng Next.js 16 + Supabase. Hỗ trợ đa nguồn phim (OPhim, NguonC, KKPhim), quản lý hồ sơ người dùng (không cần đăng nhập), danh sách yêu thích, lịch sử xem phim và tìm kiếm nâng cao.

## Tính năng

- Xem phim từ 3 nguồn: **OPhim**, **NguonC**, **KKPhim** — có thể chuyển đổi nguồn tùy ý
- Video player hỗ trợ HLS với tự động chọn luồng dự phòng khi link lỗi
- Quản lý nhiều hồ sơ (profiles) trong gia đình — không yêu cầu đăng nhập
- Yêu thích phim & lịch sử xem có ghi nhớ tiến độ
- Tìm kiếm thường và tìm kiếm nâng cao (thể loại, quốc gia, năm...)
- Giao diện responsive, hỗ trợ mobile
- Theme màu động theo nguồn phim đang chọn

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **State**: Zustand
- **Form**: React Hook Form + Zod
- **Package manager**: pnpm (monorepo với Turborepo)

## Cấu trúc dự án

```
.
├── apps/
│   └── web/          # Next.js app
│       ├── app/      # App Router pages
│       ├── components/
│       ├── lib/api/  # OPhim, NguonC, KKPhim API wrappers
│       └── utils/
├── packages/
│   ├── database/     # Supabase client + migrations
│   └── ui/           # Shared UI components
└── turbo.json
```

---

## Tự cài đặt (Self-host / Fork)

### Yêu cầu

- Node.js >= 18
- pnpm >= 9
- Tài khoản [Supabase](https://supabase.com) (free tier là đủ)
- Tài khoản [Vercel](https://vercel.com) (để deploy)

---

### 1. Clone & cài dependencies

```bash
git clone https://github.com/your-username/silent-ride-movie.git
cd silent-ride-movie
pnpm install
```

---

### 2. Tạo project Supabase

1. Truy cập [supabase.com](https://supabase.com) → **New project**
2. Điền tên project, mật khẩu database, chọn region gần nhất
3. Sau khi tạo xong, vào **Project Settings → API** để lấy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. Tạo bảng dữ liệu Supabase

Vào **SQL Editor** trong dashboard Supabase, chạy đoạn SQL sau:

```sql
-- 1. Profiles (hồ sơ người dùng)
create table if not exists public.sr_profiles (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  full_name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Favorites (yêu thích)
create table if not exists public.sr_favorites (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.sr_profiles(id) on delete cascade not null,
  movie_slug text not null,
  movie_title text,
  poster_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, movie_slug)
);

-- 3. Watch History (lịch sử xem, có lưu tiến độ)
create table if not exists public.sr_watch_history (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.sr_profiles(id) on delete cascade not null,
  movie_slug text not null,
  movie_title text,
  episode_slug text,
  episode_name text,
  duration numeric,       -- tổng thời lượng (giây)
  playback_time numeric,  -- vị trí đang xem (giây)
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(profile_id, movie_slug)
);

-- Tắt RLS (dùng cá nhân/gia đình, không cần auth)
alter table public.sr_profiles disable row level security;
alter table public.sr_favorites disable row level security;
alter table public.sr_watch_history disable row level security;
```

> File migration đầy đủ: [`packages/database/migrations/20260317_movie_management.sql`](packages/database/migrations/20260317_movie_management.sql)

---

### 4. Cấu hình biến môi trường

Tạo file `apps/web/.env.local` từ file mẫu:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Sau đó điền giá trị thực:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

| Biến | Mô tả | Lấy từ đâu |
|------|--------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key public | Supabase → Project Settings → API → `anon public` |

---

### 5. Chạy local

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## Deploy lên Vercel

### Cách 1: Deploy nhanh từ GitHub

1. Push code lên GitHub repository của bạn
2. Vào [vercel.com/new](https://vercel.com/new) → Import repository
3. Vercel sẽ tự detect Next.js, cấu hình build tự động
4. **Quan trọng**: Đặt **Root Directory** là `apps/web`
5. Thêm biến môi trường trong Vercel dashboard (xem bước tiếp theo)
6. Nhấn **Deploy**

### Cách 2: Dùng Vercel CLI

```bash
npm i -g vercel
vercel
# Làm theo hướng dẫn, chọn root directory là apps/web
```

### Thêm biến môi trường trên Vercel

Vào **Project → Settings → Environment Variables**, thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL từ Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key từ Supabase |

> Sau khi thêm biến môi trường, cần **Redeploy** để áp dụng.

---

## Phát triển

```bash
# Chạy toàn bộ monorepo
pnpm dev

# Chỉ chạy web app
pnpm --filter silent-ride dev

# Build
pnpm build

# Lint
pnpm lint
```

---

## Nguồn dữ liệu phim

Dự án sử dụng API công khai từ các nguồn sau (không cần API key):

- **OPhim** — `ophim.com`
- **NguonC** — `nguonc.com`
- **KKPhim** — `kkphim.com`

Người dùng có thể chuyển đổi nguồn trực tiếp trên giao diện.
