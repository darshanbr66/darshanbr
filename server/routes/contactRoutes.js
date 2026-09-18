const express = require('express')
const { createContact } = require('../controllers/contactController')
const validateContact = require('../middleware/validateContact')

const router = express.Router()

router.post('/', validateContact, createContact)

module.exports = router
