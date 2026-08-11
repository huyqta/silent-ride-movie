"use client";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getEpisodeRouteKey, isEpisodeRouteMatch } from "@/lib/episode-utils";
import VideoPlayer from "./VideoPlayer";
import EpisodeSelector from "./EpisodeSelector";
import MovieInfoDetails from "@/components/movie/MovieInfoDetails";

interface ClientProps {
    params: { slug: string; episode: string };
    initialData: {
        d: any;
        p: any;
        n: any;
        pa: any;
        vs: any;
    };
}

export default function WatchPageClient({ params, initialData }: ClientProps) {
    const { slug, episode } = params;
    const searchParams = useSearchParams();
    const sv = searchParams.get("sv");
    const requestedServerIndex = sv ? parseInt(sv) : undefined;

    if (!initialData || !initialData.d || !initialData.d.movie) {
        notFound();
    }

    const movie = initialData.d.movie;
    const peoples = initialData.p?.data?.peoples || [];
    const episodes = initialData.d.episodes || movie.episodes || [];

    // Find current episode and server more efficiently
    let currentEpisode = null;
    let currentServerIndex = -1;

    // Try finding in requested server first
    if (requestedServerIndex !== undefined && episodes[requestedServerIndex]) {
        currentEpisode = episodes[requestedServerIndex].server_data?.find((ep: any) => isEpisodeRouteMatch(ep, episode));
        if (currentEpisode) {
            currentServerIndex = requestedServerIndex;
        }
    }

    // Default to search in all servers if not found in requested server
    if (!currentEpisode) {
        currentServerIndex = episodes.findIndex((server: any) => 
            server.server_data?.some((ep: any) => isEpisodeRouteMatch(ep, episode))
        );

        if (currentServerIndex !== -1) {
            const serverData = episodes[currentServerIndex].server_data;
            currentEpisode = serverData.find((ep: any) => isEpisodeRouteMatch(ep, episode));
        }
    }

    if (!currentEpisode) {
        notFound();
    }

    const serverData = episodes[currentServerIndex]?.server_data || [];
    const currentEpisodeIndex = serverData.indexOf(currentEpisode);
    const prevEpisode = serverData[currentEpisodeIndex - 1];
    const nextEpisode = serverData[currentEpisodeIndex + 1];

    return (
        <div className="min-h-screen bg-black">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <nav className="flex items-center gap-2 text-sm text-foreground-secondary">
                    <Link href="/" className="hover:text-white transition-colors">
                        <Home className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href={`/phim/${slug}`} className="hover:text-white transition-colors line-clamp-1">
                        {movie.name}
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white">Tập {currentEpisode.name}</span>
                </nav>
            </div>

            {/* Video Player */}
            <div className="container mx-auto px-4">
                <VideoPlayer
                    movieSlug={slug}
                    movieName={movie.name}
                    movieThumb={movie.thumb_url}
                    episode={episode}
                    episodeName={currentEpisode.name}
                    embedUrl={currentEpisode.link_embed}
                    m3u8Url={currentEpisode.link_m3u8}
                    prevEpisodeSlug={prevEpisode ? getEpisodeRouteKey(prevEpisode) : undefined}
                    nextEpisodeSlug={nextEpisode ? getEpisodeRouteKey(nextEpisode) : undefined}
                    serverIndex={currentServerIndex}

                    nguonCData={initialData.n}
                    phimApiData={initialData.pa}
                    vsmovData={initialData.vs}
                />
            </div>

            {/* Episode selector */}
            <div className="container mx-auto px-4 py-6 border-t border-white/5">
                <h2 className="text-xl font-black mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    Chọn tập
                </h2>
                <EpisodeSelector
                    episodes={episodes}
                    movieSlug={slug}
                    currentEpisode={episode}
                    initialServerIndex={currentServerIndex}
                />
            </div>

            {/* Movie Info Details Section */}
            <div id="movie-info" className="container mx-auto px-4 scroll-mt-20 border-t border-white/5">
                <MovieInfoDetails movie={movie} peoples={peoples} />
            </div>
        </div>
    );
}
