import { Suspense } from "react";
import WatchPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [{ slug: "placeholder", episode: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string; episode: string }>;
}

export default async function WatchPage({ params }: Props) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<SplashScreen />}>
            <WatchPageClient params={resolvedParams} />
        </Suspense>
    );
}
