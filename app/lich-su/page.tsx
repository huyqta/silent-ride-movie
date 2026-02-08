"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Play, Clock, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store/useStore";
import { getImageUrl } from "@/lib/api/ophim";

export default function HistoryPage() {
    const { watchHistory, removeFromHistory, clearHistory, getProgress } = useStore();
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearAll = () => {
        clearHistory();
        setShowConfirm(false);
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "Vừa xem";
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-accent" />
                    <h1 className="text-2xl md:text-3xl font-bold">Lịch sử xem</h1>
                </div>
                {watchHistory.length > 0 && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:text-error transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa tất cả
                    </button>
                )}
            </div>

            <div className="flex items-start gap-3 p-4 mb-8 bg-accent/5 border border-accent/10 rounded-2xl text-xs md:text-sm text-foreground-secondary">
                <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-white mb-0.5">Lưu ý về thiết bị</p>
                    <p>
                        Lịch sử xem phim được lưu trữ cục bộ trên trình duyệt của bạn. Thông tin này sẽ <span className="text-accent font-medium">không được đồng bộ</span> khi bạn chuyển sang thiết bị hoặc trình duyệt khác.
                    </p>
                </div>
            </div>

            {watchHistory.length > 0 ? (
                <div className="space-y-4">
                    {watchHistory.map((item) => {
                        const progress = getProgress(item.slug);
                        return (
                            <motion.div
                                key={`${item.slug}-${item.watchedAt}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group flex gap-4 p-4 bg-background-secondary rounded-xl hover:bg-background-tertiary transition-colors"
                            >
                                {/* Thumbnail */}
                                <Link
                                    href={`/xem-phim/${item.slug}/${item.episode}`}
                                    className="relative flex-shrink-0 w-32 md:w-40 aspect-video rounded-lg overflow-hidden"
                                >
                                    <Image
                                        src={getImageUrl(item.thumb)}
                                        alt={item.name}
                                        fill
                                        sizes="160px"
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-8 h-8 text-white" fill="white" />
                                    </div>
                                    {/* Progress bar */}
                                    {progress && progress.duration > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                            <div
                                                className="h-full bg-primary"
                                                style={{
                                                    width: `${Math.round((progress.currentTime / progress.duration) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/phim/${item.slug}`}
                                        className="font-semibold hover:text-primary transition-colors line-clamp-1"
                                    >
                                        {item.name}
                                    </Link>
                                    <p className="text-sm text-foreground-secondary mt-1">
                                        {item.episodeName || `Tập ${item.episode}`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-foreground-muted">
                                        <Clock className="w-3 h-3" />
                                        {formatTime(item.watchedAt)}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/xem-phim/${item.slug}/${item.episode}`}
                                        className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        Tiếp tục xem
                                    </Link>
                                    <button
                                        onClick={() => removeFromHistory(item.slug)}
                                        className="p-2 text-foreground-muted hover:text-error transition-colors"
                                        aria-label="Xóa khỏi lịch sử"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <History className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <p className="text-foreground-secondary text-lg mb-4">
                        Chưa có lịch sử xem nào
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
                                Bạn có chắc muốn xóa toàn bộ lịch sử xem?
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
