'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Info } from 'lucide-react'
import Link from 'next/link'
import MovieGrid from '@/components/movie/MovieGrid'
import { clearAllFavorites, getFavorites } from './actions'
import { useProfileStore } from '@/lib/store/useProfileStore'
import { useEffect } from 'react'

interface Favorite {
    movie_slug: string
    movie_title: string
    poster_url: string
}

export default function FavoritesClient({ initialFavorites }: { initialFavorites: Favorite[] }) {
    const { currentProfile, favoriteSlugs, setFavoriteSlugs } = useProfileStore()
    const [favorites, setFavorites] = useState(initialFavorites)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        if (currentProfile?.id) {
            getFavorites(currentProfile.id).then(data => {
                setFavorites(data.map(f => ({
                    movie_slug: f.movie_slug,
                    movie_title: f.movie_title,
                    poster_url: f.poster_url
                })))
            })
        }
    }, [currentProfile?.id])

    const handleClearAll = async () => {
        if (!currentProfile?.id) return
        setIsPending(true)
        const result = await clearAllFavorites(currentProfile.id)
        if (result.success) {
            setFavorites([])
            setFavoriteSlugs([])
        }
        setShowConfirm(false)
        setIsPending(false)
    }

    // Filter by the actual live slugs in profile store
    const movies = favorites
        .filter(fav => favoriteSlugs.includes(fav.movie_slug))
        .map((fav) => ({
            _id: fav.movie_slug,
            slug: fav.movie_slug,
            name: fav.movie_title,
            thumb_url: fav.poster_url,
            poster_url: fav.poster_url,
            type: 'single' as const,
            category: [],
            country: [],
        }))

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
                    <h1 className="text-2xl md:text-3xl font-bold">Phim yêu thích</h1>
                </div>
                {favorites.length > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            <div className="flex items-start gap-3 p-4 mb-8 bg-white/5 border border-white/10 rounded-2xl text-xs md:text-sm text-gray-400">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-white mb-0.5">Dữ liệu tài khoản</p>
                    <p>
                        Danh sách này đã được <span className="text-green-400 font-medium">đồng bộ với tài khoản</span> Supabase của bạn. Bạn có thể xem lại trên bất kỳ thiết bị nào.
                    </p>
                </div>
            </div>

            {favorites.length > 0 ? (
                <MovieGrid movies={movies as any} showProgress={false} />
            ) : (
                <div className="text-center py-16">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-4">
                        Chưa có phim yêu thích nào
                    </p>
                    <Link
                        href="/"
                        prefetch={false}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Khám phá phim
                    </Link>
                </div>
            )}

            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                        onClick={() => setShowConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
                            <p className="text-gray-400 mb-6">
                                Bạn có chắc muốn xóa tất cả {favorites.length} phim yêu thích?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    disabled={isPending}
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    disabled={isPending}
                                    onClick={handleClearAll}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    {isPending ? 'Đang xóa...' : 'Xóa tất cả'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
