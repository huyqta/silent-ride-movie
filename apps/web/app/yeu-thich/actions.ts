import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { favoriteSchema, type FavoriteInput } from './schema'

export async function toggleFavorite(profileId: string, movieData: FavoriteInput) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  const validated = favoriteSchema.safeParse(movieData)
  if (!validated.success) {
    return { error: 'Dữ liệu phim không hợp lệ' }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { data: profile } = await supabase
    .from('sr_profiles')
    .select('id')
    .eq('id', profileId)
    .maybeSingle()

  if (!profile) {
    return { error: 'Profile không tồn tại hoặc đã bị xóa. Vui lòng chọn lại Profile.' }
  }

  const { data: existing } = await supabase
    .from('sr_favorites')
    .select('id')
    .eq('profile_id', profileId)
    .eq('movie_slug', movieData.movie_slug)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('sr_favorites')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('sr_favorites')
      .insert({
        profile_id: profileId,
        movie_slug: movieData.movie_slug,
        movie_title: movieData.movie_title,
        poster_url: movieData.poster_url
      })

    if (error) return { error: error.message }
  }

  return { success: true }
}

export async function clearAllFavorites(profileId: string) {
  if (!profileId) return { error: 'Vui lòng chọn Profile' }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_favorites')
    .delete()
    .eq('profile_id', profileId)

  if (error) return { error: error.message }

  return { success: true }
}

export async function getFavorites(profileId: string) {
  if (!profileId) return []

  const supabase = getSupabaseBrowserClient()
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

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('sr_favorites')
    .select('movie_slug')
    .eq('profile_id', profileId)

  return data?.map((f: any) => f.movie_slug) || []
}
