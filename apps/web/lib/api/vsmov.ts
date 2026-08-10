import { Movie } from "@/types/movie";

const getBaseUrl = () => {
    return "https://vsmov.com/api";
};

function normalizeImageUrl(value: unknown): string {
    if (typeof value !== "string" || value.trim() === "") return "";
    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
    } catch {
        return "";
    }
}

const filterNSFW = (movies: Movie[]) => {
    if (!movies) return [];
    return movies.filter(movie =>
        !movie.category?.some((cat: any) => cat.slug === "phim-18") &&
        !movie.name?.toLowerCase().includes("phim 18+") &&
        !movie.origin_name?.toLowerCase().includes("phim 18+")
    );
};

const VSMOV_TYPE_ENDPOINTS: Record<string, string> = {
    "phim-le": "danh-sach/phim-le",
    "phim-bo": "danh-sach/phim-bo",
    "phim-thuyet-minh": "danh-sach/thuyet-minh",
    "phim-long-tieng": "danh-sach/long-tieng",
};

export async function getNewlyUpdatedMoviesVSMov(page: number = 1) {
    try {
        const response = await fetch(`${getBaseUrl()}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { items: [] };
        const data = await response.json();
        if (data.items) {
            const filtered = filterNSFW(data.items);
            data.items = filtered.map((item: any) => ({
                ...item,
                _id: String(item._id || item.id),
                poster_url: normalizeImageUrl(item.poster_url),
                thumb_url: normalizeImageUrl(item.thumb_url),
            }));
        }
        return data;
    } catch (err) {
        console.error("Failed to fetch newly updated movies from VSMov:", err);
        return { items: [] };
    }
}

export async function getMoviesByTypeVSMov(type: string, page: number = 1, limit: number = 24) {
    try {
        const endpoint = VSMOV_TYPE_ENDPOINTS[type];
        if (!endpoint) return { data: { items: [] } };
        
        const response = await fetch(`${getBaseUrl()}/${endpoint}?page=${page}&limit=${limit}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const rawItems = data.items ? filterNSFW(data.items) : [];
        const items = rawItems.map((item: any) => ({
            ...item,
            _id: String(item._id || item.id),
            poster_url: normalizeImageUrl(item.poster_url),
            thumb_url: normalizeImageUrl(item.thumb_url),
        }));

        return {
            data: {
                items,
                params: {
                    pagination: {
                        totalItems: data.pagination?.totalItems || items.length,
                        totalItemsPerPage: Number(data.pagination?.totalItemsPerPage) || limit,
                        currentPage: data.pagination?.currentPage || page,
                        totalPages: data.pagination?.totalPages || 1,
                    }
                },
                titlePage: type.replace(/-/g, ' ').toUpperCase()
            }
        };
    } catch (err) {
        console.error(`Failed to fetch movies by type ${type} from VSMov:`, err);
        return { data: { items: [] } };
    }
}

export async function getMoviesByGenreVSMov(genreSlug: string, page: number = 1) {
    try {
        const response = await fetch(`${getBaseUrl()}/the-loai/${genreSlug}?page=${page}&limit=24`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const rawItems = data.items ? filterNSFW(data.items) : [];
        const items = rawItems.map((item: any) => ({
            ...item,
            _id: String(item._id || item.id),
            poster_url: normalizeImageUrl(item.poster_url),
            thumb_url: normalizeImageUrl(item.thumb_url),
        }));

        return {
            data: {
                items,
                params: {
                    pagination: {
                        totalItems: data.pagination?.totalItems || items.length,
                        totalItemsPerPage: Number(data.pagination?.totalItemsPerPage) || 24,
                        currentPage: data.pagination?.currentPage || page,
                        totalPages: data.pagination?.totalPages || 1,
                    }
                },
                titlePage: `THỂ LOẠI: ${genreSlug.replace(/-/g, ' ').toUpperCase()}`
            }
        };
    } catch (err) {
        console.error(`Failed to fetch movies by genre ${genreSlug} from VSMov:`, err);
        return { data: { items: [] } };
    }
}

export async function getMoviesByCountryVSMov(countrySlug: string, page: number = 1) {
    try {
        const response = await fetch(`${getBaseUrl()}/quoc-gia/${countrySlug}?page=${page}&limit=24`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const rawItems = data.items ? filterNSFW(data.items) : [];
        const items = rawItems.map((item: any) => ({
            ...item,
            _id: String(item._id || item.id),
            poster_url: normalizeImageUrl(item.poster_url),
            thumb_url: normalizeImageUrl(item.thumb_url),
        }));

        return {
            data: {
                items,
                params: {
                    pagination: {
                        totalItems: data.pagination?.totalItems || items.length,
                        totalItemsPerPage: Number(data.pagination?.totalItemsPerPage) || 24,
                        currentPage: data.pagination?.currentPage || page,
                        totalPages: data.pagination?.totalPages || 1,
                    }
                },
                titlePage: `QUỐC GIA: ${countrySlug.replace(/-/g, ' ').toUpperCase()}`
            }
        };
    } catch (err) {
        console.error(`Failed to fetch movies by country ${countrySlug} from VSMov:`, err);
        return { data: { items: [] } };
    }
}

export async function searchMoviesVSMov(keyword: string, page: number = 1) {
    try {
        const response = await fetch(`${getBaseUrl()}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=24`, {
            next: { revalidate: 60 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const rawItems = data.items ? filterNSFW(data.items) : [];
        const items = rawItems.map((item: any) => ({
            ...item,
            _id: String(item._id || item.id),
            poster_url: normalizeImageUrl(item.poster_url),
            thumb_url: normalizeImageUrl(item.thumb_url),
        }));

        return {
            data: {
                items,
                params: {
                    pagination: {
                        totalItems: data.pagination?.totalItems || items.length,
                        totalItemsPerPage: Number(data.pagination?.totalItemsPerPage) || 24,
                        currentPage: data.pagination?.currentPage || page,
                        totalPages: data.pagination?.totalPages || 1,
                    }
                },
                titlePage: `KẾT QUẢ TÌM KIẾM: ${keyword}`
            }
        };
    } catch (err) {
        console.error(`Failed to search movies on VSMov for keyword ${keyword}:`, err);
        return { data: { items: [] } };
    }
}

export async function getMovieDetailVSMov(slug: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/phim/${slug}`, {
            next: { revalidate: 3600 },
        }).catch((err) => {
            console.warn("VSMov API network request failed (probably CORS or offline):", err.message);
            return null;
        });

        if (!response || !response.ok) return null;
        const resJson = await response.json().catch(() => null);
        
        const movieItem = resJson?.movie;
        if (!movieItem) return null;

        if (movieItem.category?.some((cat: any) => cat.slug === "phim-18")) {
            return null; //restricted
        }

        // Map VSMov custom data structure to matching OPhim structure
        return {
            status: true,
            movie: {
                _id: String(movieItem._id || movieItem.id || movieItem.slug),
                name: movieItem.name,
                slug: movieItem.slug,
                origin_name: movieItem.origin_name || "",
                content: movieItem.content || "",
                thumb_url: normalizeImageUrl(movieItem.thumb_url),
                poster_url: normalizeImageUrl(movieItem.poster_url),
                time: movieItem.time || "",
                episode_current: movieItem.episode_current || "",
                episode_total: movieItem.episode_total || "",
                quality: movieItem.quality || "HD",
                lang: movieItem.lang || "",
                year: movieItem.year || new Date().getFullYear(),
                category: movieItem.category || [],
                country: movieItem.country || [],
                actor: movieItem.actor || [],
                director: movieItem.director || [],
            },
            episodes: (resJson.episodes || []).map((srv: any) => ({
                server_name: typeof srv.server_name === "string" ? srv.server_name.trim().replace(/\s+/g, " ") : "Default",
                server_data: (srv.server_data || []).map((ep: any) => ({
                    name: ep.name,
                    slug: ep.slug,
                    filename: ep.filename || ep.name,
                    link_embed: ep.link_embed || "",
                    link_m3u8: "" // VSMov only has link_embed
                }))
            }))
        };
    } catch (err) {
        console.warn(`Error fetching movie detail from VSMov for slug ${slug}:`, err);
        return null;
    }
}
