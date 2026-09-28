const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and dashes'],
    },
    category: { type: String, default: '', trim: true },
    year: { type: String, default: '', trim: true },
    shortDescription: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    technologies: { type: [String], default: [] },
    image: { type: String, default: '', trim: true },
    gallery: { type: [String], default: [] },
    githubUrl: { type: String, default: '', trim: true },
    liveUrl: { type: String, default: '', trim: true },
    problem: { type: String, default: '', trim: true },
    solution: { type: String, default: '', trim: true },
    features: { type: [String], default: [] },
    architecture: { type: [String], default: [] },
    role: { type: String, default: '', trim: true },
    details: { type: String, default: '', trim: true },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'draft' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

projectSchema.index({ status: 1, order: 1 })

module.exports = mongoose.model('Project', projectSchema)
