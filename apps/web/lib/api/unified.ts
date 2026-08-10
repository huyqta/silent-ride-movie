import * as ophim from "./ophim";
import * as nguonc from "./nguonc";
import * as kkphim from "./kkphim";
import * as vsmov from "./vsmov";

type Source = "ophim" | "nguonc" | "kkphim" | "vsmov";
type HeaderItem = { name: string; slug: string };

const DEFAULT_GENRE_FALLBACK = "https://phimapi.com/the-loai";
const DEFAULT_COUNTRY_FALLBACK = "https://ophim1.com/v1/api/quoc-gia";

const SOURCE_MOVIE_TYPES: Record<Source, HeaderItem[]> = {
    ophim: [
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Phim Vietsub", slug: "phim-vietsub" },
        // { name: "Thuyết Minh", slug: "phim-thuyet-minh" },
        // { name: "Lồng Tiếng", slug: "phim-long-tieng" },
        { name: "Chiếu Rạp", slug: "phim-chieu-rap" },
        { name: "Subteam", slug: "subteam" },
    ],
    nguonc: [
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Đang Chiếu", slug: "dang-chieu" },
    ],
    kkphim: [
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "TV Shows", slug: "tv-shows" },
        { name: "Phim Vietsub", slug: "phim-vietsub" },
        { name: "Thuyết Minh", slug: "phim-thuyet-minh" },
        { name: "Lồng Tiếng", slug: "phim-long-tieng" },
        { name: "Chiếu Rạp", slug: "phim-chieu-rap" },
        { name: "Subteam", slug: "subteam" },
        { name: "Phim Sắp Chiếu", slug: "phim-sap-chieu" },
    ],
    vsmov: [
        { name: "Thuyết Minh", slug: "phim-thuyet-minh" },
        { name: "Lồng Tiếng", slug: "phim-long-tieng" },
    ],
};

const ALL_SOURCE_MOVIE_TYPES: HeaderItem[] = [
    { name: "Phim Lẻ", slug: "phim-le" },
    { name: "Phim Bộ", slug: "phim-bo" },
    { name: "Phim Mới", slug: "phim-moi" },
    ...SOURCE_MOVIE_TYPES.ophim,
    ...SOURCE_MOVIE_TYPES.nguonc,
    ...SOURCE_MOVIE_TYPES.kkphim,
    ...SOURCE_MOVIE_TYPES.vsmov,
    { name: "Phim Bộ Đang Chiếu", slug: "phim-bo-dang-chieu" },
    { name: "Phim Bộ Hoàn Thành", slug: "phim-bo-hoan-thanh" },
];

function dedupeItems(items: HeaderItem[]) {
    const uniqueItems = new Map<string, HeaderItem>();

    items.forEach((item) => {
        const slug = item?.slug?.trim();
        const name = item?.name?.trim();
        if (!slug || !name) return;

        const key = slug.toLowerCase();
        if (!uniqueItems.has(key)) {
            uniqueItems.set(key, { slug, name });
        }
    });

    return Array.from(uniqueItems.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

function normalizeSearchText(value: unknown) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}

async function fetchHeaderCollection(url: string, stripAdultGenre: boolean = false) {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) {
        throw new Error(`Failed to fetch header collection from ${url}`);
    }

    const data = await response.json();
    const items = Array.isArray(data?.data?.items)
        ? data.data.items
        : Array.isArray(data?.items)
            ? data.items
            : [];

    if (items.length === 0) {
        throw new Error(`Header collection returned 0 items from ${url}`);
    }

    const normalizedItems = items
        .map((item: any) => ({
            name: item?.name ?? "",
            slug: item?.slug ?? "",
        }))
        .filter((item: HeaderItem) => item.name && item.slug)
        .filter((item: HeaderItem) => !stripAdultGenre || item.slug !== "phim-18");

    if (normalizedItems.length === 0) {
        throw new Error(`Header collection normalized to 0 items from ${url}`);
    }

    return {
        ...data,
        data: {
            ...(data?.data ?? {}),
            items: normalizedItems,
        },
    };
}

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
        ophim: tag(opData?.data?.items, "ophim"),
        nguonc: tag(ncData?.data?.items, "nguonc"),
        kkphim: tag(kkData?.data?.items, "kkphim"),
        vsmov: tag(vsData?.data?.items, "vsmov"),
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
    return getMovieDetailBySource(slug, source);
}

export async function getMovieDetailBySource(
    slug: string,
    source: "ophim" | "nguonc" | "kkphim" | "vsmov"
) {
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
    const page = params.page || 1;
    const limit = params.limit || 24;
    const keyword = (params.keyword || "").trim();
    const normalizedKeyword = normalizeSearchText(keyword);
    const categories = Array.isArray(params.category) ? params.category : params.category ? [params.category] : [];
    const countries = Array.isArray(params.country) ? params.country : params.country ? [params.country] : [];
    const types = Array.isArray(params.type) ? params.type : params.type ? [params.type] : [];
    const years = Array.isArray(params.year) ? params.year : params.year ? [params.year] : [];

    const toItems = (result: any) => result?.data?.items || result?.items || [];

    const fetchBySource = async (source: Source) => {
        const requests: Promise<any>[] = [];

        if (types.length > 0) {
            for (const type of types) {
                if (source === "ophim") requests.push(ophim.getMoviesByType(type, page, limit));
                if (source === "nguonc") requests.push(nguonc.getMoviesByTypeNguonC(type, page));
                if (source === "kkphim") requests.push(kkphim.getMoviesByTypeKKPhim(type, page, limit));
                if (source === "vsmov") requests.push(vsmov.getMoviesByTypeVSMov(type, page, limit));
            }
        } else if (categories.length > 0) {
            for (const category of categories) {
                if (source === "ophim") requests.push(ophim.getMoviesByGenre(category, page));
                if (source === "nguonc") requests.push(nguonc.getMoviesByGenreNguonC(category, page));
                if (source === "kkphim") requests.push(kkphim.getMoviesByGenreKKPhim(category, page));
                if (source === "vsmov") requests.push(vsmov.getMoviesByGenreVSMov(category, page));
            }
        } else if (countries.length > 0) {
            for (const country of countries) {
                if (source === "ophim") requests.push(ophim.getMoviesByCountry(country, page));
                if (source === "nguonc") requests.push(nguonc.getMoviesByCountryNguonC(country, page));
                if (source === "kkphim") requests.push(kkphim.getMoviesByCountryKKPhim(country, page));
                if (source === "vsmov") requests.push(vsmov.getMoviesByCountryVSMov(country, page));
            }
        } else if (keyword) {
            if (source === "ophim") requests.push(ophim.searchMovies(keyword, page));
            if (source === "nguonc") requests.push(nguonc.searchMoviesNguonC(keyword, page));
            if (source === "kkphim") requests.push(kkphim.searchMoviesKKPhim(keyword, page));
            if (source === "vsmov") requests.push(vsmov.searchMoviesVSMov(keyword, page));
        } else {
            if (source === "ophim") requests.push(ophim.getNewlyUpdatedMovies(page));
            if (source === "nguonc") requests.push(nguonc.getNewlyUpdatedMoviesNguonC(page));
            if (source === "kkphim") requests.push(kkphim.getNewlyUpdatedMoviesKKPhim(page));
            if (source === "vsmov") requests.push(vsmov.getNewlyUpdatedMoviesVSMov(page));
        }

        const results = await Promise.all(requests.map((request) => request.catch(() => ({ data: { items: [] }, items: [] }))));

        return results.flatMap((result) =>
            toItems(result).map((item: any) => ({
                ...item,
                _source: item?._source || source,
            }))
        );
    };

    const [ophimItems, nguoncItems, kkphimItems, vsmovItems] = await Promise.all([
        fetchBySource("ophim"),
        fetchBySource("nguonc"),
        fetchBySource("kkphim"),
        fetchBySource("vsmov"),
    ]);

    const allItems = [...ophimItems, ...nguoncItems, ...kkphimItems, ...vsmovItems];

    const filteredItems = allItems.filter((item: any) => {
        const itemName = normalizeSearchText(`${item?.name || ""} ${item?.origin_name || ""}`);
        const itemYear = String(item?.year || "");
        const itemCategories = Array.isArray(item?.category) ? item.category : [];
        const itemCountries = Array.isArray(item?.country) ? item.country : [];

        const keywordMatch = !normalizedKeyword || itemName.includes(normalizedKeyword);
        const yearMatch = years.length === 0 || years.includes(itemYear);
        const categoryMatch =
            categories.length === 0 ||
            itemCategories.some((category: any) => categories.includes(category?.slug) || categories.includes(category?.name));
        const countryMatch =
            countries.length === 0 ||
            itemCountries.some((country: any) => countries.includes(country?.slug) || countries.includes(country?.name));

        return keywordMatch && yearMatch && categoryMatch && countryMatch;
    });

    const uniqueItemsMap = new Map<string, any>();
    filteredItems.forEach((item: any) => {
        const key = `${item?._source || "unknown"}:${item?.slug || item?._id || item?.name}`;
        if (!uniqueItemsMap.has(key)) {
            uniqueItemsMap.set(key, item);
        }
    });

    const uniqueItems = Array.from(uniqueItemsMap.values());

    return {
        data: {
            items: uniqueItems,
            params: {
                pagination: {
                    totalItems: uniqueItems.length,
                    totalItemsPerPage: limit,
                    currentPage: page,
                    totalPages: Math.ceil(uniqueItems.length / limit) || 1,
                },
            },
        },
    };
}

export async function getCategories() {
    const source = getSource();

    try {
        if (source === "ophim") {
            return await fetchHeaderCollection("https://ophim1.com/v1/api/the-loai", true);
        }
        if (source === "nguonc") {
            return await fetchHeaderCollection("https://phimapi.com/the-loai", true);
        }
        if (source === "kkphim") {
            return await fetchHeaderCollection("https://phimapi.com/the-loai", true);
        }
        return await fetchHeaderCollection("https://vsmov.com/api/the-loai", true);
    } catch (error) {
        console.warn(`Falling back genres to ${DEFAULT_GENRE_FALLBACK}:`, error);
        return fetchHeaderCollection(DEFAULT_GENRE_FALLBACK, true);
    }
}

export async function getCountries() {
    const source = getSource();

    try {
        if (source === "ophim") {
            return await fetchHeaderCollection("https://ophim1.com/v1/api/quoc-gia");
        }
        if (source === "nguonc") {
            return await fetchHeaderCollection("https://ophim1.com/v1/api/quoc-gia");
        }
        if (source === "kkphim") {
            return await fetchHeaderCollection("https://phimapi.com/quoc-gia");
        }
        return await fetchHeaderCollection("https://vsmov.com/api/quoc-gia");
    } catch (error) {
        console.warn(`Falling back countries to ${DEFAULT_COUNTRY_FALLBACK}:`, error);
        return fetchHeaderCollection(DEFAULT_COUNTRY_FALLBACK);
    }
}

export function getHeaderMovieTypes(source?: Source) {
    return SOURCE_MOVIE_TYPES[source || getSource()] || [];
}

export async function getAllCategories() {
    const results = await Promise.allSettled([
        fetchHeaderCollection("https://ophim1.com/v1/api/the-loai", true),
        fetchHeaderCollection("https://phimapi.com/the-loai", true),
        fetchHeaderCollection("https://vsmov.com/api/the-loai", true),
    ]);

    const items = results.flatMap((result) =>
        result.status === "fulfilled" ? (result.value?.data?.items || []) : []
    );

    return {
        data: {
            items: dedupeItems(items),
        },
    };
}

export async function getAllCountries() {
    const results = await Promise.allSettled([
        fetchHeaderCollection("https://ophim1.com/v1/api/quoc-gia"),
        fetchHeaderCollection("https://phimapi.com/quoc-gia"),
        fetchHeaderCollection("https://vsmov.com/api/quoc-gia"),
    ]);

    const items = results.flatMap((result) =>
        result.status === "fulfilled" ? (result.value?.data?.items || []) : []
    );

    return {
        data: {
            items: dedupeItems(items),
        },
    };
}

export function getAllMovieTypes() {
    return dedupeItems(ALL_SOURCE_MOVIE_TYPES);
}

// Delegate these specifically to ophim or nguonC as needed.
// These are mostly used for details which are source-dependent already via the slugs.
export { getMoviePeoples, getMovieDetailNguonC, getMovieDetailPhimApi, movieTypes } from "./ophim";
export { getMovieDetailVSMov } from "./vsmov";
