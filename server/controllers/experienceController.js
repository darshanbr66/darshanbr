const Experience = require('../models/Experience')
const { createCrud } = require('../utils/crud')

module.exports = createCrud(Experience, {
  label: 'Experience',
  fields: [
    'role',
    'company',
    'location',
    'startDate',
    'endDate',
    'current',
    'description',
    'responsibilities',
    'technologies',
    'status',
    'order',
  ],
  prepare(data) {
    if (data.current === true) data.endDate = ''
    return data
  },
})
