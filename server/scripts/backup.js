// Exports every non-binary collection of the portfolio database to
// server/backups/<timestamp>.json. Run before any migration: `npm run backup`.
require('dotenv').config({ quiet: true })
const fs = require('node:fs')
const path = require('node:path')
const mongoose = require('mongoose')

async function backup() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db
  const collections = await db.listCollections().toArray()
  const dump = {}

  for (const { name } of collections) {
    if (name === 'uploads.chunks') continue // binary file data stays in GridFS
    dump[name] = await db.collection(name).find({}).toArray()
  }

  const dir = path.join(__dirname, '..', 'backups')
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(file, JSON.stringify(dump, null, 2))
  console.log(`Backup written: ${file}`)
  await mongoose.disconnect()
}

backup().catch((err) => {
  console.error('Backup failed:', err.message)
  process.exit(1)
})
