import * as ophim from "./ophim";
import * as nguonc from "./nguonc";
import * as kkphim from "./kkphim";
import * as vsmov from "./vsmov";

type Source = "ophim" | "nguonc" | "kkphim" | "vsmov";

const getSource = (): Source => {
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

export async function searchMovies(q: string, page: number = 1) {
    const source = getSource();
    if (source === "nguonc") return nguonc.searchMoviesNguonC(q, page);
    if (source === "kkphim") return kkphim.searchMoviesKKPhim(q, page);
    if (source === "vsmov") return vsmov.searchMoviesVSMov(q, page);
    return ophim.searchMovies(q, page);
}

// Delegate these specifically to ophim or nguonC as needed.
// These are mostly used for details which are source-dependent already via the slugs.
export { getMovieDetail, getImageUrl, getMoviePeoples, getMovieDetailNguonC, getMovieDetailPhimApi, getCategories, getCountries, movieTypes } from "./ophim";
export { getMovieDetailVSMov } from "./vsmov";

