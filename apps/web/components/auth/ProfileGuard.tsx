'use client'

import { useProfileStore } from '@/lib/store/useProfileStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { currentProfile, setFavoriteSlugs, setWatchHistory, setWatchProgress } = useProfileStore()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch favorites and history when profile changes
  useEffect(() => {
    if (currentProfile?.id) {
      // Fetch Favorites
      import('@/app/yeu-thich/actions').then(({ getFavoriteSlugs }) => {
        getFavoriteSlugs(currentProfile.id!).then(slugs => {
          setFavoriteSlugs(slugs);
        });
      });

      // Fetch Watch History
      import('@/app/lich-su/actions').then(({ getWatchHistory }) => {
        getWatchHistory(currentProfile.id!).then(history => {
          setWatchHistory(history);
          
          // Also set watchProgress map for easy lookup
          const progressMap: Record<string, any> = {};
          history.forEach((item: any) => {
            progressMap[item.movie_slug] = {
              episode: item.episode_slug,
              episodeName: item.episode_name || item.episode_slug,
              currentTime: item.playback_time,
              duration: item.duration,
              updatedAt: new Date(item.updated_at).getTime()
            };
          });
          setWatchProgress(progressMap);
        });
      });
    }
  }, [currentProfile?.id, setFavoriteSlugs, setWatchHistory, setWatchProgress])

  useEffect(() => {
    if (mounted && !currentProfile && pathname !== '/profiles') {
      router.push('/profiles')
    }
  }, [currentProfile, pathname, router, mounted])

  // Prevent hydration mismatch
  if (!mounted) return null

  // If we are on profiles page, or we have a profile, render children
  if (pathname === '/profiles' || currentProfile) {
    return <>{children}</>
  }

  // Otherwise return null while redirecting
  return null
}
