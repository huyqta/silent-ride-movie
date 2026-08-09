"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MovieCard from "@/components/movie/MovieCard";
import { getUrlCountBySource } from "@/lib/api/unified";
import type { Movie } from "@/types/movie";

type SourceKey = "ophim" | "nguonc" | "kkphim" | "vsmov";

interface SearchMovieCardProps {
    movie: Movie;
    source: SourceKey;
    index?: number;
}

export default function SearchMovieCard({ movie, source, index = 0 }: SearchMovieCardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const containerRef = useRef<HTMLDivElement>(null);

    // undefined = loading, -1 = error, 0+ = actual count
    const [urlCount, setUrlCount] = useState<number | undefined>(undefined);
    const [fetched, setFetched] = useState(false);

    useEffect(() => {
        if (fetched) return;
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fetched) {
                    setFetched(true);
                    getUrlCountBySource(movie.slug, source).then((count) => {
                        // -1 means error → don't show badge (pass undefined-like via -1, MovieCard ignores -1)
                        setUrlCount(count);
                    });
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [movie.slug, source, fetched]);

    const handleClick = () => {
        if (typeof window !== "undefined") {
            localStorage.setItem("movie-source", source);
            window.dispatchEvent(
                new StorageEvent("storage", { key: "movie-source", newValue: source })
            );
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set("source", source);
        router.replace(`/tim-kiem?${params.toString()}`, { scroll: false });
    };

    return (
        <div ref={containerRef} onClick={handleClick}>
            <MovieCard
                movie={movie}
                index={index}
                showProgress={false}
                urlCount={urlCount}
            />
        </div>
    );
}
