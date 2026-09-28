const jwt = require('jsonwebtoken')

// Verifies the admin JWT sent as `Authorization: Bearer <token>`.
function requireAdmin(req, res, next) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'Authentication is not configured on the server' })
  }

  const [scheme, token] = (req.headers.authorization || '').split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const payload = jwt.verify(token, secret)
    if (payload.role !== 'admin') throw new Error('Invalid role')
    req.admin = { email: payload.sub }
    next()
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' })
  }
}

module.exports = { requireAdmin }
