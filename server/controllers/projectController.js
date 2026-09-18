const Project = require('../models/Project')

async function getProjects(req, res, next) {
  try {
    const projects = await Project.find().sort({ createdAt: 1 })
    res.json(projects)
  } catch (err) {
    next(err)
  }
}

async function getProjectBySlug(req, res, next) {
  try {
    const project = await Project.findOne({ slug: req.params.slug })
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.json(project)
  } catch (err) {
    next(err)
  }
}

module.exports = { getProjects, getProjectBySlug }
