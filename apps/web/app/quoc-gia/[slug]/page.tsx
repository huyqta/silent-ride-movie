import { Suspense } from "react";
import { getMoviesByCountry } from "@/lib/api/unified";
import CountryPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [{ slug: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function CountryPage({ params, searchParams }: Props) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const currentPage = Math.max(1, Number.parseInt(resolvedSearchParams.page || "1", 10) || 1);
    const initialData = await getMoviesByCountry(resolvedParams.slug, currentPage).catch(() => ({ data: { items: [] } }));

    return (
        <Suspense fallback={<SplashScreen />}>
            <CountryPageClient params={resolvedParams} initialData={initialData} currentPage={currentPage} />
        </Suspense>
    );
}
