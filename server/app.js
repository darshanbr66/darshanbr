const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const connectDB = require('./config/db')
const { dbState } = require('./config/db')
const apiRoutes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

// Behind Vercel/Render/etc. the client IP arrives via X-Forwarded-For.
app.set('trust proxy', 1)

// Allowed browser origins: CLIENT_URL and/or CORS_ORIGIN, each comma separated
// (e.g. "https://darshanbr.vercel.app"). The local Vite dev server is always
// allowed outside production so local development keeps working.
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173']
const allowedOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGIN]
  .filter(Boolean)
  .join(',')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)
if (process.env.NODE_ENV !== 'production') allowedOrigins.push(...DEV_ORIGINS)

app.use(
  helmet({
    // Images/PDFs are embedded by the client, which runs on another origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(
  cors({
    origin(origin, cb) {
      // No Origin header: same-origin, curl or health checks (CORS does not apply).
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(null, false)
    },
  })
)
app.use(express.json({ limit: '1mb' }))

// Liveness probe for Render — answers even while MongoDB is (re)connecting.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'darshan-portfolio-api',
    database: dbState(),
    uptime: Math.round(process.uptime()),
  })
})
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'))
}

// Lazily connect so the same app works as a long-running server or serverless function.
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('Database connection failed:', err.message)
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' })
  }
})

app.use('/api', apiRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
