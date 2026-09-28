import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import useFormState from '../hooks/useFormState'
import { useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, SaveBar } from '../components/ui'
import { TextInput, TextArea } from '../components/fields'
import { ImageField } from '../components/MediaPicker'

const FIELDS = ['name', 'role', 'title', 'headline', 'description', 'location', 'email', 'availability', 'profileImage']

function toForm(profile) {
  const form = Object.fromEntries(FIELDS.map((f) => [f, profile?.[f] || '']))
  const link = (id) => profile?.socialLinks?.find((l) => l.id === id)?.url || ''
  form.github = link('github')
  form.linkedin = link('linkedin')
  return form
}

function withLink(links, id, label, url) {
  const rest = links.filter((l) => l.id !== id)
  if (!url.trim()) return rest
  const existing = links.findIndex((l) => l.id === id)
  const entry = { id, label, url: url.trim() }
  if (existing === -1) return [...rest, entry]
  const next = [...links]
  next[existing] = entry
  return next
}

export default function ProfilePage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAdminData(adminApi.getProfile)
  const form = useFormState(toForm(null))
  const [saving, setSaving] = useState(false)
  const { values, set } = form

  useEffect(() => {
    if (data) form.load(toForm(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!values.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      let socialLinks = withLink(data.socialLinks || [], 'github', 'GitHub', values.github)
      socialLinks = withLink(socialLinks, 'linkedin', 'LinkedIn', values.linkedin)
      const profile = Object.fromEntries(FIELDS.map((f) => [f, values[f]]))
      const updated = await adminApi.updateProfile({ ...profile, socialLinks })
      setData(updated)
      toast.success('Profile saved — the public site is updated')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader title="Profile" description="Your identity across the hero, navigation, contact section and footer." />

      <div className="adm-grid-main">
        <div className="adm-stack">
          <Card title="Identity">
            <div className="adm-form-grid">
              <TextInput label="Name" value={values.name} onChange={set('name')} required />
              <TextInput label="Role" hint="e.g. Software Engineer" value={values.role} onChange={set('role')} />
              <TextInput label="Professional title" hint="e.g. Full-Stack MERN Developer" value={values.title} onChange={set('title')} />
              <TextInput label="Headline" hint="Shown in the hero eyebrow and footer" value={values.headline} onChange={set('headline')} />
            </div>
            <TextArea
              label="Short description"
              hint="Shown under the hero title and used as the site's meta description"
              rows={3}
              value={values.description}
              onChange={set('description')}
            />
            <p className="adm-muted adm-small">
              Longer about content is edited on the <Link to="/admin/about">About</Link> page.
            </p>
          </Card>

          <Card title="Contact & availability">
            <div className="adm-form-grid">
              <TextInput label="Location" value={values.location} onChange={set('location')} />
              <TextInput label="Email" type="email" value={values.email} onChange={set('email')} />
              <TextInput
                label="Availability / status"
                hint="e.g. Available for full-time opportunities. Leave empty to hide."
                value={values.availability}
                onChange={set('availability')}
                className="adm-span-2"
              />
            </div>
          </Card>

          <Card title="Primary links" description="Manage all links, including extra ones, on the Social Links page.">
            <div className="adm-form-grid">
              <TextInput label="GitHub URL" type="url" value={values.github} onChange={set('github')} placeholder="https://github.com/…" />
              <TextInput label="LinkedIn URL" type="url" value={values.linkedin} onChange={set('linkedin')} placeholder="https://www.linkedin.com/in/…" />
            </div>
          </Card>
        </div>

        <div className="adm-stack">
          <Card title="Profile image">
            <ImageField label="Photo" hint="Optional. JPG, PNG or WebP — optimized automatically." value={values.profileImage} onChange={set('profileImage')} />
          </Card>
          <Card title="Resume">
            <p className="adm-muted">The public Resume buttons always serve the active resume.</p>
            <Link to="/admin/resume" className="adm-btn">
              Manage resume
            </Link>
          </Card>
        </div>
      </div>

      <SaveBar dirty={form.dirty} saving={saving} onReset={form.reset} />
    </form>
  )
}
