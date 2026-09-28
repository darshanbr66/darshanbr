const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Skill name is required'], trim: true, maxlength: 80 },
    category: { type: String, default: 'Other', trim: true, maxlength: 60 },
    icon: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true, maxlength: 400 },
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

skillSchema.index({ order: 1 })

module.exports = mongoose.model('Skill', skillSchema)
