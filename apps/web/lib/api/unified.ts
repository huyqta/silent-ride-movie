import * as ophim from "./ophim";
import * as nguonc from "./nguonc";
import * as kkphim from "./kkphim";
import * as vsmov from "./vsmov";

type Source = "ophim" | "nguonc" | "kkphim" | "vsmov";

export const getSource = (): Source => {
    if (typeof window !== "undefined") {
        return (localStorage.getItem("movie-source") as Source) || "ophim";
    }
    return "ophim";
};

export async function getNewlyUpdatedMovies(page: number = 1) {
    const source = getSource();
    if (source === "nguonc") return nguonc.getNewlyUpdatedMoviesNguonC(page);
    if (source === "kkphim") return kkphim.getNewlyUpdatedMoviesKKPhim(page);
    if (source === "vsmov") return vsmov.getNewlyUpdatedMoviesVSMov(page);
    return ophim.getNewlyUpdatedMovies(page);
}

export async function getMoviesByType(type: string, page: number = 1, limit: number = 24) {
    const source = getSource();
    if (source === "nguonc") return nguonc.getMoviesByTypeNguonC(type, page);
    if (source === "kkphim") return kkphim.getMoviesByTypeKKPhim(type, page, limit);
    if (source === "vsmov") return vsmov.getMoviesByTypeVSMov(type, page, limit);
    return ophim.getMoviesByType(type, page, limit);
}

export async function getMoviesByGenre(slug: string, page: number = 1) {
    const source = getSource();
    if (source === "nguonc") return nguonc.getMoviesByGenreNguonC(slug, page);
    if (source === "kkphim") return kkphim.getMoviesByGenreKKPhim(slug, page);
    if (source === "vsmov") return vsmov.getMoviesByGenreVSMov(slug, page);
    return ophim.getMoviesByGenre(slug, page);
}

export async function getMoviesByCountry(slug: string, page: number = 1) {
    const source = getSource();
    if (source === "nguonc") return nguonc.getMoviesByCountryNguonC(slug, page);
    if (source === "kkphim") return kkphim.getMoviesByCountryKKPhim(slug, page);
    if (source === "vsmov") return vsmov.getMoviesByCountryVSMov(slug, page);
    return ophim.getMoviesByCountry(slug, page);
}

export interface SearchResultsBySource {
    ophim: any[];
    nguonc: any[];
    kkphim: any[];
    vsmov: any[];
}

export async function searchMoviesAllSources(q: string, page: number = 1): Promise<SearchResultsBySource> {
    console.log(`[Search] Querying all APIs for: "${q}", page: ${page}`);
    const [opData, ncData, kkData, vsData] = await Promise.all([
        ophim.searchMovies(q, page).catch((err) => { console.error("OPhim search err:", err); return { data: { items: [] } }; }),
        nguonc.searchMoviesNguonC(q, page).catch((err) => { console.error("NguonC search err:", err); return { data: { items: [] } }; }),
        kkphim.searchMoviesKKPhim(q, page).catch((err) => { console.error("KKPhim search err:", err); return { data: { items: [] } }; }),
        vsmov.searchMoviesVSMov(q, page).catch((err) => { console.error("VSMov search err:", err); return { data: { items: [] } }; })
    ]);

    const tag = <K extends string>(items: any[], source: K) =>
        (items || []).map((item: any) => ({ ...item, _source: source }));

    return {
        ophim:  tag(opData?.data?.items, "ophim"),
        nguonc: tag(ncData?.data?.items, "nguonc"),
        kkphim: tag(kkData?.data?.items, "kkphim"),
        vsmov:  tag(vsData?.data?.items, "vsmov"),
    };
}

export async function searchMovies(q: string, page: number = 1) {
    console.log(`[Search] Querying all APIs for: "${q}", page: ${page}`);
    try {
        const [opData, ncData, kkData, vsData] = await Promise.all([
            ophim.searchMovies(q, page).catch((err) => { console.error("OPhim search err:", err); return { data: { items: [] } }; }),
            nguonc.searchMoviesNguonC(q, page).catch((err) => { console.error("NguonC search err:", err); return { data: { items: [] } }; }),
            kkphim.searchMoviesKKPhim(q, page).catch((err) => { console.error("KKPhim search err:", err); return { data: { items: [] } }; }),
            vsmov.searchMoviesVSMov(q, page).catch((err) => { console.error("VSMov search err:", err); return { data: { items: [] } }; })
        ]);

        const opItems = opData?.data?.items || [];
        const ncItems = ncData?.data?.items || [];
        const kkItems = kkData?.data?.items || [];
        const vsItems = vsData?.data?.items || [];

        console.log(`[Search] Results count - OPhim: ${opItems.length}, NguonC: ${ncItems.length}, KKPhim: ${kkItems.length}, VSMov: ${vsItems.length}`);

        // Combine items
        const allItems = [...opItems, ...ncItems, ...kkItems, ...vsItems];

        // Deduplicate by slug
        const uniqueItemsMap = new Map<string, any>();
        allItems.forEach((item) => {
            if (item && item.slug) {
                if (!uniqueItemsMap.has(item.slug)) {
                    uniqueItemsMap.set(item.slug, item);
                }
            }
        });

        const uniqueItems = Array.from(uniqueItemsMap.values());
        console.log(`[Search] Unique items combined count: ${uniqueItems.length}`);

        // Sum estimated total items
        const opTotal = (opData as any)?.data?.params?.pagination?.totalItems || opItems.length;
        const ncTotal = (ncData as any)?.data?.params?.pagination?.totalItems || ncItems.length;
        const kkTotal = (kkData as any)?.data?.params?.pagination?.totalItems || kkItems.length;
        const vsTotal = (vsData as any)?.data?.params?.pagination?.totalItems || vsItems.length;
        const totalItems = opTotal + ncTotal + kkTotal + vsTotal;

        return {
            data: {
                items: uniqueItems,
                params: {
                    pagination: {
                        totalItems: totalItems,
                        totalItemsPerPage: 24 * 4,
                        currentPage: page,
                        totalPages: Math.ceil(totalItems / 24) || 1
                    }
                }
            }
        };
    } catch (error) {
        console.error("Combined search failed:", error);
        return { data: { items: [] } };
    }
}

function mapNguonCDetailToOPhim(ncData: any) {
    if (!ncData || !ncData.movie) return null;
    const movie = ncData.movie;
    
    let categories: any[] = [];
    if (movie.category) {
        if (Array.isArray(movie.category)) {
            categories = movie.category;
        } else if (typeof movie.category === "object") {
            categories = Object.values(movie.category);
        }
    }

    let countries: any[] = [];
    if (movie.country) {
        if (Array.isArray(movie.country)) {
            countries = movie.country;
        } else if (typeof movie.country === "object") {
            countries = Object.values(movie.country);
        }
    }

    const episodes = (movie.episodes || []).map((srv: any) => ({
        server_name: srv.server_name || "Nguồn C",
        server_data: (srv.items || []).map((item: any) => ({
            name: item.name,
            slug: item.slug,
            filename: item.name,
            link_embed: item.embed,
            link_m3u8: item.m3u8,
        }))
    }));

    return {
        status: true,
        movie: {
            _id: movie.id || movie.slug,
            name: movie.name,
            slug: movie.slug,
            origin_name: movie.original_name || "",
            content: movie.description || "",
            thumb_url: movie.thumb_url || "",
            poster_url: movie.poster_url || "",
            time: movie.time || "",
            episode_current: movie.current_episode || "",
            episode_total: movie.total_episodes || "",
            quality: movie.quality || "HD",
            lang: movie.language || "",
            year: parseInt(movie.created?.split('-')[0]) || new Date().getFullYear(),
            category: categories,
            country: countries,
            actor: movie.actors ? (Array.isArray(movie.actors) ? movie.actors : [movie.actors]) : [],
            director: movie.director ? (Array.isArray(movie.director) ? movie.director : [movie.director]) : [],
            view: movie.view || 0,
        },
        episodes
    };
}

export async function getMovieDetail(slug: string) {
    const source = getSource();
    
    if (source === "nguonc") {
        const data = await ophim.getMovieDetailNguonC(slug);
        return mapNguonCDetailToOPhim(data);
    }
    
    if (source === "kkphim") {
        const data = await ophim.getMovieDetailPhimApi(slug);
        if (data && data.movie) {
            const KKPHIM_CDN = "https://phimimg.com";
            const normalize = (path: string) => {
                if (!path) return path;
                if (path.startsWith("http")) return path;
                return `${KKPHIM_CDN}/${path}`;
            };
            data.movie.thumb_url = normalize(data.movie.thumb_url);
            data.movie.poster_url = normalize(data.movie.poster_url);
        }
        return data;
    }
    
    if (source === "vsmov") {
        return vsmov.getMovieDetailVSMov(slug);
    }
    
    return ophim.getMovieDetail(slug);
}

/** Count of unique episode slugs that have at least one valid URL (embed or m3u8). */
function countUrls(episodes: any[]): number {
    if (!Array.isArray(episodes) || episodes.length === 0) return 0;
    const slugs = new Set(
        episodes.flatMap((srv) =>
            (srv.server_data || [])
                .filter((ep: any) => ep.link_embed || ep.link_m3u8)
                .map((ep: any) => ep.slug || ep.name)
        )
    );
    return slugs.size;
}

/** Fetch movie detail from a specific source and return the actual URL count. */
export async function getUrlCountBySource(
    slug: string,
    source: "ophim" | "nguonc" | "kkphim" | "vsmov"
): Promise<number> {
    try {
        if (source === "nguonc") {
            const data = await ophim.getMovieDetailNguonC(slug);
            const mapped = mapNguonCDetailToOPhim(data);
            return countUrls(mapped?.episodes || []);
        }
        if (source === "kkphim") {
            const data = await ophim.getMovieDetailPhimApi(slug);
            return countUrls(data?.episodes || []);
        }
        if (source === "vsmov") {
            const data = await vsmov.getMovieDetailVSMov(slug);
            return countUrls(data?.episodes || []);
        }
        // ophim
        const data = await ophim.getMovieDetail(slug);
        return countUrls(data?.episodes || []);
    } catch {
        return -1; // -1 = fetch failed
    }
}

export function getImageUrl(path: string, source?: "ophim" | "nguonc" | "kkphim" | "vsmov"): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    
    const activeSource = source || getSource();
    if (activeSource === "kkphim") {
        return `https://phimimg.com/${path}`;
    }
    return `https://img.ophim.live/uploads/movies/${path}`;
}

export async function advancedSearch(params: {
    keyword?: string;
    category?: string | string[];
    country?: string | string[];
    year?: string | string[];
    type?: string | string[];
    page?: number;
    limit?: number;
}) {
    const source = getSource();
    if (source === "nguonc") {
        if (params.keyword) return nguonc.searchMoviesNguonC(params.keyword, params.page);
        if (params.type && !Array.isArray(params.type)) return nguonc.getMoviesByTypeNguonC(params.type, params.page);
        if (params.category && !Array.isArray(params.category)) return nguonc.getMoviesByGenreNguonC(params.category, params.page);
        if (params.country && !Array.isArray(params.country)) return nguonc.getMoviesByCountryNguonC(params.country, params.page);
        return nguonc.getNewlyUpdatedMoviesNguonC(params.page);
    }
    if (source === "kkphim") {
        if (params.keyword) return kkphim.searchMoviesKKPhim(params.keyword, params.page);
        if (params.type && !Array.isArray(params.type)) return kkphim.getMoviesByTypeKKPhim(params.type, params.page, params.limit);
        if (params.category && !Array.isArray(params.category)) return kkphim.getMoviesByGenreKKPhim(params.category, params.page);
        if (params.country && !Array.isArray(params.country)) return kkphim.getMoviesByCountryKKPhim(params.country, params.page);
        return kkphim.getNewlyUpdatedMoviesKKPhim(params.page);
    }
    if (source === "vsmov") {
        if (params.keyword) return vsmov.searchMoviesVSMov(params.keyword, params.page);
        if (params.type && !Array.isArray(params.type)) return vsmov.getMoviesByTypeVSMov(params.type, params.page, params.limit);
        if (params.category && !Array.isArray(params.category)) return vsmov.getMoviesByGenreVSMov(params.category, params.page);
        if (params.country && !Array.isArray(params.country)) return vsmov.getMoviesByCountryVSMov(params.country, params.page);
        return vsmov.getNewlyUpdatedMoviesVSMov(params.page);
    }
    return ophim.advancedSearch(params);
}

// Delegate these specifically to ophim or nguonC as needed.
// These are mostly used for details which are source-dependent already via the slugs.
export { getMoviePeoples, getMovieDetailNguonC, getMovieDetailPhimApi, getCategories, getCountries, movieTypes } from "./ophim";
export { getMovieDetailVSMov } from "./vsmov";

