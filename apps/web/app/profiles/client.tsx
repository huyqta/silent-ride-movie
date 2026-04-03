'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, User, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useProfileStore, type Profile } from '@/lib/store/useProfileStore'
import { createProfile, deleteProfile } from './actions'

export default function ProfilesClient({ initialProfiles }: { initialProfiles: Profile[] }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  
  const { setProfile } = useProfileStore()
  const router = useRouter()

  const handleSelect = (profile: Profile) => {
    if (isManaging) return
    setProfile(profile)
    router.push('/')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || isLoading) return
    
    setIsLoading(true)
    const result = await createProfile(newName)
    if (result.success && result.data) {
      setProfiles([...profiles, result.data as Profile])
      setNewName('')
      setIsCreating(false)
    }
    setIsLoading(false)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (isLoading) return
    
    setIsLoading(true)
    const result = await deleteProfile(id)
    if (result.success) {
      setProfiles(profiles.filter(p => p.id !== id))
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Ai đang xem?
          </motion.h1>
          <p className="text-gray-400">Chọn profile của bạn để bắt đầu trải nghiệm</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(profile)}
                className="group relative flex flex-col items-center gap-4 cursor-pointer"
              >
                <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 transition-all duration-300 ${isManaging ? 'border-red-500/50 scale-95' : 'border-transparent group-hover:border-white group-hover:scale-105'}`}>
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  
                  {isManaging && (
                    <div 
                      onClick={(e) => handleDelete(e, profile.id)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/40 transition-colors"
                    >
                      <Trash2 className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <span className={`text-xl font-medium transition-colors ${isManaging ? 'text-gray-500' : 'text-gray-400 group-hover:text-white'}`}>
                  {profile.full_name}
                </span>
              </motion.div>
            ))}

            {!isCreating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center gap-4 cursor-pointer group"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-transparent flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all group-hover:scale-105">
                  <Plus className="w-16 h-16 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <span className="text-xl font-medium text-gray-400 group-hover:text-white">
                  Thêm Profile
                </span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm"
              >
                <form onSubmit={handleCreate} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Tạo Profile mới</h2>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-white/20"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      disabled={isLoading || !newName.trim()}
                      type="submit"
                      className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Tạo'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className={`px-8 py-2 border border-gray-600 rounded-md text-gray-400 font-medium hover:text-white hover:border-white transition-all ${isManaging ? 'bg-white text-black border-white' : ''}`}
          >
            {isManaging ? 'Hoàn tất' : 'Quản lý Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
