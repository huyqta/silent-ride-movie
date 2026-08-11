import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getMovieDetail, normalizeSource } from "@/lib/api/unified";
import { getEpisodeRouteKey } from "@/lib/episode-utils";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ source?: string; sv?: string }>;
}

export default async function WatchMovieSlugPage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies();
    const source = normalizeSource(resolvedSearchParams.source || cookieStore.get("movie-source")?.value);

    const detail = await getMovieDetail(resolvedParams.slug, source).catch(() => null);
    const episodes = detail?.episodes || detail?.movie?.episodes || [];
    const firstServer = episodes.find((server: any) => Array.isArray(server?.server_data) && server.server_data.length > 0);
    const firstEpisode = firstServer?.server_data?.[0];
    const firstEpisodeKey = firstEpisode ? getEpisodeRouteKey(firstEpisode) : "";

    if (!firstEpisodeKey) {
        notFound();
    }

    const nextParams = new URLSearchParams();
    if (resolvedSearchParams.sv) {
        nextParams.set("sv", resolvedSearchParams.sv);
    }

    const suffix = nextParams.toString() ? `?${nextParams.toString()}` : "";
    redirect(`/xem-phim/${resolvedParams.slug}/${firstEpisodeKey}${suffix}`);
}
