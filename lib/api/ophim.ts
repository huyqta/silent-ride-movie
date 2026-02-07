// OPhim API Service
const BASE_URL = process.env.NEXT_PUBLIC_OPHIM_API_URL || "https://ophim1.com";

// Helper function to build full image URL
export function getImageUrl(path: string): string {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `https://img.ophim.live/uploads/movies/${path}`;
}

// Fetch newly updated movies
export async function getNewlyUpdatedMovies(page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
}

// Fetch movies by type (phim-le, phim-bo, hoat-hinh, tv-shows, etc.)
export async function getMoviesByType(type: string, page: number = 1, limit: number = 24) {
    const response = await fetch(
        `${BASE_URL}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
}

// Fetch movies by genre
export async function getMoviesByGenre(genreSlug: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/the-loai/${genreSlug}?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
}

// Fetch movies by country
export async function getMoviesByCountry(countrySlug: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/quoc-gia/${countrySlug}?page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
}

// Search movies
export async function searchMovies(keyword: string, page: number = 1) {
    const response = await fetch(
        `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`,
        { next: { revalidate: 60 } }
    );
    if (!response.ok) throw new Error("Failed to search movies");
    return response.json();
}

// Fetch movie details by slug
export async function getMovieDetail(slug: string) {
    const response = await fetch(`${BASE_URL}/phim/${slug}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) throw new Error("Failed to fetch movie detail");
    return response.json();
}

// Fetch categories (genres)
export async function getCategories() {
    const response = await fetch(`${BASE_URL}/v1/api/the-loai`, {
        next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
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
