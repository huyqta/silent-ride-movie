"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import MovieCard from "./MovieCard";
import type { Movie } from "@/types/movie";

interface MovieSliderProps {
    title: string;
    movies: Movie[];
    href?: string;
    showProgress?: boolean;
}

export default function MovieSlider({ title, movies, href, showProgress = true }: MovieSliderProps) {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.offsetWidth * 0.8;
            sliderRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className="py-6 md:py-8 relative group/section">
            {/* Header */}
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

            {/* Slider container */}
            <div className="relative">
                {/* Navigation buttons */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background-secondary/90 hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all -translate-x-1/2 hidden md:flex"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background-secondary/90 hover:bg-primary rounded-full flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all translate-x-1/2 hidden md:flex"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Movies slider */}
                <div
                    ref={sliderRef}
                    className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4"
                >
                    {movies.map((movie, index) => (
                        <div
                            key={movie._id || movie.slug}
                            className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-13px)]"
                        >
                            <MovieCard movie={movie} index={index} showProgress={showProgress} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
