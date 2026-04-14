"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getMoviesByType } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SplashScreen from "@/components/ui/SplashScreen";
import { useMovieData } from "@/lib/hooks/use-movie-data";

const typeNames: Record<string, string> = {
    "phim-moi": "Phim Mới",
    "phim-bo": "Phim Bộ",
    "phim-le": "Phim Lẻ",
    "tv-shows": "TV Shows",
    "hoat-hinh": "Hoạt Hình",
    "phim-vietsub": "Phim Vietsub",
    "phim-thuyet-minh": "Phim Thuyết Minh",
    "phim-long-tieng": "Phim Lồng Tiếng",
    "phim-bo-dang-chieu": "Phim Bộ Đang Chiếu",
    "phim-bo-hoan-thanh": "Phim Bộ Hoàn Thành",
    "phim-sap-chieu": "Phim Sắp Chiếu",
    "phim-chieu-rap": "Phim Chiếu Rạp",
    "subteam": "Subteam",
};

interface Props {
    params: Promise<{ type: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default function MovieListPage({ params, searchParams }: Props) {
    const { type } = use(params);
    const { page } = use(searchParams);
    const currentPage = parseInt(page || "1", 10);

    const { data, loading } = useMovieData(
        `list-${type}-p${currentPage}`,
        () => getMoviesByType(type, currentPage)
    );

    if (loading) {
        return <SplashScreen />;
    }

    if (!typeNames[type]) {
        notFound();
    }

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">{typeNames[type]}</h1>
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
                        baseUrl={`/danh-sach/${type}`}
                    />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-foreground-muted">Không có phim nào</p>
                </div>
            )}
        </div>
    );
}
