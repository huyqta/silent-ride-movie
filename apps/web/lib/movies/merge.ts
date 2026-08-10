/**
 * merge.ts
 * Chuẩn hoá title phim để match giữa 3 nguồn khi upsert vào D1.
 * Không phụ thuộc DB — pure string manipulation.
 */

/**
 * Chuẩn hoá title để dùng làm search_key khi match phim giữa các nguồn.
 *
 * Các bước:
 * 1. Lowercase toàn bộ
 * 2. Bỏ dấu tiếng Việt
 * 3. Bỏ ký tự đặc biệt, chỉ giữ a-z0-9 và space
 * 4. Collapse nhiều space → 1 space
 * 5. Trim
 *
 * Ví dụ:
 *   "Ký Sinh Trùng (2019)" → "ky sinh trung 2019"
 *   "Avengers: Endgame" → "avengers endgame"
 *   "Doraemon: Nobita's Little Star Wars" → "doraemon nobitas little star wars"
 */
export function normalizeTitle(title: string): string {
  if (!title) return "";

  return title
    .toLowerCase()
    // Bỏ dấu tiếng Việt
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // đ → d
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    // Bỏ ký tự đặc biệt, giữ lại a-z 0-9 space
    .replace(/[^a-z0-9\s]/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tạo match key từ title + year.
 * Dùng khi query D1: WHERE search_key = ? AND year = ?
 */
export function makeMovieKey(title: string, year: number): string {
  return `${normalizeTitle(title)}__${year}`;
}
