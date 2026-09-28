const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Single-admin login. Credentials live only in server environment variables:
// ADMIN_EMAIL, ADMIN_PASSWORD_HASH (bcrypt) and JWT_SECRET.
async function login(req, res) {
  const { email, password } = req.body || {}
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, JWT_SECRET, JWT_EXPIRES_IN } = process.env
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    console.error('Admin authentication environment variables are missing')
    return res.status(500).json({ message: 'Authentication is not configured on the server' })
  }

  const emailMatches = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase()
  // Always run bcrypt so response timing doesn't reveal whether the email matched.
  const passwordMatches = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!emailMatches || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const expiresIn = JWT_EXPIRES_IN || '12h'
  const token = jwt.sign({ sub: ADMIN_EMAIL, role: 'admin' }, JWT_SECRET, { expiresIn })
  const { exp } = jwt.decode(token)
  res.json({ token, expiresAt: new Date(exp * 1000).toISOString(), email: ADMIN_EMAIL })
}

function me(req, res) {
  res.json({ email: req.admin.email })
}

module.exports = { login, me }
