import { Movie } from "@/types/movie";

const NGUONC_API = "https://phim.nguonc.com/api";

// Mapping NguonC movie structure to our local Movie structure
const mapNguonCMovie = (item: any): Movie => ({
    _id: item.id || item.slug,
    name: item.name,
    slug: item.slug,
    origin_name: item.original_name,
    type: "series", // NguonC doesn't specify, we'll default to series
    thumb_url: item.thumb_url,
    poster_url: item.poster_url,
    sub_docquyen: false,
    chipiuliui: false,
    time: item.time || "",
    episode_current: item.current_episode || "",
    quality: item.quality || "HD",
    lang: item.language || "Vietsub",
    year: parseInt(item.created?.split('-')[0]) || new Date().getFullYear(),
    category: [],
    country: [],
});

const filterNSFW = (movies: Movie[]) => {
    if (!movies) return [];
    return movies.filter(movie =>
        !movie.name?.toLowerCase().includes("phim 18+") &&
        !movie.origin_name?.toLowerCase().includes("phim 18+")
    );
};

export async function getNewlyUpdatedMoviesNguonC(page: number = 1) {
    const response = await fetch(`${NGUONC_API}/films/phim-moi-cap-nhat?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { items: [] };
    const data = await response.json();
    
    const items = (data.items || []).map(mapNguonCMovie);
    const mappedData = {
        items: filterNSFW(items),
        paginate: data.paginate,
        status: data.status,
    };
    return mappedData;
}

export async function getMoviesByTypeNguonC(type: string, page: number = 1) {
    // NguonC categories: phim-sap-chieu, phim-dang-chieu, phim-tron-bo, phim-le, phim-bo, phim-viet-nam
    let slug = type;
    if (type === 'phim-moi') slug = 'phim-moi-cap-nhat';
    
    const response = await fetch(`${NGUONC_API}/films/danh-sach/${slug}?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    
    const items = (data.items || []).map(mapNguonCMovie);
    return {
        data: {
            items: filterNSFW(items),
            params: {
                pagination: {
                    totalItems: data.paginate?.total_items || 0,
                    totalItemsPerPage: data.paginate?.items_per_page || 10,
                    currentPage: data.paginate?.current_page || 1,
                    totalPages: data.paginate?.total_page || 1,
                }
            },
            titlePage: slug.replace(/-/g, ' ').toUpperCase()
        }
    };
}

export async function getMoviesByGenreNguonC(genreSlug: string, page: number = 1) {
    const response = await fetch(`${NGUONC_API}/films/the-loai/${genreSlug}?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    
    const items = (data.items || []).map(mapNguonCMovie);
    return {
        data: {
            items: filterNSFW(items),
            params: {
                pagination: {
                    totalItems: data.paginate?.total_items || 0,
                    totalItemsPerPage: data.paginate?.items_per_page || 10,
                    currentPage: data.paginate?.current_page || 1,
                    totalPages: data.paginate?.total_page || 1,
                }
            },
            titlePage: `THỂ LOẠI: ${genreSlug.replace(/-/g, ' ').toUpperCase()}`
        }
    };
}

export async function getMoviesByCountryNguonC(countrySlug: string, page: number = 1) {
    const response = await fetch(`${NGUONC_API}/films/quoc-gia/${countrySlug}?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    
    const items = (data.items || []).map(mapNguonCMovie);
    return {
        data: {
            items: filterNSFW(items),
            params: {
                pagination: {
                    totalItems: data.paginate?.total_items || 0,
                    totalItemsPerPage: data.paginate?.items_per_page || 10,
                    currentPage: data.paginate?.current_page || 1,
                    totalPages: data.paginate?.total_page || 1,
                }
            },
            titlePage: `QUỐC GIA: ${countrySlug.replace(/-/g, ' ').toUpperCase()}`
        }
    };
}

export async function searchMoviesNguonC(keyword: string, page: number = 1) {
    const response = await fetch(`${NGUONC_API}/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    
    const items = (data.items || []).map(mapNguonCMovie);
    return {
        data: {
            items: filterNSFW(items),
            params: {
                pagination: {
                    totalItems: data.paginate?.total_items || 0,
                    totalItemsPerPage: data.paginate?.items_per_page || 10,
                    currentPage: data.paginate?.current_page || 1,
                    totalPages: data.paginate?.total_page || 1,
                }
            },
            titlePage: `KẾT QUẢ: ${keyword}`
        }
    };
}
