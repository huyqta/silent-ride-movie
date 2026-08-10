import HeroBanner from "@/components/movie/HeroBanner";
import MovieSlider from "@/components/movie/MovieSlider";
import { HeroSkeleton } from "@/components/ui/Skeleton";
import { getNewlyUpdatedMovies, getMoviesByType } from "@/lib/api/unified";

async function getHomeData() {
  const [
    newMovies,
    singleMovies,
    seriesMovies,
    animeMovies,
    tvShows,
    vietsubMovies,
    thuyetMinhMovies,
    longTiengMovies,
    boDangChieu,
    boHoanThanh,
    sapChieu,
    subteam,
    chieuRap,
  ] = await Promise.all([
    getNewlyUpdatedMovies(1).catch(() => ({ items: [] })),
    getMoviesByType("phim-le", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-bo", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("hoat-hinh", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("tv-shows", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-vietsub", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-thuyet-minh", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-long-tieng", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-bo-dang-chieu", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-bo-hoan-thanh", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-sap-chieu", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("subteam", 1).catch(() => ({ data: { items: [] } })),
    getMoviesByType("phim-chieu-rap", 1).catch(() => ({ data: { items: [] } })),
  ]);

  return {
    newMovies: newMovies?.items || [],
    singleMovies: singleMovies?.data?.items || [],
    seriesMovies: seriesMovies?.data?.items || [],
    animeMovies: animeMovies?.data?.items || [],
    tvShows: tvShows?.data?.items || [],
    vietsubMovies: vietsubMovies?.data?.items || [],
    thuyetMinhMovies: thuyetMinhMovies?.data?.items || [],
    longTiengMovies: longTiengMovies?.data?.items || [],
    boDangChieu: boDangChieu?.data?.items || [],
    boHoanThanh: boHoanThanh?.data?.items || [],
    sapChieu: sapChieu?.data?.items || [],
    subteam: subteam?.data?.items || [],
    chieuRap: chieuRap?.data?.items || [],
  };
}

export default async function HomePage() {
  const data = await getHomeData();
  const { newMovies } = data;
  const heroMovie = newMovies[0];

  const sections = [
    { title: "🔥 Phim mới cập nhật", movies: data.newMovies, href: "/danh-sach/phim-moi" },
    { title: "🎬 Phim Lẻ", movies: data.singleMovies, href: "/danh-sach/phim-le" },
    { title: "📺 Phim Bộ", movies: data.seriesMovies, href: "/danh-sach/phim-bo" },
    { title: "✨ Hoạt Hình", movies: data.animeMovies, href: "/danh-sach/hoat-hinh" },
    { title: "📡 TV Shows", movies: data.tvShows, href: "/danh-sach/tv-shows" },
    { title: "📽️ Phim Chiếu Rạp", movies: data.chieuRap, href: "/danh-sach/phim-chieu-rap" },
    { title: "🌐 Phim Vietsub", movies: data.vietsubMovies, href: "/danh-sach/phim-vietsub" },
    { title: "🎙️ Thuyết Minh", movies: data.thuyetMinhMovies, href: "/danh-sach/phim-thuyet-minh" },
    { title: "🔊 Lồng Tiếng", movies: data.longTiengMovies, href: "/danh-sach/phim-long-tieng" },
    { title: "🔄 Bộ Đang Chiếu", movies: data.boDangChieu, href: "/danh-sach/phim-bo-dang-chieu" },
    { title: "✅ Bộ Hoàn Thành", movies: data.boHoanThanh, href: "/danh-sach/phim-bo-hoan-thanh" },
    { title: "📅 Sắp Chiếu", movies: data.sapChieu, href: "/danh-sach/phim-sap-chieu" },
    { title: "👥 Subteam", movies: data.subteam, href: "/danh-sach/subteam" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {heroMovie ? (
        <HeroBanner movie={heroMovie} />
      ) : (
        <HeroSkeleton />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 space-y-2 pb-12">
        {sections.map((section) => (
          section.movies.length > 0 && (
            <MovieSlider
              key={section.href}
              title={section.title}
              movies={section.movies.slice(0, 12)}
              href={section.href}
            />
          )
        ))}
      </div>
    </div>
  );
}
