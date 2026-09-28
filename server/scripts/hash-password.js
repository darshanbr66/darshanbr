// Prints a bcrypt hash for ADMIN_PASSWORD_HASH.
// Usage: npm run hash-password -- "your new password"
const bcrypt = require('bcryptjs')

const password = process.argv[2]
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "<password of at least 10 characters>"')
  process.exit(1)
}

console.log(bcrypt.hashSync(password, 12))
