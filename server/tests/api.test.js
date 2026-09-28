// End-to-end API tests against the configured database. Every record created
// here is tagged and deleted again, so real content is never modified.
// Run with: npm test
require('dotenv').config({ quiet: true })
const { test, before, after } = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

process.env.NODE_ENV = 'test'
process.env.ADMIN_EMAIL = 'e2e-admin@example.com'
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('e2e-password-123', 4)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

const app = require('../app')

let server
let base
let token
const TAG = `e2e-${Date.now()}`

async function call(path, { method = 'GET', body, auth = true, form } = {}) {
  const headers = {}
  if (auth && token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${base}${path}`, { method, headers, body: form || (body && JSON.stringify(body)) })
  const data = res.headers.get('content-type')?.includes('json') ? await res.json() : await res.arrayBuffer()
  return { status: res.status, data, headers: res.headers }
}

before(async () => {
  server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  base = `http://127.0.0.1:${server.address().port}/api`
})

after(async () => {
  server.close()
  await mongoose.disconnect()
})

test('public site payload contains real content', async () => {
  const { status, data } = await call('/site', { auth: false })
  assert.equal(status, 200)
  assert.equal(data.profile.name, 'Darshan B R')
  assert.ok(data.projects.every((p) => p.status === 'published'))
  assert.ok(data.skills.length > 0)
  assert.ok(data.experience.some((e) => /Sigvitas/.test(e.company)))
})

test('admin routes reject missing or bad tokens', async () => {
  assert.equal((await call('/admin/stats', { auth: false })).status, 401)
  const bad = await fetch(`${base}/admin/stats`, { headers: { Authorization: 'Bearer nope' } })
  assert.equal(bad.status, 401)
  assert.equal((await call('/projects', { method: 'POST', body: { title: 'x' }, auth: false })).status, 401)
})

test('login rejects wrong password and accepts the right one', async () => {
  const wrong = await call('/auth/login', { method: 'POST', body: { email: process.env.ADMIN_EMAIL, password: 'nope' } })
  assert.equal(wrong.status, 401)
  const ok = await call('/auth/login', {
    method: 'POST',
    body: { email: process.env.ADMIN_EMAIL, password: 'e2e-password-123' },
  })
  assert.equal(ok.status, 200)
  token = ok.data.token
  assert.equal((await call('/auth/me')).data.email, process.env.ADMIN_EMAIL)
})

test('project CRUD, publish, duplicate and slug lookup', async () => {
  const created = await call('/projects', { method: 'POST', body: { title: `${TAG} Project`, status: 'draft' } })
  assert.equal(created.status, 201)
  const id = created.data._id
  const slug = created.data.slug

  assert.equal((await call(`/projects/${slug}`, { auth: false })).status, 404, 'drafts are hidden')

  const updated = await call(`/projects/${id}`, {
    method: 'PUT',
    body: { status: 'published', technologies: ['React', ' ', 'Node.js'], liveUrl: 'https://example.com' },
  })
  assert.equal(updated.status, 200)
  assert.deepEqual(updated.data.technologies, ['React', 'Node.js'])
  assert.equal((await call(`/projects/${slug}`, { auth: false })).status, 200)

  const unsafe = await call(`/projects/${id}`, { method: 'PUT', body: { liveUrl: 'javascript:alert(1)' } })
  assert.equal(unsafe.status, 400)

  const copy = await call(`/projects/${id}/duplicate`, { method: 'POST' })
  assert.equal(copy.status, 201)
  assert.equal(copy.data.status, 'draft')

  for (const pid of [id, copy.data._id]) assert.equal((await call(`/projects/${pid}`, { method: 'DELETE' })).status, 200)
})

test('skill and experience CRUD with reorder', async () => {
  const skill = await call('/skills', { method: 'POST', body: { name: `${TAG} Skill`, category: 'Tools' } })
  assert.equal(skill.status, 201)
  const all = (await call('/skills/admin')).data
  const ids = all.map((s) => s._id)
  const reordered = await call('/skills/reorder', { method: 'PUT', body: { ids: [skill.data._id, ...ids.filter((i) => i !== skill.data._id)] } })
  assert.equal(reordered.data[0]._id, skill.data._id)
  // restore original order
  await call('/skills/reorder', { method: 'PUT', body: { ids } })
  assert.equal((await call(`/skills/${skill.data._id}`, { method: 'DELETE' })).status, 200)

  const exp = await call('/experience', { method: 'POST', body: { role: `${TAG} Role`, company: 'Test Co', current: true, endDate: 'x' } })
  assert.equal(exp.status, 201)
  assert.equal(exp.data.endDate, '')
  assert.equal((await call('/experience', { method: 'POST', body: { role: 'no company' } })).status, 400)
  assert.equal((await call(`/experience/${exp.data._id}`, { method: 'DELETE' })).status, 200)
})

test('profile and content updates round-trip', async () => {
  const before = (await call('/profile/admin')).data
  const res = await call('/profile', { method: 'PUT', body: { location: before.location } })
  assert.equal(res.status, 200)
  const bad = await call('/profile', { method: 'PUT', body: { socialLinks: [{ label: 'x', url: 'javascript:1' }] } })
  assert.equal(bad.status, 400)

  const content = (await call('/content', { auth: false })).data
  const saved = await call('/content', { method: 'PUT', body: { about: { heading: content.about.heading } } })
  assert.equal(saved.data.about.heading, content.about.heading)
})

test('about principles and footer copy flow from admin to the public site', async () => {
  const original = (await call('/content', { auth: false })).data
  const restore = {
    about: { principles: original.about.principles },
    footer: { ...original.footer },
  }
  try {
    const principles = [
      ...original.about.principles,
      { title: `  ${TAG} principle  `, text: 'Edited from the admin.' },
      { title: '', text: '' }, // empty rows are dropped
    ]
    const res = await call('/content', {
      method: 'PUT',
      body: { about: { principles }, footer: { heading: `${TAG}\nline two` } },
    })
    assert.equal(res.status, 200)

    const site = (await call('/site', { auth: false })).data
    assert.equal(site.content.about.principles.length, original.about.principles.length + 1)
    assert.equal(site.content.about.principles.at(-1).title, `${TAG} principle`)
    assert.equal(site.content.footer.heading, `${TAG}\nline two`)
    assert.equal(site.content.footer.buttonLabel, original.footer.buttonLabel)

    const tooMany = Array.from({ length: 20 }, (_, i) => ({ title: `p${i}`, text: '' }))
    const capped = await call('/content', { method: 'PUT', body: { about: { principles: tooMany } } })
    assert.equal(capped.data.about.principles.length, 8)
  } finally {
    await call('/content', { method: 'PUT', body: restore })
  }
  const after = (await call('/content', { auth: false })).data
  assert.deepEqual(after.about.principles, original.about.principles)
  assert.equal(after.footer.heading, original.footer.heading)
})

test('contact form stores messages that only the admin can read', async () => {
  const invalid = await call('/contact', { method: 'POST', auth: false, body: { name: '', email: 'bad', message: '' } })
  assert.equal(invalid.status, 400)
  const sent = await call('/contact', {
    method: 'POST',
    auth: false,
    body: { name: TAG, email: 'e2e@example.com', message: 'E2E test message' },
  })
  assert.equal(sent.status, 201)
  assert.equal((await call('/contact/admin', { auth: false })).status, 401)
  const inbox = (await call('/contact/admin')).data
  const mine = inbox.find((m) => m._id === sent.data.id)
  assert.equal(mine.status, 'new')
  assert.equal((await call(`/contact/${mine._id}`, { method: 'PATCH', body: { status: 'read' } })).data.status, 'read')
  assert.equal((await call(`/contact/${mine._id}`, { method: 'DELETE' })).status, 200)
})

test('media upload optimizes images, serves them publicly, and deletes', async () => {
  const sharp = require('sharp')
  const png = await sharp({ create: { width: 3000, height: 1500, channels: 3, background: '#335' } }).png().toBuffer()
  const form = new FormData()
  form.append('files', new Blob([png], { type: 'image/png' }), `${TAG}.png`)
  const up = await call('/media', { method: 'POST', form })
  assert.equal(up.status, 201)
  const [file] = up.data
  assert.equal(file.contentType, 'image/webp')
  assert.equal(file.width, 2000)

  const served = await fetch(`${base.replace(/\/api$/, '')}${file.url}`)
  assert.equal(served.status, 200)
  assert.equal(served.headers.get('content-type'), 'image/webp')
  assert.match(served.headers.get('cache-control'), /immutable/)

  const rejected = new FormData()
  rejected.append('files', new Blob(['x'], { type: 'text/html' }), 'x.html')
  assert.equal((await call('/media', { method: 'POST', form: rejected })).status, 400)

  assert.equal((await call(`/media/${file.id}`, { method: 'DELETE' })).status, 200)
})

test('resume upload/replace, public file, and active-file protection', async () => {
  const original = (await call('/resume', { auth: false })).data
  assert.ok(original, 'an active resume exists')

  // Upload a throwaway PDF as the active resume, then always restore the original.
  const form = new FormData()
  form.append('file', new Blob(['%PDF-1.4 e2e'], { type: 'application/pdf' }), `${TAG}.pdf`)
  const up = await call('/resume', { method: 'POST', form })
  assert.equal(up.status, 201)
  try {
    const pdf = await fetch(`${base}/resume/file`)
    assert.equal(pdf.status, 200)
    assert.equal(pdf.headers.get('content-type'), 'application/pdf')
    assert.equal(Buffer.from(await pdf.arrayBuffer()).toString(), '%PDF-1.4 e2e')
    // Guard: the active resume's file cannot be deleted (only the throwaway is at risk here).
    assert.equal((await call(`/media/${up.data.fileId}`, { method: 'DELETE' })).status, 409)
    assert.equal((await call(`/resume/${up.data.id}`, { method: 'DELETE' })).status, 409)
  } finally {
    const list = (await call('/resume/admin')).data
    const originalRecord = list.find((r) => r.fileId === String(original.fileId))
    assert.equal((await call(`/resume/${originalRecord.id}/activate`, { method: 'PUT' })).status, 200)
    assert.equal((await call(`/resume/${up.data.id}`, { method: 'DELETE' })).status, 200)
  }
  const restored = (await call('/resume', { auth: false })).data
  assert.equal(restored.fileId, original.fileId)
})
