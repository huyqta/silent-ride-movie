'use server'

import { createServerSupabaseClient } from '@repo/database'
import { revalidatePath } from 'next/cache'

import { favoriteSchema, type FavoriteInput } from './schema'

export async function toggleFavorite(profileId: string, movieData: FavoriteInput) {
  console.log('toggleFavorite called for profile:', profileId, 'movie:', movieData.movie_slug)
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  // Validate data
  const validated = favoriteSchema.safeParse(movieData)
  if (!validated.success) {
    return { error: 'Dữ liệu phim không hợp lệ' }
  }
  
  const supabase = await createServerSupabaseClient()
  if (!supabase) return { error: 'Database not configured' }

  // Verify profile exists
  const { data: profile } = await supabase
    .from('sr_profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle()
  
  if (!profile) {
    return { error: 'Profile không tồn tại hoặc đã bị xóa. Vui lòng chọn lại Profile.' }
  }

  // Check if already in favorites
  const { data: existing } = await supabase
    .from('sr_favorites')
    .select('id')
    .eq('profile_id', profileId)
    .eq('movie_slug', movieData.movie_slug)
    .maybeSingle()

  if (existing) {
    console.log('Existing favorite found, deleting:', existing.id)
    // Remove
    const { error } = await supabase
      .from('sr_favorites')
      .delete()
      .eq('id', existing.id)
    
    if (error) {
      console.error('Delete error:', error)
      return { error: error.message }
    }
  } else {
    console.log('Inserting new favorite for:', profileId, movieData.movie_slug)
    // Add
    const { error } = await supabase
      .from('sr_favorites')
      .insert({
        profile_id: profileId,
        movie_slug: movieData.movie_slug,
        movie_title: movieData.movie_title,
        poster_url: movieData.poster_url
      })
    
    if (error) {
      console.error('Insert error:', error)
      return { error: error.message }
    }
  }

  revalidatePath('/yeu-thich')
  return { success: true }
}

export async function clearAllFavorites(profileId: string) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }
  const supabase = await createServerSupabaseClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_favorites')
    .delete()
    .eq('profile_id', profileId)

  if (error) return { error: error.message }
  
  revalidatePath('/yeu-thich')
  return { success: true }
}

export async function getFavorites(profileId: string) {
    if (!profileId) return []
    const supabase = await createServerSupabaseClient()
    if (!supabase) return []

    const { data } = await supabase
        .from('sr_favorites')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function getFavoriteSlugs(profileId: string) {
  if (!profileId) return []
  const supabase = await createServerSupabaseClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_favorites')
    .select('movie_slug')
    .eq('profile_id', profileId)

  return data?.map((f: any) => f.movie_slug) || []
}
