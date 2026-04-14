'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Trash2, Play, Clock, Info } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { clearHistory, getWatchHistory } from './actions'
import { getImageUrl } from '@/lib/api/ophim'
import { useProfileStore } from '@/lib/store/useProfileStore'
import { useEffect } from 'react'

interface HistoryItem {
  movie_slug: string
  movie_title: string
  poster_url: string
  episode_slug: string
  episode_name: string
  duration: number
  playback_time: number
  updated_at: string
}

export default function HistoryClient({ initialHistory }: { initialHistory: HistoryItem[] }) {
  const { currentProfile, setWatchHistory, setWatchProgress } = useProfileStore()
  const [history, setHistory] = useState(initialHistory)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (currentProfile?.id) {
      getWatchHistory(currentProfile.id).then(data => {
        setHistory(data as any)
        
        // Sync remote history into local watchProgress store for Resume functionality
        const progress: Record<string, any> = {}
        data?.forEach((item: any) => {
          progress[item.movie_slug] = {
            episode: item.episode_slug,
            episodeName: item.episode_name,
            currentTime: item.playback_time,
            duration: item.duration,
            updatedAt: new Date(item.updated_at).getTime()
          }
        })
        setWatchProgress(progress)
      })
    }
  }, [currentProfile?.id, setWatchProgress])

  const handleClearAll = async () => {
    if (!currentProfile?.id) return
    setIsPending(true)
    const result = await clearHistory(currentProfile.id)
    if (result.success) {
      setHistory([])
      setWatchHistory([])
      setWatchProgress({})
    }
    setShowConfirm(false)
    setIsPending(false)
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Vừa xem'
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl md:text-3xl font-bold">Lịch sử xem</h1>
        </div>
        {history.length > 0 && (
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
            Lịch sử xem phim của bạn đã được <span className="text-green-400 font-medium">đồng bộ với tài khoản</span> Supabase.
          </p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map((item) => {
            const progressPercent = item.duration > 0 ? (item.playback_time / item.duration) * 100 : 0
            return (
              <motion.div
                key={`${item.movie_slug}-${item.updated_at}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors"
              >
                {/* Thumbnail */}
                <Link
                  href={`/xem-phim/${item.movie_slug}/${item.episode_slug}${item.playback_time > 0 ? `?t=${item.playback_time}` : ''}`}
                  prefetch={false}
                  className="relative flex-shrink-0 w-32 md:w-40 aspect-video rounded-xl overflow-hidden bg-background-secondary"
                >
                  {item.poster_url ? (
                    <Image
                      src={getImageUrl(item.poster_url)}
                      alt={item.movie_title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                  {/* Progress bar */}
                  {item.duration > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/phim/${item.movie_slug}`}
                    prefetch={false}
                    className="font-semibold hover:text-blue-400 transition-colors line-clamp-1"
                  >
                    {item.movie_title}
                  </Link>
                  <p className="text-sm text-gray-400 mt-1">
                    {item.episode_name}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTime(item.updated_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/xem-phim/${item.movie_slug}/${item.episode_slug}${item.playback_time > 0 ? `?t=${item.playback_time}` : ''}`}
                    prefetch={false}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors hidden md:block"
                  >
                    Tiếp tục xem
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">
            Chưa có lịch sử xem nào
          </p>
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
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
                Bạn có chắc muốn xóa toàn bộ lịch sử xem?
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
