const express = require('express')
const rateLimit = require('express-rate-limit')
const { requireAdmin } = require('../middleware/auth')
const { uploadMedia, uploadResume } = require('../middleware/upload')
const validateContact = require('../middleware/validateContact')
const auth = require('../controllers/authController')
const site = require('../controllers/siteController')
const profile = require('../controllers/profileController')
const content = require('../controllers/contentController')
const skills = require('../controllers/skillController')
const experience = require('../controllers/experienceController')
const projects = require('../controllers/projectController')
const contact = require('../controllers/contactController')
const media = require('../controllers/mediaController')
const resume = require('../controllers/resumeController')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
})

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
})

// Auth
router.post('/auth/login', loginLimiter, auth.login)
router.get('/auth/me', requireAdmin, auth.me)

// Public read endpoints
router.get('/site', site.getSite)
router.get('/profile', profile.getProfile)
router.get('/content', content.getContent)
router.get('/skills', skills.listPublic)
router.get('/experience', experience.listPublic)
router.get('/projects', projects.listPublic)
router.get('/resume', resume.getActive)
router.get('/resume/file', resume.streamActive)
router.get('/media/:id', media.stream)
router.post('/contact', contactLimiter, validateContact, contact.createContact)

// Admin endpoints
router.get('/admin/stats', requireAdmin, site.getStats)

router.get('/profile/admin', requireAdmin, profile.getProfileAdmin)
router.put('/profile', requireAdmin, profile.updateProfile)
router.put('/content', requireAdmin, content.updateContent)

router.get('/skills/admin', requireAdmin, skills.listAll)
router.post('/skills', requireAdmin, skills.create)
router.put('/skills/reorder', requireAdmin, skills.reorder)
router.put('/skills/:id', requireAdmin, skills.update)
router.delete('/skills/:id', requireAdmin, skills.remove)

router.get('/experience/admin', requireAdmin, experience.listAll)
router.post('/experience', requireAdmin, experience.create)
router.put('/experience/reorder', requireAdmin, experience.reorder)
router.put('/experience/:id', requireAdmin, experience.update)
router.delete('/experience/:id', requireAdmin, experience.remove)

router.get('/projects/admin', requireAdmin, projects.listAll)
router.get('/projects/admin/:id', requireAdmin, projects.getById)
router.post('/projects', requireAdmin, projects.create)
router.put('/projects/reorder', requireAdmin, projects.reorder)
router.post('/projects/:id/duplicate', requireAdmin, projects.duplicate)
router.put('/projects/:id', requireAdmin, projects.update)
router.delete('/projects/:id', requireAdmin, projects.remove)
router.get('/projects/:slug', projects.getBySlug)

router.get('/contact/admin', requireAdmin, contact.listMessages)
router.patch('/contact/:id', requireAdmin, contact.updateMessage)
router.delete('/contact/:id', requireAdmin, contact.deleteMessage)

router.get('/media', requireAdmin, media.list)
router.post('/media', requireAdmin, uploadMedia.array('files', 10), media.upload)
router.delete('/media/:id', requireAdmin, media.remove)

router.get('/resume/admin', requireAdmin, resume.listAll)
router.post('/resume', requireAdmin, uploadResume.single('file'), resume.upload)
router.put('/resume/:id/activate', requireAdmin, resume.activate)
router.delete('/resume/:id', requireAdmin, resume.remove)

module.exports = router
