"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MovieGrid from "./MovieGrid";
import type { Movie } from "@/types/movie";

interface MovieSectionProps {
    title: string;
    movies: Movie[];
    href?: string;
    showProgress?: boolean;
}

export default function MovieSection({ title, movies, href, showProgress = true }: MovieSectionProps) {
    return (
        <section className="py-6 md:py-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                {href && (
                    <Link
                        href={href}
                        prefetch={false}
                        className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group"
                    >
                        Xem tất cả
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
            <MovieGrid movies={movies} showProgress={showProgress} />
        </section>
    );
}
