# Hướng dẫn Setup D1 Multi-Source Movies

Tài liệu này hướng dẫn triển khai tính năng gộp 3 nguồn phim (OPhim, NguonC, KKPhim) vào Cloudflare D1.

---

## 1. Tạo D1 Database

```bash
cd apps/web
npx wrangler d1 create silent-ride-movies
```

Output sẽ có dạng:
```
✅ Successfully created DB 'silent-ride-movies'!
📊 Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Copy `database_id` và thay vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "silent-ride-movies"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # <- paste ở đây
```

---

## 2. Chạy Migration

**Lưu ý quan trọng:** Bạn phải chạy lệnh `wrangler` từ thư mục `apps/web/` vì `wrangler.toml` nằm ở đó.

### Local (test trước)

```bash
cd apps/web
npx wrangler d1 migrations apply silent-ride-movies --local
```

### Production (sau khi test xong)

```bash
cd apps/web
npx wrangler d1 migrations apply silent-ride-movies --remote
```

Kiểm tra schema đã apply:

```bash
# Local
npx wrangler d1 execute silent-ride-movies --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# Remote
npx wrangler d1 execute silent-ride-movies --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

Expected output: `movies`, `movie_sources`, `movie_episode_servers`

---

## 3. Cấu hình Environment

Thêm vào file `.env.local` (hoặc `.env` nếu dùng local):

```env
ADMIN_SYNC_TOKEN=your-super-secret-token-here-change-this
```

⚠️ **Bảo mật:** Token này để bảo vệ admin sync endpoint. Đừng commit vào Git!

---

## 4. Sync Data Thủ Công

### Sync 1 nguồn

```bash
# OPhim - sync toàn bộ
curl -X POST "http://localhost:3000/api/admin/sync?source=ophim&token=YOUR_TOKEN"

# NguonC - sync 500 phim đầu tiên
curl -X POST "http://localhost:3000/api/admin/sync?source=nguonc&token=YOUR_TOKEN&limit=500"

# KKPhim - sync page 2 (mỗi page ~24 phim)
curl -X POST "http://localhost:3000/api/admin/sync?source=kkphim&token=YOUR_TOKEN&page=2"
```

### Sync tất cả 3 nguồn

```bash
curl -X POST "http://localhost:3000/api/admin/sync?source=all&token=YOUR_TOKEN"
```

⚠️ **Lưu ý về write limit:**
- D1 free tier: 100,000 writes/ngày
- Mỗi phim mới: ~3-5 writes (1 INSERT movies + 1 INSERT movie_sources + 1-3 INSERT episode_servers)
- Sync lần đầu có thể tốn 20k-50k writes tuỳ số lượng phim
- Khuyến nghị: sync từng nguồn, từng batch nhỏ (limit=500) qua nhiều ngày

### Response format

```json
{
  "success": true,
  "source": "ophim",
  "results": {
    "ophim": 1240,
    "errors": []
  },
  "timing": {
    "duration_ms": 45230,
    "limit": 0,
    "page": 1
  }
}
```

---

## 5. Kiểm Tra Dữ Liệu

### Query D1 trực tiếp

```bash
# Đếm số phim đã sync
npx wrangler d1 execute silent-ride-movies --remote --command "SELECT COUNT(*) FROM movies"

# Xem 10 phim mới nhất
npx wrangler d1 execute silent-ride-movies --remote --command "SELECT title, year, updated_at FROM movies ORDER BY updated_at DESC LIMIT 10"

# Đếm số nguồn theo từng loại
npx wrangler d1 execute silent-ride-movies --remote --command "SELECT source_name, COUNT(*) FROM movie_sources GROUP BY source_name"

# Kiểm tra phim có đủ 3 nguồn
npx wrangler d1 execute silent-ride-movies --remote --command "
  SELECT m.title, COUNT(DISTINCT ms.source_name) as source_count
  FROM movies m
  LEFT JOIN movie_sources ms ON m.id = ms.movie_id
  GROUP BY m.id
  HAVING source_count = 3
  LIMIT 10
"
```

---

## 6. Deploy lên Cloudflare Pages

### Build OpenNext

```bash
pnpm pages:build
```

### Deploy

```bash
pnpm deploy
# hoặc
npx wrangler pages deploy .open-next --project-name silent-ride
```

### Thêm secrets cho production

```bash
npx wrangler secret put ADMIN_SYNC_TOKEN --env production
# Nhập token khi được hỏi
```

Sau khi deploy, sync endpoint sẽ có URL:
```
https://silent-ride.pages.dev/api/admin/sync?source=ophim&token=YOUR_TOKEN
```

---

## 7. Chiến Lược Sync Định Kỳ

Vì bạn muốn sync thủ công để kiểm soát chi phí, đây là chiến lược khuyến nghị:

### Lần đầu: Sync toàn bộ (phân làm nhiều lần)

```bash
# Day 1: OPhim
curl -X POST "https://silent-ride.pages.dev/api/admin/sync?source=ophim&token=YOUR_TOKEN&limit=1000"

# Day 2: NguonC
curl -X POST "https://silent-ride.pages.dev/api/admin/sync?source=nguonc&token=YOUR_TOKEN&limit=1000"

# Day 3: KKPhim
curl -X POST "https://silent-ride.pages.dev/api/admin/sync?source=kkphim&token=YOUR_TOKEN&limit=1000"
```

### Hàng tuần: Sync phim mới (page 1 mỗi nguồn)

```bash
#!/bin/bash
# weekly-sync.sh

TOKEN="your-token-here"
BASE_URL="https://silent-ride.pages.dev"

echo "Syncing OPhim..."
curl -X POST "$BASE_URL/api/admin/sync?source=ophim&token=$TOKEN&page=1"

echo "Syncing NguonC..."
curl -X POST "$BASE_URL/api/admin/sync?source=nguonc&token=$TOKEN&page=1"

echo "Syncing KKPhim..."
curl -X POST "$BASE_URL/api/admin/sync?source=kkphim&token=$TOKEN&page=1"

echo "Done!"
```

Chạy script này 1 lần/tuần bằng cron job trên máy local hoặc GitHub Actions.

---

## 8. Monitoring & Troubleshooting

### Xem D1 Metrics

1. Mở Cloudflare Dashboard
2. Navigate: Workers & Pages → D1 → silent-ride-movies → Metrics
3. Theo dõi: Rows written, Rows read, Storage used

### Lỗi thường gặp

**"D1 binding not found"**
- Kiểm tra `wrangler.toml` đã có `[[d1_databases]]` binding
- Redeploy sau khi sửa config

**"Unauthorized"**
- Token sai hoặc chưa set `ADMIN_SYNC_TOKEN` trong env
- Check: `npx wrangler secret list`

**"Rate limit exceeded"**
- Đã vượt 100k writes/ngày
- Đợi sang ngày mới hoặc giảm `limit` trong request

**Sync chậm/timeout**
- APIs nguồn chậm hoặc down
- Thử lại sau hoặc sync từng nguồn riêng lẻ

---

## 9. Next Steps

Sau khi sync xong, bước tiếp theo là:

1. **Tạo API routes đọc data từ D1** (`/api/movies`, `/api/movies/[slug]`)
2. **Sửa các trang hiện tại** (home, danh sách, tìm kiếm) đọc từ D1 thay vì gọi trực tiếp 3 API nguồn
3. **Tích hợp source health check** vào VideoPlayer để fallback giữa nguồn khi link die
4. **Cache D1 queries** với Next.js ISR hoặc KV để giảm D1 reads

Chi tiết sẽ có trong các docs tiếp theo.
