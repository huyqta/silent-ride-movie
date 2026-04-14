"use client";

import Link from "next/link";
import { MovieDetail, Person } from "@/types/movie";
import {
    Tag,
    Globe,
    Info,
    Star,
    Users,
    Calendar,
    Clock,
    Layout,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useRef } from "react";

interface MovieInfoDetailsProps {
    movie: MovieDetail;
    peoples?: Person[];
}

export default function MovieInfoDetails({ movie, peoples = [] }: MovieInfoDetailsProps) {
    const actorScrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (actorScrollRef.current) {
            const { scrollLeft, clientWidth } = actorScrollRef.current;
            const scrollTo = direction === "left"
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            actorScrollRef.current.scrollTo({
                left: scrollTo,
                behavior: "smooth"
            });
        }
    };

    // Helper to get cast list (prefers peoples API, falls back to movie.actor)
    const cast = peoples.length > 0
        ? peoples
        : (movie.actor || []).map(name => ({ name, character: "Acting", profile_path: null } as Person));

    return (
        <div className="space-y-12 py-8">
            {/* Header section with Titles and Badges */}
            <div className="space-y-4">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        {movie.name}
                    </h1>
                    {movie.origin_name && (
                        <p className="text-xl md:text-2xl text-foreground-secondary font-medium italic">
                            {movie.origin_name}
                        </p>
                    )}
                </div>
                {/* Movie Description / Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t border-white/5">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-white">Nội dung phim</h2>
                        <div className="space-y-4">
                            <div
                                className="text-foreground-secondary leading-relaxed text-sm md:text-base font-medium prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: movie.content }}
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Additional Metadata */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" /> Chi tiết
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                                    <span className="text-foreground-muted">Đạo diễn:</span>
                                    <span className="text-white font-bold">{movie.director?.join(", ") || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                                    <span className="text-foreground-muted">Thời lượng:</span>
                                    <span className="text-white font-bold">{movie.time || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                                    <span className="text-foreground-muted">Phát hành:</span>
                                    <span className="text-white font-bold">{movie.year}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs py-2 border-b border-white/5">
                                    <span className="text-foreground-muted">Chất lượng:</span>
                                    <span className="text-white font-bold">{movie.quality}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags / Types */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary" /> Từ khóa
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {movie.category?.map(cat => (
                                    <Link
                                        key={cat.slug}
                                        href={`/the-loai/${cat.slug}`}
                                        prefetch={false}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-foreground-secondary hover:text-white rounded-lg transition-all border border-white/10"
                                    >
                                        #{cat.slug}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
                    <span className="px-3 py-1 bg-white/10 text-white rounded-md border border-white/5">
                        {movie.type === "series" ? "Phim Bộ" : "Phim Lẻ"}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white rounded-md border border-white/5">
                        {movie.year}
                    </span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/10">
                        {movie.lang}
                    </span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-md border border-yellow-500/10">
                        {movie.quality}
                    </span>
                </div>
            </div>

            {/* Metadata Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Genres */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Thể loại</span>
                        </div>
                        <span className="w-6 h-6 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold">
                            {movie.category?.length || 0}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {movie.category?.map(cat => (
                            <Link
                                key={cat.slug}
                                href={`/the-loai/${cat.slug}`}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded-md transition-colors border border-white/5"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                </div>

                {/* Countries */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Globe className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Quốc gia</span>
                        </div>
                        <span className="w-6 h-6 flex items-center justify-center bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">
                            {movie.country?.length || 0}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {movie.country?.map(c => (
                            <Link
                                key={c.slug}
                                href={`/quoc-gia/${c.slug}`}
                                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[10px] rounded-md transition-colors border border-white/5"
                            >
                                {c.name}
                            </Link>
                        ))}
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                </div>

                {/* Technical Info */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400">
                            <Info className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Thông tin</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-md text-[10px] font-black uppercase">
                            {movie.status === "completed" ? "Hoàn thành" : "Đang chiếu"}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground-muted">Thời lượng:</span>
                            <span className="font-bold text-white">{movie.time || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground-muted">Tập hiện tại:</span>
                            <span className="font-bold text-primary">{movie.episode_current}</span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                </div>

                {/* TMDB */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <Layout className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">TMDB</span>
                        </div>
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-md text-[10px] font-black uppercase">
                            {movie.tmdb?.type || "movie"}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground-muted">ID TMDB:</span>
                            <span className="font-bold text-white uppercase">{movie.tmdb?.id || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[14px] font-black text-white">
                                {movie.tmdb?.vote_average?.toFixed(1) || "N/A"}
                            </span>
                            <span className="text-[10px] text-foreground-muted">
                                ({movie.tmdb?.vote_count || 0})
                            </span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                </div>

                {/* IMDb */}
                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-500">
                            <Star className="w-4 h-4 fill-yellow-500" />
                            <span className="text-xs font-bold uppercase tracking-wider">IMDb</span>
                        </div>
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-md text-[10px] font-black uppercase">
                            Rating
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-foreground-muted">ID IMDb:</span>
                            <span className="font-bold text-white uppercase">{movie.imdb?.id || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[14px] font-black text-yellow-500">
                                N/A
                            </span>
                            <span className="text-[10px] text-foreground-muted">/10</span>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                </div>
            </div>

            {/* Cast / Actors Carousel */}
            {cast.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <Users className="w-6 h-6 text-primary" />
                            Diễn viên
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scroll("left")}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={actorScrollRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x"
                    >
                        {cast.map((person, idx) => (
                            <div
                                key={idx}
                                className="flex-none w-40 glass rounded-2xl border border-white/10 overflow-hidden snap-start hover:border-primary/50 transition-colors group"
                            >
                                <div className="aspect-[3/4] bg-white/5 flex items-center justify-center relative">
                                    {person.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                            alt={person.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <Users className="w-12 h-12 text-white/10 group-hover:scale-110 transition-transform duration-500" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-xs font-black text-white line-clamp-1 mb-1">{person.name}</p>
                                    <p className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest line-clamp-1">
                                        {person.character || "Acting"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
}
