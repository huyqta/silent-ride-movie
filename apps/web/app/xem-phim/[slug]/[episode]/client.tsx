"use client";

import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getMovieDetail } from "@/lib/api/unified";
import { getMoviePeoples, getMovieDetailNguonC, getMovieDetailPhimApi } from "@/lib/api/ophim";
import { getMovieDetailVSMov } from "@/lib/api/vsmov";
import VideoPlayer from "./VideoPlayer";
import EpisodeSelector from "./EpisodeSelector";
import MovieInfoDetails from "@/components/movie/MovieInfoDetails";
import SplashScreen from "@/components/ui/SplashScreen";
import { useMovieData } from "@/lib/hooks/use-movie-data";

interface ClientProps {
    params: { slug: string; episode: string };
}

export default function WatchPageClient({ params }: ClientProps) {
    const { slug, episode } = params;
    const searchParams = useSearchParams();
    const sv = searchParams.get("sv");
    const requestedServerIndex = sv ? parseInt(sv) : undefined;

    const { data: watchData, loading } = useMovieData(`watch-${slug}`, async () => {
        // 1. Fetch main movie detail based on active source immediately (essential for playback)
        const d = await getMovieDetail(slug).catch(() => null);
        const p = await getMoviePeoples(slug).catch(() => null);

        // 2. Fetch backup sources asynchronously so they appear in the player
        // We catch all errors locally to prevent a single offline API (like VSMov) from breaking page load
        const [n, pa, vs] = await Promise.all([
            getMovieDetailNguonC(slug).catch(() => null),
            getMovieDetailPhimApi(slug).catch(() => null),
            // Fetch VSMov detail and safely catch error (returning null to indicate no response, which resolves to no link button)
            getMovieDetailVSMov(slug).catch((err) => {
                console.warn("VSMov detail query failed:", err);
                return null;
            })
        ]);

        return { d, p, n, pa, vs };
    });

    if (loading) {
        return <SplashScreen />;
    }

    if (!watchData || !watchData.d || !watchData.d.movie) {
        notFound();
    }

    const movie = watchData.d.movie;
    const peoples = watchData.p?.data?.peoples || [];
    const episodes = watchData.d.episodes || movie.episodes || [];

    // Find current episode and server more efficiently
    let currentEpisode = null;
    let currentServerIndex = -1;

    // Try finding in requested server first
    if (requestedServerIndex !== undefined && episodes[requestedServerIndex]) {
        currentEpisode = episodes[requestedServerIndex].server_data?.find((ep: { slug: string }) => ep.slug === episode);
        if (currentEpisode) {
            currentServerIndex = requestedServerIndex;
        }
    }

    // Default to search in all servers if not found in requested server
    if (!currentEpisode) {
        currentServerIndex = episodes.findIndex((server: any) => 
            server.server_data?.some((ep: { slug: string }) => ep.slug === episode)
        );

        if (currentServerIndex !== -1) {
            const serverData = episodes[currentServerIndex].server_data;
            currentEpisode = serverData.find((ep: { slug: string }) => ep.slug === episode);
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
                    prevEpisodeSlug={prevEpisode?.slug}
                    nextEpisodeSlug={nextEpisode?.slug}
                    serverIndex={currentServerIndex}

                    nguonCData={watchData.n}
                    phimApiData={watchData.pa}
                    vsmovData={watchData.vs}
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
