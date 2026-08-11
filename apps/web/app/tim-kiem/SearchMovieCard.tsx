"use client";

import { useEffect, useRef, useState } from "react";
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

    return (
        <div ref={containerRef}>
            <MovieCard
                movie={{ ...movie, _source: source }}
                index={index}
                showProgress={false}
                urlCount={urlCount}
            />
        </div>
    );
}
