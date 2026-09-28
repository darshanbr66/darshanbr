require('dotenv').config({ quiet: true })
const mongoose = require('mongoose')
const app = require('./app')
const connectDB = require('./config/db')

const PORT = Number(process.env.PORT) || 5000
// 0.0.0.0 so hosting platforms (Render, Docker) can route traffic to the process.
const HOST = process.env.HOST || '0.0.0.0'
const RETRY_MS = 10000

// Names only — never log the values.
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD_HASH']
const missing = REQUIRED_ENV.filter((name) => !process.env[name])
if (missing.length) console.warn(`Missing environment variables: ${missing.join(', ')}`)

// Start listening right away so health checks pass while MongoDB connects;
// a temporary Atlas outage is retried instead of crashing the service.
async function connectWithRetry() {
  try {
    await connectDB()
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}. Retrying in ${RETRY_MS / 1000}s`)
    setTimeout(connectWithRetry, RETRY_MS).unref()
  }
}

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT} (${process.env.NODE_ENV || 'development'})`)
  connectWithRetry()
})

function shutdown(signal) {
  console.log(`${signal} received, shutting down`)
  server.close(() => {
    mongoose.disconnect().finally(() => process.exit(0))
  })
  setTimeout(() => process.exit(0), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
