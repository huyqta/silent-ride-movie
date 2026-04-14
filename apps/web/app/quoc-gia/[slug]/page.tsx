"use client";

import { use } from "react";
import { getMoviesByCountry } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SplashScreen from "@/components/ui/SplashScreen";
import { useMovieData } from "@/lib/hooks/use-movie-data";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default function CountryPage({ params, searchParams }: Props) {
    const { slug } = use(params);
    const { page } = use(searchParams);
    const currentPage = parseInt(page || "1", 10);

    const { data, loading } = useMovieData(
        `country-${slug}-p${currentPage}`,
        () => getMoviesByCountry(slug, currentPage)
    );

    if (loading) {
        return <SplashScreen />;
    }

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;
    const title = data?.data?.titlePage || `Phim ${slug.replace(/-/g, " ")}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold capitalize">{title}</h1>
                {totalItems > 0 && (
                    <p className="text-foreground-secondary text-sm">
                        {totalItems.toLocaleString()} phim
                    </p>
                )}
            </div>

            {movies.length > 0 ? (
                <>
                    <MovieGrid movies={movies} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={`/quoc-gia/${slug}`}
                    />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-foreground-muted">Không có phim nào từ quốc gia này</p>
                </div>
            )}
        </div>
    );
}
