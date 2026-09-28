const Resume = require('../models/Resume')
const { findFile, getBucket } = require('../config/gridfs')
const { storeUpload } = require('./mediaController')
const { notFoundError } = require('../utils/crud')

function formatResume(resume, file) {
  return {
    id: String(resume._id),
    fileId: resume.fileId,
    filename: resume.filename,
    status: resume.status,
    size: file?.length,
    uploadedAt: resume.createdAt,
    url: `/api/media/${resume.fileId}`,
  }
}

// Public metadata for the current resume (null when none is uploaded).
async function getActive(req, res) {
  const resume = await Resume.findOne({ status: 'active' }).sort({ createdAt: -1 }).lean()
  res.set('Cache-Control', 'no-cache')
  if (!resume) return res.json(null)
  const file = await findFile(resume.fileId)
  res.json(file ? formatResume(resume, file) : null)
}

// Stable public URL that always serves whichever resume is active.
async function streamActive(req, res) {
  const resume = await Resume.findOne({ status: 'active' }).sort({ createdAt: -1 }).lean()
  const file = resume && (await findFile(resume.fileId))
  if (!file) throw notFoundError('Resume')

  const disposition = req.query.download ? 'attachment' : 'inline'
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': String(file.length),
    'Content-Disposition': `${disposition}; filename="${encodeURIComponent(resume.filename)}"`,
    'Cache-Control': 'no-cache',
    ETag: `"${file._id}"`,
  })
  if (req.headers['if-none-match'] === `"${file._id}"`) return res.status(304).end()
  getBucket().openDownloadStream(file._id).on('error', () => res.end()).pipe(res)
}

async function listAll(req, res) {
  const resumes = await Resume.find().sort({ createdAt: -1 }).lean()
  const withFiles = await Promise.all(resumes.map(async (r) => formatResume(r, await findFile(r.fileId))))
  res.json(withFiles)
}

async function upload(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Please choose a PDF file' })
  const stored = await storeUpload(req.file, 'resume')
  await Resume.updateMany({ status: 'active' }, { $set: { status: 'archived' } })
  const resume = await Resume.create({ fileId: stored.id, filename: stored.filename, status: 'active' })
  res.status(201).json(formatResume(resume.toObject(), { length: stored.size }))
}

async function activate(req, res) {
  const resume = await Resume.findById(req.params.id)
  if (!resume) throw notFoundError('Resume')
  await Resume.updateMany({ status: 'active' }, { $set: { status: 'archived' } })
  resume.status = 'active'
  await resume.save()
  res.json(formatResume(resume.toObject(), await findFile(resume.fileId)))
}

async function remove(req, res) {
  const resume = await Resume.findById(req.params.id)
  if (!resume) throw notFoundError('Resume')
  if (resume.status === 'active') {
    return res.status(409).json({ message: 'The active resume cannot be deleted. Upload or activate another one first.' })
  }
  const file = await findFile(resume.fileId)
  if (file) await getBucket().delete(file._id)
  await resume.deleteOne()
  res.json({ message: 'Resume deleted', id: String(resume._id) })
}

module.exports = { getActive, streamActive, listAll, upload, activate, remove }
