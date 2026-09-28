const multer = require('multer')

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']
const DOCUMENT_TYPES = ['application/pdf']

function uploader(allowedTypes, maxMb) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 10 },
    fileFilter(req, file, cb) {
      if (allowedTypes.includes(file.mimetype)) return cb(null, true)
      const error = new Error(`Unsupported file type: ${file.mimetype}`)
      error.status = 400
      cb(error)
    },
  })
}

const uploadMedia = uploader([...IMAGE_TYPES, ...DOCUMENT_TYPES], 10)
const uploadResume = uploader(DOCUMENT_TYPES, 10)

module.exports = { uploadMedia, uploadResume, IMAGE_TYPES }
