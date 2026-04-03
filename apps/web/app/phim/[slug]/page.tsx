import { Metadata } from "next";
import Image from "next/image";

export const revalidate = 3600;
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Heart, Share2, Calendar, Clock, Globe, Star, ChevronRight } from "lucide-react";
import { getMovieDetail, getImageUrl } from "@/lib/api/ophim";
import MovieSlider from "@/components/movie/MovieSlider";
import FavoriteButton from "./FavoriteButton";
import EpisodeList from "./EpisodeList";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await getMovieDetail(slug);
        const movie = data.movie;
        return {
            title: movie.name,
            description: movie.content?.slice(0, 160) || `Xem phim ${movie.name} - ${movie.origin_name}`,
            openGraph: {
                title: movie.name,
                description: movie.content?.slice(0, 160),
                images: [getImageUrl(movie.poster_url || movie.thumb_url)],
            },
        };
    } catch {
        return {
            title: "Không tìm thấy phim",
        };
    }
}

export default async function MovieDetailPage({ params }: Props) {
    const { slug } = await params;

    let data;
    try {
        data = await getMovieDetail(slug);
    } catch {
        notFound();
    }

    if (!data || !data.movie) {
        notFound();
    }

    const movie = data.movie;
    const episodes = data.episodes || movie.episodes || [];

    return (
        <div className="min-h-screen">
            {/* Hero Background */}
            <div className="relative h-[50vh] md:h-[60vh]">
                <Image
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 -mt-48 relative z-10">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-48 md:w-64 mx-auto md:mx-0">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                            <Image
                                src={getImageUrl(movie.thumb_url)}
                                alt={movie.name}
                                fill
                                sizes="256px"
                                className="object-cover"
                            />
                            {movie.quality && (
                                <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-xs font-semibold rounded">
                                    {movie.quality}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-4xl font-bold mb-2">{movie.name}</h1>
                        <p className="text-lg text-foreground-secondary mb-4">{movie.origin_name}</p>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-foreground-secondary mb-6">
                            {movie.year && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {movie.year}
                                </div>
                            )}
                            {movie.time && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {movie.time}
                                </div>
                            )}
                            {movie.lang && (
                                <div className="flex items-center gap-1">
                                    <Globe className="w-4 h-4" />
                                    {movie.lang}
                                </div>
                            )}
                            {movie.view && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    {movie.view.toLocaleString()} lượt xem
                                </div>
                            )}
                        </div>

                        {/* Episode info */}
                        {movie.episode_current && (
                            <p className="text-foreground-muted mb-4">
                                {movie.episode_current} / {movie.episode_total || "?"}
                            </p>
                        )}

                        {/* Categories */}
                        {movie.category && movie.category.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
                                {movie.category.map((cat: { slug: string; name: string }) => (
                                    <Link
                                        key={cat.slug}
                                        href={`/the-loai/${cat.slug}`}
                                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-sm rounded-full transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                            {episodes.length > 0 && episodes[0]?.server_data?.length > 0 && (
                                <Link
                                    href={`/xem-phim/${movie.slug}/${episodes[0].server_data[0].slug}`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors shadow-lg shadow-primary/30"
                                >
                                    <Play className="w-5 h-5" fill="white" />
                                    Xem phim
                                </Link>
                            )}
                            <FavoriteButton movie={movie} />
                        </div>

                        {/* Description */}
                        {movie.content && (
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-lg font-semibold mb-2">Nội dung</h3>
                                <div
                                    className="text-foreground-secondary text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: movie.content }}
                                />
                            </div>
                        )}

                        {/* Cast & Crew */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {movie.director && movie.director.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Đạo diễn</h4>
                                    <p className="text-foreground-secondary text-sm">
                                        {movie.director.join(", ")}
                                    </p>
                                </div>
                            )}
                            {movie.actor && movie.actor.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Diễn viên</h4>
                                    <p className="text-foreground-secondary text-sm">
                                        {movie.actor.slice(0, 10).join(", ")}
                                        {movie.actor.length > 10 && "..."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Episode List */}
                {episodes.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold mb-4">Danh sách tập</h2>
                        <EpisodeList episodes={episodes} movieSlug={movie.slug} />
                    </div>
                )}
            </div>
        </div>
    );
}
