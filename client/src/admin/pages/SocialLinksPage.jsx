import { useEffect, useState } from 'react'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import useFormState from '../hooks/useFormState'
import { useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, SaveBar, ReorderButtons } from '../components/ui'
import { moveItem } from '../utils/format'
import Icon from '../components/Icon'

const PRESETS = [
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/…' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/…' },
  { id: 'email', label: 'Email', placeholder: 'mailto:you@example.com' },
]

const isValid = (url) => /^(https?:\/\/\S+|mailto:\S+@\S+)$/i.test(url.trim())

export default function SocialLinksPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAdminData(adminApi.getProfile)
  const form = useFormState({ links: [] })
  const [saving, setSaving] = useState(false)
  const links = form.values.links

  useEffect(() => {
    if (data) form.load({ links: (data.socialLinks || []).map((l) => ({ ...l })) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const setLinks = (next) => form.setValues({ links: next })
  const update = (index, field, value) => setLinks(links.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  const missingPresets = PRESETS.filter((p) => !links.some((l) => l.id === p.id))
  const invalid = links.filter((l) => l.url && !isValid(l.url))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (invalid.length) return toast.error('Fix the highlighted URLs first')
    setSaving(true)
    try {
      const cleaned = links
        .filter((l) => l.url.trim())
        .map((l, i) => ({ ...l, id: l.id || `${l.label || 'link'}-${i}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
      const updated = await adminApi.updateProfile({ socialLinks: cleaned })
      setData(updated)
      toast.success('Links saved — navigation, contact and footer are updated')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader title="Social Links" description="Shown in the contact section and footer, in this order. Email links use mailto:." />

      <Card>
        {links.length === 0 && <p className="adm-muted adm-pad">No links yet.</p>}
        <div className="adm-links">
          {links.map((link, index) => {
            const preset = PRESETS.find((p) => p.id === link.id)
            const bad = link.url && !isValid(link.url)
            return (
              <div key={index} className={`adm-links__row ${bad ? 'has-error' : ''}`}>
                <ReorderButtons index={index} count={links.length} onMove={(i, dir) => setLinks(moveItem(links, i, dir))} />
                <input
                  className="adm-input adm-links__label"
                  value={link.label}
                  onChange={(e) => update(index, 'label', e.target.value)}
                  aria-label="Label"
                  placeholder="Label"
                />
                <input
                  className="adm-input"
                  value={link.url}
                  onChange={(e) => update(index, 'url', e.target.value)}
                  aria-label={`${link.label || 'Link'} URL`}
                  placeholder={preset?.placeholder || 'https://'}
                />
                {link.url && isValid(link.url) && (
                  <a className="adm-icon-btn" href={link.url} target="_blank" rel="noreferrer" aria-label="Open link">
                    <Icon name="external" size={16} />
                  </a>
                )}
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn--danger"
                  onClick={() => setLinks(links.filter((_, i) => i !== index))}
                  aria-label="Remove link"
                >
                  <Icon name="trash" size={16} />
                </button>
                {bad && <p className="adm-field__error adm-links__error">Use a full https:// URL or mailto:address</p>}
              </div>
            )
          })}
        </div>

        <div className="adm-links__add">
          {missingPresets.map((p) => (
            <button
              type="button"
              key={p.id}
              className="adm-btn adm-btn--sm"
              onClick={() => setLinks([...links, { id: p.id, label: p.label, url: '' }])}
            >
              <Icon name="plus" size={14} /> {p.label}
            </button>
          ))}
          <button type="button" className="adm-btn adm-btn--sm" onClick={() => setLinks([...links, { id: '', label: '', url: '' }])}>
            <Icon name="plus" size={14} /> Custom link
          </button>
        </div>
      </Card>

      <SaveBar dirty={form.dirty} saving={saving} onReset={form.reset} />
    </form>
  )
}
