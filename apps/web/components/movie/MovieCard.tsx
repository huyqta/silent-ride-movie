"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Heart, Clock, Star } from "lucide-react";
import { getImageUrl, getUrlCountBySource } from "@/lib/api/unified";
import { useStore } from "@/lib/store/useStore";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { toggleFavorite } from "@/app/yeu-thich/actions";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
    movie: Movie;
    index?: number;
    showProgress?: boolean;
    /** Actual playable URL count fetched from detail API. undefined = loading, -1 = error */
    urlCount?: number;
}

export default function MovieCard({ movie, index = 0, showProgress = true, urlCount: propUrlCount }: MovieCardProps) {
    const { currentProfile, favoriteSlugs, toggleFavoriteSlug, watchProgress } = useProfileStore();
    const isLiked = favoriteSlugs.includes(movie.slug);
    
    // Auto-fetch URL count if not passed from prop
    const [localUrlCount, setLocalUrlCount] = useState<number | undefined>(undefined);
    const [fetched, setFetched] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const urlCount = propUrlCount !== undefined ? propUrlCount : localUrlCount;

    useEffect(() => {
        if (propUrlCount !== undefined || fetched) return;
        const el = containerRef.current;
        if (!el) return;

        // Resolve source: custom source on item OR fallback to system active source
        const getSourceHelper = async () => {
            let source = movie._source;
            if (!source) {
                const { getSource } = await import("@/lib/api/unified");
                source = getSource();
            }
            return source;
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !fetched) {
                    setFetched(true);
                    getSourceHelper().then((source) => {
                        getUrlCountBySource(movie.slug, source).then((count) => {
                            setLocalUrlCount(count);
                        });
                    });
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [movie.slug, movie._source, fetched, propUrlCount]);

    // Get progress from profile store instead of local useStore
    const progress = showProgress ? watchProgress[movie.slug] : null;

    const progressPercent = progress
        ? Math.round((progress.currentTime / progress.duration) * 100)
        : 0;

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!currentProfile?.id) {
            console.warn('Vui lòng chọn Profile để thực hiện tính năng này');
            return;
        }

        // Toggle local state for immediate feedback
        toggleFavoriteSlug(movie.slug);

        // Sync with Supabase
        const result = await toggleFavorite(currentProfile.id, {
            movie_slug: movie.slug,
            movie_title: movie.name,
            poster_url: movie.thumb_url
        });

        if (result && 'error' in result) {
            console.error('Lỗi khi lưu phim yêu thích:', result.error);
            // Rollback local state on error
            toggleFavoriteSlug(movie.slug);
        }
    };

    const handleMovieClick = () => {
        if (typeof window === "undefined" || !movie._source) return;

        localStorage.setItem("movie-source", movie._source);
        document.cookie = `movie-source=${movie._source}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(
            new StorageEvent("storage", { key: "movie-source", newValue: movie._source })
        );
    };

    const movieHref = movie._source
        ? `/phim/${movie.slug}?source=${movie._source}`
        : `/phim/${movie.slug}`;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative"
        >
            <Link
                href={movieHref}
                prefetch={false}
                className="block"
                onClick={handleMovieClick}
            >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-secondary">
                    {/* Thumbnail */}
                    <Image
                        src={getImageUrl(movie.thumb_url, movie._source)}
                        alt={movie.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                    {/* Quality badge */}
                    {movie.quality && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded">
                            {movie.quality}
                        </div>
                    )}

                    {/* Episode badge + URL count */}
                    {movie.episode_current && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                            <div className="px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                                {movie.episode_current}
                            </div>
                            {urlCount === undefined && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
                            )}
                            {urlCount !== undefined && urlCount >= 0 && urlCount === 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-500/80 text-white">
                                    N/A
                                </span>
                            )}
                            {urlCount !== undefined && urlCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-600/80 text-white">
                                    {urlCount}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Favorite button - Positioned below episode badge to avoid overlap */}
                    <button
                        onClick={handleFavoriteClick}
                        className={`absolute top-10 right-2 p-1.5 rounded-full transition-all z-10 ${isLiked
                                ? "bg-primary text-white"
                                : "bg-black/50 text-white md:opacity-0 group-hover:opacity-100"
                            }`}
                        aria-label={isLiked ? "Bỏ thích" : "Thêm yêu thích"}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                    </button>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
                        >
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </motion.div>
                    </div>

                    {/* Progress bar */}
                    {progress && progressPercent > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {movie.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-foreground-secondary">
                            {movie.year && <span>{movie.year}</span>}
                            {movie.lang && (
                                <>
                                    <span>•</span>
                                    <span>{movie.lang}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Continue watching indicator */}
            {progress && (
                <div className="flex items-center gap-1 mt-2 text-xs text-foreground-muted">
                    <Clock className="w-3 h-3" />
                    <span>
                        Đang xem: {progress.episodeName || `Tập ${progress.episode}`}
                    </span>
                </div>
            )}
        </motion.div>
    );
}
