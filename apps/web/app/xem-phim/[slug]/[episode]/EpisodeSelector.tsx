"use client";

import { useState } from "react";
import Link from "next/link";
import type { Episode } from "@/types/movie";

interface EpisodeSelectorProps {
    episodes: Episode[];
    movieSlug: string;
    currentEpisode: string;
    initialServerIndex?: number;
}

export default function EpisodeSelector({
    episodes,
    movieSlug,
    currentEpisode,
    initialServerIndex = 0,
}: EpisodeSelectorProps) {
    const [activeServer, setActiveServer] = useState(initialServerIndex);

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
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2">
                {currentServer?.server_data?.map((ep: { slug: string; name: string }) => {
                    const isCurrent = ep.slug === currentEpisode;
                    
                    if (isCurrent) {
                        return (
                            <div
                                key={ep.slug}
                                className="px-3 py-2 text-center text-sm font-medium rounded-lg bg-primary text-white cursor-default"
                            >
                                {ep.name}
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={ep.slug}
                            href={`/xem-phim/${movieSlug}/${ep.slug}?sv=${activeServer}`}
                            prefetch={false}
                            className="px-3 py-2 text-center text-sm font-medium rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-foreground-secondary hover:text-white"
                        >
                            {ep.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

