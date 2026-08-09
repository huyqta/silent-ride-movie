"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { searchMoviesAllSources, type SearchResultsBySource } from "@/lib/api/unified";
import SearchMovieCard from "./SearchMovieCard";
import SearchForm from "./SearchForm";

type SourceKey = "ophim" | "nguonc" | "kkphim" | "vsmov";

const SOURCES: { key: SourceKey; label: string }[] = [
    { key: "ophim", label: "OPhim" },
    { key: "nguonc", label: "NguonPhim" },
    { key: "kkphim", label: "KKPhim" },
    { key: "vsmov", label: "VSMOV" },
];

const ALL_SOURCE_KEYS = SOURCES.map((s) => s.key);

/** Parse ?source= param → Set of VISIBLE source keys. Empty = all visible. */
function parseSourceParam(raw: string | null): Set<SourceKey> | null {
    if (!raw) return null; // null = show all
    const keys = raw
        .split(",")
        .map((k) => k.trim())
        .filter((k): k is SourceKey => ALL_SOURCE_KEYS.includes(k as SourceKey));
    return keys.length > 0 ? new Set(keys) : null;
}

function buildUrl(q: string, page: number, visibleSources: Set<SourceKey> | null): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    if (visibleSources && visibleSources.size < ALL_SOURCE_KEYS.length) {
        params.set("source", [...visibleSources].join(","));
    }
    return `/tim-kiem?${params.toString()}`;
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    // visibleSources: null = all shown; Set = only those sources shown
    const visibleSources = parseSourceParam(searchParams.get("source"));

    const [results, setResults] = useState<SearchResultsBySource | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!q) { setResults(null); return; }
        setLoading(true);
        setResults(null);
        searchMoviesAllSources(q, page)
            .then((data) => setResults(data))
            .catch((err) => console.error("Search failed:", err))
            .finally(() => setLoading(false));
    }, [q, page]);

    useEffect(() => {
        document.title = q ? `Tìm kiếm: ${q} | Silent Ride` : "Tìm kiếm phim | Silent Ride";
    }, [q]);

    const toggleSource = (key: SourceKey) => {
        // Current visible set (default: all)
        const current: Set<SourceKey> = visibleSources
            ? new Set(visibleSources)
            : new Set(ALL_SOURCE_KEYS);

        if (current.has(key)) {
            current.delete(key);
        } else {
            current.add(key);
        }

        // If all sources selected again → remove param (cleaner URL)
        const next = current.size === ALL_SOURCE_KEYS.length ? null : current;
        router.replace(buildUrl(q, page, next), { scroll: false });
    };

    const isSourceVisible = (key: SourceKey) =>
        visibleSources === null || visibleSources.has(key);

    const totalFound = results
        ? SOURCES.reduce((sum, s) => sum + (results[s.key]?.length || 0), 0)
        : 0;

    const visibleCount = results
        ? SOURCES.filter((s) => isSourceVisible(s.key))
              .reduce((sum, s) => sum + (results[s.key]?.length || 0), 0)
        : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Tìm kiếm phim</h1>

            <SearchForm initialQuery={q} />

            {q ? (
                loading ? (
                    <p className="text-foreground-muted text-center py-12">Đang tìm kiếm...</p>
                ) : results ? (
                    <>
                        <p className="text-foreground-secondary mb-4">
                            {totalFound > 0
                                ? visibleSources
                                    ? `Hiển thị ${visibleCount} / ${totalFound} kết quả cho "${q}"`
                                    : `Tìm thấy ${totalFound} kết quả cho "${q}" từ tất cả nguồn`
                                : `Không tìm thấy kết quả cho "${q}"`}
                        </p>

                        {/* Source filter toggle tabs */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            <span className="text-foreground-muted text-sm self-center mr-1">
                                Lọc theo nguồn:
                            </span>
                            {SOURCES.map((s) => {
                                const count = results[s.key]?.length || 0;
                                const isActive = isSourceVisible(s.key);
                                return (
                                    <button
                                        key={s.key}
                                        onClick={() => toggleSource(s.key)}
                                        title={isActive ? `Ẩn kết quả từ ${s.label}` : `Hiện kết quả từ ${s.label}`}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                                            isActive
                                                ? "bg-primary border-primary text-white shadow-sm"
                                                : "bg-transparent border-border text-foreground-muted opacity-50"
                                        }`}
                                    >
                                        {s.label}
                                        <span
                                            className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                                                isActive
                                                    ? "bg-white/20 text-white"
                                                    : "bg-background-secondary text-foreground-muted"
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                            {/* Reset button — only shown when filter is active */}
                            {visibleSources && (
                                <button
                                    onClick={() => router.replace(buildUrl(q, page, null), { scroll: false })}
                                    className="px-3 py-1.5 rounded-lg text-sm border border-border text-foreground-muted hover:border-primary hover:text-primary transition-all duration-200"
                                >
                                    Hiển thị tất cả
                                </button>
                            )}
                        </div>

                        {/* Results grouped by source */}
                        <div className="space-y-10">
                            {SOURCES.map((s) => {
                                if (!isSourceVisible(s.key)) return null;
                                const items = results[s.key] || [];
                                return (
                                    <section key={s.key}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <h2 className="text-lg font-semibold">{s.label}</h2>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-background-secondary text-foreground-muted border border-border">
                                                {items.length} kết quả
                                            </span>
                                        </div>
                                        {items.length === 0 ? (
                                            <p className="text-foreground-muted text-sm py-4 px-1">
                                                Không có kết quả từ {s.label}
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                                {items.map((movie: any, index: number) => (
                                                    <SearchMovieCard
                                                        key={`${s.key}-${movie._id || movie.slug}-${index}`}
                                                        movie={movie}
                                                        source={s.key}
                                                        index={index}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    </>
                ) : null
            ) : (
                <p className="text-foreground-muted text-center py-12">
                    Nhập tên phim để tìm kiếm
                </p>
            )}
        </div>
    );
}
