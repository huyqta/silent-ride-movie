import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchHistoryItem, FavoriteItem, WatchProgress } from "@/types/movie";

interface StoreState {
    // Watch History
    watchHistory: WatchHistoryItem[];
    addToHistory: (item: Omit<WatchHistoryItem, "watchedAt">) => void;
    clearHistory: () => void;
    removeFromHistory: (slug: string) => void;

    // Favorites
    favorites: FavoriteItem[];
    addToFavorites: (item: Omit<FavoriteItem, "addedAt">) => void;
    removeFromFavorites: (slug: string) => void;
    isFavorite: (slug: string) => boolean;
    clearFavorites: () => void;

    // Watch Progress
    watchProgress: WatchProgress;
    updateProgress: (
        movieSlug: string,
        episode: string,
        episodeName: string,
        currentTime: number,
        duration: number
    ) => void;
    getProgress: (movieSlug: string) => WatchProgress[string] | null;
    clearProgress: (movieSlug: string) => void;
    clearAllProgress: () => void;

    // UI State
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    movieSource: 'ophim' | 'nguonc' | 'kkphim';
    setMovieSource: (source: 'ophim' | 'nguonc' | 'kkphim') => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set, get) => ({
            // Watch History
            watchHistory: [],
            addToHistory: (item) =>
                set((state) => {
                    // Remove existing entry if exists
                    const filtered = state.watchHistory.filter((h) => h.slug !== item.slug);
                    // Add new entry at the beginning, limit to 50 items
                    return {
                        watchHistory: [
                            { ...item, watchedAt: Date.now() },
                            ...filtered,
                        ].slice(0, 50),
                    };
                }),
            clearHistory: () => set({ watchHistory: [] }),
            removeFromHistory: (slug) =>
                set((state) => ({
                    watchHistory: state.watchHistory.filter((h) => h.slug !== slug),
                })),

            // Favorites
            favorites: [],
            addToFavorites: (item) =>
                set((state) => {
                    if (state.favorites.some((f) => f.slug === item.slug)) {
                        return state;
                    }
                    return {
                        favorites: [{ ...item, addedAt: Date.now() }, ...state.favorites],
                    };
                }),
            removeFromFavorites: (slug) =>
                set((state) => ({
                    favorites: state.favorites.filter((f) => f.slug !== slug),
                })),
            isFavorite: (slug) => get().favorites.some((f) => f.slug === slug),
            clearFavorites: () => set({ favorites: [] }),

            // Watch Progress
            watchProgress: {},
            updateProgress: (movieSlug, episode, episodeName, currentTime, duration) =>
                set((state) => ({
                    watchProgress: {
                        ...state.watchProgress,
                        [movieSlug]: {
                            episode,
                            episodeName,
                            currentTime,
                            duration,
                            updatedAt: Date.now(),
                        },
                    },
                })),
            getProgress: (movieSlug) => get().watchProgress[movieSlug] || null,
            clearProgress: (movieSlug) =>
                set((state) => {
                    const { [movieSlug]: _, ...rest } = state.watchProgress;
                    return { watchProgress: rest };
                }),
            clearAllProgress: () => set({ watchProgress: {} }),

            // UI State
            sidebarOpen: false,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            movieSource: 'ophim',
            setMovieSource: (source) => set({ movieSource: source }),
        }),
        {
            name: "silent-ride-storage",
            partialize: (state) => ({
                watchHistory: state.watchHistory,
                favorites: state.favorites,
                watchProgress: state.watchProgress,
                movieSource: state.movieSource,
            }),
        }
    )
);
