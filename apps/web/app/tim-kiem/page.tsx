"use client";

import { useSearchParams } from "next/navigation";
import { searchMovies } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SearchForm from "./SearchForm";
import SplashScreen from "@/components/ui/SplashScreen";
import { useMovieData } from "@/lib/hooks/use-movie-data";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";
    const page = Number.parseInt(searchParams.get("page") || "1", 10);

    const { data, loading } = useMovieData(
        q ? `search-${q}-p${page}` : null,
        () => searchMovies(q, page)
    );

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalItems = (pagination as any).totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Tìm kiếm phim</h1>

            <SearchForm initialQuery={q} />

            {q ? (
                loading ? (
                    <SplashScreen />
                ) : (
                    <>
                        <p className="text-foreground-secondary mb-6">
                            {movies.length > 0
                                ? `Tìm thấy ${totalItems} kết quả cho "${q}"`
                                : `Không tìm thấy kết quả cho "${q}"`}
                        </p>
                        {movies.length > 0 && (
                            <>
                                <MovieGrid movies={movies} />
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    baseUrl={`/tim-kiem?q=${encodeURIComponent(q)}`}
                                />
                            </>
                        )}
                    </>
                )
            ) : (
                <p className="text-foreground-muted text-center py-12">
                    Nhập tên phim để tìm kiếm
                </p>
            )}
        </div>
    );
}
