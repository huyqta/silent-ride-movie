'use server'

import { createServerSupabaseClient } from '@repo/database'
import { revalidatePath } from 'next/cache'

export async function getProfiles() {
  const supabase = await createServerSupabaseClient()
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
  const supabase = await createServerSupabaseClient()
  if (!supabase) return { error: 'Database not configured' }
  const { data, error } = await supabase
    .from('sr_profiles')
    .insert({
      full_name: fullName,
      avatar_url: avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName}`,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profiles')
  return { success: true, data }
}

export async function deleteProfile(id: string) {
    const supabase = await createServerSupabaseClient()
    if (!supabase) return { error: 'Database not configured' }
    const { error } = await supabase
      .from('sr_profiles')
      .delete()
      .eq('id', id)
  
    if (error) return { error: error.message }
    
    revalidatePath('/profiles')
    return { success: true }
}
