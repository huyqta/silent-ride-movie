import { Suspense } from "react";
import MovieListPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [
        { type: "phim-moi" },
        { type: "phim-bo" },
        { type: "phim-le" },
        { type: "tv-shows" },
        { type: "hoat-hinh" },
        { type: "phim-vietsub" },
        { type: "phim-thuyet-minh" },
        { type: "phim-long-tieng" },
        { type: "phim-bo-dang-chieu" },
        { type: "phim-bo-hoan-thanh" },
        { type: "phim-sap-chieu" },
        { type: "phim-chieu-rap" },
        { type: "subteam" },
    ];
}

interface Props {
    params: Promise<{ type: string }>;
}

export default async function MovieListPage({ params }: Props) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<SplashScreen />}>
            <MovieListPageClient params={resolvedParams} />
        </Suspense>
    );
}
