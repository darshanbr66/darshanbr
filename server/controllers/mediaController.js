const path = require('node:path')
const sharp = require('sharp')
const Resume = require('../models/Resume')
const Project = require('../models/Project')
const Profile = require('../models/Profile')
const { getBucket, findFile, saveBuffer, toObjectId } = require('../config/gridfs')
const { notFoundError } = require('../utils/crud')

// Raster images are resized and re-encoded to WebP for fast public delivery.
const OPTIMIZABLE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_IMAGE_WIDTH = 2000

async function storeUpload(file, kind) {
  let buffer = file.buffer
  let mimeType = file.mimetype
  let filename = file.originalname
  const metadata = { originalName: file.originalname, kind }

  if (OPTIMIZABLE.includes(mimeType)) {
    const image = sharp(buffer, { failOn: 'error' }).rotate()
    const { data, info } = await image
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true })
    buffer = data
    mimeType = 'image/webp'
    filename = `${path.parse(filename).name}.webp`
    metadata.width = info.width
    metadata.height = info.height
  }

  metadata.mimeType = mimeType
  metadata.size = buffer.length
  const id = await saveBuffer(buffer, filename, metadata)
  return formatFile({ _id: id, filename, length: buffer.length, uploadDate: new Date(), metadata })
}

function formatFile(file) {
  const id = String(file._id)
  return {
    id,
    url: `/api/media/${id}`,
    filename: file.filename,
    contentType: file.metadata?.mimeType || file.contentType || 'application/octet-stream',
    size: file.length,
    width: file.metadata?.width,
    height: file.metadata?.height,
    kind: file.metadata?.kind || (String(file.metadata?.mimeType || '').startsWith('image/') ? 'image' : 'file'),
    uploadedAt: file.uploadDate,
  }
}

async function upload(req, res) {
  const files = req.files || (req.file ? [req.file] : [])
  if (!files.length) return res.status(400).json({ message: 'No file uploaded' })
  const stored = []
  for (const file of files) {
    try {
      stored.push(await storeUpload(file, file.mimetype.startsWith('image/') ? 'image' : 'file'))
    } catch (err) {
      const error = new Error(`Could not process "${file.originalname}": ${err.message}`)
      error.status = 400
      throw error
    }
  }
  res.status(201).json(stored)
}

async function list(req, res) {
  const files = await getBucket().find({}).sort({ uploadDate: -1 }).toArray()
  const activeResume = await Resume.findOne({ status: 'active' }).lean()
  res.json(
    files.map((f) => ({ ...formatFile(f), isActiveResume: String(activeResume?.fileId) === String(f._id) }))
  )
}

// Public file delivery. File ids are immutable, so responses cache forever.
async function stream(req, res) {
  const file = await findFile(req.params.id)
  if (!file) throw notFoundError('File')

  const etag = `"${file._id}"`
  const contentType = file.metadata?.mimeType || file.contentType || 'application/octet-stream'
  res.set({
    'Content-Type': contentType,
    'Content-Length': String(file.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: etag,
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    'X-Content-Type-Options': 'nosniff',
  })
  const disposition = req.query.download ? 'attachment' : 'inline'
  res.set('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.filename)}"`)

  if (req.headers['if-none-match'] === etag) return res.status(304).end()

  getBucket()
    .openDownloadStream(file._id)
    .on('error', (err) => {
      console.error('GridFS stream failed:', err.message)
      if (!res.headersSent) res.status(500).json({ message: 'Failed to read file' })
      else res.end()
    })
    .pipe(res)
}

async function remove(req, res) {
  const id = toObjectId(req.params.id)
  const file = id && (await findFile(id))
  if (!file) throw notFoundError('File')

  // Compare as strings: older records may hold the id as an ObjectId.
  const activeResumes = await Resume.collection.find({ status: 'active' }).toArray()
  if (activeResumes.some((r) => String(r.fileId) === String(id))) {
    return res.status(409).json({ message: 'This file is the active resume. Upload a new resume first.' })
  }

  const url = `/api/media/${id}`
  await getBucket().delete(id)
  // Detach the deleted file from anything that referenced it.
  await Promise.all([
    Resume.collection.deleteMany({ fileId: { $in: [String(id), id] }, status: { $ne: 'active' } }),
    Project.updateMany({ image: url }, { $set: { image: '' } }),
    Project.updateMany({ gallery: url }, { $pull: { gallery: url } }),
    Profile.updateMany({ profileImage: url }, { $set: { profileImage: '' } }),
  ])
  res.json({ message: 'File deleted', id: String(id) })
}

module.exports = { upload, list, stream, remove, storeUpload, formatFile }
