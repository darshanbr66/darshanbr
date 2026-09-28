// Copies only whitelisted fields from a request body, so clients can never
// set `_id`, timestamps or any other field that isn't explicitly editable.
function pick(body, fields) {
  const out = {}
  for (const field of fields) {
    if (body?.[field] === undefined) continue
    const value = body[field]
    if (Array.isArray(value)) {
      out[field] = value
        .filter((v) => v !== null && v !== undefined)
        .map((v) => (typeof v === 'string' ? v.trim() : v))
        .filter((v) => v !== '')
    } else {
      out[field] = value
    }
  }
  return out
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Accepts http(s)/mailto URLs and site-relative paths; rejects javascript: etc.
function isSafeUrl(value) {
  if (!value) return true
  if (value.startsWith('/')) return !value.startsWith('//')
  return /^(https?:\/\/|mailto:)/i.test(value)
}

function assertSafeUrls(data, fields) {
  for (const field of fields) {
    const values = Array.isArray(data[field]) ? data[field] : [data[field]]
    if (values.some((v) => typeof v === 'string' && !isSafeUrl(v))) {
      const error = new Error(`${field} must be a valid http(s) URL`)
      error.status = 400
      throw error
    }
  }
}

module.exports = { pick, slugify, isSafeUrl, assertSafeUrls }
