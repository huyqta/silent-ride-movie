export default function MovieCardSkeleton() {
    return (
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-background-secondary">
            <div className="skeleton w-full h-full" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="skeleton h-4 w-3/4 rounded mb-2" />
                <div className="skeleton h-3 w-1/2 rounded" />
            </div>
        </div>
    );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <MovieCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function MovieSliderSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="flex gap-4 overflow-hidden pb-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-13px)]"
                >
                    <MovieCardSkeleton />
                </div>
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="relative h-[60vh] md:h-[70vh] skeleton">
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="skeleton h-8 w-1/3 rounded mb-4" />
                <div className="skeleton h-4 w-2/3 rounded mb-2" />
                <div className="skeleton h-4 w-1/2 rounded mb-6" />
                <div className="flex gap-4">
                    <div className="skeleton h-12 w-32 rounded-lg" />
                    <div className="skeleton h-12 w-32 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
