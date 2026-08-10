import { Suspense } from "react";
import { cookies } from "next/headers";
import { getMovieDetail } from "@/lib/api/unified";
import { getMovieDetailNguonC, getMovieDetailPhimApi, getMoviePeoples } from "@/lib/api/ophim";
import { getMovieDetailVSMov } from "@/lib/api/vsmov";
import WatchPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

interface Props {
    params: Promise<{ slug: string; episode: string }>;
}

export default async function WatchPage({ params }: Props) {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const source = cookieStore.get("movie-source")?.value;

    const watchData = await (async () => {
        const d = await getMovieDetail(resolvedParams.slug, source).catch(() => null);
        const p = await getMoviePeoples(resolvedParams.slug).catch(() => null);
        const [n, pa, vs] = await Promise.all([
            getMovieDetailNguonC(resolvedParams.slug).catch(() => null),
            getMovieDetailPhimApi(resolvedParams.slug).catch(() => null),
            getMovieDetailVSMov(resolvedParams.slug).catch(() => null),
        ]);

        return { d, p, n, pa, vs };
    })();

    return (
        <Suspense fallback={<SplashScreen />}>
            <WatchPageClient params={resolvedParams} initialData={watchData} />
        </Suspense>
    );
}
