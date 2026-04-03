import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Profile {
  id: string
  full_name: string
  avatar_url?: string
}

export interface WatchProgressItem {
  episode: string
  episodeName: string
  currentTime: number
  duration: number
  updatedAt: number
}

export interface WatchHistoryItem {
  movie_slug: string
  movie_title: string
  poster_url: string
  episode_slug: string
  episode_name: string
  duration: number
  playback_time: number
  updated_at: string
}

interface ProfileState {
  currentProfile: Profile | null
  favoriteSlugs: string[]
  watchHistory: WatchHistoryItem[] // Typed history
  watchProgress: Record<string, WatchProgressItem> // For movie cards/player
  setProfile: (profile: Profile | null) => void
  setFavoriteSlugs: (slugs: string[]) => void
  toggleFavoriteSlug: (slug: string) => void
  setWatchHistory: (history: WatchHistoryItem[]) => void
  setWatchProgress: (progress: Record<string, WatchProgressItem>) => void
  updateWatchProgress: (slug: string, progress: WatchProgressItem) => void
  getProfileId: () => string | null
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      currentProfile: null,
      favoriteSlugs: [],
      watchHistory: [],
      watchProgress: {},
      setProfile: (profile) => {
        // When profile changes, reset all profile-specific data
        set({ 
          currentProfile: profile, 
          favoriteSlugs: [], 
          watchHistory: [], 
          watchProgress: {} 
        })
      },
      setFavoriteSlugs: (slugs) => set({ favoriteSlugs: slugs }),
      toggleFavoriteSlug: (slug) => set((state) => ({
        favoriteSlugs: state.favoriteSlugs.includes(slug)
          ? state.favoriteSlugs.filter(s => s !== slug)
          : [...state.favoriteSlugs, slug]
      })),
      setWatchHistory: (history) => set({ 
        watchHistory: history.slice(0, 50) // Limit local storage size
      }),
      setWatchProgress: (progress) => set({ watchProgress: progress }),
      updateWatchProgress: (slug, progress) => set((state) => ({
        watchProgress: {
          ...state.watchProgress,
          [slug]: progress
        }
      })),
      getProfileId: () => get().currentProfile?.id || null,
    }),
    {
      name: 'sr-profile-storage',
      partialize: (state) => ({ 
        currentProfile: state.currentProfile,
        favoriteSlugs: state.favoriteSlugs,
        watchHistory: state.watchHistory,
        watchProgress: state.watchProgress
      }),
    }
  )
)
