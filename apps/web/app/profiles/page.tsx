import ProfilesClient from './client'
import { getProfiles } from './actions'

export const metadata = {
  title: 'Ai đang xem? | Silent Ride Movie',
  description: 'Chọn profile của bạn để tiếp tục',
}

export default async function ProfilesPage() {
  const initialProfiles = await getProfiles()
  
  return <ProfilesClient initialProfiles={initialProfiles} />
}
