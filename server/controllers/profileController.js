const Profile = require('../models/Profile')
const { pick, assertSafeUrls, isSafeUrl } = require('../utils/sanitize')

const FIELDS = [
  'name',
  'role',
  'title',
  'headline',
  'description',
  'location',
  'email',
  'availability',
  'profileImage',
  'socialLinks',
  'status',
]

async function getOrCreateProfile() {
  const profile = await Profile.findOne()
  if (profile) return profile
  return Profile.create({ name: 'Your Name', status: 'draft' })
}

async function getProfile(req, res) {
  const profile = await Profile.findOne().lean()
  if (!profile) return res.status(404).json({ message: 'Profile not found' })
  res.set('Cache-Control', 'no-cache')
  res.json(profile)
}

async function getProfileAdmin(req, res) {
  res.json(await getOrCreateProfile())
}

function normalizeSocialLinks(links) {
  if (!Array.isArray(links)) return undefined
  return links
    .filter((l) => l && typeof l.url === 'string' && l.url.trim())
    .map((l) => {
      const label = String(l.label || '').trim() || 'Link'
      const url = l.url.trim()
      if (!isSafeUrl(url)) {
        const error = new Error(`"${label}" must be a valid http(s) or mailto URL`)
        error.status = 400
        throw error
      }
      const id = String(l.id || label).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { id, label, url }
    })
}

async function updateProfile(req, res) {
  const data = pick(req.body, FIELDS)
  if (data.socialLinks !== undefined) data.socialLinks = normalizeSocialLinks(req.body.socialLinks)
  assertSafeUrls(data, ['profileImage'])

  const profile = await getOrCreateProfile()
  profile.set(data)
  await profile.save()
  res.json(profile)
}

module.exports = { getProfile, getProfileAdmin, updateProfile, getOrCreateProfile }
