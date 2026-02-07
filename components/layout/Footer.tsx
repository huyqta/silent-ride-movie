import Link from "next/link";
import { Film, Github, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background-secondary mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-red-700 rounded-lg flex items-center justify-center">
                                <Film className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold">SilentRide</span>
                        </Link>
                        <p className="text-foreground-secondary text-sm">
                            Website xem phim miễn phí với chất lượng cao. Dữ liệu được cung cấp bởi OPhim.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Danh mục</h3>
                        <ul className="space-y-2 text-sm text-foreground-secondary">
                            <li>
                                <Link href="/danh-sach/phim-le" className="hover:text-white transition-colors">
                                    Phim Lẻ
                                </Link>
                            </li>
                            <li>
                                <Link href="/danh-sach/phim-bo" className="hover:text-white transition-colors">
                                    Phim Bộ
                                </Link>
                            </li>
                            <li>
                                <Link href="/danh-sach/hoat-hinh" className="hover:text-white transition-colors">
                                    Hoạt Hình
                                </Link>
                            </li>
                            <li>
                                <Link href="/danh-sach/tv-shows" className="hover:text-white transition-colors">
                                    TV Shows
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Personal */}
                    <div>
                        <h3 className="font-semibold mb-4">Cá nhân</h3>
                        <ul className="space-y-2 text-sm text-foreground-secondary">
                            <li>
                                <Link href="/yeu-thich" className="hover:text-white transition-colors flex items-center gap-2">
                                    <Heart className="w-4 h-4" />
                                    Phim yêu thích
                                </Link>
                            </li>
                            <li>
                                <Link href="/lich-su" className="hover:text-white transition-colors">
                                    Lịch sử xem
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-6 text-center text-sm text-foreground-muted">
                    <p>
                        © {new Date().getFullYear()} SilentRide. Website chỉ dành cho mục đích cá nhân.
                    </p>
                    <p className="mt-1">
                        Dữ liệu phim được cung cấp bởi{" "}
                        <a
                            href="https://ophim.cc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            OPhim
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
