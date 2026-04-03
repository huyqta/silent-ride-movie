import { Metadata } from "next";
import { getMoviesByGenre } from "@/lib/api/unified";

export const revalidate = 3600;
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Thể loại: ${slug.replace(/-/g, " ")}`,
        description: `Xem phim theo thể loại ${slug.replace(/-/g, " ")}`,
    };
}

export default async function GenrePage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);

    let data;
    try {
        data = await getMoviesByGenre(slug, currentPage);
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        data = null;
    }

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;
    const title = data?.data?.titlePage || `Thể loại: ${slug.replace(/-/g, " ")}`;

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
                        baseUrl={`/the-loai/${slug}`}
                    />
                </>
            ) : (
                <div className="text-center py-12">
                    <p className="text-foreground-muted">Không có phim nào trong thể loại này</p>
                </div>
            )}
        </div>
    );
}
