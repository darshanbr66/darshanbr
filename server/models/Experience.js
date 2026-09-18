const mongoose = require('mongoose')

const experienceSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    period: { type: String, required: true },
    current: { type: Boolean, default: false },
    summary: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    stack: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Experience', experienceSchema)
