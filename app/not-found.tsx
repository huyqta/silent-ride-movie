import Link from "next/link";
import { Home, Film } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Film className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-2">Không tìm thấy trang</h2>
                <p className="text-foreground-secondary mb-8">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
}
