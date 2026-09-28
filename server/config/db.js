const mongoose = require('mongoose')

let pending = null

// Reuses a single connection (also across warm serverless invocations).
// Concurrent callers share one in-flight attempt; a failed attempt is cleared
// so the next request retries instead of failing forever.
async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in the environment')
  }
  if (!pending) {
    pending = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log('MongoDB connected')
        return mongoose.connection
      })
      .finally(() => {
        pending = null
      })
  }
  return pending
}

function dbState() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
}

module.exports = connectDB
module.exports.dbState = dbState
