import { z } from 'zod'

export const watchHistorySchema = z.object({
  movie_slug: z.string().min(1),
  movie_title: z.string().min(1),
  poster_url: z.string(),
  episode_slug: z.string().min(1),
  episode_name: z.string(),
  duration: z.number().min(0),
  playback_time: z.number().min(0),
})

export type WatchHistoryInput = z.infer<typeof watchHistorySchema>
