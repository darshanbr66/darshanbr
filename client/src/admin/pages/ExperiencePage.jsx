import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Spinner, ErrorState, EmptyState, Badge, Modal, ReorderButtons } from '../components/ui'
import { moveItem } from '../utils/format'
import { TextInput, TextArea, Toggle, TagInput, ListEditor } from '../components/fields'
import Icon from '../components/Icon'

const EMPTY = {
  role: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  responsibilities: [],
  technologies: [],
  status: 'published',
}

function ExperienceModal({ item, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState(item ? { ...EMPTY, ...item } : EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }))

  const save = async () => {
    const next = {}
    if (!values.role.trim()) next.role = 'Role is required'
    if (!values.company.trim()) next.company = 'Company is required'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const payload = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, values[k]]))
      const saved = item ? await adminApi.experience.update(item._id, payload) : await adminApi.experience.create(payload)
      toast.success(item ? 'Experience updated' : 'Experience added')
      onSaved(saved)
    } catch (err) {
      toast.error(err)
      setSaving(false)
    }
  }

  return (
    <Modal
      title={item ? 'Edit experience' : 'Add experience'}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button className="adm-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save experience'}
          </button>
        </>
      }
    >
      <div className="adm-stack-sm">
        <div className="adm-form-grid">
          <TextInput label="Role" value={values.role} onChange={set('role')} error={errors.role} autoFocus />
          <TextInput label="Company" value={values.company} onChange={set('company')} error={errors.company} />
          <TextInput label="Location" value={values.location} onChange={set('location')} className="adm-span-2" />
          <TextInput label="Start date" placeholder="e.g. November 2024" value={values.startDate} onChange={set('startDate')} />
          <TextInput
            label="End date"
            placeholder={values.current ? 'Present' : 'e.g. March 2026'}
            value={values.current ? '' : values.endDate}
            onChange={set('endDate')}
            disabled={values.current}
          />
        </div>
        <Toggle label="Current role" hint="Shows “Present” and a CURRENT badge on the timeline." checked={values.current} onChange={set('current')} />
        <TextArea label="Description" rows={3} value={values.description} onChange={set('description')} />
        <ListEditor
          label="Responsibilities"
          value={values.responsibilities}
          onChange={set('responsibilities')}
          placeholder="Add a responsibility and press Enter"
        />
        <TagInput label="Technologies" value={values.technologies} onChange={set('technologies')} />
        <Toggle
          label="Published"
          checked={values.status === 'published'}
          onChange={(on) => set('status')(on ? 'published' : 'draft')}
        />
      </div>
    </Modal>
  )
}

export default function ExperiencePage() {
  const toast = useToast()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const { data: items, setData, loading, error, reload } = useAdminData(adminApi.experience.list)
  const [editing, setEditing] = useState(() => (params.get('new') ? 'new' : null))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (params.get('new')) setParams({}, { replace: true })
  }, [params, setParams])

  if (loading && !items) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const move = async (index, dir) => {
    const next = moveItem(items, index, dir)
    setData(next)
    setBusy(true)
    try {
      setData(await adminApi.experience.reorder(next.map((i) => i._id)))
    } catch (err) {
      toast.error(err)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const remove = async (item) => {
    const ok = await confirm({ title: `Delete ${item.role} at ${item.company}?`, message: 'This cannot be undone.' })
    if (!ok) return
    try {
      await adminApi.experience.remove(item._id)
      setData((list) => list.filter((i) => i._id !== item._id))
      toast.success('Experience deleted')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Experience"
        description="Roles shown on the animated experience timeline, top to bottom."
        actions={
          <button className="adm-btn adm-btn--primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} /> Add experience
          </button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title="No experience yet"
          description="Add your roles to populate the timeline."
          action={
            <button className="adm-btn adm-btn--primary" onClick={() => setEditing('new')}>
              Add experience
            </button>
          }
        />
      ) : (
        <div className="adm-stack">
          {items.map((item, index) => (
            <article key={item._id} className="adm-card adm-exp">
              <ReorderButtons index={index} count={items.length} onMove={move} disabled={busy} />
              <div className="adm-exp__body">
                <div className="adm-exp__head">
                  <h2>{item.role}</h2>
                  {item.current && <Badge tone="accent">Current</Badge>}
                  {item.status !== 'published' && <Badge>Hidden</Badge>}
                </div>
                <p className="adm-muted">
                  {[item.company, item.location].filter(Boolean).join(' · ')}
                  {' · '}
                  {[item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' – ')}
                </p>
                {item.description && <p className="adm-exp__desc">{item.description}</p>}
                {item.technologies?.length > 0 && (
                  <div className="adm-chips">
                    {item.technologies.map((t) => (
                      <span key={t} className="adm-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {item.responsibilities?.length > 0 && (
                  <p className="adm-muted adm-small">{item.responsibilities.length} responsibilities</p>
                )}
              </div>
              <div className="adm-exp__actions">
                <button className="adm-btn adm-btn--sm" onClick={() => setEditing(item)}>
                  <Icon name="edit" size={14} /> Edit
                </button>
                <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(item)} aria-label="Delete">
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <ExperienceModal
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setData((list) =>
              list.some((i) => i._id === saved._id) ? list.map((i) => (i._id === saved._id ? saved : i)) : [...list, saved]
            )
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
