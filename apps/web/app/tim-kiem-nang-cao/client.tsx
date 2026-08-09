"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCategories, getCountries, movieTypes, advancedSearch } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import AdvancedSearchForm from "@/components/search/AdvancedSearchForm";
import SplashScreen from "@/components/ui/SplashScreen";

export default function AdvancedSearchClient() {
    const searchParams = useSearchParams();

    const keyword = searchParams.get("q") || "";
    const genreParam = searchParams.get("genre");
    const genre = genreParam ? genreParam.split(",") : [];
    const countryParam = searchParams.get("country");
    const country = countryParam ? countryParam.split(",") : [];
    const typeParam = searchParams.get("type");
    const type = typeParam ? typeParam.split(",") : [];
    const year = searchParams.get("year") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    const [genres, setGenres] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [movies, setMovies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [pagination, setPagination] = useState({ pageRanges: 1, currentPage: 1, totalItems: 0 });

    // Fetch filters data once on mount
    useEffect(() => {
        Promise.all([getCategories().catch(() => null), getCountries().catch(() => null)])
            .then(([genresData, countriesData]) => {
                setGenres(genresData?.data?.items || []);
                setCountries(countriesData?.data?.items || []);
            })
            .finally(() => setLoading(false));
    }, []);

    // Fetch search results when parameters change
    useEffect(() => {
        setSearching(true);
        advancedSearch({
            keyword,
            category: genre,
            country,
            type,
            year,
            page,
            limit,
        })
            .then((searchData) => {
                setMovies(searchData?.data?.items || []);
                setPagination(
                    searchData?.data?.params?.pagination || {
                        pageRanges: 1,
                        currentPage: 1,
                        totalItems: searchData?.data?.items?.length || 0,
                    }
                );
            })
            .catch((error) => {
                console.error("Advanced search failed:", error);
                setMovies([]);
            })
            .finally(() => setSearching(false));
    }, [keyword, genreParam, countryParam, typeParam, year, page, limit]);

    if (loading) {
        return <SplashScreen />;
    }

    const types = movieTypes.map((t: { name: string; slug: string }) => ({
        name: t.name,
        slug: t.slug,
    }));

    const totalItems = pagination.totalItems || movies.length;
    const totalPages = Math.ceil(totalItems / 24) || 1;

    // Build base URL for pagination
    const baseUrlParams = new URLSearchParams();
    if (genre.length > 0) baseUrlParams.set("genre", genre.join(","));
    if (type.length > 0) baseUrlParams.set("type", type.join(","));
    if (keyword) baseUrlParams.set("q", keyword);
    if (country.length > 0) baseUrlParams.set("country", country.join(","));
    if (year) baseUrlParams.set("year", year);
    baseUrlParams.set("limit", limit.toString());

    const baseUrl = `/tim-kiem-nang-cao?${baseUrlParams.toString()}`;

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
                            {searching ? "Đang tìm..." : `${totalItems} phim`}
                        </span>
                    </h2>
                </div>

                {searching ? (
                    <p className="text-foreground-muted text-center py-12">Đang tải kết quả...</p>
                ) : movies.length > 0 ? (
                    <>
                        <MovieGrid movies={movies} />
                        <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
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
