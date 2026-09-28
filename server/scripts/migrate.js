// Brings existing portfolio data into the CMS schema. Safe to re-run:
// every step is recorded in the `migrations` collection and runs only once,
// and nothing is dropped — take a backup first with `npm run backup`.
//
// Sources of real data (all already in this database):
//   profiles / contents / resumes / uploads   — previous portfolio + admin
//   skills (MERN, Python) + skillcategories    — skill records
//   experiences / projects / contacts          — records from the first build
// Real project list and experience record come from the previous portfolio's
// seed files (darshan-portfolio/server/src/seed), which the first build of this
// site overwrote with placeholder entries.
require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Profile = require('../models/Profile')
const Content = require('../models/Content')
const { DEFAULT_PRINCIPLES } = require('../models/Content')
const Skill = require('../models/Skill')
const Experience = require('../models/Experience')
const Project = require('../models/Project')
const ContactMessage = require('../models/ContactMessage')

const CATEGORY_MAP = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tooling: 'Tools',
  foundations: 'Other',
}

const FEATURED_SKILLS = ['React.js', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB']

const SKILL_DESCRIPTIONS = {
  'React.js': 'Component-driven UI development with hooks, context and modern patterns.',
  JavaScript: 'Core language for building interactive, dynamic applications.',
  'Tailwind CSS': 'Utility-first styling for fast, consistent, responsive interfaces.',
  'React Router': 'Client-side routing for single-page application navigation.',
  'Node.js': 'JavaScript runtime powering server-side applications.',
  'Express.js': 'Minimal, flexible framework for building REST APIs.',
  'REST APIs': 'Designing clean, predictable HTTP interfaces between systems.',
  'JWT Authentication': 'Stateless, token-based authentication for secure sessions.',
  MongoDB: 'Document-oriented database for flexible data modeling.',
  Git: 'Version control for tracking and collaborating on code changes.',
  GitHub: 'Hosting, code review and collaboration on software projects.',
  'CI/CD': 'Automated build, test and deployment pipelines.',
  Scrum: 'Agile framework for iterative delivery and team collaboration.',
  'Data Structures & Algorithms': 'Foundation for writing efficient, well-reasoned code.',
  'Cloud Fundamentals': 'Core concepts of deploying and running applications in the cloud.',
  Python: 'General-purpose language used for scripting and tooling.',
  WordPress: 'Building and customizing content-managed websites.',
  MERN: 'MongoDB, Express, React and Node.js as one full-stack JavaScript toolchain.',
}

// From the previous portfolio's seed (darshan-portfolio/server/src/seed/projects.js).
const REAL_PROJECTS = [
  { title: 'Roster Data Management', slug: 'roster-data-management', category: 'Professional' },
  { title: 'Patent Claim Parsing', slug: 'patent-claim-parsing', category: 'Professional' },
  { title: 'US Patent Blog Application', slug: 'us-patent-blog-application', category: 'Professional' },
  {
    title: 'Daily Routine App',
    slug: 'daily-routine-app',
    category: 'Personal Project',
    technologies: ['MERN'],
    githubUrl: 'https://github.com/darshanbr66/daily-routine-app',
    liveUrl: 'https://daily-routine-app-zeta.vercel.app',
  },
]

// Placeholder entries written by the first build of this site. They are kept
// (as unpublished drafts) so nothing is lost, but hidden from the public site.
const PLACEHOLDER_SLUGS = [
  'patent-claim-formatter',
  'ai-recruitment-platform',
  'medical-image-dashboard',
  'productivity-suite',
]

// Facts from the project's own README (github.com/darshanbr66/daily-routine-app).
const DAILY_ROUTINE_DETAILS = {
  year: '2026',
  shortDescription: 'A daily routine and productivity platform built with the MERN stack.',
  description:
    'A daily routine and productivity platform built with the MERN stack — React (Vite) on the front end, an Express and Node.js API, and MongoDB Atlas, with JWT-based authentication and protected routes.',
  technologies: [
    'React',
    'Vite',
    'Tailwind CSS',
    'React Router',
    'Axios',
    'Node.js',
    'Express.js',
    'MongoDB Atlas',
    'Mongoose',
    'JWT',
    'bcrypt',
  ],
  features: [
    'User registration and login',
    'JWT authentication with protected routes',
    'User profile',
    'Task CRUD with soft delete',
    'Task status updates',
  ],
  architecture: ['React (Vite) Client', 'Express REST API', 'JWT Auth Middleware', 'MongoDB Atlas'],
  details:
    'Planned next: dashboard, routines, habit tracker, calendar, reminder engine, goals, notes, analytics, PWA support and an AI assistant.',
}

const steps = [
  {
    id: '2026-09-profile',
    async run() {
      const profile = await Profile.findOne()
      if (!profile) {
        await Profile.create({ name: 'Darshan B R', status: 'published' })
        return this.run()
      }
      const content = await mongoose.connection.db.collection('contents').findOne()
      const defaults = {
        name: 'Darshan B R',
        role: 'Software Engineer',
        title: 'Full-Stack MERN Developer',
        location: 'Bengaluru',
        email: 'darshanbr36@gmail.com',
      }
      for (const [key, value] of Object.entries(defaults)) {
        if (!profile[key]) profile[key] = value
      }
      // The old record stored the tagline in `headline`; the site now uses
      // `headline` for the professional headline and `description` for the tagline.
      if (!profile.description) {
        profile.description = profile.headline || 'Building practical web applications with modern technologies.'
        profile.headline = 'Full-Stack MERN Developer'
      }
      if (!profile.availability) {
        const text = content?.hero?.availableForText || 'Full-time opportunities'
        profile.availability = `Available for ${text.charAt(0).toLowerCase()}${text.slice(1)}`
      }
      await profile.save()
    },
  },
  {
    id: '2026-09-content',
    async run() {
      let content = await Content.findOne()
      if (!content) content = new Content()
      const about = content.about
      if (!about.heading) about.heading = 'A little about me.'
      if (!about.introduction) {
        // Wording from the previous portfolio's own profile seed.
        about.introduction =
          'I am a Software Engineer focused on building full-stack web applications using modern JavaScript technologies.'
      }
      if (!about.background && about.backgroundText) about.background = about.backgroundText
      if (!about.focus) about.focus = 'Full-Stack MERN Development'
      if (!content.skills?.heading) content.set('skills.heading', 'Technology')
      if (!content.projects?.heading) content.set('projects.heading', 'Selected Work')
      if (!content.experience?.heading) content.set('experience.heading', 'Experience')
      if (!content.contact?.heading) content.set('contact.heading', "Let's Build Something.")
      await content.save()
    },
  },
  {
    id: '2026-09-skills',
    async run() {
      const categories = await mongoose.connection.db
        .collection('skillcategories')
        .find({})
        .sort({ order: 1 })
        .toArray()

      const wanted = categories.flatMap((c) =>
        (c.skills || []).map((name) => ({ name, category: CATEGORY_MAP[c.categoryId] || c.label || 'Other' }))
      )
      const existing = await Skill.find()
      const byName = new Map(existing.map((s) => [s.name.toLowerCase(), s]))

      let order = 1
      for (const item of wanted) {
        const found = byName.get(item.name.toLowerCase())
        if (found) {
          if (!found.category || found.category === 'Technology') found.category = item.category
          if (!found.description) found.description = SKILL_DESCRIPTIONS[item.name] || ''
          found.order = order++
          await found.save()
        } else {
          await Skill.create({
            ...item,
            description: SKILL_DESCRIPTIONS[item.name] || '',
            featured: FEATURED_SKILLS.includes(item.name),
            status: 'published',
            order: order++,
          })
        }
      }
      // Records that only exist in `skills` (e.g. MERN) keep their data, placed last.
      for (const skill of existing) {
        if (wanted.some((w) => w.name.toLowerCase() === skill.name.toLowerCase())) continue
        if (skill.category === 'Technology') skill.category = 'Other'
        if (!skill.description) skill.description = SKILL_DESCRIPTIONS[skill.name] || ''
        skill.order = order++
        await skill.save()
      }
    },
  },
  {
    id: '2026-09-experience',
    async run() {
      const collection = mongoose.connection.db.collection('experiences')
      const legacy = await collection.find({ period: { $exists: true } }).toArray()
      for (const doc of legacy) {
        const [start, end] = String(doc.period).split(/\s*[—–-]\s*/)
        const current = Boolean(doc.current) || /present/i.test(end || '')
        const isSigvitas = /sigvitas/i.test(doc.company)
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              startDate: start || '',
              endDate: current ? '' : end || '',
              current,
              status: 'published',
              // The Sigvitas record previously held generated summary/responsibility
              // text; restore the factual record from the previous portfolio instead.
              description: isSigvitas ? '' : doc.summary || '',
              responsibilities: isSigvitas ? [] : doc.responsibilities || [],
              technologies: isSigvitas ? ['MERN', 'Python'] : doc.stack || [],
            },
            $unset: { period: '', summary: '', stack: '' },
          }
        )
      }
      if ((await Experience.countDocuments()) === 0) {
        await Experience.create({
          role: 'Software Engineer',
          company: 'Sigvitas Private Limited',
          location: 'Bengaluru, Karnataka',
          startDate: 'November 2024',
          current: true,
          technologies: ['MERN', 'Python'],
          status: 'published',
          order: 1,
        })
      }
    },
  },
  {
    id: '2026-09-projects',
    async run() {
      const collection = mongoose.connection.db.collection('projects')
      const placeholders = await collection.find({ slug: { $in: PLACEHOLDER_SLUGS } }).toArray()
      for (const doc of placeholders) {
        await collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              status: 'draft',
              featured: false,
              shortDescription: doc.shortDescription || doc.description || '',
              image: String(doc.image || '').startsWith('/projects/') ? '' : doc.image || '',
              gallery: doc.gallery || [],
              role: doc.role || '',
              details: doc.details || '',
              order: 100 + PLACEHOLDER_SLUGS.indexOf(doc.slug),
            },
            $unset: { number: '' },
          }
        )
      }

      for (const [index, project] of REAL_PROJECTS.entries()) {
        const exists = await Project.exists({ slug: project.slug })
        if (exists) continue
        await Project.create({ ...project, status: 'published', featured: false, order: index + 1 })
      }
    },
  },
  {
    id: '2026-09-contacts',
    async run() {
      const legacy = await mongoose.connection.db.collection('contacts').find({}).toArray()
      for (const doc of legacy) {
        await ContactMessage.collection.updateOne(
          { _id: doc._id },
          {
            $setOnInsert: {
              name: doc.name,
              email: doc.email,
              message: doc.message,
              status: 'new',
              createdAt: doc.createdAt || new Date(),
              updatedAt: doc.updatedAt || new Date(),
            },
          },
          { upsert: true }
        )
      }
    },
  },
  {
    // The previous portfolio stored resumes.fileId as an ObjectId; this schema
    // uses strings. Normalize, and if the active record points at a file that
    // no longer exists, repoint it to an identical upload (same name and size).
    id: '2026-09-resume-fileid',
    async run() {
      const db = mongoose.connection.db
      const resumes = await db.collection('resumes').find({}).toArray()
      for (const resume of resumes) {
        let fileId = String(resume.fileId)
        const file = await db.collection('uploads.files').findOne({ _id: new mongoose.Types.ObjectId(fileId) })
        if (!file) {
          const twin = await db
            .collection('uploads.files')
            .findOne({ filename: resume.filename }, { sort: { uploadDate: 1 } })
          if (twin) fileId = String(twin._id)
        }
        await db.collection('resumes').updateOne({ _id: resume._id }, { $set: { fileId } })
      }
    },
  },
  {
    // Stored explicitly so the Admin shows (and can edit) what the site displays.
    id: '2026-09-about-principles',
    async run() {
      await mongoose.connection.db
        .collection('contents')
        .updateOne({ 'about.principles': { $exists: false } }, { $set: { 'about.principles': DEFAULT_PRINCIPLES } })
    },
  },
  {
    // Only empty fields are filled, so anything edited in the Admin is kept.
    id: '2026-09-daily-routine-details',
    async run() {
      const project = await Project.findOne({ slug: 'daily-routine-app' })
      if (!project) return
      for (const [key, value] of Object.entries(DAILY_ROUTINE_DETAILS)) {
        const current = project[key]
        const isEmpty = Array.isArray(current)
          ? current.length === 0 || (key === 'technologies' && current.join() === 'MERN')
          : !current
        if (isEmpty) project[key] = value
      }
      await project.save()
    },
  },
]

async function migrate() {
  await connectDB()
  const log = mongoose.connection.db.collection('migrations')
  for (const step of steps) {
    if (await log.findOne({ _id: step.id })) {
      console.log(`- ${step.id} already applied`)
      continue
    }
    await step.run()
    await log.insertOne({ _id: step.id, appliedAt: new Date() })
    console.log(`✓ ${step.id}`)
  }
  await mongoose.disconnect()
}

migrate().catch(async (err) => {
  console.error('Migration failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})
