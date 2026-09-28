const mongoose = require('mongoose')

// All uploaded files (images, resumes) live in the GridFS `uploads` bucket,
// the same bucket the previous portfolio used.
function getBucket() {
  const db = mongoose.connection.db
  if (!db) throw new Error('MongoDB connection is not available')
  return new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' })
}

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  return new mongoose.Types.ObjectId(String(id))
}

async function findFile(id) {
  const _id = toObjectId(id)
  if (!_id) return null
  const [file] = await getBucket().find({ _id }).toArray()
  return file || null
}

function saveBuffer(buffer, filename, metadata) {
  return new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, {
      contentType: metadata.mimeType,
      metadata,
    })
    stream.on('error', reject)
    stream.on('finish', () => resolve(stream.id))
    stream.end(buffer)
  })
}

module.exports = { getBucket, toObjectId, findFile, saveBuffer }
