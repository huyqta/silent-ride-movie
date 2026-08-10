// OPhim API Service
const BASE_URL = process.env.NEXT_PUBLIC_OPHIM_API_URL || "https://ophim1.com";

import { Movie } from "@/types/movie";

// Helper function to build full image URL
export function getImageUrl(path: string): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `https://img.ophim.live/uploads/movies/${path}`;
}

// Global NSFW Filter
const filterNSFW = (movies: Movie[]) => {
    if (!movies) return [];
    return movies.filter(movie =>
        !movie.category?.some(cat => cat.slug === "phim-18") &&
        !movie.name?.toLowerCase().includes("phim 18+") &&
        !movie.origin_name?.toLowerCase().includes("phim 18+")
    );
};

type OPhimListResponse = {
    status?: string;
    items?: Movie[];
    pagination?: Record<string, unknown>;
    data?: {
        items?: Movie[];
        params?: Record<string, unknown>;
        titlePage?: string;
    };
};

const O_PHIM_TYPE_ENDPOINTS: Record<string, string> = {
    "phim-le": "/v1/api/danh-sach/phim-le",
    "phim-bo": "/v1/api/danh-sach/phim-bo",
    "hoat-hinh": "/v1/api/danh-sach/hoat-hinh",
    "tv-shows": "/v1/api/danh-sach/tv-shows",
    "phim-chieu-rap": "/v1/api/danh-sach/phim-chieu-rap",
    "phim-vietsub": "/v1/api/danh-sach/phim-vietsub",
    // "phim-long-tieng": "/v1/api/danh-sach/phim-long-tieng",
    // "phim-thuyet-minh": "/v1/api/danh-sach/phim-thuyet-minh",
    "subteam": "/v1/api/danh-sach/subteam",
};

function normalizeListResponse(data: OPhimListResponse, page: number, limit: number, type: string) {
    if (data?.data?.items) {
        data.data.items = filterNSFW(data.data.items);
        return data;
    }

    const items = filterNSFW(data?.items || []);
    return {
        ...data,
        data: {
            items,
            params: {
                pagination: {
                    totalItems: Number(data?.pagination?.["totalItems"]) || items.length,
                    totalItemsPerPage: Number(data?.pagination?.["totalItemsPerPage"]) || limit,
                    currentPage: Number(data?.pagination?.["currentPage"]) || page,
                    totalPages: Number(data?.pagination?.["totalPages"]) || 1,
                },
            },
            titlePage: data?.data?.titlePage || type.replace(/-/g, " ").toUpperCase(),
        },
    };
}

// Fetch newly updated movies
export async function getNewlyUpdatedMovies(page: number = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) return { items: [] };
        const data = await response.json();
        if (data.items) {
            data.items = filterNSFW(data.items);
        }
        return data;
    } catch (err) {
        console.error("Failed to fetch newly updated movies:", err);
        return { items: [] };
    }
}

// Fetch movies by type (phim-le, phim-bo, hoat-hinh, tv-shows, etc.)
export async function getMoviesByType(type: string, page: number = 1, limit: number = 24) {
    try {
        const endpoint = O_PHIM_TYPE_ENDPOINTS[type];
        if (!endpoint) {
            return { data: { items: [] } };
        }

        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await fetch(
            `${BASE_URL}${endpoint}${separator}page=${page}&limit=${limit}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        return normalizeListResponse(data, page, limit, type);
    } catch (err) {
        console.error(`Failed to fetch movies by type ${type}:`, err);
        return { data: { items: [] } };
    }
}

// Fetch movies by genre
export async function getMoviesByGenre(genreSlug: string, page: number = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/v1/api/the-loai/${genreSlug}?page=${page}`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        if (data.data?.items) {
            data.data.items = filterNSFW(data.data.items);
        }
        return data;
    } catch (err) {
        console.error(`Failed to fetch movies by genre ${genreSlug}:`, err);
        return { data: { items: [] } };
    }
}

// Fetch movies by country
export async function getMoviesByCountry(countrySlug: string, page: number = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/v1/api/quoc-gia/${countrySlug}?page=${page}`,
            { next: { revalidate: 3600 } }
        );
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        if (data.data?.items) {
            data.data.items = filterNSFW(data.data.items);
        }
        return data;
    } catch (err) {
        console.error(`Failed to fetch movies by country ${countrySlug}:`, err);
        return { data: { items: [] } };
    }
}

// Search movies
export async function searchMovies(keyword: string, page: number = 1) {
    try {
        const response = await fetch(
            `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
            { next: { revalidate: 60 } }
        );
        if (!response.ok) return { data: { items: [] } };
        const data = await response.json();
        if (data.data?.items) {
            data.data.items = filterNSFW(data.data.items);
        }
        return data;
    } catch (err) {
        console.error(`Failed to search movies for keyword ${keyword}:`, err);
        return { data: { items: [] } };
    }
}

// Advanced Search / Filter movies
export async function advancedSearch(params: {
    keyword?: string;
    category?: string | string[];
    country?: string | string[];
    year?: string | string[];
    type?: string | string[];
    page?: number;
    limit?: number;
}) {
    const {
        keyword = "",
        category = "",
        country = "",
        year = "",
        type = "",
        page = 1,
        limit = 24
    } = params;

    // Helper to format values as comma-separated string
    const formatValue = (val: string | string[]) => {
        if (Array.isArray(val)) return val.join(",");
        return val;
    };

    const catStr = formatValue(category);
    const countryStr = formatValue(country);
    const yearStr = formatValue(year);
    const typeStr = formatValue(type);

    // Build query string
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (keyword) queryParams.append("keyword", keyword);
    if (catStr) queryParams.append("category", catStr);
    if (countryStr) queryParams.append("country", countryStr);
    if (yearStr) queryParams.append("year", yearStr);

    // Determine base endpoint
    // Priority: type -> category -> country -> year -> search
    let endpoint = "tim-kiem";
    if (typeStr && !typeStr.includes(",")) {
        const ophimEndpoint = O_PHIM_TYPE_ENDPOINTS[typeStr];
        endpoint = ophimEndpoint
            ? ophimEndpoint.replace(/^\//, "").replace(/^v1\/api\//, "")
            : "tim-kiem";
    } else if (catStr && !catStr.includes(",")) {
        endpoint = `the-loai/${catStr}`;
    } else if (countryStr && !countryStr.includes(",")) {
        endpoint = `quoc-gia/${countryStr}`;
    } else if (yearStr && !yearStr.includes(",")) {
        endpoint = `nam-phat-hanh/${yearStr}`;
    }

    const response = await fetch(
        `${BASE_URL}/v1/api/${endpoint}?${queryParams.toString()}`,
        { next: { revalidate: 3600 } }
    );

    if (!response.ok) throw new Error("Failed to search movies");
    const data = await response.json();
    return normalizeListResponse(data, page, limit, typeStr || "tim-kiem");
}

// Fetch movie details by slug
export async function getMovieDetail(slug: string) {
    const response = await fetch(`${BASE_URL}/phim/${slug}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Failed to fetch movie detail");
    const data = await response.json();

    // Safety check for detail page
    if (data.movie?.category?.some((cat: any) => cat.slug === "phim-18")) {
        throw new Error("This content is restricted.");
    }

    return data;
}

// Fetch movie peoples (actors/crew with images) by slug
export async function getMoviePeoples(slug: string) {
    const response = await fetch(`${BASE_URL}/v1/api/phim/${slug}/peoples`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Failed to fetch movie peoples");
    return response.json();
}

// Fetch movie details from NguonC API by slug
export async function getMovieDetailNguonC(slug: string) {
    try {
        const response = await fetch(`https://phim.nguonc.com/api/film/${slug}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Error fetching from NguonC:", error);
        return null;
    }
}

// Fetch movie details from PhimApi by slug
export async function getMovieDetailPhimApi(slug: string) {
    try {
        const response = await fetch(`https://phimapi.com/phim/${slug}`, {
            next: { revalidate: 3600 },
        });
        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error("Error fetching from PhimApi:", error);
        return null;
    }
}

// Fetch categories (genres)
export async function getCategories() {
    const response = await fetch(`${BASE_URL}/v1/api/the-loai`, {
        next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = data.data.items.filter((cat: any) => cat.slug !== "phim-18");
    }
    return data;
}

// Fetch countries
export async function getCountries() {
    const response = await fetch(`${BASE_URL}/v1/api/quoc-gia`, {
        next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("Failed to fetch countries");
    return response.json();
}

// Movie types for navigation and homepage
export const movieTypes = [
    { name: "Phim Mới", slug: "phim-moi", icon: "Sparkles" },
    { name: "Phim Lẻ", slug: "phim-le", icon: "Film" },
    { name: "Phim Bộ", slug: "phim-bo", icon: "Tv" },
    { name: "Hoạt Hình", slug: "hoat-hinh", icon: "Gamepad2" },
    { name: "TV Shows", slug: "tv-shows", icon: "Monitor" },
    { name: "Vietsub", slug: "phim-vietsub", icon: "Languages" },
    { name: "Thuyết Minh", slug: "phim-thuyet-minh", icon: "Mic2" },
    { name: "Lồng Tiếng", slug: "phim-long-tieng", icon: "Volume2" },
    { name: "Bộ Đang Chiếu", slug: "phim-bo-dang-chieu", icon: "PlayCircle" },
    { name: "Bộ Hoàn Thành", slug: "phim-bo-hoan-thanh", icon: "CheckCircle2" },
    { name: "Sắp Chiếu", slug: "phim-sap-chieu", icon: "Calendar" },
    { name: "Chiếu Rạp", slug: "phim-chieu-rap", icon: "Ticket" },
    { name: "Subteam", slug: "subteam", icon: "Users" },
];
