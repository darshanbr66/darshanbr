const ContactMessage = require('../models/ContactMessage')
const { notFoundError } = require('../utils/crud')
const { notifyNewMessage } = require('../utils/notify')

async function createContact(req, res) {
  // Honeypot: real visitors never fill the hidden `website` field.
  if (req.body.website) return res.status(201).json({ message: 'Message received' })

  const { name, email, message } = req.body
  const contact = await ContactMessage.create({ name, email, message })
  notifyNewMessage(contact).catch((err) => console.warn('Contact notification failed:', err.message))
  res.status(201).json({ message: 'Message received', id: contact._id })
}

async function listMessages(req, res) {
  const filter = {}
  if (['new', 'read', 'replied'].includes(req.query.status)) filter.status = req.query.status
  const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).lean()
  res.json(messages)
}

async function updateMessage(req, res) {
  const { status } = req.body || {}
  if (!['new', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ message: 'status must be new, read or replied' })
  }
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' })
  if (!message) throw notFoundError('Message')
  res.json(message)
}

async function deleteMessage(req, res) {
  const message = await ContactMessage.findByIdAndDelete(req.params.id)
  if (!message) throw notFoundError('Message')
  res.json({ message: 'Message deleted', id: message._id })
}

module.exports = { createContact, listMessages, updateMessage, deleteMessage }
