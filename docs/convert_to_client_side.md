# Hướng dẫn: Chuyển sang Client-Side + Cloudflare Pages Static

## Mục tiêu

Chuyển app từ **Next.js + Cloudflare Workers** (dynamic, tốn 1M req/tháng) sang
**Next.js Static Export + Cloudflare Pages** (static, miễn phí không giới hạn).

**Lý do khả thi**: Toàn bộ data phim đang được fetch client-side từ browser thẳng đến
API ngoài (ophim.live, nguonc.com...). Worker hiện chỉ đang trả HTML shell rỗng — không
cần thiết. Supabase cũng hỗ trợ gọi trực tiếp từ browser.

**Kết quả sau khi xong**:
- `output: 'export'` → build ra thư mục `out/` chứa HTML tĩnh
- Deploy lên Cloudflare Pages → 0 Worker request, không giới hạn
- Xóa OpenNext, wrangler, không còn lỗi symlink trên Windows khi build

---

## Tổng quan thay đổi

| File | Thay đổi |
|---|---|
| `apps/web/next.config.ts` | Đổi `output: 'standalone'` → `output: 'export'` |
| `apps/web/app/tim-kiem/page.tsx` | Xóa Server Component, viết lại bằng `"use client"` + `useSearchParams()` |
| `apps/web/app/profiles/actions.ts` | Xóa `'use server'`, đổi thành browser client functions |
| `apps/web/app/yeu-thich/actions.ts` | Xóa `'use server'`, đổi thành browser client functions |
| `apps/web/app/lich-su/actions.ts` | Xóa `'use server'`, đổi thành browser client functions |
| `apps/web/app/profiles/page.tsx` | Xóa `getProfiles()` server call, truyền `initialProfiles={[]}` |
| `apps/web/public/_redirects` | Tạo mới — SPA fallback cho Cloudflare Pages |
| `apps/web/package.json` | Xóa script `pages:build`, `deploy` |
| `apps/web/open-next.config.ts` | Xóa file |
| `apps/web/wrangler.toml` | Xóa file (không cần nữa) |

---

## Chi tiết từng bước

### Bước 1: Đổi `next.config.ts`

**File**: `apps/web/next.config.ts`

Đổi dòng `output`:
```ts
// Trước
output: 'standalone',

// Sau
output: 'export',
```

> **Lưu ý**: Với `output: 'export'`, `next/image` không dùng được optimization server-side.
> Nhưng project đã có `images: { unoptimized: true }` rồi → không cần thay đổi gì thêm.

---

### Bước 2: Viết lại `/tim-kiem/page.tsx` thành client component

**File**: `apps/web/app/tim-kiem/page.tsx`

File hiện tại là async Server Component đọc `searchParams` — không hỗ trợ trong static export.
Viết lại hoàn toàn bằng `"use client"` + `useSearchParams()`:

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchMovies } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SearchForm from "./SearchForm";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [movies, setMovies] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setMovies([]);
      return;
    }
    setLoading(true);
    searchMovies(q, page)
      .then((data) => {
        const items = data?.data?.items || [];
        const pagination = data?.data?.params?.pagination || {};
        const total = pagination.totalItems || items.length;
        setMovies(items);
        setTotalItems(total);
        setTotalPages(Math.ceil(total / 24) || 1);
        setCurrentPage(pagination.currentPage || page);
      })
      .finally(() => setLoading(false));
  }, [q, page]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Tìm kiếm phim</h1>

      <SearchForm initialQuery={q} />

      {q ? (
        loading ? (
          <p className="text-foreground-muted text-center py-12">Đang tìm kiếm...</p>
        ) : (
          <>
            <p className="text-foreground-secondary mb-6">
              {movies.length > 0
                ? `Tìm thấy ${totalItems} kết quả cho "${q}"`
                : `Không tìm thấy kết quả cho "${q}"`}
            </p>
            {movies.length > 0 && (
              <>
                <MovieGrid movies={movies} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/tim-kiem?q=${encodeURIComponent(q)}`}
                />
              </>
            )}
          </>
        )
      ) : (
        <p className="text-foreground-muted text-center py-12">
          Nhập tên phim để tìm kiếm
        </p>
      )}
    </div>
  );
}
```

> **Lưu ý**: Xóa file `apps/web/app/tim-kiem/page.tsx` cũ và thay bằng file mới này.
> `generateMetadata` không dùng được trong `"use client"` — không sao vì SEO không phải
> ưu tiên của trang search. Nếu muốn giữ title thì dùng `useEffect` set `document.title`.

---

### Bước 3: Tạo Supabase browser client helper

**File mới**: `apps/web/lib/supabase-browser.ts`

Thay vì import `createServerDataSupabaseClient` từ `@repo/database` (chỉ dùng được server-side),
tạo helper dùng browser client:

```ts
import { createClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  if (!_client) {
    _client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  }

  return _client
}
```

> **Quan trọng**: `createClient` từ `@supabase/supabase-js` đã có sẵn trong dependencies.
> `NEXT_PUBLIC_` prefix đảm bảo biến được expose ra browser.

---

### Bước 4: Viết lại `apps/web/app/profiles/actions.ts`

Xóa `'use server'` và `revalidatePath`. Đổi `createServerDataSupabaseClient` thành
`getSupabaseBrowserClient`. **Không đổi tên function** — các nơi import vẫn dùng được.

```ts
// Bỏ: 'use server'
// Bỏ: import { revalidatePath } from 'next/cache'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import {
  buildProfileAvatarUrl,
  normalizeProfileName,
} from '@repo/database'

export async function getProfiles() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('sr_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data
}

export async function createProfile(fullName: string, avatarUrl?: string) {
  const normalizedFullName = normalizeProfileName(fullName)
  if (!normalizedFullName) {
    return { error: 'Vui lòng nhập tên profile' }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { data, error } = await supabase
    .from('sr_profiles')
    .insert({
      full_name: normalizedFullName,
      avatar_url: avatarUrl || buildProfileAvatarUrl(normalizedFullName),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Bỏ: revalidatePath('/profiles')
  return { success: true, data }
}

export async function deleteProfile(id: string) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_profiles')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  // Bỏ: revalidatePath('/profiles')
  return { success: true }
}
```

---

### Bước 5: Viết lại `apps/web/app/yeu-thich/actions.ts`

Tương tự, xóa `'use server'` và `revalidatePath`:

```ts
// Bỏ: 'use server'
// Bỏ: import { revalidatePath } from 'next/cache'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { favoriteSchema, type FavoriteInput } from './schema'

export async function toggleFavorite(profileId: string, movieData: FavoriteInput) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  const validated = favoriteSchema.safeParse(movieData)
  if (!validated.success) {
    return { error: 'Dữ liệu phim không hợp lệ' }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { data: profile } = await supabase
    .from('sr_profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle()

  if (!profile) {
    return { error: 'Profile không tồn tại hoặc đã bị xóa. Vui lòng chọn lại Profile.' }
  }

  const { data: existing } = await supabase
    .from('sr_favorites')
    .select('id')
    .eq('profile_id', profileId)
    .eq('movie_slug', movieData.movie_slug)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('sr_favorites')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('sr_favorites')
      .insert({
        profile_id: profileId,
        movie_slug: movieData.movie_slug,
        movie_title: movieData.movie_title,
        poster_url: movieData.poster_url
      })

    if (error) return { error: error.message }
  }

  // Bỏ: revalidatePath('/yeu-thich')
  return { success: true }
}

export async function clearAllFavorites(profileId: string) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_favorites')
    .delete()
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  // Bỏ: revalidatePath('/yeu-thich')
  return { success: true }
}

export async function getFavorites(profileId: string) {
  if (!profileId) return []

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_favorites')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return data || []
}

export async function getFavoriteSlugs(profileId: string) {
  if (!profileId) return []

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_favorites')
    .select('movie_slug')
    .eq('profile_id', profileId)

  return data?.map((f: any) => f.movie_slug) || []
}
```

---

### Bước 6: Viết lại `apps/web/app/lich-su/actions.ts`

```ts
// Bỏ: 'use server'
// Bỏ: import { revalidatePath } from 'next/cache'

import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { watchHistorySchema, type WatchHistoryInput } from './schema'

export async function updateWatchHistory(profileId: string, historyData: WatchHistoryInput) {
  if (!profileId) return

  const validated = watchHistorySchema.safeParse(historyData)
  if (!validated.success) {
    console.error('Invalid history data:', validated.error.format())
    return
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return

  const { error } = await supabase
    .from('sr_watch_history')
    .upsert({
      profile_id: profileId,
      movie_slug: historyData.movie_slug,
      movie_title: historyData.movie_title,
      poster_url: historyData.poster_url,
      episode_slug: historyData.episode_slug,
      episode_name: historyData.episode_name,
      duration: historyData.duration,
      playback_time: historyData.playback_time,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'profile_id,movie_slug'
    })

  if (error) console.error('Failed to update watch history:', error)

  // Bỏ: revalidatePath('/lich-su')
}

export async function getWatchHistory(profileId: string) {
  if (!profileId) return []

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_watch_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })

  return data || []
}

export async function clearHistory(profileId: string) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_watch_history')
    .delete()
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  // Bỏ: revalidatePath('/lich-su')
  return { success: true }
}
```

---

### Bước 7: Sửa `apps/web/app/profiles/page.tsx`

File hiện tại gọi server function `getProfiles()` để lấy initial data. Với static export,
bỏ phần này — client component sẽ tự fetch khi mount:

```tsx
// File: apps/web/app/profiles/page.tsx
import ProfilesClient from './client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chọn Profile | Silent Ride',
  description: 'Chọn profile để bắt đầu xem phim.',
}

export default function ProfilesPage() {
  return <ProfilesClient initialProfiles={[]} />
}
```

> **Lưu ý**: `ProfilesClient` đã có `useEffect` fetch profiles khi mount — sẽ hoạt động
> đúng. Chỉ cần bỏ server call ở page.tsx.

---

### Bước 8: Tạo `apps/web/public/_redirects`

File này cần thiết để Cloudflare Pages phục vụ SPA — mọi route đều trả về `index.html`
thay vì 404 khi user refresh trang hoặc truy cập trực tiếp URL:

```
/*  /index.html  200
```

---

### Bước 9: Cập nhật `package.json`

**File**: `apps/web/package.json`

Xóa scripts `pages:build` và `deploy` (không cần OpenNext nữa). Thêm script build thông thường:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

Xóa khỏi `devDependencies`:
```json
"@opennextjs/cloudflare": "^1.19.1"
```

---

### Bước 10: Xóa các file không cần thiết

```bash
# Xóa các file liên quan đến OpenNext/Workers
rm apps/web/open-next.config.ts
rm apps/web/wrangler.toml
```

---

### Bước 11: Cập nhật root `package.json`

**File**: `package.json` (root monorepo)

Xóa script `build:cloudflare` (đã có trong root package.json để chạy pre-push hook):

```json
// Xóa dòng này nếu còn tồn tại:
"build:cloudflare": "pnpm build && pnpm --filter silent-ride run pages:build"
```

---

## Kiểm tra sau khi implement

### Build test
```bash
pnpm --filter silent-ride build
```

Kết quả mong đợi:
- Tất cả routes hiển thị `○ (Static)` hoặc `●` 
- Không còn `ƒ (Dynamic)`
- Thư mục `apps/web/out/` được tạo ra

### Kiểm tra cụ thể

1. **`/tim-kiem`**: Mở trang, gõ từ khóa → kết quả hiển thị đúng
2. **`/profiles`**: Tạo/xóa profile → lưu vào Supabase (kiểm tra Network tab, thấy request đến supabase.co)
3. **`/yeu-thich`**: Thêm/xóa yêu thích → đồng bộ Supabase
4. **SPA routing**: Truy cập `/phim/ten-phim` trực tiếp trên trình duyệt → không 404

---

## Deploy lên Cloudflare Pages

1. Push code lên GitHub
2. Vào Cloudflare Pages Dashboard → Create project → Connect GitHub repo
3. Cấu hình build:
   - **Build command**: `pnpm --filter silent-ride build`
   - **Build output directory**: `apps/web/out`
   - **Root directory**: `/` (monorepo root)
4. Thêm Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

---

## Lưu ý quan trọng

> **`cookies()` và `headers()`**: Sau khi bỏ `'use server'`, đảm bảo không còn import
> `cookies` hoặc `headers` từ `next/headers` trong bất kỳ file nào của `apps/web`.
> Chạy lệnh sau để kiểm tra:
> ```bash
> grep -r "next/headers" apps/web/app --include="*.ts" --include="*.tsx"
> ```
> Kết quả phải rỗng.

> **`@repo/database`**: File `packages/database/index.ts` import `cookies` từ
> `next/headers` — **không được import file này trong client components**.
> Sau khi bỏ `'use server'`, các actions files sẽ không import từ `@repo/database` nữa
> (chỉ import `buildProfileAvatarUrl`, `normalizeProfileName` là safe vì đây là pure functions
> không dùng `next/headers`).

> **Dynamic routes** (`/phim/[slug]`, `/danh-sach/[type]`, v.v.): Với `output: 'export'`,
> Next.js yêu cầu `generateStaticParams()` hoặc thiết lập `dynamicParams = false`.
> Tuy nhiên vì dùng `"use client"` và fetch data từ browser, có thể thêm dòng này vào
> đầu mỗi page file có dynamic segment:
> ```ts
> export const dynamicParams = true  // cho phép paths không được pre-generate
> ```
> Cloudflare Pages với file `_redirects` sẽ serve `index.html` cho mọi path,
> React Router sẽ xử lý routing phía client.
