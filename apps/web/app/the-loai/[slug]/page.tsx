import { Suspense } from "react";
import { getMoviesByGenre } from "@/lib/api/unified";
import GenrePageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [{ slug: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function GenrePage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page || "1", 10) || 1);
    const initialData = await getMoviesByGenre(resolvedParams.slug, currentPage).catch(() => ({ data: { items: [] } }));

    return (
        <Suspense fallback={<SplashScreen />}>
            <GenrePageClient params={resolvedParams} initialData={initialData} currentPage={currentPage} />
        </Suspense>
    );
}
