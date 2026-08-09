import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import {
  buildProfileAvatarUrl,
  normalizeProfileName,
} from '@repo/database/profile-utils'

export async function getProfiles() {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('sr_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching profiles:', error)
    return []
  }

  return data
}

export async function createProfile(fullName: string, avatarUrl?: string) {
  const normalizedFullName = normalizeProfileName(fullName)
  if (!normalizedFullName) {
    return { error: 'Vui lòng nhập tên profile' }
  }

  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { data, error } = await supabase
    .from('sr_profiles')
    .insert({
      full_name: normalizedFullName,
      avatar_url: avatarUrl || buildProfileAvatarUrl(normalizedFullName),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, data }
}

export async function deleteProfile(id: string) {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) return { error: 'Database not configured' }

  const { error } = await supabase
    .from('sr_profiles')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  return { success: true }
}
