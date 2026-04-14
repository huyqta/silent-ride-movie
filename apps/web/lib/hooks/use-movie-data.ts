"use client";

import { useEffect, useState } from "react";

// Global in-memory cache
const cache = new Map<string, any>();

export function useMovieData<T>(key: string | null, fetcher: () => Promise<T>) {
    const [data, setData] = useState<T | null>(() => {
        if (!key) return null;
        return cache.get(key) || null;
    });
    const [loading, setLoading] = useState(!data && !!key);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!key) {
            setLoading(false);
            return;
        }

        // If data is already in cache, we don't need to show loading (Stale-while-revalidate)
        const cachedData = cache.get(key);
        if (cachedData) {
            setData(cachedData);
            // We can still fetch in background to refresh, but for now we trust the cache
            setLoading(false);
        } else {
            setLoading(true);
        }

        async function doFetch() {
            try {
                const result = await fetcher();
                cache.set(key!, result);
                setData(result);
                setError(null);
            } catch (err) {
                setError(err);
                console.error(`Error fetching for key ${key}:`, err);
            } finally {
                setLoading(false);
            }
        }

        doFetch();
    }, [key]);

    return { data, loading, error };
}
