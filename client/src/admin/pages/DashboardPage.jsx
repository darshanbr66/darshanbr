import { Link } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { PageHeader, Card, Spinner, ErrorState, Badge, EmptyState } from '../components/ui'
import { formatDate } from '../utils/format'
import Icon from '../components/Icon'

function Stat({ to, icon, label, value, detail }) {
  return (
    <Link to={to} className="adm-stat">
      <span className="adm-stat__icon">
        <Icon name={icon} />
      </span>
      <span className="adm-stat__label">{label}</span>
      <strong className="adm-stat__value">{value}</strong>
      {detail && <span className="adm-stat__detail">{detail}</span>}
    </Link>
  )
}

const QUICK_ACTIONS = [
  { to: '/admin/projects/new', label: 'Add Project', icon: 'plus' },
  { to: '/admin/profile', label: 'Edit Profile', icon: 'user' },
  { to: '/admin/skills?new=1', label: 'Add Skill', icon: 'skills' },
  { to: '/admin/experience?new=1', label: 'Add Experience', icon: 'briefcase' },
  { to: '/admin/messages', label: 'View Messages', icon: 'mail' },
]

export default function DashboardPage() {
  const { data, loading, error, reload } = useAdminData(adminApi.stats)

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your portfolio content."
        actions={
          <a className="adm-btn" href="/" target="_blank" rel="noreferrer">
            <Icon name="external" size={16} /> Open site
          </a>
        }
      />

      <div className="adm-stats">
        <Stat
          to="/admin/projects"
          icon="folder"
          label="Projects"
          value={data.projects.total}
          detail={`${data.projects.published} published`}
        />
        <Stat to="/admin/skills" icon="skills" label="Skills" value={data.skills} />
        <Stat to="/admin/experience" icon="briefcase" label="Experience" value={data.experience} />
        <Stat
          to="/admin/profile"
          icon="user"
          label="Profile"
          value={`${data.profile.completion}%`}
          detail={data.profile.exists ? `Updated ${formatDate(data.profile.updatedAt)}` : 'Not set up'}
        />
        <Stat
          to="/admin/messages"
          icon="mail"
          label="Messages"
          value={data.messages.total}
          detail={data.messages.unread ? `${data.messages.unread} unread` : 'All read'}
        />
        <Stat
          to="/admin/resume"
          icon="file"
          label="Resume"
          value={data.resume ? 'Active' : 'Missing'}
          detail={data.resume ? data.resume.filename : 'Upload a PDF'}
        />
      </div>

      <div className="adm-grid-2">
        <Card title="Quick actions">
          <div className="adm-quick">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.to} to={a.to} className="adm-quick__item">
                <Icon name={a.icon} />
                {a.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card
          title="Recent messages"
          actions={
            <Link to="/admin/messages" className="adm-link">
              View all
            </Link>
          }
        >
          {data.recentMessages.length === 0 ? (
            <EmptyState icon="mail" title="No messages yet" description="Contact form submissions will appear here." />
          ) : (
            <ul className="adm-recent">
              {data.recentMessages.map((m) => (
                <li key={m._id}>
                  <Link to={`/admin/messages?open=${m._id}`}>
                    <div>
                      <strong>{m.name}</strong>
                      <span className="adm-muted adm-truncate">{m.message}</span>
                    </div>
                    <div className="adm-recent__meta">
                      {m.status === 'new' && <Badge tone="accent">New</Badge>}
                      <span className="adm-muted">{formatDate(m.createdAt)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
