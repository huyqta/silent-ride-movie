"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { toggleFavorite } from "@/app/yeu-thich/actions";
import type { MovieDetail } from "@/types/movie";

interface FavoriteButtonProps {
    movie: MovieDetail;
}

export default function FavoriteButton({ movie }: FavoriteButtonProps) {
    const { currentProfile, favoriteSlugs, toggleFavoriteSlug } = useProfileStore();
    const isLiked = favoriteSlugs.includes(movie.slug);

    const handleClick = async () => {
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
