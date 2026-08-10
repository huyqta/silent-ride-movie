/**
 * d1.ts
 * Đọc dữ liệu từ D1 và trả về đúng shape mà các pages/components đang dùng.
 * Drop-in replacement cho unified.ts / ophim.ts — components không cần sửa.
 */

import type { D1Movie, D1EpisodeServer, NormalizedEpisode } from "@/types/normalized";

// ─── Type helpers ────────────────────────────────────────────────────────────

/** Chuyển D1Movie sang Movie shape mà components đang dùng */
function d1MovieToMovie(m: D1Movie) {
  const categories = safeParseJSON(m.categories, []);
  const countries = safeParseJSON(m.countries, []);
  return {
    _id: m.id,
    name: m.title,
    slug: m.slug ?? "",
    origin_name: m.origin_name ?? "",
    type: m.type ?? "series",
    thumb_url: m.thumb_url ?? m.poster ?? "",
    poster_url: m.poster ?? m.thumb_url ?? "",
    quality: m.quality ?? "HD",
    lang: m.lang ?? "Vietsub",
    year: m.year,
    episode_current: m.episode_current ?? "",
    episode_total: m.episode_total ?? "",
    content: m.content ?? "",
    status: m.status ?? "",
    category: categories,
    country: countries,
    // Các fields không lưu trong D1 — set default
    sub_docquyen: false,
    chipiuliui: false,
    time: "",
    view: 0,
    actor: [] as string[],
    director: [] as string[],
    trailer_url: "",
    notify: "",
    showtimes: "",
    episodes: [] as any[],
  };
}

/** Chuyển D1 episode servers sang Episode[] shape cũ (OPhim format) */
function d1ServersToEpisodes(servers: (D1EpisodeServer & { episodes: NormalizedEpisode[] })[]) {
  return servers.map((server) => ({
    server_name: server.server_name,
    server_data: server.episodes.map((ep) => ({
      name: ep.name,
      slug: ep.slug,
      filename: "",
      link_embed: ep.embed ?? "",
      link_m3u8: ep.m3u8 ?? "",
    })),
  }));
}

function safeParseJSON<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try { return JSON.parse(str) as T; } catch { return fallback; }
}

// ─── Pagination helper ────────────────────────────────────────────────────────

function makePagination(total: number, page: number, limit = 24) {
  return {
    totalItems: total,
    totalItemsPerPage: limit,
    currentPage: page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

// ─── Map D1 type slug → SQL WHERE clause ─────────────────────────────────────

const TYPE_MAP: Record<string, string | null> = {
  "phim-le":           "single",
  "phim-bo":           "series",
  "hoat-hinh":         "hoathinh",
  "tv-shows":          "tvshows",
  // Các type dựa vào lang / status — không có trong D1, fallback về API
  "phim-vietsub":      null,
  "phim-thuyet-minh":  null,
  "phim-long-tieng":   null,
  "phim-bo-dang-chieu": null,
  "phim-bo-hoan-thanh": null,
  "phim-sap-chieu":    null,
  "phim-chieu-rap":    null,
  "subteam":           null,
  "phim-moi":          null, // dùng updated_at DESC
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch phim mới cập nhật từ D1 — tương đương getNewlyUpdatedMovies()
 * Trả về { items: Movie[] } (flat, không có .data wrapper)
 */
export async function getNewlyUpdatedMoviesD1(page = 1, limit = 24) {
  const res = await fetch(
    `/api/movies?page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("D1: Failed to fetch newly updated");
  const json = await res.json();
  return {
    items: (json.items ?? []).map(d1MovieToMovie),
    paginate: {
      total_items: json.pagination?.totalItems ?? 0,
      items_per_page: limit,
      current_page: page,
      total_page: json.pagination?.totalPages ?? 1,
    },
  };
}

/**
 * Fetch phim theo type — tương đương getMoviesByType()
 * Trả về { data: { items, params: { pagination } } }
 */
export async function getMoviesByTypeD1(type: string, page = 1, limit = 24) {
  const d1Type = TYPE_MAP[type];
  let url: string;

  if (d1Type) {
    url = `/api/movies?type=${d1Type}&page=${page}&limit=${limit}`;
  } else if (type === "phim-moi") {
    url = `/api/movies?page=${page}&limit=${limit}`;
  } else {
    // type không map được (phim-vietsub, phim-thuyet-minh...) — fallback rỗng
    return { data: { items: [], params: { pagination: makePagination(0, page, limit) }, titlePage: type } };
  }

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return { data: { items: [], params: { pagination: makePagination(0, page, limit) }, titlePage: type } };
  const json = await res.json();

  return {
    data: {
      items: (json.items ?? []).map(d1MovieToMovie),
      params: { pagination: json.pagination ?? makePagination(0, page, limit) },
      titlePage: type,
    },
  };
}

/**
 * Fetch phim theo thể loại — tương đương getMoviesByGenre()
 */
export async function getMoviesByGenreD1(slug: string, page = 1, limit = 24) {
  const res = await fetch(
    `/api/movies?category=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return { data: { items: [], params: { pagination: makePagination(0, page, limit) }, titlePage: slug } };
  const json = await res.json();
  return {
    data: {
      items: (json.items ?? []).map(d1MovieToMovie),
      params: { pagination: json.pagination ?? makePagination(0, page, limit) },
      titlePage: `Thể loại: ${slug.replace(/-/g, " ")}`,
    },
  };
}

/**
 * Fetch phim theo quốc gia — tương đương getMoviesByCountry()
 */
export async function getMoviesByCountryD1(slug: string, page = 1, limit = 24) {
  const res = await fetch(
    `/api/movies?country=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) return { data: { items: [], params: { pagination: makePagination(0, page, limit) }, titlePage: slug } };
  const json = await res.json();
  return {
    data: {
      items: (json.items ?? []).map(d1MovieToMovie),
      params: { pagination: json.pagination ?? makePagination(0, page, limit) },
      titlePage: `Quốc gia: ${slug.replace(/-/g, " ")}`,
    },
  };
}

/**
 * Tìm kiếm phim — tương đương searchMovies()
 */
export async function searchMoviesD1(q: string, page = 1, limit = 24) {
  const res = await fetch(
    `/api/movies?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return { data: { items: [], params: { pagination: makePagination(0, page, limit) } } };
  const json = await res.json();
  return {
    data: {
      items: (json.items ?? []).map(d1MovieToMovie),
      params: { pagination: json.pagination ?? makePagination(0, page, limit) },
    },
  };
}

/**
 * Fetch chi tiết phim + tất cả episodes từ D1.
 * Trả về { movie: MovieDetail, episodes: Episode[] } — giống shape cũ của OPhim.
 */
export async function getMovieDetailD1(slug: string) {
  const res = await fetch(`/api/movies/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`D1: Movie not found: ${slug}`);
  const json = await res.json();
  if (!json.success || !json.movie) throw new Error(`D1: Movie not found: ${slug}`);

  const movie = d1MovieToMovie(json.movie as D1Movie);

  // Gộp tất cả servers từ tất cả sources thành 1 episodes array
  // Mỗi source được prefix trong server_name để phân biệt
  const allEpisodes: any[] = [];
  for (const source of json.sources ?? []) {
    const sourceLabel = source.source_name === "ophim" ? "" :
                        source.source_name === "nguonc" ? " [NC]" : " [KK]";
    for (const server of source.servers ?? []) {
      const episodes = server.episodes as NormalizedEpisode[];
      allEpisodes.push({
        server_name: `${server.server_name}${sourceLabel}`,
        server_data: episodes.map((ep) => ({
          name: ep.name,
          slug: ep.slug,
          filename: "",
          link_embed: ep.embed ?? "",
          link_m3u8: ep.m3u8 ?? "",
        })),
      });
    }
  }

  return {
    movie: { ...movie, episodes: allEpisodes },
    episodes: allEpisodes,
  };
}
