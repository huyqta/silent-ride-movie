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
        let endpoint = `the-loai/${type}`;
        if (type === 'phim-le') {
            endpoint = `the-loai/phim-le`; // or check if type=single works on year/genre
        } else if (type === 'phim-bo') {
            endpoint = `the-loai/phim-bo`;
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
        });
        if (!response.ok) return null;
        const data = await response.json();
        
        if (data.movie?.category?.some((cat: any) => cat.slug === "phim-18")) {
            return null; //restricted
        }
        return data;
    } catch (err) {
        console.error(`Error fetching movie detail from VSMov for slug ${slug}:`, err);
        return null;
    }
}
