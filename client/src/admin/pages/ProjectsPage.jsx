import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, EmptyState, Badge, ReorderButtons } from '../components/ui'
import { moveItem, formatDate } from '../utils/format'
import Icon from '../components/Icon'
import { resolveMediaUrl } from '../../services/api'

export default function ProjectsPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { data: projects, setData, loading, error, reload } = useAdminData(adminApi.projects.list)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [busy, setBusy] = useState(false)

  const categories = useMemo(() => [...new Set((projects || []).map((p) => p.category).filter(Boolean))], [projects])

  if (loading && !projects) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const q = query.trim().toLowerCase()
  const filtering = q || status !== 'all' || category !== 'all'
  const visible = projects.filter((p) => {
    if (status === 'featured' ? !p.featured : status !== 'all' && p.status !== status) return false
    if (category !== 'all' && p.category !== category) return false
    if (!q) return true
    return [p.title, p.category, p.shortDescription, ...(p.technologies || [])].join(' ').toLowerCase().includes(q)
  })
  const publishedIndex = (p) => projects.filter((x) => x.status === 'published').indexOf(p)

  const move = async (index, dir) => {
    const next = moveItem(projects, index, dir)
    setData(next)
    setBusy(true)
    try {
      setData(await adminApi.projects.reorder(next.map((p) => p._id)))
    } catch (err) {
      toast.error(err)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const patch = async (project, changes, message) => {
    try {
      const updated = await adminApi.projects.update(project._id, changes)
      setData((list) => list.map((p) => (p._id === project._id ? updated : p)))
      toast.success(message)
    } catch (err) {
      toast.error(err)
    }
  }

  const duplicate = async (project) => {
    try {
      const copy = await adminApi.projects.duplicate(project._id)
      toast.success('Project duplicated as a draft')
      navigate(`/admin/projects/${copy._id}`)
    } catch (err) {
      toast.error(err)
    }
  }

  const remove = async (project) => {
    const ok = await confirm({
      title: `Delete "${project.title}"?`,
      message: 'The project and its detail page will be removed. Uploaded images stay in the media library.',
    })
    if (!ok) return
    try {
      await adminApi.projects.remove(project._id)
      setData((list) => list.filter((p) => p._id !== project._id))
      toast.success('Project deleted')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Published projects appear in the cinematic showcase in this order."
        actions={
          <Link className="adm-btn adm-btn--primary" to="/admin/projects/new">
            <Icon name="plus" size={16} /> Add project
          </Link>
        }
      />

      <Card>
        <div className="adm-toolbar">
          <div className="adm-search">
            <Icon name="search" size={16} />
            <input placeholder="Search projects" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search projects" />
          </div>
          <select className="adm-input adm-input--auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="featured">Featured</option>
          </select>
          {categories.length > 0 && (
            <select className="adm-input adm-input--auto" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <span className="adm-muted adm-small">{visible.length} of {projects.length}</span>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon="folder"
            title="No projects yet"
            description="Add your first project to fill the showcase."
            action={
              <Link className="adm-btn adm-btn--primary" to="/admin/projects/new">
                Add project
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title="No matching projects" />
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th className="adm-col-order">Order</th>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Updated</th>
                  <th className="adm-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((project) => {
                  const index = projects.indexOf(project)
                  const number = publishedIndex(project)
                  return (
                    <tr key={project._id}>
                      <td>
                        <ReorderButtons index={index} count={projects.length} onMove={move} disabled={busy || filtering} />
                      </td>
                      <td>
                        <Link to={`/admin/projects/${project._id}`} className="adm-project-cell">
                          <span className="adm-thumb">
                            {project.image ? <img src={resolveMediaUrl(project.image)} alt="" loading="lazy" /> : <Icon name="image" size={16} />}
                          </span>
                          <span>
                            <strong>
                              {number >= 0 && <span className="adm-muted">{String(number + 1).padStart(2, '0')} · </span>}
                              {project.title}
                            </strong>
                            <span className="adm-muted adm-small">/work/{project.slug}</span>
                          </span>
                        </Link>
                      </td>
                      <td>{project.category || <span className="adm-muted">—</span>}</td>
                      <td>
                        <button
                          className="adm-badge-btn"
                          title="Toggle publish"
                          onClick={() =>
                            patch(
                              project,
                              { status: project.status === 'published' ? 'draft' : 'published' },
                              project.status === 'published' ? 'Project unpublished' : 'Project published'
                            )
                          }
                        >
                          <Badge tone={project.status === 'published' ? 'success' : 'neutral'}>
                            {project.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </button>
                      </td>
                      <td>
                        <button
                          className={`adm-star ${project.featured ? 'is-on' : ''}`}
                          onClick={() => patch(project, { featured: !project.featured }, project.featured ? 'Removed from featured' : 'Marked as featured')}
                          aria-label={project.featured ? 'Unfeature' : 'Feature'}
                          aria-pressed={project.featured}
                        >
                          <Icon name="star" size={16} />
                        </button>
                      </td>
                      <td className="adm-muted adm-small">{formatDate(project.updatedAt)}</td>
                      <td className="adm-col-actions">
                        {project.status === 'published' && (
                          <a className="adm-icon-btn" href={`/work/${project.slug}`} target="_blank" rel="noreferrer" aria-label="View on site">
                            <Icon name="eye" size={16} />
                          </a>
                        )}
                        <Link className="adm-icon-btn" to={`/admin/projects/${project._id}`} aria-label={`Edit ${project.title}`}>
                          <Icon name="edit" size={16} />
                        </Link>
                        <button className="adm-icon-btn" onClick={() => duplicate(project)} aria-label="Duplicate">
                          <Icon name="copy" size={16} />
                        </button>
                        <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(project)} aria-label={`Delete ${project.title}`}>
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
    </>
  )
}
