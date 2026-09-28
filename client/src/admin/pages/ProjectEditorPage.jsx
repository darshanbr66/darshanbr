import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useFormState from '../hooks/useFormState'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, SaveBar, Badge } from '../components/ui'
import { TextInput, TextArea, Toggle, TagInput, ListEditor } from '../components/fields'
import { ImageField, GalleryField } from '../components/MediaPicker'
import Icon from '../components/Icon'

const EMPTY = {
  title: '',
  slug: '',
  category: '',
  year: '',
  shortDescription: '',
  description: '',
  technologies: [],
  image: '',
  gallery: [],
  githubUrl: '',
  liveUrl: '',
  problem: '',
  solution: '',
  features: [],
  architecture: [],
  role: '',
  details: '',
  featured: false,
  status: 'draft',
}

const toForm = (project) => Object.fromEntries(Object.keys(EMPTY).map((k) => [k, project?.[k] ?? EMPTY[k]]))

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const isUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v)

export default function ProjectEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const navigate = useNavigate()
  const toast = useToast()
  const confirm = useConfirm()
  const form = useFormState(EMPTY)
  const { values, set, setValues } = form
  const [state, setState] = useState({ loading: !isNew, error: null })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [slugTouched, setSlugTouched] = useState(!isNew)

  useEffect(() => {
    if (isNew) {
      form.load(EMPTY)
      return
    }
    setState({ loading: true, error: null })
    adminApi.projects
      .get(id)
      .then((project) => {
        form.load(toForm(project))
        setSlugTouched(true)
        setState({ loading: false, error: null })
      })
      .catch((error) => setState({ loading: false, error }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!form.dirty) return undefined
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [form.dirty])

  if (state.loading) return <Spinner />
  if (state.error) return <ErrorState error={state.error} onRetry={() => navigate(0)} />

  const setTitle = (title) => {
    setValues((v) => ({ ...v, title, slug: slugTouched ? v.slug : slugify(title) }))
  }

  const validate = () => {
    const next = {}
    if (!values.title.trim()) next.title = 'Title is required'
    if (!slugify(values.slug || values.title)) next.slug = 'Slug is required'
    if (!isUrl(values.githubUrl)) next.githubUrl = 'Enter a full URL starting with https://'
    if (!isUrl(values.liveUrl)) next.liveUrl = 'Enter a full URL starting with https://'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    try {
      const payload = { ...values, slug: slugify(values.slug || values.title) }
      const saved = isNew ? await adminApi.projects.create(payload) : await adminApi.projects.update(id, payload)
      form.load(toForm(saved))
      toast.success(isNew ? 'Project created' : 'Project saved')
      if (isNew) navigate(`/admin/projects/${saved._id}`, { replace: true })
    } catch (err) {
      if (err.status === 409) setErrors((x) => ({ ...x, slug: err.message }))
      toast.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const ok = await confirm({ title: `Delete "${values.title}"?`, message: 'This cannot be undone.' })
    if (!ok) return
    try {
      await adminApi.projects.remove(id)
      toast.success('Project deleted')
      navigate('/admin/projects')
    } catch (err) {
      toast.error(err)
    }
  }

  const setMain = (url) => {
    setValues((v) => ({ ...v, image: url }))
    toast.info('Set as main image — remember to save')
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title={isNew ? 'New project' : values.title || 'Edit project'}
        description={
          <>
            <Link to="/admin/projects" className="adm-link">
              ← All projects
            </Link>
            {!isNew && (
              <>
                {' · '}
                <Badge tone={values.status === 'published' ? 'success' : 'neutral'}>
                  {values.status === 'published' ? 'Published' : 'Draft'}
                </Badge>
              </>
            )}
          </>
        }
        actions={
          !isNew && (
            <>
              {form.values.status === 'published' && (
                <a className="adm-btn" href={`/work/${values.slug}`} target="_blank" rel="noreferrer">
                  <Icon name="eye" size={16} /> View
                </a>
              )}
              <button type="button" className="adm-btn adm-btn--ghost-danger" onClick={handleDelete}>
                <Icon name="trash" size={16} /> Delete
              </button>
            </>
          )
        }
      />

      <div className="adm-grid-main">
        <div className="adm-stack">
          <Card title="Basics">
            <TextInput label="Title" value={values.title} onChange={setTitle} error={errors.title} autoFocus={isNew} />
            <TextInput
              label="Slug"
              hint={`URL: /work/${slugify(values.slug || values.title) || '…'}`}
              value={values.slug}
              onChange={(v) => {
                setSlugTouched(true)
                set('slug')(v)
              }}
              error={errors.slug}
            />
            <div className="adm-form-grid">
              <TextInput label="Category" placeholder="e.g. Professional" value={values.category} onChange={set('category')} />
              <TextInput label="Year" placeholder="e.g. 2025" value={values.year} onChange={set('year')} />
            </div>
            <TextArea
              label="Short description"
              hint="Shown on the project showcase panel."
              rows={2}
              value={values.shortDescription}
              onChange={set('shortDescription')}
            />
            <TextArea
              label="Full description"
              hint="Overview on the project detail page."
              rows={5}
              value={values.description}
              onChange={set('description')}
            />
            <TagInput label="Technologies" value={values.technologies} onChange={set('technologies')} />
          </Card>

          <Card title="Case study" description="Optional. Sections without content are hidden on the detail page.">
            <TextArea label="Problem" rows={3} value={values.problem} onChange={set('problem')} />
            <TextArea label="Solution" rows={3} value={values.solution} onChange={set('solution')} />
            <ListEditor label="Features" value={values.features} onChange={set('features')} placeholder="Add a feature" />
            <ListEditor
              label="Architecture layers"
              hint="Rendered top-to-bottom as the animated architecture diagram, e.g. React Client → Express API → MongoDB."
              value={values.architecture}
              onChange={set('architecture')}
              placeholder="Add a layer"
            />
            <TextArea label="Role / contribution" rows={3} value={values.role} onChange={set('role')} />
            <TextArea label="Additional details" rows={3} value={values.details} onChange={set('details')} />
          </Card>

          <Card title="Gallery">
            <GalleryField
              label="Gallery images"
              hint="Shown below the case study. Use ★ to make an image the main image."
              value={values.gallery}
              onChange={set('gallery')}
              onSetMain={setMain}
            />
          </Card>
        </div>

        <div className="adm-stack">
          <Card title="Publishing">
            <Toggle
              label="Published"
              hint="Visible in the showcase and at its URL."
              checked={values.status === 'published'}
              onChange={(on) => set('status')(on ? 'published' : 'draft')}
            />
            <Toggle label="Featured" checked={values.featured} onChange={set('featured')} />
          </Card>

          <Card title="Main image">
            <ImageField label="Cover" hint="Used in the showcase and detail hero. Optimized to WebP on upload." value={values.image} onChange={set('image')} />
          </Card>

          <Card title="Links">
            <TextInput label="Live URL" type="url" placeholder="https://" value={values.liveUrl} onChange={set('liveUrl')} error={errors.liveUrl} />
            <TextInput label="GitHub URL" type="url" placeholder="https://github.com/…" value={values.githubUrl} onChange={set('githubUrl')} error={errors.githubUrl} />
          </Card>
        </div>
      </div>

      <SaveBar dirty={form.dirty || isNew} saving={saving} onReset={isNew ? undefined : form.reset} label={isNew ? 'Create project' : 'Save project'} />
    </form>
  )
}
