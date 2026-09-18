const mongoose = require('mongoose')

const skillCategorySchema = new mongoose.Schema(
  {
    categoryId: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    skills: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('SkillCategory', skillCategorySchema)
