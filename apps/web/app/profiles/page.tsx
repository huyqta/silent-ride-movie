import ProfilesClient from './client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chọn Profile | Silent Ride',
  description: 'Chọn profile để bắt đầu xem phim.',
}

export default function ProfilesPage() {
  return <ProfilesClient initialProfiles={[]} />
}
