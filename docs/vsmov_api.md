# VSMOV API Documentation

> Nguồn: [VSMOV API Documentation](https://vsmov.com/api-document)  
> Ngày trích xuất: 2026-08-10  
> Mục đích: tài liệu tích hợp cho website xem phim cá nhân.

## 1. Tổng quan

VSMOV cung cấp REST API public để truy xuất dữ liệu phim.

| Thuộc tính | Giá trị |
|---|---|
| Base URL | `https://vsmov.com/api` |
| HTTP method | `GET` |
| Định dạng phản hồi | JSON |
| Mã hóa | UTF-8 |
| Xác thực | Không cần token |
| Header nên gửi | `Accept: application/json` |

Dữ liệu được giới thiệu gồm:

- Thông tin chi tiết phim.
- Hình ảnh HD từ TMDB.
- Thông tin diễn viên và đạo diễn.
- Tập phim và server phát, nếu endpoint chi tiết có dữ liệu.
- Tìm kiếm theo từ khóa.
- Lọc theo thể loại và quốc gia.
- Sắp xếp theo nhiều tiêu chí.
- Phân trang.

## 2. Quy ước chung

- Tất cả endpoint public dùng prefix `/api`.
- Slug được truyền trực tiếp trên path, ví dụ `hanh-dong`, `nhat-ban`, `mau-xanh-cuoi-cung`.
- Các tham số query phải được URL-encode.
- Tài liệu nguồn chưa công bố rate limit, CORS, cache policy, version API hoặc SLA.
- Các tab **Tham số** và **Phản hồi** trên trang nguồn hiện ghi `Đang cập nhật...`; tab **Ví dụ** chưa có nội dung. Vì vậy kiểu dữ liệu, giá trị enum và JSON schema chưa được VSMOV cam kết chính thức.

## 3. Bảng endpoint

| Nhóm | Endpoint | Công dụng |
|---|---|---|
| Trang chủ | `GET /danh-sach/phim-moi-cap-nhat?page=1` | Phim mới cập nhật |
| Danh sách | `GET /danh-sach/{slug}` | Phim thuộc một danh sách |
| Tìm kiếm | `GET /tim-kiem?keyword={keyword}` | Tìm phim theo từ khóa |
| Thể loại | `GET /the-loai` | Danh sách thể loại |
| Thể loại | `GET /the-loai/{slug}` | Phim theo thể loại |
| Quốc gia | `GET /quoc-gia` | Danh sách quốc gia |
| Quốc gia | `GET /quoc-gia/{slug}` | Phim theo quốc gia |
| Năm | `GET /nam` | Danh sách năm phát hành |
| Năm | `GET /nam/{year}` | Phim theo năm phát hành |
| Phim | `GET /phim/{slug}` | Chi tiết phim và tập phim nếu có |
| Diễn viên | `GET /dien-vien` | Danh sách diễn viên |

> Các path trong bảng là tương đối so với `https://vsmov.com/api`.

## 4. Chi tiết endpoint

### 4.1. Phim mới cập nhật

```http
GET /danh-sach/phim-moi-cap-nhat?page=1
Accept: application/json
```

Lấy danh sách phim mới cập nhật để hiển thị ở trang chủ.

| Tham số | Vị trí | Bắt buộc | Ý nghĩa |
|---|---|---:|---|
| `page` | query | Không | Trang cần lấy; ví dụ nguồn dùng `1` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=1' \
  --header 'accept: application/json'
```

### 4.2. Phim theo danh sách

```http
GET /danh-sach/{slug}
Accept: application/json
```

Lấy phim theo slug danh sách. Ví dụ được công bố: `subteam`. Có thể kết hợp `page`, `limit` và các bộ lọc phụ; tài liệu chưa liệt kê đầy đủ bộ lọc phụ.

| Tham số | Vị trí | Bắt buộc | Ý nghĩa |
|---|---|---:|---|
| `slug` | path | Có | Slug của danh sách |
| `page` | query | Không | Trang cần lấy |
| `limit` | query | Không | Số bản ghi mỗi trang |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/danh-sach/subteam?page=1&limit=5' \
  --header 'accept: application/json'
```

### 4.3. Tìm kiếm phim

```http
GET /tim-kiem?keyword={keyword}&limit=20&page=1
Accept: application/json
```

| Tham số | Vị trí | Bắt buộc | Ý nghĩa |
|---|---|---:|---|
| `keyword` | query | Có theo mẫu endpoint | Từ khóa tìm kiếm |
| `limit` | query | Không | Số kết quả mỗi trang; ví dụ dùng `20` |
| `page` | query | Không | Trang kết quả; ví dụ dùng `1` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/tim-kiem?keyword=avengers&limit=20&page=1' \
  --header 'accept: application/json'
```

### 4.4. Danh sách thể loại

```http
GET /the-loai
Accept: application/json
```

Trả về danh sách tất cả thể loại phim.

```bash
curl --request GET \
  --url 'https://vsmov.com/api/the-loai' \
  --header 'accept: application/json'
```

### 4.5. Phim theo thể loại

```http
GET /the-loai/{slug}?limit=20&page=1&year=2024&country=han-quoc&type=series&status=completed
Accept: application/json
```

| Tham số | Vị trí | Bắt buộc | Ý nghĩa/giá trị trong ví dụ |
|---|---|---:|---|
| `slug` | path | Có | Slug thể loại, ví dụ `hanh-dong` |
| `limit` | query | Không | Số bản ghi mỗi trang; ví dụ `20` |
| `page` | query | Không | Trang cần lấy; ví dụ `1` |
| `year` | query | Không | Năm phát hành; ví dụ `2024` |
| `country` | query | Không | Slug quốc gia; ví dụ `han-quoc` |
| `type` | query | Không | Loại phim; ví dụ nguồn dùng `series` |
| `status` | query | Không | Trạng thái; ví dụ nguồn dùng `completed` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/the-loai/hanh-dong?limit=20&page=1&year=2024&country=han-quoc&type=series&status=completed' \
  --header 'accept: application/json'
```

### 4.6. Danh sách quốc gia

```http
GET /quoc-gia
Accept: application/json
```

Trả về danh sách tất cả quốc gia phim.

```bash
curl --request GET \
  --url 'https://vsmov.com/api/quoc-gia' \
  --header 'accept: application/json'
```

### 4.7. Phim theo quốc gia

```http
GET /quoc-gia/{slug}?limit=20&page=1&year=2024&type=series&status=completed
Accept: application/json
```

| Tham số | Vị trí | Bắt buộc | Ý nghĩa/giá trị trong ví dụ |
|---|---|---:|---|
| `slug` | path | Có | Slug quốc gia, ví dụ `nhat-ban` |
| `limit` | query | Không | Số bản ghi mỗi trang; ví dụ `20` |
| `page` | query | Không | Trang cần lấy; ví dụ `1` |
| `year` | query | Không | Năm phát hành; ví dụ `2024` |
| `type` | query | Không | Loại phim; ví dụ `series` |
| `status` | query | Không | Trạng thái; ví dụ `completed` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/quoc-gia/nhat-ban?limit=20&page=1&year=2024&type=series&status=completed' \
  --header 'accept: application/json'
```

### 4.8. Danh sách năm phát hành

```http
GET /nam
Accept: application/json
```

Trả về danh sách tất cả năm phát hành phim.

```bash
curl --request GET \
  --url 'https://vsmov.com/api/nam' \
  --header 'accept: application/json'
```

### 4.9. Phim theo năm phát hành

```http
GET /nam/{year}?limit=20&page=1&type=series&status=completed
Accept: application/json
```

| Tham số | Vị trí | Bắt buộc | Ý nghĩa/giá trị trong ví dụ |
|---|---|---:|---|
| `year` | path | Có | Năm phát hành, ví dụ `2024` |
| `limit` | query | Không | Số bản ghi mỗi trang; ví dụ `20` |
| `page` | query | Không | Trang cần lấy; ví dụ `1` |
| `type` | query | Không | Loại phim; ví dụ `series` |
| `status` | query | Không | Trạng thái; ví dụ `completed` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/nam/2024?limit=20&page=1&type=series&status=completed' \
  --header 'accept: application/json'
```

### 4.10. Chi tiết phim

```http
GET /phim/{slug}
Accept: application/json
```

Lấy thông tin chi tiết phim theo slug. Theo phần tổng quan của VSMOV, phản hồi chi tiết có thể chứa `episodes` cùng server phát nếu phim có dữ liệu tập.

| Tham số | Vị trí | Bắt buộc | Ý nghĩa |
|---|---|---:|---|
| `slug` | path | Có | Slug phim, ví dụ `mau-xanh-cuoi-cung` |

```bash
curl --request GET \
  --url 'https://vsmov.com/api/phim/mau-xanh-cuoi-cung' \
  --header 'accept: application/json'
```

### 4.11. Danh sách diễn viên

```http
GET /dien-vien
Accept: application/json
```

Trả về danh sách tất cả diễn viên. Trang nguồn chưa công bố tham số phân trang hoặc lọc cho endpoint này.

```bash
curl --request GET \
  --url 'https://vsmov.com/api/dien-vien' \
  --header 'accept: application/json'
```

## 5. Response schema quan sát từ API thực tế

> Phần này được suy ra bằng cách gọi trực tiếp các endpoint public ngày 2026-08-10. Đây là **schema quan sát được**, không phải hợp đồng chính thức vì trang VSMOV vẫn để phần “Phản hồi” ở trạng thái “Đang cập nhật...”. Client nên validate dữ liệu ở runtime và chịu được field thiếu, `null` hoặc sai kiểu.

### 5.1. Response danh sách phim

Áp dụng cho:

- `/danh-sach/phim-moi-cap-nhat`
- `/danh-sach/{slug}`
- `/tim-kiem`
- `/the-loai/{slug}`
- `/quoc-gia/{slug}`
- `/nam/{year}`

```ts
interface MovieListResponse {
  status: boolean;
  items: MovieListItem[];
  pagination: Pagination;
  pathImage?: string; // Chỉ quan sát thấy ở phim mới cập nhật
}

interface MovieListItem {
  _id: number;
  name: string;
  origin_name: string;
  slug: string;
  poster_url: string | null | Record<string, never>;
  thumb_url: string | null;
  year: number;
  tmdb: {
    type: string;                // Ví dụ: "tv"
    id: string;
    season: number | string | null;
    vote_average: string;        // API đang trả chuỗi, ví dụ "8.3"
    vote_count: number;
  };
  imdb: {
    id: string | null;
  };
  modified: {
    time: string;                // ISO 8601, ví dụ 2026-08-10T11:24:28+07:00
  };
}

interface Pagination {
  totalItems: number;
  totalItemsPerPage: number | string;
  currentPage: number;
  totalPages: number;
}
```

Response thực tế rút gọn:

```json
{
  "status": true,
  "items": [
    {
      "tmdb": {
        "type": "tv",
        "id": "300954",
        "season": null,
        "vote_average": "8.3",
        "vote_count": 3
      },
      "imdb": {
        "id": "tt39393581"
      },
      "modified": {
        "time": "2026-08-10T11:24:28+07:00"
      },
      "_id": 50345,
      "name": "Người chồng",
      "origin_name": "The Husband",
      "slug": "nguoi-chong",
      "poster_url": "https://vsmov.com/storage/images/example.jpg",
      "thumb_url": "https://vsmov.com/storage/images/example.jpg",
      "year": 2026
    }
  ],
  "pagination": {
    "totalItems": 18243,
    "totalItemsPerPage": 24,
    "currentPage": 1,
    "totalPages": 761
  },
  "pathImage": "..."
}
```

Lưu ý thực tế:

- `/danh-sach/phim-moi-cap-nhat?limit=2` vẫn trả 24 item; `limit` có vẻ không được áp dụng ở endpoint này.
- `/danh-sach/subteam?limit=2` vẫn trả toàn bộ 14 item và `totalItemsPerPage` là `20`.
- Endpoint tìm kiếm/lọc trả `totalItemsPerPage` dạng chuỗi khi truyền `limit`, ví dụ `"2"`; endpoint phim mới trả number `24`.
- Đã quan sát thấy `poster_url: {}` ở một phim. Không nên render ảnh trước khi kiểm tra giá trị là chuỗi URL hợp lệ.
- `imdb.id`, `tmdb.season`, ảnh và một số metadata có thể `null`.

### 5.2. Response danh mục

Áp dụng cho `/the-loai`, `/quoc-gia` và `/nam`:

```ts
interface TaxonomyResponse {
  status: 'success' | string;
  message: string;
  data: {
    items: TaxonomyItem[];
  };
}

interface TaxonomyItem {
  _id: number | string;
  name: string;
  slug: string;
}
```

Ví dụ thể loại/quốc gia:

```json
{
  "status": "success",
  "message": "",
  "data": {
    "items": [
      {
        "_id": 17,
        "name": "Bí Ẩn",
        "slug": "bi-an"
      }
    ]
  }
}
```

Ở `/nam`, `_id`, `name` và `slug` đều được quan sát dưới dạng string:

```json
{
  "_id": "2029",
  "name": "2029",
  "slug": "2029"
}
```

### 5.3. Response danh sách diễn viên

```ts
interface ActorListResponse {
  status: 'success' | string;
  message: string;
  data: {
    items: ActorItem[];
  };
}

interface ActorItem {
  _id: number;
  name: string;
  slug: string;
  thumb_url: string | null;
}
```

```json
{
  "status": "success",
  "message": "",
  "data": {
    "items": [
      {
        "_id": 42781,
        "name": "'Jeeva' Ravi",
        "slug": "jeeva-ravi",
        "thumb_url": "https://image.tmdb.org/t/p/w500/example.jpg"
      }
    ]
  }
}
```

Tại thời điểm kiểm tra, endpoint trả một mảng rất lớn (quan sát thấy 184.547 phần tử) và không có pagination trong response. Không nên gọi endpoint này ở mỗi page view; nên tải ở backend, cache dài hạn và tạo chỉ mục tìm kiếm riêng.

### 5.4. Response chi tiết phim

```ts
interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: MovieDetail;
  episodes: EpisodeServer[];
}

interface MovieDetail {
  _id: number;
  name: string;
  origin_name: string;
  slug: string;
  content: string; // Có thể chứa HTML
  type: string; // Quan sát thấy "series"
  status: string; // Quan sát thấy "ongoing" hoặc "completed"
  poster_url: string | null | Record<string, never>;
  thumb_url: string | null;
  trailer_url: string | null;
  time: string | null;
  episode_current: string;
  episode_total: string;
  quality: string;
  lang: string;
  notify: string | null;
  showtimes: string | null;
  year: number;
  keywords: string[];
  view: number;
  chieurap: boolean;
  sub_docquyen: boolean;
  actor: string[];
  director: string[];
  category: TaxonomyRef[];
  country: TaxonomyRef[];
  tmdb: {
    type: string;
    id: string;
    season: number | string | null;
    vote_average: string;
    vote_count: number;
  };
  imdb: {
    id: string | null;
  };
  created: { time: string };
  modified: { time: string };
}

interface TaxonomyRef {
  id: number;
  name: string;
  slug: string;
}

interface EpisodeServer {
  server_name: string;
  server_data: Episode[];
}

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
}
```

Response thực tế rút gọn:

```json
{
  "status": true,
  "msg": "",
  "movie": {
    "_id": 50345,
    "name": "Người chồng",
    "origin_name": "The Husband",
    "slug": "nguoi-chong",
    "content": "Tae-ju and Se-yun are on the verge of divorce...",
    "type": "series",
    "status": "completed",
    "poster_url": "https://vsmov.com/storage/images/example.jpg",
    "thumb_url": "https://vsmov.com/storage/images/example.jpg",
    "trailer_url": null,
    "time": null,
    "episode_current": "Hoàn tất (12/12)",
    "episode_total": "12",
    "quality": "HD",
    "lang": "Vietsub",
    "notify": null,
    "showtimes": null,
    "year": 2026,
    "keywords": ["romance", "thriller", "kidnapping"],
    "view": 215,
    "chieurap": false,
    "sub_docquyen": true,
    "actor": ["Namkoong Min", "Lee Seol"],
    "director": ["Kim Jung-hyun"],
    "category": [
      { "id": 15, "name": "Chính Kịch", "slug": "chinh-kich" }
    ],
    "country": [
      { "id": 10, "name": "Hàn Quốc", "slug": "han-quoc" }
    ]
  },
  "episodes": [
    {
      "server_name": "Vietsub #1",
      "server_data": [
        {
          "name": "1",
          "slug": "tap-1",
          "filename": "1",
          "link_embed": "https://v1.streamvsmov.com/video/example-id"
        }
      ]
    }
  ]
}
```

Lưu ý:

- `episodes` có thể là mảng rỗng dù `movie` tồn tại.
- `server_name` có thể chứa ký tự xuống dòng và khoảng trắng; nên `.trim()` trước khi hiển thị.
- Thứ tự `server_data` không được đảm bảo; response thực tế có thể không xếp tập theo số tăng dần.
- `content` có thể là plain text hoặc HTML. Phải sanitize trước khi render bằng `dangerouslySetInnerHTML`.
- `episode_total`, `tmdb.id` và `tmdb.vote_average` đang là string, không nên ép kiểu tĩnh mà không kiểm tra.
- URL trong `link_embed` thuộc subdomain khác nhau như `v1.streamvsmov.com`, `v8.streamvsmov.com`, `v16.streamvsmov.com`; CSP của site phải cho phép host động phù hợp nếu phát bằng iframe.

### 5.5. Type guard tối thiểu

Không nên dùng `response.json() as Promise<T>` như một bước validation. Có thể bắt đầu bằng các guard tối thiểu sau hoặc dùng Zod/Valibot:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMovieListResponse(value: unknown): value is MovieListResponse {
  if (!isRecord(value)) return false;
  return (
    value.status === true &&
    Array.isArray(value.items) &&
    isRecord(value.pagination)
  );
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeServerName(value: unknown): string {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim()
    : '';
}
```

## 6. Các trường dữ liệu quan trọng

Checklist chính thức của trang tài liệu yêu cầu đối chiếu các trường sau trong JSON:

| Trường | Mục đích dự kiến |
|---|---|
| `name` | Tên phim |
| `slug` | Định danh thân thiện URL |
| `thumb_url` | Ảnh thumbnail |
| `poster_url` | Ảnh poster |
| `episodes` | Danh sách tập/server ở endpoint chi tiết nếu có |

Tên trường trên được tài liệu nguồn nêu rõ, nhưng kiểu dữ liệu và cấu trúc lồng nhau chưa được công bố.

## 7. Mẫu tích hợp JavaScript/TypeScript

```ts
const API_BASE_URL = 'https://vsmov.com/api';

async function vsmovGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`VSMOV API error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  return response.json() as Promise<T>; // Chỉ ép kiểu; cần validate ở nơi gọi
}

export const getLatestMovies = (page = 1) =>
  vsmovGet('/danh-sach/phim-moi-cap-nhat', { page });

export const searchMovies = (keyword: string, page = 1, limit = 20) =>
  vsmovGet('/tim-kiem', { keyword, page, limit });

export const getMovieDetail = (slug: string) =>
  vsmovGet(`/phim/${encodeURIComponent(slug)}`);
```

Nếu gọi trực tiếp từ browser bị CORS, hãy gọi VSMOV từ backend/server route của ứng dụng. Không coi proxy là cách vượt giới hạn của nhà cung cấp; vẫn cần tuân thủ điều khoản và mức sử dụng hợp lý.

## 8. Kiểm thử nhanh

Các lệnh do trang nguồn cung cấp:

```bash
curl -s 'https://vsmov.com/api/danh-sach/phim-moi-cap-nhat?page=1' | head -c 400
curl -s 'https://vsmov.com/api/danh-sach/subteam?page=1&limit=5' | head -c 400
curl -s 'https://vsmov.com/api/tim-kiem?keyword=avengers&limit=5' | head -c 400
curl -s 'https://vsmov.com/api/phim/mau-xanh-cuoi-cung' | head -c 400
```

Checklist kiểm thử:

1. Kiểm tra bốn nhóm: trang chủ, bộ lọc, tìm kiếm và chi tiết phim.
2. Xác nhận HTTP status là `200` khi request hợp lệ.
3. Xác nhận header `content-type` chứa `application/json`.
4. Đối chiếu `name`, `slug`, `thumb_url`, `poster_url`.
5. Với chi tiết phim, kiểm tra `episodes` nếu có.
6. Xử lý an toàn trường hợp mảng rỗng, trường thiếu hoặc `null` vì schema chưa được công bố.

## 9. Khuyến nghị khi build site cá nhân

- Gọi API qua server-side route để chủ động cache, timeout và tránh phụ thuộc CORS.
- Cache danh mục thể loại/quốc gia/năm lâu hơn danh sách phim mới.
- Cache chi tiết phim ngắn hạn và có cơ chế revalidate.
- Luôn dùng timeout và `AbortController`.
- Không hard-code enum chỉ từ các ví dụ `series` và `completed`; tài liệu chưa xác nhận toàn bộ giá trị hợp lệ.
- Không giả định mọi phim đều có `episodes`, poster hoặc thumbnail.
- Không hotlink hoặc phân phối nội dung vượt quá quyền được cấp; kiểm tra điều khoản sử dụng và quyền đối với dữ liệu, hình ảnh, phụ đề và luồng phát trước khi đưa site ra ngoài phạm vi cá nhân.

## 10. Nội dung trang nguồn chưa công bố

Tại thời điểm trích xuất, tài liệu chưa nêu:

- JSON schema hoàn chỉnh cho từng endpoint.
- Cấu trúc lỗi và mã HTTP lỗi.
- Giá trị mặc định/tối đa của `page` và `limit`.
- Danh sách đầy đủ slug cho `/danh-sach/{slug}`.
- Danh sách đầy đủ giá trị cho `type`, `status` và các bộ lọc phụ.
- Rate limit, CORS, cache headers, SLA và chính sách versioning.
- Chính sách sử dụng dữ liệu hoặc giấy phép nội dung.

Các phần này nên được kiểm tra lại trước khi phụ thuộc vào API trong môi trường production.
