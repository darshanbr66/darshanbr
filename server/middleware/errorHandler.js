const multer = require('multer')

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` })
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Invalid data'
    return res.status(400).json({ message })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${err.path}` })
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `A record with this ${field} already exists` })
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message
    return res.status(400).json({ message })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' })
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' })
  }

  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message })
}

module.exports = { notFound, errorHandler }
