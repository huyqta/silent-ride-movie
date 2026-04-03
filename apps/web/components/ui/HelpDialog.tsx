"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, Tablet, MousePointer2, Zap, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";

interface HelpDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const sections = [
        {
            title: "Phím tắt bàn phím",
            icon: Keyboard,
            items: [
                { key: <ArrowLeft className="w-3 h-3" />, label: "Lùi 10 giây" },
                { key: <ArrowRight className="w-3 h-3" />, label: "Tiến 10 giây" },
                { key: <ArrowUp className="w-3 h-3" />, label: "Tập tiếp theo" },
                { key: <ArrowDown className="w-3 h-3" />, label: "Tập trước đó" },
            ]
        },
        {
            title: "Thao tác trên Mobile",
            icon: Tablet,
            items: [
                { key: "2x Tap", label: "Chạm 2 lần trái/phải để tua 10s" },
                { key: "Swipe", label: "Vuốt ngang để xem phim khác" },
            ]
        },
        {
            title: "Tính năng chung",
            icon: Zap,
            items: [
                { key: "Autoplay", label: "Tự động phát khi chuyển tập" },
                { key: "Resume", label: "Xem tiếp đoạn đang xem dở" },
                { key: "History", label: "Lưu lịch sử xem tự động" },
            ]
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-background-secondary border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative p-6 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Hướng dẫn sử dụng</h2>
                                    <p className="text-xs text-foreground-muted">Tối ưu trải nghiệm xem phim của bạn</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors text-foreground-muted hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            {sections.map((section, idx) => (
                                <div key={idx} className="space-y-4">
                                    <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                                        <section.icon className="w-4 h-4" />
                                        {section.title}
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {section.items.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/30 transition-colors">
                                                <span className="text-sm text-foreground-secondary">{item.label}</span>
                                                <div className="px-2 py-1 rounded bg-zinc-800 border border-white/10 text-[10px] font-mono text-white flex items-center justify-center min-w-[32px]">
                                                    {item.key}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-black/20 border-t border-white/5">
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Đã hiểu, bắt đầu xem phim!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
