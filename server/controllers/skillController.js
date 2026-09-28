const Skill = require('../models/Skill')
const { createCrud } = require('../utils/crud')

module.exports = createCrud(Skill, {
  label: 'Skill',
  fields: ['name', 'category', 'icon', 'description', 'featured', 'status', 'order'],
})
