"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function WatchError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-6xl font-black text-primary">!</div>
                <h1 className="text-2xl font-bold">Không thể tải phim</h1>
                <p className="text-foreground-secondary">
                    Nguồn phát gặp lỗi hoặc không khả dụng. Vui lòng thử lại.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={reset}
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all"
                    >
                        Thử lại
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
