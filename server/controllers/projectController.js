const Project = require('../models/Project')
const { createCrud, notFoundError } = require('../utils/crud')
const { slugify, assertSafeUrls } = require('../utils/sanitize')

const FIELDS = [
  'title',
  'slug',
  'category',
  'year',
  'shortDescription',
  'description',
  'technologies',
  'image',
  'gallery',
  'githubUrl',
  'liveUrl',
  'problem',
  'solution',
  'features',
  'architecture',
  'role',
  'details',
  'featured',
  'status',
  'order',
]

async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || 'project'
  let candidate = root
  let n = 2
  // eslint-disable-next-line no-await-in-loop
  while (await Project.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    candidate = `${root}-${n++}`
  }
  return candidate
}

const crud = createCrud(Project, {
  label: 'Project',
  fields: FIELDS,
  async prepare(data, existing) {
    assertSafeUrls(data, ['image', 'gallery', 'githubUrl', 'liveUrl'])
    if (data.slug !== undefined || !existing) {
      data.slug = slugify(data.slug || data.title || existing?.title)
      if (!data.slug) {
        const error = new Error('Title is required')
        error.status = 400
        throw error
      }
      const taken = await Project.exists({ slug: data.slug, ...(existing ? { _id: { $ne: existing._id } } : {}) })
      if (taken) {
        const error = new Error(`The slug "${data.slug}" is already used by another project`)
        error.status = 409
        throw error
      }
    }
    return data
  },
})

async function getBySlug(req, res) {
  const project = await Project.findOne({ slug: String(req.params.slug).toLowerCase(), status: 'published' }).lean()
  if (!project) throw notFoundError('Project')
  res.set('Cache-Control', 'no-cache')
  res.json(project)
}

async function getById(req, res) {
  const project = await Project.findById(req.params.id).lean()
  if (!project) throw notFoundError('Project')
  res.json(project)
}

async function duplicate(req, res) {
  const source = await Project.findById(req.params.id).lean()
  if (!source) throw notFoundError('Project')
  const { _id, createdAt, updatedAt, __v, ...rest } = source
  const last = await Project.findOne().sort({ order: -1 }).select('order').lean()
  const copy = await Project.create({
    ...rest,
    title: `${source.title} (Copy)`,
    slug: await uniqueSlug(`${source.slug}-copy`),
    status: 'draft',
    featured: false,
    order: (last?.order ?? 0) + 1,
  })
  res.status(201).json(copy)
}

module.exports = { ...crud, getBySlug, getById, duplicate }
