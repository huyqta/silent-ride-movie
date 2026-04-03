import { Movie } from "@/types/movie";

const KKPHIM_API = "https://phimapi.com";
const KKPHIM_CDN = "https://phimimg.com";

const normalizeImageUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith("http")) return path;
    return `${KKPHIM_CDN}/${path}`;
};

const normalizeMovieImages = (movies: Movie[]) =>
    movies.map((m: any) => ({
        ...m,
        thumb_url: normalizeImageUrl(m.thumb_url),
        poster_url: normalizeImageUrl(m.poster_url),
    }));

// KKPhim uses the same response structure as OPhim
const filterNSFW = (movies: Movie[]) => {
    if (!movies) return [];
    return movies.filter(movie =>
        !movie.category?.some((cat: any) => cat.slug === "phim-18") &&
        !movie.name?.toLowerCase().includes("phim 18+") &&
        !movie.origin_name?.toLowerCase().includes("phim 18+")
    );
};

export async function getNewlyUpdatedMoviesKKPhim(page: number = 1) {
    const response = await fetch(`${KKPHIM_API}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { items: [] };
    const data = await response.json();
    if (data.items) {
        data.items = normalizeMovieImages(filterNSFW(data.items));
    }
    return data;
}

export async function getMoviesByTypeKKPhim(type: string, page: number = 1, limit: number = 24) {
    const response = await fetch(`${KKPHIM_API}/v1/api/danh-sach/${type}?page=${page}&limit=${limit}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = normalizeMovieImages(filterNSFW(data.data.items));
    }
    return data;
}

export async function getMoviesByGenreKKPhim(genreSlug: string, page: number = 1) {
    const response = await fetch(`${KKPHIM_API}/v1/api/the-loai/${genreSlug}?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = normalizeMovieImages(filterNSFW(data.data.items));
    }
    return data;
}

export async function getMoviesByCountryKKPhim(countrySlug: string, page: number = 1) {
    const response = await fetch(`${KKPHIM_API}/v1/api/quoc-gia/${countrySlug}?page=${page}`, {
        next: { revalidate: 3600 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = normalizeMovieImages(filterNSFW(data.data.items));
    }
    return data;
}

export async function searchMoviesKKPhim(keyword: string, page: number = 1) {
    const response = await fetch(`${KKPHIM_API}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`, {
        next: { revalidate: 60 },
    });
    if (!response.ok) return { data: { items: [] } };
    const data = await response.json();
    if (data.data?.items) {
        data.data.items = normalizeMovieImages(filterNSFW(data.data.items));
    }
    return data;
}
