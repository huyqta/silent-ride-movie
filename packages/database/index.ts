import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const hasSupabaseConfig = () => {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

const getSupabaseConfig = () => {
  if (!hasSupabaseConfig()) return null

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}

export const createClient = () => {
  const config = getSupabaseConfig()
  if (!config) return null as any;
  return createBrowserClient(
    config.url,
    config.anonKey
  )
}

export const createServerSupabaseClient = async () => {
  const config = getSupabaseConfig()
  if (!config) return null as any;
  const cookieStore = await cookies()

  return createServerClient(
    config.url,
    config.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `remove` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export const createServerDataSupabaseClient = () => {
  const config = getSupabaseConfig()
  if (!config) return null as any

  return createSupabaseClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export { buildProfileAvatarUrl, normalizeProfileName } from './profile-utils'
