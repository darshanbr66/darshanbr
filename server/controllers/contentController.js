const Content = require('../models/Content')

// Editable keys per section. Anything else in the request body is ignored.
const SECTION_FIELDS = {
  hero: ['titleLine1', 'titleLine2', 'exploreWorkLabel', 'contactLabel', 'scrollLabel'],
  about: ['sectionLabel', 'heading', 'introduction', 'summary', 'background', 'focus', 'additional'],
  skills: ['heading', 'description'],
  experience: ['heading', 'description'],
  projects: ['heading', 'description'],
  contact: ['heading', 'description'],
  footer: ['eyebrow', 'heading', 'buttonLabel'],
}

const MAX_PRINCIPLES = 8

// [{ title, text }] — trimmed, capped, and emptied rows dropped.
function cleanPrinciples(list) {
  return list
    .filter((p) => p && typeof p === 'object')
    .map((p) => ({ title: String(p.title || '').trim(), text: String(p.text || '').trim() }))
    .filter((p) => p.title || p.text)
    .slice(0, MAX_PRINCIPLES)
}

async function getOrCreateContent() {
  const content = await Content.findOne()
  if (content) return content
  return Content.create({})
}

async function getContent(req, res) {
  const content = await getOrCreateContent()
  res.set('Cache-Control', 'no-cache')
  res.json(content)
}

// Partial update: { about: { heading: '...' }, hero: { ... } }
async function updateContent(req, res) {
  const content = await getOrCreateContent()
  for (const [section, fields] of Object.entries(SECTION_FIELDS)) {
    const incoming = req.body?.[section]
    if (!incoming || typeof incoming !== 'object') continue
    for (const field of fields) {
      if (typeof incoming[field] === 'string') content.set(`${section}.${field}`, incoming[field])
    }
  }
  if (Array.isArray(req.body?.about?.principles)) {
    content.set('about.principles', cleanPrinciples(req.body.about.principles))
  }
  await content.save()
  res.json(content)
}

module.exports = { getContent, updateContent, getOrCreateContent }
