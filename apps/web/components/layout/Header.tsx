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
    HelpCircle,
    UserCircle,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { useProfileStore } from "@/lib/store/useProfileStore";
import { getCategories, getCountries } from "@/lib/api/ophim";
import HelpDialog from "@/components/ui/HelpDialog";
import { usePathname } from "next/navigation";

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
    const [helpOpen, setHelpOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const querySource = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('source') : null;
    const pathname = usePathname();

    const currentProfile = useProfileStore(state => state.currentProfile);
    const movieSource = useStore(state => state.movieSource);
    const setMovieSource = useStore(state => state.setMovieSource);
    const favoriteSlugs = useProfileStore(state => state.favoriteSlugs);
    const watchHistory = useProfileStore(state => state.watchHistory);

    const [genres, setGenres] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Fetch navigation data
    useEffect(() => {
        setMounted(true);
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

    // Sync source with cookie for SSR on mount
    useEffect(() => {
        if (mounted) {
            document.cookie = `movie-source=${movieSource}; path=/; max-age=31536000; SameSite=Lax`;
        }
    }, [mounted]);

    const sourceConfig = {
        ophim:  { hex: '#E50914', hoverHex: '#b20710', name: 'OPhim' },
        nguonc: { hex: '#0063E5', hoverHex: '#004db3', name: 'NguonPhim' },
        kkphim: { hex: '#F5C518', hoverHex: '#d4a800', name: 'KKPhim' },
    } as const;
    const activeColor = sourceConfig[movieSource].hex;
    const activeHoverColor = sourceConfig[movieSource].hoverHex;

    const handleSourceChange = (source: 'ophim' | 'nguonc' | 'kkphim') => {
        if (source === movieSource) return;
        document.cookie = `movie-source=${source}; path=/; max-age=31536000; SameSite=Lax`;
        setMovieSource(source);
        router.refresh();
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Check for first visit
    useEffect(() => {
        const hasVisited = localStorage.getItem("silent-ride-visited");
        if (!hasVisited) {
            const timer = setTimeout(() => {
                setHelpOpen(true);
                localStorage.setItem("silent-ride-visited", "true");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [mobileMenuOpen]);

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    if (pathname === '/profiles') return null;

    return (
        <>
            <style>{`:root { --primary: ${activeColor}; --primary-hover: ${activeHoverColor}; --primary-text: ${movieSource === 'kkphim' ? '#000000' : '#ffffff'}; }`}</style>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
                    }`}
            >
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" prefetch={false} className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3"
                            >
                                <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center overflow-hidden rounded-xl bg-black/50 group-hover:border-primary/50 transition-colors">
                                    <img
                                        src="/logo.png"
                                        alt="HKU Logo"
                                        className="w-full h-full object-cover transform scale-110 group-hover:scale-125 transition-transform duration-500"
                                        onError={(e) => {
                                            // Fallback if image not found
                                            (e.target as any).style.display = 'none';
                                            (e.target as any).nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div style={{ display: 'none' }} className="absolute inset-0 bg-gradient-to-br from-primary to-red-700 items-center justify-center">
                                        <Film className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                                        Silent Ride
                                    </span>
                                    <span className="text-[10px] md:text-xs font-medium text-primary tracking-[0.2em] uppercase leading-none">
                                        HQ - Premium Streaming
                                    </span>
                                </div>
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={false}
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
                                        prefetch={false}
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
                                                        prefetch={false}
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
                                                        prefetch={false}
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
                            {/* Help Button - hidden on mobile */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setHelpOpen(true)}
                                className="hidden md:flex p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5"
                                aria-label="Hướng dẫn"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </motion.button>

                            {/* Movie Source Switcher */}
                            <div className="relative group">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 p-2 px-3 text-xs font-bold transition-all rounded-lg bg-white/5 border"
                                    style={{ borderColor: `${activeColor}60`, color: activeColor }}
                                >
                                    <Layers className="w-4 h-4" />
                                    <span className="hidden sm:inline uppercase">
                                        {sourceConfig[movieSource].name}
                                    </span>
                                </motion.button>

                                <div className="absolute top-full right-0 mt-2 w-48 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <div className="p-2 space-y-1">
                                        {(Object.entries(sourceConfig) as [keyof typeof sourceConfig, typeof sourceConfig[keyof typeof sourceConfig]][]).map(([key, cfg]) => (
                                            <button
                                                key={key}
                                                onClick={() => handleSourceChange(key)}
                                                className={`w-full flex items-center justify-between pl-3 pr-4 py-2.5 rounded-lg text-sm transition-all border-l-2 ${movieSource === key ? 'bg-white/10' : 'border-transparent text-foreground-secondary hover:bg-white/5 hover:text-white'}`}
                                                style={movieSource === key ? { borderColor: cfg.hex, color: cfg.hex } : {}}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.hex }} />
                                                    {cfg.name}
                                                </span>
                                                {movieSource === key && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 border-t border-white/5">
                                        <p className="text-[10px] text-foreground-muted leading-tight">
                                            Chọn nguồn dữ liệu để có nhiều phim hơn.
                                        </p>
                                    </div>
                                </div>
                            </div>

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
                                prefetch={false}
                                className="hidden md:flex items-center gap-1 p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5 relative"
                            >
                                <Heart className="w-5 h-5" />
                                {mounted && favoriteSlugs.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[var(--primary-text)] text-xs rounded-full flex items-center justify-center">
                                        {favoriteSlugs.length}
                                    </span>
                                )}
                            </Link>

                            {/* History Link */}
                            <Link
                                href="/lich-su"
                                prefetch={false}
                                className="hidden md:flex items-center gap-1 p-2 text-foreground-secondary hover:text-white transition-colors rounded-lg hover:bg-white/5 relative"
                            >
                                <History className="w-5 h-5" />
                                {mounted && watchHistory.length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                                        {watchHistory.length}
                                    </span>
                                )}
                            </Link>

                            {/* Profile Switcher */}
                            {currentProfile && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.push('/profiles')}
                                    className="flex items-center gap-2 p-1 pl-2 md:pl-1 pr-1 md:pr-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                        {currentProfile.avatar_url ? (
                                            <img src={currentProfile.avatar_url} alt={currentProfile.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <UserCircle className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 hidden md:block group-hover:text-white transition-colors">
                                        {currentProfile.full_name}
                                    </span>
                                </motion.button>
                            )}

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
                        className="fixed inset-y-0 right-0 z-[55] w-80 max-w-full bg-background-secondary border-l border-border lg:hidden flex flex-col"
                    >
                        {/* Mobile Menu Header with Logo */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
                                <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg bg-black/50 border border-white/10 group-hover:border-primary/5 transition-colors">
                                    <img
                                        src="/logo.png"
                                        alt="HKU"
                                        className="w-full h-full object-cover transform scale-110"
                                        onError={(e) => {
                                            (e.target as any).style.display = 'none';
                                            (e.target as any).nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div style={{ display: 'none' }} className="absolute inset-0 bg-gradient-to-br from-primary to-red-700 items-center justify-center">
                                        <Film className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <span className="font-bold text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                    Silent Ride
                                </span>
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-foreground-muted"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 px-4">
                            <nav className="pt-4 space-y-1">
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
                                    {mounted && favoriteSlugs.length > 0 && (
                                        <span className="ml-auto px-2 py-0.5 bg-primary text-[var(--primary-text)] text-xs rounded-full">
                                            {favoriteSlugs.length}
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
                                    {mounted && watchHistory.length > 0 && (
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

            <HelpDialog isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
        </>
    );
}
