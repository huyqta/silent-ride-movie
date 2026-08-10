# Testing D1 Multi-Source Sync

## Prerequisites

1. ✅ D1 database đã được tạo
2. ✅ Migration đã apply (local + remote)
3. ✅ `.env.local` có `ADMIN_SYNC_TOKEN`
4. ✅ Build OpenNext thành công (`pnpm pages:build`)

---

## Option 1: Test với Local D1 (Khuyến nghị)

### Bước 1: Start dev server với D1 binding

```bash
cd apps/web
bash dev-with-d1.sh
```

Server sẽ chạy tại: http://localhost:8788

### Bước 2: Test sync trong terminal khác

```bash
cd apps/web

# Sync 5 phim từ OPhim
bash test-sync.sh http://localhost:8788 ophim 5

# Sync 5 phim từ NguonC
bash test-sync.sh http://localhost:8788 nguonc 5

# Sync 5 phim từ KKPhim
bash test-sync.sh http://localhost:8788 kkphim 5
```

### Bước 3: Verify data trong D1 local

```bash
npx wrangler d1 execute silent-ride-movies --local \
  --command "SELECT COUNT(*) as total FROM movies"

npx wrangler d1 execute silent-ride-movies --local \
  --command "SELECT title, year FROM movies LIMIT 5"

npx wrangler d1 execute silent-ride-movies --local \
  --command "SELECT source_name, COUNT(*) FROM movie_sources GROUP BY source_name"
```

Expected: 15 movies total (5 từ mỗi nguồn, có thể ít hơn nếu trùng title+year)

---

## Option 2: Test với Remote D1 (Production)

### Bước 1: Deploy lên Cloudflare Pages

```bash
cd apps/web
pnpm deploy
```

Hoặc nếu đã có project:

```bash
npx wrangler pages deploy .open-next --project-name silent-ride
```

### Bước 2: Set ADMIN_SYNC_TOKEN secret

```bash
npx wrangler secret put ADMIN_SYNC_TOKEN
# Paste token khi được hỏi (copy từ .env.local)
```

### Bước 3: Sync qua production URL

```bash
TOKEN=$(grep ADMIN_SYNC_TOKEN .env.local | cut -d '=' -f2)
PROD_URL="https://silent-ride.pages.dev"  # Thay bằng URL thực tế của bạn

# Sync 10 phim từ OPhim
curl -X POST "$PROD_URL/api/admin/sync?source=ophim&token=$TOKEN&limit=10" | jq .

# Verify
npx wrangler d1 execute silent-ride-movies --remote \
  --command "SELECT COUNT(*) FROM movies"
```

---

## Option 3: Test Manual (Không dùng scripts)

### Start wrangler pages dev thủ công

```bash
cd apps/web
pnpm pages:build

npx wrangler pages dev .open-next \
  --compatibility-date=2024-12-01 \
  --compatibility-flag=nodejs_compat \
  --d1=DB=silent-ride-movies \
  --port=8788
```

### Gọi API bằng curl

```bash
TOKEN="your-super-secret-token-here-change-this"

curl -X POST \
  "http://localhost:8788/api/admin/sync?source=ophim&token=$TOKEN&limit=5" \
  -H "Content-Type: application/json" | jq .
```

Expected response:
```json
{
  "success": true,
  "source": "ophim",
  "results": {
    "ophim": 5,
    "errors": []
  },
  "timing": {
    "duration_ms": 3240,
    "limit": 5,
    "page": 1
  }
}
```

---

## Troubleshooting

### "ADMIN_SYNC_TOKEN not configured"

- Check `apps/web/.env.local` (không phải root `.env.local`)
- Restart wrangler dev sau khi tạo `.env.local`
- Với production: `npx wrangler secret list` để verify

### "D1 binding not available"

- Không thể test với `pnpm dev` thông thường
- Phải dùng `npx wrangler pages dev` với flag `--d1=DB=...`
- Script `dev-with-d1.sh` đã handle điều này

### "Unauthorized" (token đúng mà vẫn lỗi)

- Verify token: `cat apps/web/.env.local`
- Copy chính xác token (không có dấu cách thừa)
- Production: dùng `npx wrangler secret put` chứ không phải env file

### Build lỗi TypeScript

- `pnpm pages:build` phải pass trước khi test
- Check `get_diagnostics` nếu có lỗi
- Clear cache: `rm -rf .next .open-next` rồi build lại

### Sync chậm hoặc timeout

- Giảm `limit` xuống (5-10 phim/lần)
- APIs nguồn có thể chậm hoặc rate limit
- Thử lại sau vài phút

---

## Next: Test Read APIs

Sau khi sync thành công, test đọc data:

```bash
# List movies
curl "http://localhost:8788/api/movies?limit=10" | jq .

# Search movies
curl "http://localhost:8788/api/movies?q=avengers" | jq .

# Movie detail (thay [slug] bằng slug thực)
curl "http://localhost:8788/api/movies/ky-sinh-trung" | jq .
```
