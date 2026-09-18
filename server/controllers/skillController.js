const SkillCategory = require('../models/Skill')

async function getSkills(req, res, next) {
  try {
    const categories = await SkillCategory.find().sort({ order: 1 })
    res.json(categories)
  } catch (err) {
    next(err)
  }
}

module.exports = { getSkills }
