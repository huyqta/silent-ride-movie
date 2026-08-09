import MovieDetailPageClient from "./client";

export function generateStaticParams() {
    return [{ slug: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function MovieDetailPage({ params }: Props) {
    const resolvedParams = await params;
    return <MovieDetailPageClient params={resolvedParams} />;
}
