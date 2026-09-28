import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, EmptyState, Badge, Modal, ReorderButtons } from '../components/ui'
import { moveItem } from '../utils/format'
import { TextInput, TextArea, Toggle } from '../components/fields'
import Icon from '../components/Icon'

const DEFAULT_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tools', 'Other']
const EMPTY = { name: '', category: 'Frontend', icon: '', description: '', featured: false, status: 'published' }

function SkillModal({ skill, categories, onClose, onSaved }) {
  const toast = useToast()
  const [values, setValues] = useState(skill ? { ...EMPTY, ...skill } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }))

  const save = async (e) => {
    e?.preventDefault()
    if (!values.name.trim()) return setError('Skill name is required')
    setSaving(true)
    try {
      const payload = {
        name: values.name,
        category: values.category.trim() || 'Other',
        icon: values.icon,
        description: values.description,
        featured: values.featured,
        status: values.status,
      }
      const saved = skill ? await adminApi.skills.update(skill._id, payload) : await adminApi.skills.create(payload)
      toast.success(skill ? 'Skill updated' : 'Skill added')
      onSaved(saved)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      title={skill ? 'Edit skill' : 'Add skill'}
      onClose={onClose}
      footer={
        <>
          <button className="adm-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save skill'}
          </button>
        </>
      }
    >
      <form onSubmit={save} className="adm-stack-sm">
        <TextInput label="Name" value={values.name} onChange={set('name')} error={error} autoFocus />
        <div className="adm-form-grid">
          <div className="adm-field">
            <label className="adm-field__label" htmlFor="skill-category">
              Category
            </label>
            <input
              id="skill-category"
              className="adm-input"
              list="skill-categories"
              value={values.category}
              onChange={(e) => set('category')(e.target.value)}
            />
            <datalist id="skill-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <TextInput label="Icon" hint="Optional: an emoji or image URL" value={values.icon} onChange={set('icon')} />
        </div>
        <TextArea
          label="Description"
          hint="Shown when a visitor selects the skill in the Technology Universe."
          rows={3}
          value={values.description}
          onChange={set('description')}
        />
        <Toggle label="Featured" hint="Featured skills are highlighted on the inner orbit." checked={values.featured} onChange={set('featured')} />
        <Toggle
          label="Published"
          checked={values.status === 'published'}
          onChange={(on) => set('status')(on ? 'published' : 'draft')}
        />
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

export default function SkillsPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const { data: skills, setData, loading, error, reload } = useAdminData(adminApi.skills.list)
  const [editing, setEditing] = useState(() => (params.get('new') ? 'new' : null)) // null | 'new' | skill
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (params.get('new')) setParams({}, { replace: true })
  }, [params, setParams])

  const categories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...(skills || []).map((s) => s.category).filter(Boolean)])],
    [skills]
  )

  if (loading && !skills) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const filtering = query.trim() || category !== 'all'
  const visible = skills.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      s.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const move = async (index, dir) => {
    const next = moveItem(skills, index, dir)
    setData(next)
    setBusy(true)
    try {
      setData(await adminApi.skills.reorder(next.map((s) => s._id)))
    } catch (err) {
      toast.error(err)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const patch = async (skill, changes, message) => {
    try {
      const updated = await adminApi.skills.update(skill._id, changes)
      setData((list) => list.map((s) => (s._id === skill._id ? updated : s)))
      toast.success(message)
    } catch (err) {
      toast.error(err)
    }
  }

  const remove = async (skill) => {
    const ok = await confirm({ title: `Delete "${skill.name}"?`, message: 'This skill will be removed from the site.' })
    if (!ok) return
    try {
      await adminApi.skills.remove(skill._id)
      setData((list) => list.filter((s) => s._id !== skill._id))
      toast.success('Skill deleted')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Skills"
        description="Technologies shown in the Technology Universe. Order here is the order on the site."
        actions={
          <button className="adm-btn adm-btn--primary" onClick={() => setEditing('new')}>
            <Icon name="plus" size={16} /> Add skill
          </button>
        }
      />

      <Card>
        <div className="adm-toolbar">
          <div className="adm-search">
            <Icon name="search" size={16} />
            <input placeholder="Search skills" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search skills" />
          </div>
          <select className="adm-input adm-input--auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="adm-muted adm-small">{visible.length} of {skills.length}</span>
        </div>

        {skills.length === 0 ? (
          <EmptyState
            icon="skills"
            title="No skills yet"
            description="Add the technologies you work with."
            action={
              <button className="adm-btn adm-btn--primary" onClick={() => setEditing('new')}>
                Add skill
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title="No matching skills" />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="adm-col-order">Order</th>
                  <th>Skill</th>
                  <th>Category</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th className="adm-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((skill) => {
                  const index = skills.indexOf(skill)
                  return (
                    <tr key={skill._id}>
                      <td>
                        <ReorderButtons index={index} count={skills.length} onMove={move} disabled={busy || filtering} />
                      </td>
                      <td>
                        <strong>
                          {skill.icon && !/^(https?:|\/)/.test(skill.icon) && <span className="adm-skill-icon">{skill.icon}</span>}
                          {skill.name}
                        </strong>
                        {skill.description && <div className="adm-muted adm-small adm-truncate">{skill.description}</div>}
                      </td>
                      <td>{skill.category}</td>
                      <td>
                        <button
                          className={`adm-star ${skill.featured ? 'is-on' : ''}`}
                          onClick={() => patch(skill, { featured: !skill.featured }, skill.featured ? 'Removed from featured' : 'Marked as featured')}
                          aria-label={skill.featured ? 'Unfeature' : 'Feature'}
                          aria-pressed={skill.featured}
                        >
                          <Icon name="star" size={16} />
                        </button>
                      </td>
                      <td>
                        <button
                          className="adm-badge-btn"
                          onClick={() =>
                            patch(
                              skill,
                              { status: skill.status === 'published' ? 'draft' : 'published' },
                              skill.status === 'published' ? 'Skill hidden' : 'Skill published'
                            )
                          }
                          title="Toggle visibility"
                        >
                          <Badge tone={skill.status === 'published' ? 'success' : 'neutral'}>
                            {skill.status === 'published' ? 'Published' : 'Hidden'}
                          </Badge>
                        </button>
                      </td>
                      <td className="adm-col-actions">
                        <button className="adm-icon-btn" onClick={() => setEditing(skill)} aria-label={`Edit ${skill.name}`}>
                          <Icon name="edit" size={16} />
                        </button>
                        <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(skill)} aria-label={`Delete ${skill.name}`}>
                          <Icon name="trash" size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtering && visible.length > 0 && <p className="adm-muted adm-small adm-pad">Clear search and filters to reorder.</p>}
      </Card>

      {editing && (
        <SkillModal
          skill={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setData((list) =>
              list.some((s) => s._id === saved._id) ? list.map((s) => (s._id === saved._id ? saved : s)) : [...list, saved]
            )
            setEditing(null)
          }}
        />
      )}
    </>
  )
}
