import { useEffect, useState } from 'react'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import useFormState from '../hooks/useFormState'
import { useAuth, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, SaveBar } from '../components/ui'
import { formatDate } from '../utils/format'
import { TextInput, TextArea } from '../components/fields'

const SECTIONS = [
  { key: 'experience', label: 'Experience section' },
  { key: 'skills', label: 'Technology section' },
  { key: 'projects', label: 'Projects section' },
  { key: 'contact', label: 'Contact section' },
]
const HERO_FIELDS = ['titleLine1', 'titleLine2', 'exploreWorkLabel', 'contactLabel', 'scrollLabel']
const FOOTER_FIELDS = ['eyebrow', 'heading', 'buttonLabel']

function toForm(content) {
  const form = { hero: {}, footer: {} }
  for (const f of HERO_FIELDS) form.hero[f] = content?.hero?.[f] || ''
  for (const f of FOOTER_FIELDS) form.footer[f] = content?.footer?.[f] || ''
  for (const { key } of SECTIONS) {
    form[key] = { heading: content?.[key]?.heading || '', description: content?.[key]?.description || '' }
  }
  return form
}

export default function SettingsPage() {
  const toast = useToast()
  const { session } = useAuth()
  const { data, loading, error, reload, setData } = useAdminData(adminApi.getContent)
  const form = useFormState(toForm(null))
  const [saving, setSaving] = useState(false)
  const { values, setValues } = form

  useEffect(() => {
    if (data) form.load(toForm(data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const set = (section, field) => (value) =>
    setValues((v) => ({ ...v, [section]: { ...v[section], [field]: value } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      setData(await adminApi.updateContent(values))
      toast.success('Site content saved')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader title="Settings" description="Section headings, hero copy and account information." />

      <div className="adm-stack">
        <Card title="Hero" description="The large animated title and button labels at the top of the site.">
          <div className="adm-form-grid">
            <TextInput label="Title — line 1" value={values.hero.titleLine1} onChange={set('hero', 'titleLine1')} />
            <TextInput label="Title — line 2 (accent)" value={values.hero.titleLine2} onChange={set('hero', 'titleLine2')} />
            <TextInput label="Primary button" value={values.hero.exploreWorkLabel} onChange={set('hero', 'exploreWorkLabel')} />
            <TextInput label="Secondary button" value={values.hero.contactLabel} onChange={set('hero', 'contactLabel')} />
            <TextInput label="Scroll hint" value={values.hero.scrollLabel} onChange={set('hero', 'scrollLabel')} />
          </div>
        </Card>

        <Card title="Section headings" description="The About heading is edited on the About page.">
          {SECTIONS.map(({ key, label }) => (
            <fieldset key={key} className="adm-fieldset">
              <legend>{label}</legend>
              <TextInput label="Heading" value={values[key].heading} onChange={set(key, 'heading')} />
              <TextArea label="Intro text" hint="Optional short paragraph." rows={2} value={values[key].description} onChange={set(key, 'description')} />
            </fieldset>
          ))}
        </Card>

        <Card
          title="Closing call-to-action"
          description="The large closing statement shown above the footer on project pages. Clear the heading to hide it."
        >
          <TextInput label="Eyebrow" value={values.footer.eyebrow} onChange={set('footer', 'eyebrow')} />
          <TextArea
            label="Heading"
            hint="Each line is revealed separately; the last line is drawn as an outline."
            rows={2}
            value={values.footer.heading}
            onChange={set('footer', 'heading')}
          />
          <TextInput label="Button label" value={values.footer.buttonLabel} onChange={set('footer', 'buttonLabel')} />
        </Card>

        <Card title="Account">
          <dl className="adm-dl">
            <dt>Signed in as</dt>
            <dd>{session?.email}</dd>
            <dt>Session expires</dt>
            <dd>{formatDate(session?.expiresAt, true)}</dd>
            <dt>Password</dt>
            <dd className="adm-muted">
              Credentials are stored as server environment variables. To change the password, run{' '}
              <code>npm run hash-password -- "new password"</code> in <code>server/</code> and set the result as{' '}
              <code>ADMIN_PASSWORD_HASH</code>.
            </dd>
          </dl>
        </Card>
      </div>

      <SaveBar dirty={form.dirty} saving={saving} onReset={form.reset} />
    </form>
  )
}
