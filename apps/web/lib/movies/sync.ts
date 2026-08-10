/**
 * sync.ts
 * Logic upsert NormalizedMovie vào D1.
 * Chạy từ admin API route, không tự động.
 */

import { normalizeTitle } from "./merge";
import type { NormalizedMovie } from "@/types/normalized";

/**
 * Upsert 1 phim từ 1 nguồn vào D1.
 *
 * Flow:
 * 1. Tìm phim đã có (match search_key + year)
 * 2. Nếu chưa có → INSERT movies
 * 3. Upsert movie_sources (INSERT hoặc UPDATE updated_at nếu đã có)
 * 4. Xoá episode servers cũ của source này (nếu có)
 * 5. INSERT episode servers mới
 *
 * Lý do xoá episode servers cũ: episodes có thể thay đổi (thêm tập mới, đổi link, v.v.)
 */
export async function upsertMovieSource(
  db: D1Database,
  movie: NormalizedMovie
): Promise<void> {
  const searchKey = normalizeTitle(movie.title);

  // 1. Tìm phim đã tồn tại — match bằng slug trước (chính xác nhất)
  //    Fallback sang search_key + year nếu không có slug
  let existing = movie.slug
    ? await db
        .prepare("SELECT id FROM movies WHERE slug = ?")
        .bind(movie.slug)
        .first<{ id: string }>()
    : null;

  if (!existing) {
    existing = await db
      .prepare("SELECT id FROM movies WHERE search_key = ? AND year = ?")
      .bind(searchKey, movie.year)
      .first<{ id: string }>();
  }

  let movieId = existing?.id;

  // 2. INSERT hoặc UPDATE movies với đầy đủ metadata
  if (!movieId) {
    movieId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO movies
           (id, title, origin_name, slug, search_key, year,
            poster, thumb_url, type, quality, lang,
            episode_current, episode_total, content, status,
            categories, countries)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        movieId,
        movie.title,
        movie.originTitle,
        movie.slug,
        searchKey,
        movie.year,
        movie.poster,
        movie.thumb,
        movie.type,
        movie.quality,
        movie.lang,
        movie.episodeCurrent,
        movie.episodeTotal,
        movie.content,
        movie.status,
        JSON.stringify(movie.categories),
        JSON.stringify(movie.countries)
      )
      .run();
  } else {
    // UPDATE — ưu tiên OPhim cho metadata chất lượng cao hơn
    // Luôn update episode_current/total vì chúng thay đổi theo thời gian
    const isPreferredSource = movie.sourceName === "ophim";
    await db
      .prepare(
        `UPDATE movies SET
           episode_current = ?,
           episode_total = ?,
           updated_at = datetime('now')
           ${isPreferredSource ? `,
           title = ?, origin_name = ?, slug = ?,
           poster = ?, thumb_url = ?, type = ?,
           quality = ?, lang = ?, content = ?, status = ?,
           categories = ?, countries = ?` : ""}
         WHERE id = ?`
      )
      .bind(
        ...(isPreferredSource
          ? [
              movie.episodeCurrent,
              movie.episodeTotal,
              movie.title,
              movie.originTitle,
              movie.slug,
              movie.poster,
              movie.thumb,
              movie.type,
              movie.quality,
              movie.lang,
              movie.content,
              movie.status,
              JSON.stringify(movie.categories),
              JSON.stringify(movie.countries),
              movieId,
            ]
          : [movie.episodeCurrent, movie.episodeTotal, movieId])
      )
      .run();
  }

  // 3. Upsert movie_sources
  const existingSource = await db
    .prepare("SELECT id FROM movie_sources WHERE source_name = ? AND source_slug = ?")
    .bind(movie.sourceName, movie.sourceSlug)
    .first<{ id: string }>();

  let sourceId = existingSource?.id;

  if (!sourceId) {
    sourceId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO movie_sources (id, movie_id, source_name, source_slug)
         VALUES (?, ?, ?, ?)`
      )
      .bind(sourceId, movieId, movie.sourceName, movie.sourceSlug)
      .run();
  } else {
    // Update timestamp
    await db
      .prepare(`UPDATE movie_sources SET updated_at = datetime('now') WHERE id = ?`)
      .bind(sourceId)
      .run();
  }

  // 4. Xoá episode servers cũ của source này
  await db
    .prepare("DELETE FROM movie_episode_servers WHERE movie_source_id = ?")
    .bind(sourceId)
    .run();

  // 5. INSERT episode servers mới
  for (const server of movie.servers) {
    const serverId = crypto.randomUUID();
    const episodesJson = JSON.stringify(server.episodes);

    await db
      .prepare(
        `INSERT INTO movie_episode_servers (id, movie_source_id, server_name, server_index, episodes)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(serverId, sourceId, server.serverName, server.serverIndex, episodesJson)
      .run();
  }
}

/**
 * Sync 1 nguồn hoàn chỉnh (fetch API → normalize → upsert vào D1).
 *
 * Modes:
 * - page + limit: fetch đúng 1 page, slice theo limit → dùng khi sync thủ công từng batch
 * - pages=N: tự động fetch N pages liên tiếp (mỗi page ~24 phim) → dùng khi sync bulk
 * - pages=0: fetch toàn bộ cho đến khi hết phim (dùng cẩn thận, tốn nhiều writes)
 */
export async function syncSingleSource(
  db: D1Database,
  source: "ophim" | "nguonc" | "kkphim",
  options: { limit?: number; page?: number; pages?: number } = {}
): Promise<{ count: number; errors: string[]; pagesProcessed: number }> {
  const { limit = 0, page = 1, pages } = options;
  const errors: string[] = [];
  let count = 0;
  let pagesProcessed = 0;

  // Nếu có `pages` param → multi-page mode
  // pages=N: fetch N pages bắt đầu từ `page`
  // pages=0: fetch đến hết
  const isMultiPage = pages !== undefined;
  const maxPages = isMultiPage ? (pages === 0 ? 9999 : pages) : 1;
  const startPage = page;

  try {
    let normalizeFunc: ((raw: any) => NormalizedMovie) | null = null;
    let getDetail: ((slug: string) => Promise<any>) | null = null;
    let fetchPage: (p: number) => Promise<{ items: any[]; hasMore: boolean }>;

    if (source === "ophim") {
      const { getNewlyUpdatedMovies, getMovieDetail } = await import("../api/ophim");
      const { normalizeFromOphim } = await import("../api/normalize");
      normalizeFunc = normalizeFromOphim;
      getDetail = getMovieDetail;
      fetchPage = async (p) => {
        const data = await getNewlyUpdatedMovies(p);
        const items = data.items ?? [];
        const totalPages = (data as any).paginate?.total_page ?? (data as any).pagination?.totalPages ?? 1;
        return { items, hasMore: p < totalPages };
      };
    } else if (source === "nguonc") {
      const { getNewlyUpdatedMoviesNguonC } = await import("../api/nguonc");
      const { normalizeFromNguonC } = await import("../api/normalize");
      normalizeFunc = normalizeFromNguonC;
      getDetail = async (slug: string) => {
        const response = await fetch(`https://phim.nguonc.com/api/film/${slug}`);
        if (!response.ok) throw new Error("NguonC detail fetch failed");
        return response.json();
      };
      fetchPage = async (p) => {
        const data = await getNewlyUpdatedMoviesNguonC(p);
        const items = data.items ?? [];
        const totalPages = (data as any).paginate?.total_page ?? 1;
        return { items, hasMore: p < totalPages };
      };
    } else {
      const { getNewlyUpdatedMoviesKKPhim } = await import("../api/kkphim");
      const { normalizeFromKKPhim } = await import("../api/normalize");
      normalizeFunc = normalizeFromKKPhim;
      getDetail = async (slug: string) => {
        const response = await fetch(`https://phimapi.com/phim/${slug}`);
        if (!response.ok) throw new Error("KKPhim detail fetch failed");
        return response.json();
      };
      fetchPage = async (p) => {
        const data = await getNewlyUpdatedMoviesKKPhim(p);
        const items = data.items ?? [];
        const totalPages = (data as any).paginate?.total_page ?? (data as any).data?.params?.pagination?.totalPages ?? 1;
        return { items, hasMore: p < totalPages };
      };
    }

    // Loop qua từng page
    for (let currentPage = startPage; currentPage < startPage + maxPages; currentPage++) {
      const { items: rawMovies, hasMore } = await fetchPage(currentPage);
      pagesProcessed++;

      // Single-page mode: apply limit bằng slice
      const moviesToProcess = (!isMultiPage && limit > 0)
        ? rawMovies.slice(0, limit)
        : rawMovies;

      if (moviesToProcess.length === 0) break;

      // Upsert từng phim — fetch detail để có episodes
      for (const raw of moviesToProcess) {
        try {
          let movieData = raw;

          if (getDetail && raw.slug) {
            try {
              movieData = await getDetail(raw.slug);
            } catch {
              // Fallback to list data nếu detail fetch fail
            }
          }

          const normalized = normalizeFunc!(movieData);
          await upsertMovieSource(db, normalized);
          count++;
        } catch (err) {
          const title = raw?.name || raw?.movie?.name || "unknown";
          errors.push(`${source}/${title}: ${(err as Error).message}`);
        }
      }

      // Stop nếu không còn page nào
      if (!hasMore) break;
    }
  } catch (err) {
    errors.push(`${source} fetch failed: ${(err as Error).message}`);
  }

  return { count, errors, pagesProcessed };
}

/**
 * Sync tất cả 3 nguồn — chỉ dùng khi cần sync toàn bộ.
 * ⚠️ CẢNH BÁO: có thể tốn nhiều D1 writes, dùng cẩn thận!
 */
export async function syncAllSources(
  db: D1Database,
  options: { limit?: number; page?: number; pages?: number } = {}
): Promise<{ ophim: number; nguonc: number; kkphim: number; pagesProcessed: number; errors: string[] }> {
  const sources: Array<"ophim" | "nguonc" | "kkphim"> = ["ophim", "nguonc", "kkphim"];
  const results = { ophim: 0, nguonc: 0, kkphim: 0, pagesProcessed: 0, errors: [] as string[] };

  for (const source of sources) {
    const { count, errors, pagesProcessed } = await syncSingleSource(db, source, options);
    results[source] = count;
    results.pagesProcessed += pagesProcessed;
    results.errors.push(...errors);
  }

  return results;
}
