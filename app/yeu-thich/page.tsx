"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { getImageUrl } from "@/lib/api/ophim";
import MovieGrid from "@/components/movie/MovieGrid";

export default function FavoritesPage() {
    const { favorites, removeFromFavorites, clearFavorites } = useStore();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearAll = () => {
        clearFavorites();
        setShowConfirm(false);
    };

    // Convert favorites to movie-like objects for MovieGrid
    const movies = favorites.map((fav) => ({
        _id: fav.slug,
        slug: fav.slug,
        name: fav.name,
        thumb_url: fav.thumb,
        year: fav.year,
        quality: fav.quality,
        origin_name: "",
        type: "single" as const,
        poster_url: fav.thumb,
        sub_docquyen: false,
        chipiuliui: false,
        time: "",
        episode_current: "",
        lang: "",
        category: [],
        country: [],
    }));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-primary" fill="#e50914" />
                    <h1 className="text-2xl md:text-3xl font-bold">Phim yêu thích</h1>
                </div>
                {favorites.length > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:text-error transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            {favorites.length > 0 ? (
                <MovieGrid movies={movies} showProgress={false} />
            ) : (
                <div className="text-center py-16">
                    <Heart className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <p className="text-foreground-secondary text-lg mb-4">
                        Chưa có phim yêu thích nào
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
                    >
                        Khám phá phim
                    </Link>
                </div>
            )}

            {/* Confirm dialog */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                        onClick={() => setShowConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-background-secondary rounded-xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                            <p className="text-foreground-secondary mb-6">
                                Bạn có chắc muốn xóa tất cả {favorites.length} phim yêu thích?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    className="flex-1 px-4 py-2 bg-error hover:bg-red-600 text-white rounded-lg transition-colors"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
