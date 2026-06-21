import test from 'node:test'
import assert from 'node:assert/strict'

import { buildProfileAvatarUrl, normalizeProfileName } from './profile-utils.ts'

test('normalizeProfileName trims surrounding whitespace', () => {
  assert.equal(normalizeProfileName('  Huy Quan  '), 'Huy Quan')
})

test('buildProfileAvatarUrl encodes unicode and spaces safely', () => {
  assert.equal(
    buildProfileAvatarUrl('Hằng đẹp zai'),
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=H%E1%BA%B1ng%20%C4%91%E1%BA%B9p%20zai'
  )
})
