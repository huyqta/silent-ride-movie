import { Suspense } from "react";
import AdvancedSearchClient from "./client";
import SplashScreen from "@/components/ui/SplashScreen";

export const metadata = {
    title: "Tìm kiếm nâng cao | SilentRide",
    description: "Lọc và tìm kiếm phim theo tên, quốc gia, thể loại và danh sách.",
};

export default function AdvancedSearchPage() {
    return (
        <Suspense fallback={<SplashScreen />}>
            <AdvancedSearchClient />
        </Suspense>
    );
}
