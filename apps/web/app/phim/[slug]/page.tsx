import { getMovieDetailBySource } from "@/lib/api/unified";
import MovieDetailPageClient from "./client";

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ source?: string }>;
}

export default async function MovieDetailPage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const source = resolvedSearchParams.source === "ophim"
        || resolvedSearchParams.source === "nguonc"
        || resolvedSearchParams.source === "kkphim"
        || resolvedSearchParams.source === "vsmov"
        ? resolvedSearchParams.source
        : "ophim";

    const initialData = await getMovieDetailBySource(resolvedParams.slug, source).catch(() => null);

    return <MovieDetailPageClient params={resolvedParams} initialData={initialData} source={source} />;
}
