import { Metadata } from "next";
import { getCategories, getCountries, movieTypes, advancedSearch } from "@/lib/api/ophim";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import AdvancedSearchForm from "@/components/search/AdvancedSearchForm";

interface Props {
    searchParams: Promise<{
        q?: string;
        genre?: string;
        country?: string;
        type?: string;
        year?: string;
        page?: string;
        limit?: string;
    }>;
}

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Tìm kiếm nâng cao | SilentRide",
        description: "Lọc và tìm kiếm phim theo tên, quốc gia, thể loại và danh sách.",
    };
}

export default async function AdvancedSearchPage({ searchParams }: Props) {
    const params = await searchParams;
    const keyword = params.q || "";
    const genre = params.genre ? params.genre.split(",") : [];
    const country = params.country ? params.country.split(",") : [];
    const type = params.type ? params.type.split(",") : [];
    const year = params.year || "";
    const page = parseInt(params.page || "1", 10);
    const limit = parseInt(params.limit || "24", 10);

    // Fetch filters data
    const [genresData, countriesData] = await Promise.all([
        getCategories(),
        getCountries(),
    ]);

    const genres = genresData?.data?.items || [];
    const countries = countriesData?.data?.items || [];

    // Map movieTypes for the search form
    const types = movieTypes.map((t: { name: string, slug: string }) => ({ name: t.name, slug: t.slug }));

    // Fetch search results
    let searchData = null;
    let movies = [];
    let pagination = { pageRanges: 1, currentPage: 1, totalItems: 0 };

    try {
        searchData = await advancedSearch({
            keyword,
            category: genre,
            country,
            type,
            year,
            page,
            limit,
        });
        movies = searchData?.data?.items || [];
        pagination = searchData?.data?.params?.pagination || { pageRanges: 1, currentPage: 1, totalItems: 0 };
    } catch (error) {
        console.error("Advanced search failed:", error);
    }

    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;

    // Build base URL for pagination (without page and without fragment)
    const baseUrlParams = new URLSearchParams();
    if (genre.length > 0) baseUrlParams.set("genre", genre.join(","));
    if (type.length > 0) baseUrlParams.set("type", type.join(","));
    if (keyword) baseUrlParams.set("q", keyword);
    if (country.length > 0) baseUrlParams.set("country", country.join(","));
    if (year) baseUrlParams.set("year", year);
    baseUrlParams.set("limit", limit.toString());

    const baseUrl = `/tim-kiem-nang-cao?${baseUrlParams.toString()}`;

    // Collapse filter if we have results and either page > 1 or filters are applied
    const hasFilters = !!keyword || genre.length > 0 || country.length > 0 || type.length > 0 || !!year;
    const isCollapsed = page > 1 || (movies.length > 0 && hasFilters);

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-white to-primary/50 bg-clip-text text-transparent">
                    Tìm kiếm nâng cao
                </h1>
            </div>

            <AdvancedSearchForm
                genres={genres}
                countries={countries}
                types={types}
                initialValues={{ keyword, genre, country, type, year }}
                isCollapsed={isCollapsed}
            />

            {/* Results Section */}
            <div id="results" className="scroll-mt-20 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Kết quả tìm kiếm
                        <span className="text-sm font-normal text-foreground-muted bg-white/5 px-2 py-0.5 rounded-full">
                            {pagination.totalItems || movies.length} phim
                        </span>
                    </h2>
                </div>

                {movies.length > 0 ? (
                    <>
                        <MovieGrid movies={movies} />
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl={baseUrl}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                            <FilterX className="w-10 h-10 text-foreground-muted" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-medium text-foreground-secondary">
                                Không tìm thấy phim nào
                            </p>
                            <p className="text-sm text-foreground-muted max-w-xs mx-auto">
                                Thử thay đổi các bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt hơn.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon for empty results
function FilterX(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.05" />
            <path d="m22 2-5 5" />
            <path d="m17 2 5 5" />
        </svg>
    );
}
