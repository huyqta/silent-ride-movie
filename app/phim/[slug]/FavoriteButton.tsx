"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import type { MovieDetail } from "@/types/movie";

interface FavoriteButtonProps {
    movie: MovieDetail;
}

export default function FavoriteButton({ movie }: FavoriteButtonProps) {
    const { isFavorite, addToFavorites, removeFromFavorites } = useStore();
    const isLiked = isFavorite(movie.slug);

    const handleClick = () => {
        if (isLiked) {
            removeFromFavorites(movie.slug);
        } else {
            addToFavorites({
                slug: movie.slug,
                name: movie.name,
                thumb: movie.thumb_url,
                year: movie.year,
                quality: movie.quality,
            });
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors ${isLiked
                    ? "bg-primary text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
        >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            {isLiked ? "Đã thích" : "Yêu thích"}
        </motion.button>
    );
}
