import { Suspense } from "react";
import CountryPageClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export function generateStaticParams() {
    return [{ slug: "placeholder" }];
}

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function CountryPage({ params }: Props) {
    const resolvedParams = await params;
    return (
        <Suspense fallback={<SplashScreen />}>
            <CountryPageClient params={resolvedParams} />
        </Suspense>
    );
}
