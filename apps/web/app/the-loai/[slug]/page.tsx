import { Suspense } from "react";
import GenrePageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [{ slug: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function GenrePage({ params }: Props) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<SplashScreen />}>
            <GenrePageClient params={resolvedParams} />
        </Suspense>
    );
}
