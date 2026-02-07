import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMoviesByType } from "@/lib/api/ophim";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type } = await params;
    const typeName = typeNames[type] || "Danh sách phim";
    return {
        title: typeName,
        description: `Xem ${typeName.toLowerCase()} mới nhất, chất lượng cao`,
    };
}

export default async function MovieListPage({ params, searchParams }: Props) {
    const { type } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);

    if (!typeNames[type]) {
        notFound();
    }

    let data;
    try {
        // All types use the same v1 API endpoint
        data = await getMoviesByType(type, currentPage);
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        data = null;
    }

    // v1/api returns: { data: { items: [], params: { pagination: { ... } } } }
    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalPages = pagination.pageRanges || 1;
    const totalItems = pagination.totalItems || movies.length;
    const title = data?.data?.titlePage || typeNames[type];

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
