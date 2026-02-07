import { Metadata } from "next";
import { getMoviesByCountry } from "@/lib/api/ophim";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `Phim ${slug.replace(/-/g, " ")}`,
        description: `Xem phim theo quốc gia ${slug.replace(/-/g, " ")}`,
    };
}

export default async function CountryPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || "1", 10);

    let data;
    try {
        data = await getMoviesByCountry(slug, currentPage);
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        data = null;
    }

    const movies = data?.data?.items || [];
    const pagination = data?.data?.params?.pagination || {};
    const totalPages = pagination.pageRanges || 1;
    const totalItems = pagination.totalItems || movies.length;
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
