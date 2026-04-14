"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Episode } from "@/types/movie";
import { useStore } from "@/lib/store/useStore";

interface EpisodeListProps {
    episodes: Episode[];
    movieSlug: string;
}

export default function EpisodeList({ episodes, movieSlug }: EpisodeListProps) {
    const [activeServer, setActiveServer] = useState(0);
    const { getProgress } = useStore();
    const progress = getProgress(movieSlug);

    if (!episodes || episodes.length === 0) return null;

    const currentServer = episodes[activeServer];

    return (
        <div className="space-y-4">
            {/* Server tabs */}
            {episodes.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {episodes.map((server, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveServer(index)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeServer === index
                                    ? "bg-primary text-white"
                                    : "bg-white/10 text-foreground-secondary hover:bg-white/20"
                                }`}
                        >
                            {server.server_name}
                        </button>
                    ))}
                </div>
            )}

            {/* Episode grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                {currentServer?.server_data?.map((ep) => {
                    const isWatching = progress?.episode === ep.slug;
                    return (
                        <Link
                            key={ep.slug}
                            href={`/xem-phim/${movieSlug}/${ep.slug}?sv=${activeServer}`}
                            prefetch={false}
                            className={`relative px-3 py-2 text-center text-sm font-medium rounded-lg transition-colors ${isWatching
                                    ? "bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background"
                                    : "bg-white/10 hover:bg-white/20 text-foreground-secondary hover:text-white"
                                }`}
                        >
                            {ep.name}
                            {isWatching && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
