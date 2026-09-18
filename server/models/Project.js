const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    number: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    year: { type: String, required: true },
    description: { type: String, required: true },
    problem: { type: String, required: true },
    solution: { type: String, required: true },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    architecture: { type: [String], default: [] },
    image: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
