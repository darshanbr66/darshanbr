import { useEffect, useState } from 'react'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import useFormState from '../hooks/useFormState'
import { useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, SaveBar } from '../components/ui'
import { TextInput, TextArea } from '../components/fields'
import Icon from '../components/Icon'

const FIELDS = ['heading', 'introduction', 'summary', 'background', 'focus', 'additional']
const MAX_PRINCIPLES = 8

const toForm = (about) => ({
  ...Object.fromEntries(FIELDS.map((f) => [f, about?.[f] || ''])),
  principles: (about?.principles || []).map((p) => ({ title: p.title || '', text: p.text || '' })),
})

function PrinciplesEditor({ value, onChange }) {
  const update = (index, field, text) =>
    onChange(value.map((p, i) => (i === index ? { ...p, [field]: text } : p)))
  const remove = (index) => onChange(value.filter((_, i) => i !== index))
  const move = (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="adm-principles">
      {value.map((p, i) => (
        <div key={i} className="adm-principle">
          <span className="adm-list__index">{String(i + 1).padStart(2, '0')}</span>
          <div className="adm-principle__fields">
            <input
              className="adm-input"
              value={p.title}
              placeholder="Title"
              onChange={(e) => update(i, 'title', e.target.value)}
              aria-label={`Principle ${i + 1} title`}
            />
            <textarea
              className="adm-input"
              rows={2}
              value={p.text}
              placeholder="One or two sentences"
              onChange={(e) => update(i, 'text', e.target.value)}
              aria-label={`Principle ${i + 1} text`}
            />
          </div>
          <div className="adm-list__actions">
            <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
              <Icon name="up" size={14} />
            </button>
            <button
              type="button"
              className="adm-icon-btn"
              onClick={() => move(i, 1)}
              disabled={i === value.length - 1}
              aria-label="Move down"
            >
              <Icon name="down" size={14} />
            </button>
            <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(i)} aria-label="Remove">
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="adm-btn adm-btn--sm"
        onClick={() => onChange([...value, { title: '', text: '' }])}
        disabled={value.length >= MAX_PRINCIPLES}
      >
        <Icon name="plus" size={14} /> Add principle
      </button>
    </div>
  )
}

export default function AboutPage() {
  const toast = useToast()
  const { data, loading, error, reload, setData } = useAdminData(adminApi.getContent)
  const form = useFormState(toForm(null))
  const [saving, setSaving] = useState(false)
  const { values, set } = form

  useEffect(() => {
    if (data) form.load(toForm(data.about))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      setData(await adminApi.updateContent({ about: values }))
      toast.success('About section saved')
    } catch (err) {
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader title="About" description="Content for the About section. Empty fields are hidden on the site." />

      <div className="adm-stack">
        <Card title="Heading & introduction">
          <TextInput label="About heading" value={values.heading} onChange={set('heading')} placeholder="About" />
          <TextArea
            label="Introduction"
            hint="The large statement that highlights word by word as visitors scroll."
            rows={3}
            value={values.introduction}
            onChange={set('introduction')}
          />
          <TextInput label="Focus" hint="Shown in the About details column." value={values.focus} onChange={set('focus')} />
        </Card>

        <Card title="Details" description="Each filled field becomes a numbered entry in the About section.">
          <TextArea label="Professional summary" rows={4} value={values.summary} onChange={set('summary')} />
          <TextArea label="Background" rows={4} value={values.background} onChange={set('background')} />
          <TextArea label="Additional information" rows={4} value={values.additional} onChange={set('additional')} />
        </Card>

        <Card
          title="How I work"
          description="Numbered principles listed after the details above, each animating in as visitors scroll."
        >
          <PrinciplesEditor value={values.principles} onChange={set('principles')} />
        </Card>
      </div>

      <SaveBar dirty={form.dirty} saving={saving} onReset={form.reset} />
    </form>
  )
}
