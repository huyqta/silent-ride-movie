/**
 * unified.ts — D1-backed version
 * Đọc dữ liệu từ D1 thay vì gọi thẳng 3 API nguồn.
 * Giữ nguyên interface cũ để các pages không cần sửa.
 */

export {
  getNewlyUpdatedMoviesD1   as getNewlyUpdatedMovies,
  getMoviesByTypeD1         as getMoviesByType,
  getMoviesByGenreD1        as getMoviesByGenre,
  getMoviesByCountryD1      as getMoviesByCountry,
  searchMoviesD1            as searchMovies,
} from "./d1";

// Detail functions vẫn cần — re-export từ ophim cho fallback
// Sẽ được swap sang d1 ở bước sau khi đủ dữ liệu
export {
  getMovieDetail,
  getImageUrl,
  getMoviePeoples,
  getMovieDetailNguonC,
  getMovieDetailPhimApi,
  getCategories,
  getCountries,
  movieTypes,
} from "./ophim";
