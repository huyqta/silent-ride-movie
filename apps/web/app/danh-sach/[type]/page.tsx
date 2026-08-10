import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getMoviesByType } from "@/lib/api/unified";
import MovieListPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [
        { type: "phim-moi" },
        { type: "phim-bo" },
        { type: "phim-le" },
        { type: "tv-shows" },
        { type: "hoat-hinh" },
        { type: "dang-chieu" },
        { type: "phim-vietsub" },
        { type: "phim-thuyet-minh" },
        { type: "phim-long-tieng" },
        { type: "phim-bo-dang-chieu" },
        { type: "phim-bo-hoan-thanh" },
        { type: "phim-sap-chieu" },
        { type: "phim-chieu-rap" },
        { type: "subteam" },
    ];
}

interface Props {
    params: Promise<{ type: string }>;
    searchParams: Promise<{ page?: string }>;
}

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

export default async function MovieListPage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies();
    const source = cookieStore.get("movie-source")?.value;
    const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page || "1", 10) || 1);

    if (!typeNames[resolvedParams.type]) {
        notFound();
    }

    const initialData = await getMoviesByType(resolvedParams.type, currentPage, 24, source).catch(() => ({ data: { items: [] } }));

    return (
        <Suspense fallback={<SplashScreen />}>
            <MovieListPageClient params={resolvedParams} initialData={initialData} currentPage={currentPage} />
        </Suspense>
    );
}
