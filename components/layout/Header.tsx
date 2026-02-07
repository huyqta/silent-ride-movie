"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Menu,
    X,
    Film,
    Tv,
    Sparkles,
    Monitor,
    Heart,
    History,
    ChevronDown,
    Gamepad2,
    Languages,
    Mic2,
    Volume2,
    PlayCircle,
    CheckCircle2,
    Calendar,
    Ticket,
    Users,
    Globe,
    Layers,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { getCategories, getCountries } from "@/lib/api/ophim";

const navItems = [
    { name: "Phim Lẻ", href: "/danh-sach/phim-le", icon: Film },
    { name: "Phim Bộ", href: "/danh-sach/phim-bo", icon: Tv },
    { name: "Hoạt Hình", href: "/danh-sach/hoat-hinh", icon: Gamepad2 },
    { name: "Tìm phim", href: "/tim-kiem-nang-cao", icon: Search },
];

const exploreItems = [
    { name: "Phim Vietsub", href: "/danh-sach/phim-vietsub", icon: Languages },
    { name: "Thuyết Minh", href: "/danh-sach/phim-thuyet-minh", icon: Mic2 },
    { name: "Lồng Tiếng", href: "/danh-sach/phim-long-tieng", icon: Volume2 },
    { name: "Bộ Đang Chiếu", href: "/danh-sach/phim-bo-dang-chieu", icon: PlayCircle },
    { name: "Bộ Hoàn Thành", href: "/danh-sach/phim-bo-hoan-thanh", icon: CheckCircle2 },
    { name: "Sắp Chiếu", href: "/danh-sach/phim-sap-chieu", icon: Calendar },
    { name: "Chiếu Rạp", href: "/danh-sach/phim-chieu-rap", icon: Ticket },
    { name: "Subteam", href: "/danh-sach/subteam", icon: Users },
];

export default function Header() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const [genres, setGenres] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { favorites, watchHistory } = useStore();

    // Fetch navigation data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gData, cData] = await Promise.all([
                    getCategories(),
                    getCountries(),
                ]);
                setGenres(gData?.data?.items || []);
                setCountries(cData?.data?.items || []);
            } catch (error) {
                console.error("Failed to fetch header data:", error);
            }
        };
        fetchData();
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-red-700 rounded-lg flex items-center justify-center">
                                    <Film className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                    Silent Ride [HKU]
                                </span>
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </Link>
                            ))}

                            {/* Thể loại Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveMenu("genres")}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <button
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    Thể loại
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "genres" ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {activeMenu === "genres" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-[480px] glass rounded-xl border border-white/10 shadow-2xl overflow-hidden p-4"
                                        >
                                            <div className="grid grid-cols-3 gap-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                                {genres.map((genre) => (
                                                    <Link
                                                        key={genre.slug}
                                                        href={`/the-loai/${genre.slug}`}
                                                        onClick={() => setActiveMenu(null)}
                                                        className="px-3 py-2 text-xs text-foreground-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        {genre.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Quốc gia Dropdown */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setActiveMenu("countries")}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <button
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    Quốc gia
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "countries" ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {activeMenu === "countries" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-[400px] glass rounded-xl border border-white/10 shadow-2xl overflow-hidden p-4"
                                        >
                                            <div className="grid grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto scrollbar-hide">
                                                {countries.map((country) => (
                                                    <Link
                                                        key={country.slug}
                                                        href={`/quoc-gia/${country.slug}`}
                                                        onClick={() => setActiveMenu(null)}
                                                        className="px-3 py-2 text-xs text-foreground-secondary hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        {country.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Explore Dropdown (Danh sách) */}
                            <div
                                className="relative group/explore"
                                onMouseEnter={() => setActiveMenu("explore")}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <button
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                >
                                    Danh sách
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeMenu === "explore" ? "rotate-180" : ""}`} />
                                </button>

                                <AnimatePresence>
                                    {activeMenu === "explore" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 mt-2 w-64 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden overflow-y-auto max-h-[70vh] scrollbar-hide"
                                        >
                                            <div className="p-2 grid grid-cols-1 gap-1">
                                                {exploreItems.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setActiveMenu(null)}
                                                        className="flex items-center gap-3 px-4 py-3 text-sm text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors group/item"
                                                    >
                                                        <item.icon className="w-4 h-4 text-foreground-muted group-hover/item:text-primary transition-colors" />
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                aria-label="Tìm kiếm"
                            >
                                <Search className="w-5 h-5" />
                            </motion.button>

                            {/* Favorites Link */}
                            <Link
                                href="/yeu-thich"
                                className="hidden md:flex items-center gap-1 p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5 relative"
                            >
                                <Heart className="w-5 h-5" />
                                {favorites.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                                        {favorites.length > 9 ? "9+" : favorites.length}
                                    </span>
                                )}
                            </Link>

                            {/* History Link */}
                            <Link
                                href="/lich-su"
                                className="hidden md:flex items-center gap-1 p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5 relative"
                            >
                                <History className="w-5 h-5" />
                                {watchHistory.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                                        {watchHistory.length > 9 ? "9+" : watchHistory.length}
                                    </span>
                                )}
                            </Link>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-foreground-secondary hover:text-white transition-colors"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm"
                        onClick={() => setSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="container mx-auto px-4 pt-24"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground-muted" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm phim, diễn viên, thể loại..."
                                        className="w-full pl-14 pr-4 py-4 text-lg bg-background-secondary rounded-2xl border border-border focus:border-primary focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setSearchOpen(false)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-center text-foreground-muted text-sm mt-4">
                                    Nhấn Enter để tìm kiếm hoặc ESC để đóng. <Link href="/tim-kiem-nang-cao" onClick={() => setSearchOpen(false)} className="text-primary hover:underline ml-1">Tìm kiếm nâng cao</Link>
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "tween" }}
                        className="fixed inset-y-0 right-0 z-[55] w-80 max-w-full bg-background-secondary border-l border-border lg:hidden"
                    >
                        <div className="flex flex-col h-full pt-20 pb-6 px-4">
                            <nav className="flex-1 space-y-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                ))}

                                <div className="pt-4 pb-2 px-4">
                                    <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Thể loại</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1 px-2">
                                    {genres.slice(0, 10).map((genre: any) => (
                                        <Link
                                            key={genre.slug}
                                            href={`/the-loai/${genre.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="px-4 py-2 text-sm text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {genre.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/tim-kiem-nang-cao"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2 text-sm text-primary hover:underline transition-colors"
                                    >
                                        Xem tất cả...
                                    </Link>
                                </div>

                                <div className="pt-4 pb-2 px-4">
                                    <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Quốc gia</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1 px-2">
                                    {countries.slice(0, 10).map((country: any) => (
                                        <Link
                                            key={country.slug}
                                            href={`/quoc-gia/${country.slug}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="px-4 py-2 text-sm text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            {country.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href="/tim-kiem-nang-cao"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2 text-sm text-primary hover:underline transition-colors"
                                    >
                                        Xem tất cả...
                                    </Link>
                                </div>

                                <div className="pt-4 pb-2 px-4">
                                    <p className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Danh sách</p>
                                </div>

                                {exploreItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                ))}

                                <hr className="border-border my-4" />
                                <Link
                                    href="/yeu-thich"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <Heart className="w-5 h-5" />
                                    Yêu thích
                                    {favorites.length > 0 && (
                                        <span className="ml-auto px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                            {favorites.length}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    href="/lich-su"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <History className="w-5 h-5" />
                                    Lịch sử xem
                                    {watchHistory.length > 0 && (
                                        <span className="ml-auto px-2 py-0.5 bg-accent text-white text-xs rounded-full">
                                            {watchHistory.length}
                                        </span>
                                    )}
                                </Link>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile menu backdrop */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[54] bg-black/60 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
