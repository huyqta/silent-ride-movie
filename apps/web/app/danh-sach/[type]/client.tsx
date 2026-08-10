"use client";

import { notFound } from "next/navigation";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";

const typeNames: Record<string, string> = {
    "phim-moi": "Phim Mới",
    "phim-bo": "Phim Bộ",
    "phim-le": "Phim Lẻ",
    "tv-shows": "TV Shows",
    "hoat-hinh": "Hoạt Hình",
    "dang-chieu": "Đang Chiếu",
    "phim-vietsub": "Phim Vietsub",
    "phim-thuyet-minh": "Phim Thuyết Minh",
    "phim-long-tieng": "Phim Lồng Tiếng",
    "phim-bo-dang-chieu": "Phim Bộ Đang Chiếu",
    "phim-bo-hoan-thanh": "Phim Bộ Hoàn Thành",
    "phim-sap-chieu": "Phim Sắp Chiếu",
    "phim-chieu-rap": "Phim Chiếu Rạp",
    "subteam": "Subteam",
};

interface ClientProps {
    params: { type: string };
    initialData: any;
    currentPage: number;
}

export default function MovieListPageClient({ params, initialData, currentPage }: ClientProps) {
    const { type } = params;

    if (!typeNames[type]) {
        notFound();
    }

    const movies = initialData?.data?.items || [];
    const pagination = initialData?.data?.params?.pagination || {};
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
