"use client";

import MovieCard from "./MovieCard";
import type { Movie } from "@/types/movie";

interface MovieGridProps {
    movies: Movie[];
    showProgress?: boolean;
}

export default function MovieGrid({ movies, showProgress = true }: MovieGridProps) {
    if (!movies || movies.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-foreground-muted">Không có phim nào</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
                <MovieCard
                    key={movie._id || movie.slug}
                    movie={movie}
                    index={index}
                    showProgress={showProgress}
                />
            ))}
        </div>
    );
}
