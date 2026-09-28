const Profile = require('../models/Profile')
const Project = require('../models/Project')
const Skill = require('../models/Skill')
const Experience = require('../models/Experience')
const ContactMessage = require('../models/ContactMessage')
const Resume = require('../models/Resume')
const { getOrCreateContent } = require('./contentController')
const { findFile } = require('../config/gridfs')

// One request that gives the public site everything it needs to render.
async function getSite(req, res) {
  const published = { status: 'published' }
  const sort = { order: 1, createdAt: 1 }
  const [profile, content, projects, skills, experience, resume] = await Promise.all([
    Profile.findOne().lean(),
    getOrCreateContent(),
    Project.find(published).sort(sort).lean(),
    Skill.find(published).sort(sort).lean(),
    Experience.find(published).sort(sort).lean(),
    Resume.findOne({ status: 'active' }).sort({ createdAt: -1 }).lean(),
  ])

  const resumeFile = resume && (await findFile(resume.fileId))
  res.set('Cache-Control', 'no-cache')
  res.json({
    profile,
    content,
    projects,
    skills,
    experience,
    resume: resumeFile
      ? { filename: resume.filename, uploadedAt: resume.createdAt, url: '/api/resume/file' }
      : null,
  })
}

async function getStats(req, res) {
  const [projects, publishedProjects, skills, experience, messages, unread, profile, resume] =
    await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'published' }),
      Skill.countDocuments(),
      Experience.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      Profile.findOne().lean(),
      Resume.findOne({ status: 'active' }).lean(),
    ])

  const profileFields = ['name', 'role', 'title', 'headline', 'description', 'location', 'email', 'availability']
  const filled = profile ? profileFields.filter((f) => profile[f]).length : 0
  const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean()

  res.json({
    projects: { total: projects, published: publishedProjects },
    skills,
    experience,
    messages: { total: messages, unread },
    profile: {
      exists: Boolean(profile),
      completion: Math.round((filled / profileFields.length) * 100),
      updatedAt: profile?.updatedAt,
      status: profile?.status,
    },
    resume: resume ? { filename: resume.filename, uploadedAt: resume.createdAt } : null,
    recentMessages,
  })
}

module.exports = { getSite, getStats }
