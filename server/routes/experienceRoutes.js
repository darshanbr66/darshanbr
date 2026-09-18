const express = require('express')
const { getExperience } = require('../controllers/experienceController')

const router = express.Router()

router.get('/', getExperience)

module.exports = router
