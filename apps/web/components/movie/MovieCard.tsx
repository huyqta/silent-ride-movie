"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Heart, Clock, Star } from "lucide-react";
import { getImageUrl } from "@/lib/api/ophim";
import { useStore } from "@/lib/store/useStore";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { toggleFavorite } from "@/app/yeu-thich/actions";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
    movie: Movie;
    index?: number;
    showProgress?: boolean;
}

export default function MovieCard({ movie, index = 0, showProgress = true }: MovieCardProps) {
    const { currentProfile, favoriteSlugs, toggleFavoriteSlug, watchProgress } = useProfileStore();
    const isLiked = favoriteSlugs.includes(movie.slug);
    
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative"
        >
            <Link href={`/phim/${movie.slug}`} prefetch={false} className="block">
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-secondary">
                    {/* Thumbnail */}
                    <Image
                        src={getImageUrl(movie.thumb_url)}
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

                    {/* Episode badge */}
                    {movie.episode_current && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                            {movie.episode_current}
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
