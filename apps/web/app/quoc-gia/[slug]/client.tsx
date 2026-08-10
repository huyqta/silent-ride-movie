"use client";

import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";

interface ClientProps {
    params: { slug: string };
    initialData: any;
    currentPage: number;
}

export default function CountryPageClient({ params, initialData, currentPage }: ClientProps) {
    const { slug } = params;

    const movies = initialData?.data?.items || [];
    const pagination = initialData?.data?.params?.pagination || {};
    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;
    const title = initialData?.data?.titlePage || `Phim ${slug.replace(/-/g, " ")}`;

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
