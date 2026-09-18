const Contact = require('../models/Contact')

async function createContact(req, res, next) {
  try {
    const { name, email, message } = req.body
    const contact = await Contact.create({ name, email, message })
    res.status(201).json({ message: 'Message received', id: contact._id })
  } catch (err) {
    next(err)
  }
}

module.exports = { createContact }
