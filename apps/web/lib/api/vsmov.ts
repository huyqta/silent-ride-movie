import { Movie } from "@/types/movie";

const VSMOV_API = "https://vsmov.com/api";

const filterNSFW = (movies: Movie[]) => {
    if (!movies) return [];
    return movies.filter(movie =>
        !movie.category?.some((cat: any) => cat.slug === "phim-18") &&
        !movie.name?.toLowerCase().includes("phim 18+") &&
        !movie.origin_name?.toLowerCase().includes("phim 18+")
    );
};

export async function getNewlyUpdatedMoviesVSMov(page: number = 1) {
    try {
        const response = await fetch(`${VSMOV_API}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { items: [] };
        const data = await response.json();
        if (data.items) {
            data.items = filterNSFW(data.items);
        }
        return data;
    } catch (err) {
        console.error("Failed to fetch newly updated movies from VSMov:", err);
        return { items: [] };
    }
}

export async function getMoviesByTypeVSMov(type: string, page: number = 1, limit: number = 24) {
    try {
        // VSMov types can be mapped or used directly.
        // OPhim sends: phim-le, phim-bo, hoat-hinh, tv-shows, etc.
        // Let's check: /the-loai/slug or type parameters if any, but since the API provided does the-loai & quoc-gia,
        // let's check if the type is series / single or if we need to call `/the-loai/type`
        let endpoint = `danh-sach/${type}`;
        if (type === 'phim-le') {
            endpoint = `danh-sach/phim-le`;
        } else if (type === 'phim-bo') {
            endpoint = `danh-sach/phim-bo`;
        }
        // Let's query
        const response = await fetch(`${VSMOV_API}/${endpoint}?page=${page}&limit=${limit}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const items = data.items ? filterNSFW(data.items) : [];
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
        const response = await fetch(`${VSMOV_API}/the-loai/${genreSlug}?page=${page}&limit=24`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const items = data.items ? filterNSFW(data.items) : [];
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
        const response = await fetch(`${VSMOV_API}/quoc-gia/${countrySlug}?page=${page}&limit=24`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const items = data.items ? filterNSFW(data.items) : [];
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
        const response = await fetch(`${VSMOV_API}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=24`, {
            next: { revalidate: 60 },
        });
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        
        const items = data.items ? filterNSFW(data.items) : [];
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
        const response = await fetch(`${VSMOV_API}/phim/${slug}`, {
            next: { revalidate: 3600 },
        }).catch((err) => {
            console.warn("VSMov API network request failed (probably CORS or offline):", err.message);
            return null;
        });

        if (!response || !response.ok) return null;
        const resJson = await response.json().catch(() => null);
        
        // VSMov response format has the item inside "data.item"
        const movieItem = resJson?.data?.item;
        if (!movieItem) return null;

        if (movieItem.category?.some((cat: any) => cat.slug === "phim-18")) {
            return null; //restricted
        }

        // Map VSMov custom data structure to matching OPhim structure
        return {
            status: true,
            movie: {
                _id: movieItem.id || movieItem.slug,
                name: movieItem.name,
                slug: movieItem.slug,
                origin_name: movieItem.origin_name || "",
                content: movieItem.content || "",
                thumb_url: movieItem.thumb_url || "",
                poster_url: movieItem.poster_url || "",
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
            episodes: movieItem.episodes || []
        };
    } catch (err) {
        console.warn(`Error fetching movie detail from VSMov for slug ${slug}:`, err);
        return null;
    }
}
