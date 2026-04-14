"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import { getImageUrl } from "@/lib/api/ophim";
import type { Movie } from "@/types/movie";

interface HeroBannerProps {
    movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
    return (
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex items-end md:items-center">
                <div className="container mx-auto px-4 pb-12 md:pb-0">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl"
                    >
                        {/* Badges */}
                        <div className="flex items-center gap-3 mb-4">
                            {movie.quality && (
                                <span className="px-2 py-1 bg-primary text-white text-xs font-semibold rounded">
                                    {movie.quality}
                                </span>
                            )}
                            {movie.year && (
                                <span className="text-foreground-secondary text-sm">{movie.year}</span>
                            )}
                            {movie.lang && (
                                <span className="text-foreground-secondary text-sm">{movie.lang}</span>
                            )}
                            {movie.time && (
                                <span className="text-foreground-secondary text-sm">{movie.time}</span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-white">
                            {movie.name}
                        </h1>
                        <p className="text-lg md:text-xl text-foreground-secondary mb-2">
                            {movie.origin_name}
                        </p>

                        {/* Episode info */}
                        {movie.episode_current && (
                            <p className="text-foreground-muted mb-4">{movie.episode_current}</p>
                        )}

                        {/* Categories */}
                        {movie.category && movie.category.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {movie.category.slice(0, 5).map((cat) => (
                                    <Link
                                        key={cat.slug}
                                        href={`/the-loai/${cat.slug}`}
                                        prefetch={false}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded-full transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/phim/${movie.slug}`}
                                    prefetch={false}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/30"
                                >
                                    <Play className="w-5 h-5" fill="white" />
                                    Xem ngay
                                </Link>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link
                                    href={`/phim/${movie.slug}`}
                                    prefetch={false}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                                >
                                    <Info className="w-5 h-5" />
                                    Thông tin
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
