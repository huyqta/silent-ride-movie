# D1 Multi-Source Implementation Status

## ✅ Phase 1: Infrastructure & Data Layer (DONE)

### Types & Normalization
- ✅ `types/normalized.ts` - Normalized data structures
- ✅ `types/cloudflare.d.ts` - D1 TypeScript definitions
- ✅ `lib/api/normalize.ts` - Map 3 API sources to NormalizedMovie
- ✅ `lib/movies/merge.ts` - Title normalization for matching

### Database
- ✅ `migrations/0001_multi_source_movies.sql` - D1 schema
- ✅ `wrangler.toml` - D1 binding configuration

### Sync Logic
- ✅ `lib/movies/sync.ts` - Upsert logic to D1
- ✅ `app/api/admin/sync/route.ts` - Admin API endpoint
- ✅ `.env.example` - ADMIN_SYNC_TOKEN config

### Read APIs
- ✅ `app/api/movies/route.ts` - List/search movies from D1
- ✅ `app/api/movies/[slug]/route.ts` - Movie detail with all sources

### Documentation
- ✅ `docs/D1_SETUP.md` - Setup & sync guide
- ✅ `docs/silent-ride-multi-source-upgrade-d1.md` - Updated plan

---

## 🚧 Phase 2: Frontend Integration (TODO)

### Pages to Refactor
- ⏳ `app/page.tsx` - Home page (read from D1 instead of direct API calls)
- ⏳ `app/danh-sach/[type]/page.tsx` - List page
- ⏳ `app/tim-kiem/page.tsx` - Search page
- ⏳ `app/phim/[slug]/page.tsx` - Movie detail page
- ⏳ `app/xem-phim/[slug]/[episode]/page.tsx` - Watch page with multi-source fallback

### Components to Update
- ⏳ `components/movie/MovieCard.tsx` - Handle D1Movie type
- ⏳ `app/xem-phim/[slug]/[episode]/VideoPlayer.tsx` - Use normalized episodes from D1
- ⏳ `app/xem-phim/[slug]/[episode]/EpisodeSelector.tsx` - Work with NormalizedServer[]
- ⏳ `app/phim/[slug]/EpisodeList.tsx` - Same as above

### New Features
- ⏳ `lib/movies/source-health.ts` - Health check & source selection logic
- ⏳ Multi-source UI indicator (badge showing available sources)
- ⏳ Source quality ranking (prefer working sources over dead links)

---

## 🎯 Phase 3: Testing & Optimization (TODO)

### Testing
- ⏳ Test sync với 3 nguồn (local D1)
- ⏳ Test migration trên remote D1
- ⏳ Test API routes `/api/movies` & `/api/movies/[slug]`
- ⏳ Test multi-source fallback trong VideoPlayer
- ⏳ Load testing (D1 read performance với 10k+ movies)

### Optimization
- ⏳ Add caching layer (Next.js ISR or Cloudflare KV)
- ⏳ Optimize D1 queries (indexes)
- ⏳ Lazy load episode servers (chỉ load khi user click server tab)
- ⏳ Prefetch first episode data for instant playback

### Monitoring
- ⏳ Setup D1 metrics dashboard
- ⏳ Track sync errors/success rate
- ⏳ Monitor source availability rate
- ⏳ Alert on write limit approaching (>80k writes/day)

---

## 📝 Next Immediate Steps

1. **Tạo D1 database:**
   ```bash
   cd apps/web
   npx wrangler d1 create silent-ride-movies
   # Copy database_id vào wrangler.toml
   ```

2. **Run migration:**
   ```bash
   npx wrangler d1 migrations apply silent-ride-movies --local
   npx wrangler d1 migrations apply silent-ride-movies --remote
   ```

3. **Test sync locally:**
   ```bash
   # Set ADMIN_SYNC_TOKEN trong .env.local
   pnpm dev
   # Gọi: http://localhost:3000/api/admin/sync?source=ophim&token=YOUR_TOKEN&limit=10
   ```

4. **Verify data:**
   ```bash
   npx wrangler d1 execute silent-ride-movies --local --command "SELECT COUNT(*) FROM movies"
   ```

5. **Refactor home page:** Sửa `app/page.tsx` đọc từ `/api/movies` thay vì `getNewlyUpdatedMovies()`

---

## ⚠️ Known Issues & TODOs

- [ ] Handle dev environment khi không có D1 binding (fallback to direct API)
- [ ] Add retry logic cho sync khi API nguồn timeout
- [ ] Handle edge case: phim cùng title+year nhưng khác nhau (ví dụ remake)
- [ ] Add admin UI để trigger sync thay vì dùng curl
- [ ] Implement incremental sync (chỉ sync phim đã update, không re-sync toàn bộ)
- [ ] Add source priority config (cho phép user chọn nguồn ưu tiên)

---

## 💡 Future Enhancements

- [ ] Cloudflare KV cache layer cho hot movies
- [ ] R2 for storing thumbnails/posters locally
- [ ] Analytics: track which sources are most reliable
- [ ] Auto-disable dead sources after X consecutive failures
- [ ] Webhooks to notify when sync completes
- [ ] GraphQL API layer on top of D1 for flexible querying
