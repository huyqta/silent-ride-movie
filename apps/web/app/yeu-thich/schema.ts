import { z } from 'zod'

export const favoriteSchema = z.object({
  movie_slug: z.string().min(1),
  movie_title: z.string().min(1),
  poster_url: z.string(),
})

export type FavoriteInput = z.infer<typeof favoriteSchema>
