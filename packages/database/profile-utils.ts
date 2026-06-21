const DICEBEAR_BASE_URL = 'https://api.dicebear.com/7.x/pixel-art/svg?seed='

export const normalizeProfileName = (value: string) => value.trim()

export const buildProfileAvatarUrl = (fullName: string) =>
  `${DICEBEAR_BASE_URL}${encodeURIComponent(normalizeProfileName(fullName))}`
