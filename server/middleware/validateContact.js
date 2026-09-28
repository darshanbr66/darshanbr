const { body, validationResult } = require('express-validator')

const validateContact = [
  body('name').isString().withMessage('Name is required').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isString().withMessage('A valid email is required').trim().isEmail().withMessage('A valid email is required').isLength({ max: 200 }),
  body('message')
    .isString()
    .withMessage('Message is required')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 5000 })
    .withMessage('Message is too long'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() })
    }
    next()
  },
]

module.exports = validateContact
