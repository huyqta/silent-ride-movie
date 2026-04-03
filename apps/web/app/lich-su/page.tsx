import { getWatchHistory } from './actions'
import HistoryClient from './client'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Lịch sử xem | Silent Ride',
    description: 'Lịch sử xem phim của bạn trên Silent Ride.',
}

export default async function HistoryPage() {
    return <HistoryClient initialHistory={[]} />
}
