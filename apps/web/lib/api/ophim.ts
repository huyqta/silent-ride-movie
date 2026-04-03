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

// Fetch newly updated movies
export async function getNewlyUpdatedMovies(page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    if (data.items) {
        data.items = filterNSFW(data.items);
    }
    return data;
}

// Fetch movies by type (phim-le, phim-bo, hoat-hinh, tv-shows, etc.)
export async function getMoviesByType(type: string, page: number = 1, limit: number = 24) {
    const response = await fetch(
        `${BASE_URL}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = filterNSFW(data.data.items);
    }
    return data;
}

// Fetch movies by genre
export async function getMoviesByGenre(genreSlug: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/the-loai/${genreSlug}?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = filterNSFW(data.data.items);
    }
    return data;
}

// Fetch movies by country
export async function getMoviesByCountry(countrySlug: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/quoc-gia/${countrySlug}?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = filterNSFW(data.data.items);
    }
    return data;
}

// Search movies
export async function searchMovies(keyword: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
        { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error("Failed to search movies");
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = filterNSFW(data.data.items);
    }
    return data;
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
        endpoint = `danh-sach/${typeStr}`;
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
    if (data.data?.items) {
        data.data.items = filterNSFW(data.data.items);
    }
    return data;
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
