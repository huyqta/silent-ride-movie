/**
 * Normalized types — shared schema cho D1 storage và runtime.
 * Mọi data từ OPhim / NguonC / KKPhim đều được map về các type này
 * trước khi ghi vào D1 hoặc hiển thị trên UI.
 */

export type SourceName = "ophim" | "nguonc" | "kkphim";

export type MovieType = "single" | "series" | "hoathinh" | "tvshows";

export interface NormalizedCategory {
  id: string;
  name: string;
  slug: string;
}

export interface NormalizedCountry {
  id: string;
  name: string;
  slug: string;
}

/** 1 tập phim — chuẩn hoá từ 3 nguồn */
export interface NormalizedEpisode {
  name: string;   // "Tập 1" | "1" | "Full"
  slug: string;   // dùng cho URL /xem-phim/[slug]/[episode]
  embed?: string; // link embed (iframe)
  m3u8?: string;  // link stream trực tiếp
}

/**
 * 1 server/season từ 1 nguồn.
 * OPhim: mỗi server_name = 1 bản dịch hoặc 1 season
 * NguonC: luôn là 1 server duy nhất
 * KKPhim: giống OPhim
 */
export interface NormalizedServer {
  serverName: string;     // "Vietsub #1" | "Season 1" | "NguonC" | v.v.
  serverIndex: number;    // thứ tự trong danh sách servers của nguồn đó
  episodes: NormalizedEpisode[];
}

/** Đại diện cho 1 phim đã được chuẩn hoá từ 1 nguồn */
export interface NormalizedMovie {
  sourceName: SourceName;
  sourceSlug: string;       // slug trên API nguồn đó
  // Core identity
  slug: string;             // slug dùng cho URL (từ nguồn, ưu tiên OPhim)
  title: string;
  originTitle: string;
  year: number;
  // Visual
  poster: string;
  thumb: string;
  // Metadata
  type: MovieType;
  quality: string;
  lang: string;
  episodeCurrent: string;
  episodeTotal: string;
  content: string;
  status: string;
  categories: NormalizedCategory[];
  countries: NormalizedCountry[];
  // Episodes
  servers: NormalizedServer[];
}

/**
 * Row trong bảng movies của D1 — phản ánh schema sau migration 0002
 */
export interface D1Movie {
  id: string;
  title: string;
  origin_name: string | null;
  slug: string | null;
  search_key: string;
  year: number;
  poster: string | null;
  thumb_url: string | null;
  type: MovieType | null;
  quality: string | null;
  lang: string | null;
  episode_current: string | null;
  episode_total: string | null;
  content: string | null;
  status: string | null;
  categories: string;    // JSON string
  countries: string;     // JSON string
  created_at: string;
  updated_at: string;
}

export interface D1MovieWithSources extends D1Movie {
  sources: D1MovieSource[];
}

export interface D1MovieSource {
  id: string;
  movie_id: string;
  source_name: SourceName;
  source_slug: string;
  updated_at: string;
  servers: D1EpisodeServer[];
}

export interface D1EpisodeServer {
  id: string;
  movie_source_id: string;
  server_name: string;
  server_index: number;
  /** JSON.stringify(NormalizedEpisode[]) — parse khi đọc */
  episodes_json: string;
}
