import { cookies } from "next/headers";
import { getMovieDetailBySource } from "@/lib/api/unified";
import MovieDetailPageClient from "./client";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ source?: string }>;
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const cookieStore = await cookies();
    const cookieSource = cookieStore.get("movie-source")?.value;
    const source = resolvedSearchParams.source === "ophim"
        || resolvedSearchParams.source === "nguonc"
        || resolvedSearchParams.source === "kkphim"
        || resolvedSearchParams.source === "vsmov"
        ? resolvedSearchParams.source
        : cookieSource === "ophim" || cookieSource === "nguonc" || cookieSource === "kkphim" || cookieSource === "vsmov"
            ? cookieSource
            : "ophim";

    const initialData = await getMovieDetailBySource(resolvedParams.slug, source).catch(() => null);

    return <MovieDetailPageClient params={resolvedParams} initialData={initialData} source={source} />;
}
