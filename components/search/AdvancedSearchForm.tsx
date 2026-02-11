"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown, Filter, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
    name: string;
    slug: string;
}

interface AdvancedSearchFormProps {
    genres: Option[];
    countries: Option[];
    types: Option[];
    initialValues: {
        keyword: string;
        genre: string[];
        country: string[];
        type: string[];
        year: string;
    };
    isCollapsed?: boolean;
}

export default function AdvancedSearchForm({
    genres,
    countries,
    types,
    initialValues,
    isCollapsed = false,
}: AdvancedSearchFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [keyword, setKeyword] = useState(initialValues.keyword);
    const [selectedGenres, setSelectedGenres] = useState<string[]>(initialValues.genre);
    const [selectedCountries, setSelectedCountries] = useState<string[]>(initialValues.country);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(initialValues.type);
    const [year, setYear] = useState(initialValues.year);

    const [showFilters, setShowFilters] = useState(!isCollapsed);

    // Sync with prop if it changes
    useEffect(() => {
        setShowFilters(!isCollapsed);
    }, [isCollapsed]);

    // Years range
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => (currentYear - i).toString());

    const toggleSelection = (slug: string, current: string[], setter: (val: string[]) => void) => {
        if (current.includes(slug)) {
            setter(current.filter(s => s !== slug));
        } else {
            setter([...current, slug]);
        }
    };

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const params = new URLSearchParams();
        if (selectedGenres.length > 0) params.set("genre", selectedGenres.join(","));
        if (selectedTypes.length > 0) params.set("type", selectedTypes.join(","));
        if (keyword) params.set("q", keyword);
        if (selectedCountries.length > 0) params.set("country", selectedCountries.join(","));
        if (year) params.set("year", year);

        // Preserve or set default limit
        const currentLimit = searchParams.get("limit") || "24";
        params.set("limit", currentLimit);

        router.push(`/tim-kiem-nang-cao?${params.toString()}#results`);
    };

    const handleReset = () => {
        setKeyword("");
        setSelectedGenres([]);
        setSelectedCountries([]);
        setSelectedTypes([]);
        setYear("");
        router.push("/tim-kiem-nang-cao");
    };

    return (
        <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden mb-8 shadow-xl">
            <div className="p-4 md:p-8">
                <form onSubmit={handleSearch} className="space-y-8">
                    {/* Keyword Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Nhập tên phim cần tìm..."
                            className="w-full pl-12 pr-4 py-4 bg-background rounded-xl border border-border focus:border-primary focus:outline-none transition-all placeholder:text-foreground-muted/50 text-lg"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 text-sm font-semibold text-foreground-secondary hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc nâng cao"}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
                        </button>

                        {(keyword || selectedGenres.length > 0 || selectedCountries.length > 0 || selectedTypes.length > 0 || year) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors py-2 px-4 rounded-lg hover:bg-primary/5"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Đặt lại mặc định
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-8 pt-4">
                                    {/* Year Select - Single Choice */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground-muted uppercase tracking-widest">
                                            Năm phát hành
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setYear("")}
                                                className={`px-4 py-2 rounded-lg text-sm transition-all ${!year ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-background hover:bg-white/5 border border-border text-foreground-secondary"}`}
                                            >
                                                Tất cả
                                            </button>
                                            {years.map((y) => (
                                                <button
                                                    key={y}
                                                    type="button"
                                                    onClick={() => setYear(y === year ? "" : y)}
                                                    className={`px-4 py-2 rounded-lg text-sm transition-all ${y === year ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-background hover:bg-white/5 border border-border text-foreground-secondary"}`}
                                                >
                                                    {y}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Type Selection (Grid) */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground-muted uppercase tracking-widest">
                                            Danh sách phim
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2">
                                            {types.map((t) => (
                                                <button
                                                    key={t.slug}
                                                    type="button"
                                                    onClick={() => toggleSelection(t.slug, selectedTypes, setSelectedTypes)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${selectedTypes.includes(t.slug) ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-foreground-secondary hover:border-foreground-muted"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedTypes.includes(t.slug) ? "bg-primary border-primary" : "border-foreground-muted"}`}>
                                                        {selectedTypes.includes(t.slug) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="truncate">{t.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Genre Selection (Grid) */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground-muted uppercase tracking-widest">
                                            Thể loại
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                            {genres.map((g) => (
                                                <button
                                                    key={g.slug}
                                                    type="button"
                                                    onClick={() => toggleSelection(g.slug, selectedGenres, setSelectedGenres)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${selectedGenres.includes(g.slug) ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-foreground-secondary hover:border-foreground-muted"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedGenres.includes(g.slug) ? "bg-primary border-primary" : "border-foreground-muted"}`}>
                                                        {selectedGenres.includes(g.slug) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="truncate">{g.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Country Selection (Grid) */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-foreground-muted uppercase tracking-widest">
                                            Quốc gia
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                            {countries.map((c) => (
                                                <button
                                                    key={c.slug}
                                                    type="button"
                                                    onClick={() => toggleSelection(c.slug, selectedCountries, setSelectedCountries)}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${selectedCountries.includes(c.slug) ? "bg-primary/10 border-primary text-primary" : "bg-background border-border text-foreground-secondary hover:border-foreground-muted"}`}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCountries.includes(c.slug) ? "bg-primary border-primary" : "border-foreground-muted"}`}>
                                                        {selectedCountries.includes(c.slug) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <span className="truncate">{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        className="w-full py-5 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="text-lg">Tìm kiếm</span>
                    </button>
                </form>
            </div>
        </div>
    );
}
