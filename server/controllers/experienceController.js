const Experience = require('../models/Experience')

async function getExperience(req, res, next) {
  try {
    const experience = await Experience.find().sort({ order: 1 })
    res.json(experience)
  } catch (err) {
    next(err)
  }
}

module.exports = { getExperience }
