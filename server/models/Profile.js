const mongoose = require('mongoose')

const socialLinkSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
)

// Single-document collection. Shares the `profiles` collection with the
// previous portfolio so the existing record keeps working.
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    role: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    headline: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    about: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    availability: { type: String, default: '', trim: true },
    profileImage: { type: String, default: '', trim: true },
    socialLinks: { type: [socialLinkSchema], default: [] },
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Profile', profileSchema)
