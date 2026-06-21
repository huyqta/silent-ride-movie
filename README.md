# Silent Ride Movie

Ứng dụng xem phim trực tuyến miễn phí, xây dựng bằng Next.js 16 + Supabase (Optional). Hỗ trợ đa nguồn phim (OPhim, NguonC, KKPhim), quản lý hồ sơ người dùng (không cần đăng nhập), danh sách yêu thích, lịch sử xem phim và tìm kiếm nâng cao.

## Tính năng

- Xem phim từ 3 nguồn: **OPhim**, **NguonC**, **KKPhim** — có thể chuyển đổi nguồn tùy ý
- Video player hỗ trợ HLS với tự động chọn luồng dự phòng khi link lỗi
- **(Tuỳ chọn)** Quản lý nhiều hồ sơ (profiles) trong gia đình — không yêu cầu đăng nhập
- **(Tuỳ chọn)** Yêu thích phim & lịch sử xem có ghi nhớ tiến độ
- Tìm kiếm thường và tìm kiếm nâng cao (thể loại, quốc gia, năm...)
- Giao diện responsive, hỗ trợ mobile
- Theme màu động theo nguồn phim đang chọn

> **Lưu ý**: Nếu bạn không cấu hình Supabase, các tính năng liên quan đến Hồ sơ, Xem tiếp và Yêu thích sẽ tự động được ẩn khỏi giao diện. Ứng dụng vẫn hoạt động 100% chức năng xem phim bình thường.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **State**: Zustand
- **Form**: React Hook Form + Zod
- **Package manager**: pnpm (monorepo với Turborepo)
- **Edge Deployment**: OpenNext (hỗ trợ Cloudflare Pages)

## Cấu trúc dự án

```text
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
- (Tuỳ chọn) Tài khoản [Supabase](https://supabase.com) (free tier là đủ, dùng cho tính năng tài khoản/cá nhân hoá)
- Tài khoản [Vercel](https://vercel.com) hoặc [Cloudflare](https://dash.cloudflare.com) để deploy

---

### 1. Clone & cài dependencies

```bash
git clone https://github.com/your-username/silent-ride-movie.git
cd silent-ride-movie
pnpm install
```

---

### 2. Cấu hình Supabase (Tuỳ chọn)

Nếu bạn muốn bật tính năng cá nhân hóa (Profile, Yêu thích, Lịch sử), bạn cần cài đặt Supabase. Nếu không, **hãy bỏ qua bước này.**

1. Truy cập [supabase.com](https://supabase.com) → **New project**
2. Tạo project và vào **Project Settings → API** để lấy `Project URL` và `anon public` key.
3. Tạo file `apps/web/.env.local` từ file mẫu:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
4. Điền giá trị:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Chạy SQL Migration trong giao diện Supabase. Xem file query đầy đủ tại: 
   [`packages/database/migrations/20260317_movie_management.sql`](packages/database/migrations/20260317_movie_management.sql)

---

### 3. Chạy local

```bash
pnpm dev
# hoặc
pnpm --filter web dev
```

Mở [http://localhost:3000](http://localhost:3000)

---

## Deploy lên Vercel

Hướng dẫn chi tiết cách deploy hoàn toàn bằng dòng lệnh (CLI):

### 1. Chuẩn bị tài khoản
Tạo tài khoản tại [Vercel](https://vercel.com). Sau đó cài Vercel CLI nếu chưa có:
```bash
npm i -g vercel
```

### 2. Khởi tạo dự án
Chạy lệnh gốc kết nối:
```bash
vercel --prod
```
> **Bắt buộc tuân thủ** các câu trả lời sau để web nhận dạng đúng cấu trúc Monorepo:
> - `? Set up and deploy...` ➔ Ấn **Y**
> - `? Which scope...` ➔ Ấn **Enter**
> - `? Link to existing project?` ➔ Nhập **n**
> - `? What’s your project’s name?` ➔ Đặt tên web của bạn (vd: `silent-ride`) và **Enter**
> - `? In which directory is your code located? ./` ➔ 🚨 **HÃY XÓA CHỮ `./` BẰNG PHÍM BACKSPACE, SAU ĐÓ GÕ VÀO `apps/web`** rồi ấn **Enter**.

### 3. Cấu hình Database & Cập nhật lại (Nếu có sử dụng Supabase)
Nếu bạn muốn lưu thông tin Yêu thích / Lịch sử xem phim:
1. Đăng ký tài khoản [Supabase](https://supabase.com), tạo dự án và lấy **Project URL** cùng **Anon Key**.
2. Chạy đoạn Script SQL trong file [`packages/database/migrations/20260317_movie_management.sql`](packages/database/migrations/20260317_movie_management.sql) trên màn hình SQL của Supabase Dashboard.
3. Thiết lập trực tiếp biến môi trường cho Vercel thông qua Terminal:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # Khi hệ thống hỏi Value, copy dán đường link URL của bạn vào
   
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # Khi hệ thống hỏi Value, copy dán chuỗi Anon Key vào
   ```
4. Cập nhật lại sản phẩm cuối cùng sau khi đã nạp biến môi trường:
   ```bash
   vercel --prod
   ```

---

## Deploy lên Cloudflare Pages

Dự án này sử dụng `open-next` để tương thích hoàn toàn cấu trúc Next.js App Router với Cloudflare Pages.

### Cách 1: Deploy qua Github (Cloudflare CI/CD)
1. Push code lên Github.
2. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com) -> Workers & Pages -> Create application -> Pages -> Connect to Git.
3. Chọn repo `silent-ride-movie`.
4. Cấu hình Build settings:
   - Framework preset: **Next.js**
   - Build command: `pnpm run build`
   - Build output directory: `apps/web/.open-next/assets`
   - Root directory (tuỳ chọn): `apps/web`
5. Thêm Environment Variables (nếu dùng Supabase):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - *Lưu ý: Có thể bạn cần thêm nodejs compat flag tuỳ vào version của open-next*
6. Nhấn **Save and Deploy**.

### Cách 2: Deploy bằng Wrangler CLI (Local)
1. Cài đặt các gói:
   ```bash
   npm i -g wrangler
   ```
2. Build ứng dụng:
   ```bash
   pnpm --filter web build
   ```
3. Deploy frontend:
   ```bash
   cd apps/web
   npx wrangler pages deploy .open-next/assets --project-name="silent-ride"
   ```

---

## Phát triển

```bash
# Chạy toàn bộ monorepo
pnpm dev

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
