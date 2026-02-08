import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { getMovieDetail, getMoviePeoples } from "@/lib/api/ophim";
import VideoPlayer from "./VideoPlayer";
import EpisodeSelector from "./EpisodeSelector";
import MovieInfoDetails from "@/components/movie/MovieInfoDetails";

interface Props {
    params: Promise<{ slug: string; episode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, episode } = await params;
    try {
        const data = await getMovieDetail(slug);
        const movie = data.movie;
        return {
            title: `${movie.name} - Tập ${episode}`,
            description: `Xem ${movie.name} tập ${episode} - ${movie.origin_name}`,
        };
    } catch {
        return {
            title: "Xem phim",
        };
    }
}

export default async function WatchPage({ params }: Props) {
    const { slug, episode } = await params;

    let data;
    let peoplesData = null;

    try {
        [data, peoplesData] = await Promise.all([
            getMovieDetail(slug),
            getMoviePeoples(slug).catch(() => null) // Fallback if peoples API fails
        ]);
    } catch {
        notFound();
    }

    if (!data || !data.movie) {
        notFound();
    }

    const movie = data.movie;
    const peoples = peoplesData?.data?.peoples || [];
    const episodes = data.episodes || movie.episodes || [];

    // Find current episode
    let currentEpisode = null;
    let currentServerIndex = 0;
    let currentEpisodeIndex = 0;

    for (let i = 0; i < episodes.length; i++) {
        const serverData = episodes[i].server_data;
        const epIndex = serverData?.findIndex((ep: { slug: string }) => ep.slug === episode);
        if (epIndex !== undefined && epIndex !== -1) {
            currentEpisode = serverData[epIndex];
            currentServerIndex = i;
            currentEpisodeIndex = epIndex;
            break;
        }
    }

    if (!currentEpisode) {
        notFound();
    }

    const serverData = episodes[currentServerIndex]?.server_data || [];
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
                />
            </div>

            {/* Navigation buttons */}
            {/* <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {prevEpisode ? (
                        <Link
                            href={`/xem-phim/${slug}/${prevEpisode.slug}`}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Tập trước</span>
                            <span className="sm:hidden">{prevEpisode.name}</span>
                        </Link>
                    ) : (
                        <div />
                    )}

                    <Link
                        href="#movie-info"
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        Thông tin phim
                    </Link>
                    
                    {nextEpisode ? (
                        <Link
                            href={`/xem-phim/${slug}/${nextEpisode.slug}`}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                        >
                            <span className="hidden sm:inline">Tập tiếp</span>
                            <span className="sm:hidden">{nextEpisode.name}</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <div />
                    )}
                </div>
            </div> */}

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
                />
            </div>

            {/* Movie Info Details Section */}
            <div id="movie-info" className="container mx-auto px-4 scroll-mt-20 border-t border-white/5">
                <MovieInfoDetails movie={movie} peoples={peoples} />
            </div>
        </div>
    );
}
