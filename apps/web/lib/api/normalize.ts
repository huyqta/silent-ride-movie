/**
 * normalize.ts
 * Map raw API responses từ OPhim, NguonC, KKPhim về NormalizedMovie.
 * Không phụ thuộc DB — dùng được cả ở sync time lẫn runtime.
 */

import type {
  NormalizedMovie,
  NormalizedServer,
  NormalizedEpisode,
  NormalizedCategory,
  NormalizedCountry,
  MovieType,
} from "@/types/normalized";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMovieType(raw: string | undefined): MovieType {
  const map: Record<string, MovieType> = {
    single: "single",
    "phim-le": "single",
    series: "series",
    "phim-bo": "series",
    hoathinh: "hoathinh",
    "hoat-hinh": "hoathinh",
    tvshows: "tvshows",
    "tv-shows": "tvshows",
  };
  return map[raw?.toLowerCase() ?? ""] ?? "series";
}

// ─── OPhim ───────────────────────────────────────────────────────────────────

/**
 * OPhim detail response:
 * {
 *   movie: { name, slug, origin_name, type, thumb_url, poster_url, quality, lang,
 *            year, episode_current, episode_total, content, status,
 *            category: [{id,name,slug}], country: [{id,name,slug}] },
 *   episodes: [{ server_name, server_data: [{ name, slug, link_embed, link_m3u8 }] }]
 * }
 */
export function normalizeFromOphim(raw: any): NormalizedMovie {
  const movie = raw.movie ?? raw;
  const rawEpisodes: any[] = raw.episodes ?? movie.episodes ?? [];

  const servers: NormalizedServer[] = rawEpisodes.map(
    (server: any, idx: number) => ({
      serverName: server.server_name ?? `Server ${idx + 1}`,
      serverIndex: idx,
      episodes: (server.server_data ?? []).map(
        (ep: any): NormalizedEpisode => ({
          name: ep.name ?? "",
          slug: ep.slug ?? "",
          embed: ep.link_embed || undefined,
          m3u8: ep.link_m3u8 || undefined,
        })
      ),
    })
  );

  const categories: NormalizedCategory[] = (movie.category ?? []).map((c: any) => ({
    id: c.id ?? c.slug ?? "",
    name: c.name ?? "",
    slug: c.slug ?? "",
  }));

  const countries: NormalizedCountry[] = (movie.country ?? []).map((c: any) => ({
    id: c.id ?? c.slug ?? "",
    name: c.name ?? "",
    slug: c.slug ?? "",
  }));

  return {
    sourceName: "ophim",
    sourceSlug: movie.slug ?? "",
    slug: movie.slug ?? "",
    title: movie.name ?? "",
    originTitle: movie.origin_name ?? "",
    year: Number(movie.year) || new Date().getFullYear(),
    poster: movie.poster_url ?? movie.thumb_url ?? "",
    thumb: movie.thumb_url ?? movie.poster_url ?? "",
    type: toMovieType(movie.type),
    quality: movie.quality ?? "HD",
    lang: movie.lang ?? "Vietsub",
    episodeCurrent: movie.episode_current ?? "",
    episodeTotal: movie.episode_total ?? "",
    content: movie.content ?? "",
    status: movie.status ?? "",
    categories,
    countries,
    servers,
  };
}

// ─── KKPhim ──────────────────────────────────────────────────────────────────

/**
 * KKPhim dùng cùng structure với OPhim (phimapi.com).
 * Chỉ khác CDN ảnh — đã được normalize trong kkphim.ts.
 */
export function normalizeFromKKPhim(raw: any): NormalizedMovie {
  const normalized = normalizeFromOphim(raw);
  return { ...normalized, sourceName: "kkphim" };
}

// ─── NguonC ──────────────────────────────────────────────────────────────────

/**
 * NguonC detail response:
 * {
 *   movie: {
 *     name, slug, original_name, thumb_url, poster_url, quality, language,
 *     current_episode, total_episodes, description, status, created,
 *     category: [{name, slug}],
 *     country: [{name, slug}],  (có thể là string hoặc array)
 *     episodes: [{ server_name?, items: [{ name, slug, embed, m3u8 }] }]
 *   }
 * }
 */
export function normalizeFromNguonC(raw: any): NormalizedMovie {
  const movie = raw.movie ?? raw;
  const rawEpisodes: any[] = movie.episodes ?? [];

  const servers: NormalizedServer[] = rawEpisodes.map(
    (server: any, idx: number) => ({
      serverName: server.server_name ?? `NguonC ${idx + 1}`,
      serverIndex: idx,
      episodes: (server.items ?? []).map(
        (ep: any): NormalizedEpisode => ({
          name: ep.name ?? "",
          slug: ep.slug ?? "",
          embed: ep.embed || undefined,
          m3u8: ep.m3u8 || undefined,
        })
      ),
    })
  );

  // NguonC categories có thể thiếu id
  const categories: NormalizedCategory[] = (movie.category ?? []).map((c: any) => ({
    id: c.id ?? c.slug ?? c.name ?? "",
    name: c.name ?? "",
    slug: c.slug ?? (c.name ?? "").toLowerCase().replace(/\s+/g, "-"),
  }));

  // NguonC country có thể là string hoặc array
  const rawCountries = Array.isArray(movie.country)
    ? movie.country
    : movie.country
    ? [{ name: movie.country }]
    : [];
  const countries: NormalizedCountry[] = rawCountries.map((c: any) => ({
    id: c.id ?? c.slug ?? c.name ?? "",
    name: c.name ?? "",
    slug: c.slug ?? (c.name ?? "").toLowerCase().replace(/\s+/g, "-"),
  }));

  const createdYear = movie.created
    ? Number.parseInt(String(movie.created).split("-")[0], 10)
    : new Date().getFullYear();

  // NguonC không có type field — đoán dựa vào total_episodes
  const total = Number(movie.total_episodes ?? 0);
  const guessedType: MovieType = total === 1 ? "single" : "series";

  return {
    sourceName: "nguonc",
    sourceSlug: movie.slug ?? "",
    slug: movie.slug ?? "",
    title: movie.name ?? "",
    originTitle: movie.original_name ?? "",
    year: Number(movie.year) || createdYear,
    poster: movie.poster_url ?? movie.thumb_url ?? "",
    thumb: movie.thumb_url ?? movie.poster_url ?? "",
    type: guessedType,
    quality: movie.quality ?? "HD",
    lang: movie.language ?? "Vietsub",
    episodeCurrent: movie.current_episode ?? "",
    episodeTotal: String(movie.total_episodes ?? ""),
    content: movie.description ?? "",
    status: movie.status ?? "",
    categories,
    countries,
    servers,
  };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function getFirstEpisode(
  servers: NormalizedServer[]
): { episode: NormalizedEpisode; serverIndex: number } | null {
  for (const server of servers) {
    if (server.episodes.length > 0) {
      return { episode: server.episodes[0], serverIndex: server.serverIndex };
    }
  }
  return null;
}

export function findEpisodeBySlug(
  servers: NormalizedServer[],
  slug: string
): { episode: NormalizedEpisode; serverIndex: number } | null {
  for (const server of servers) {
    const ep = server.episodes.find((e) => e.slug === slug);
    if (ep) return { episode: ep, serverIndex: server.serverIndex };
  }
  return null;
}
