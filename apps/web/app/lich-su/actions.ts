'use server'

import { createServerSupabaseClient } from '@repo/database'
import { revalidatePath } from 'next/cache'
import { watchHistorySchema, type WatchHistoryInput } from './schema'

export async function updateWatchHistory(profileId: string, historyData: WatchHistoryInput) {
  if (!profileId) return
  
  // Validate data
  const validated = watchHistorySchema.safeParse(historyData)
  if (!validated.success) {
    console.error('Invalid history data:', validated.error.format())
    return
  }
  
  const data = validated.data
  const supabase = await createServerSupabaseClient()
  if (!supabase) return

  // Verify profile exists
  const { data: profile } = await supabase
    .from('sr_profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle()
  
  if (!profile) return

  const { error } = await supabase
    .from('sr_watch_history')
    .upsert({
      profile_id: profileId,
      movie_slug: historyData.movie_slug,
      movie_title: historyData.movie_title,
      poster_url: historyData.poster_url,
      episode_slug: historyData.episode_slug,
      episode_name: historyData.episode_name,
      duration: historyData.duration,
      playback_time: historyData.playback_time,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'profile_id,movie_slug'
    })

  if (error) console.error('Failed to update watch history:', error)
  
  revalidatePath('/lich-su')
}

export async function getWatchHistory(profileId: string) {
  if (!profileId) return []
  const supabase = await createServerSupabaseClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_watch_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('updated_at', { ascending: false })

  return data || []
}

export async function clearHistory(profileId: string) {
    if (!profileId) return { error: 'Vui lòng chọn Profile' }
    const supabase = await createServerSupabaseClient()
    if (!supabase) return { error: 'Database not configured' }
  
    const { error } = await supabase
      .from('sr_watch_history')
      .delete()
      .eq('profile_id', profileId)
  
    if (error) return { error: error.message }
    
    revalidatePath('/lich-su')
    return { success: true }
}
