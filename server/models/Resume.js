const mongoose = require('mongoose')

// Points at a file in the GridFS `uploads` bucket. Exactly one record is
// `active`; earlier uploads are kept as `archived` history.
const resumeSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    filename: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Resume', resumeSchema)
