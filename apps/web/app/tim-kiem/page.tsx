import { Metadata } from "next";
import { searchMovies } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SearchForm from "./SearchForm";

interface Props {
    searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams;
    return {
        title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm phim",
        description: q ? `Kết quả tìm kiếm cho "${q}"` : "Tìm kiếm phim hay",
    };
}

export default async function SearchPage({ searchParams }: Props) {
    const { q, page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);

    let data = null;
    if (q) {
        try {
            data = await searchMovies(q, currentPage);
        } catch (error) {
            console.error("Failed to search movies:", error);
        }
    }

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {
        pageRanges: 1,
        currentPage: 1,
    };
    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Tìm kiếm phim</h1>

            {/* Search form */}
            <SearchForm initialQuery={q || ""} />

            {/* Results */}
            {q ? (
                <>
                    <p className="text-foreground-secondary mb-6">
                        {movies.length > 0
                            ? `Tìm thấy ${pagination.totalItems || movies.length} kết quả cho "${q}"`
                            : `Không tìm thấy kết quả cho "${q}"`}
                    </p>

                    {movies.length > 0 && (
                        <>
                            <MovieGrid movies={movies} />
                            <Pagination
                                currentPage={pagination.currentPage || currentPage}
                                totalPages={totalPages}
                                baseUrl={`/tim-kiem?q=${encodeURIComponent(q)}`}
                            />
                        </>
                    )}
                </>
            ) : (
                <p className="text-foreground-muted text-center py-12">
                    Nhập tên phim để tìm kiếm
                </p>
            )}
        </div>
    );
}
