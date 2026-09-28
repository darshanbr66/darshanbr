const mongoose = require('mongoose')

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: [true, 'Role is required'], trim: true },
    company: { type: String, required: [true, 'Company is required'], trim: true },
    location: { type: String, default: '', trim: true },
    startDate: { type: String, default: '', trim: true },
    endDate: { type: String, default: '', trim: true },
    current: { type: Boolean, default: false },
    description: { type: String, default: '', trim: true },
    responsibilities: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

experienceSchema.index({ order: 1 })

module.exports = mongoose.model('Experience', experienceSchema)
