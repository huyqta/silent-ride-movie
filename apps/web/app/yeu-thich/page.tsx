import { getFavorites } from './actions'
import FavoritesClient from './client'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Phim yêu thích | Silent Ride',
    description: 'Danh sách phim yêu thích của bạn trên Silent Ride.',
}

export default async function FavoritesPage() {
    return <FavoritesClient initialFavorites={[]} />
}
