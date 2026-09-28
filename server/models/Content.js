const mongoose = require('mongoose')

// Editable section copy for the public site. Single-document collection that
// extends the `contents` document created by the previous portfolio.
const sectionSchema = new mongoose.Schema(
  {
    sectionLabel: { type: String, default: '', trim: true },
    heading: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
)

const principleSchema = new mongoose.Schema(
  {
    title: { type: String, default: '', trim: true },
    text: { type: String, default: '', trim: true },
  },
  { _id: false }
)

// The numbered "how I work" list in the About section.
const DEFAULT_PRINCIPLES = [
  {
    title: 'Build with intent',
    text: 'Every component, endpoint and query should exist for a reason — no speculative abstractions.',
  },
  {
    title: 'Own the full stack',
    text: 'From React interfaces to Express APIs to MongoDB schemas, I design systems end to end.',
  },
  {
    title: 'Ship, then refine',
    text: 'Working software first. Iteration, performance and polish follow once the foundation is solid.',
  },
]

const contentSchema = new mongoose.Schema(
  {
    hero: {
      titleLine1: { type: String, default: 'I BUILD DIGITAL', trim: true },
      titleLine2: { type: String, default: 'EXPERIENCES.', trim: true },
      availableForLabel: { type: String, default: '', trim: true },
      availableForText: { type: String, default: '', trim: true },
      exploreWorkLabel: { type: String, default: 'Explore My Work', trim: true },
      contactLabel: { type: String, default: "Let's Connect", trim: true },
      scrollLabel: { type: String, default: 'Scroll to explore', trim: true },
    },
    about: {
      sectionLabel: { type: String, default: 'About', trim: true },
      heading: { type: String, default: '', trim: true },
      introduction: { type: String, default: '', trim: true },
      summary: { type: String, default: '', trim: true },
      background: { type: String, default: '', trim: true },
      focus: { type: String, default: '', trim: true },
      additional: { type: String, default: '', trim: true },
      principles: { type: [principleSchema], default: () => DEFAULT_PRINCIPLES.map((p) => ({ ...p })) },
      // Legacy fields from the previous portfolio (background copy is migrated
      // into `background`); kept so the old document stays valid.
      backgroundLabel: { type: String, default: '', trim: true },
      backgroundText: { type: String, default: '', trim: true },
    },
    skills: { type: sectionSchema, default: () => ({}) },
    experience: { type: sectionSchema, default: () => ({}) },
    projects: { type: sectionSchema, default: () => ({}) },
    contact: { type: sectionSchema, default: () => ({}) },
    // Closing call-to-action band above the footer.
    footer: {
      eyebrow: { type: String, default: "Let's build something", trim: true },
      heading: { type: String, default: "Have an idea?\nLet's talk.", trim: true },
      buttonLabel: { type: String, default: 'Start a conversation', trim: true },
    },
  },
  { timestamps: true, minimize: false }
)

module.exports = mongoose.model('Content', contentSchema)
module.exports.DEFAULT_PRINCIPLES = DEFAULT_PRINCIPLES
