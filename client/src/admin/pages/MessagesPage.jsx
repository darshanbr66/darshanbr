import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, EmptyState, Badge } from '../components/ui'
import { formatDate } from '../utils/format'
import Icon from '../components/Icon'

const STATUS_TONE = { new: 'accent', read: 'neutral', replied: 'success' }
const STATUS_LABEL = { new: 'Unread', read: 'Read', replied: 'Replied' }

export default function MessagesPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const [params, setParams] = useSearchParams()
  const { data: messages, setData, loading, error, reload } = useAdminData(adminApi.messages.list)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(params.get('open'))

  const setStatus = async (message, status, silent = false) => {
    try {
      const updated = await adminApi.messages.setStatus(message._id, status)
      setData((list) => list.map((m) => (m._id === message._id ? updated : m)))
      if (!silent) toast.success(`Marked as ${STATUS_LABEL[status].toLowerCase()}`)
    } catch (err) {
      toast.error(err)
    }
  }

  const open = messages?.find((m) => m._id === openId)

  // Opening an unread message marks it as read.
  useEffect(() => {
    if (open?.status === 'new') setStatus(open, 'read', true)
    if (params.get('open')) setParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?._id])

  if (loading && !messages) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const q = query.trim().toLowerCase()
  const visible = messages.filter(
    (m) =>
      (filter === 'all' || m.status === filter) &&
      (!q || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q))
  )
  const unread = messages.filter((m) => m.status === 'new').length

  const remove = async (message) => {
    const ok = await confirm({ title: `Delete message from ${message.name}?`, message: 'This cannot be undone.' })
    if (!ok) return
    try {
      await adminApi.messages.remove(message._id)
      setData((list) => list.filter((m) => m._id !== message._id))
      if (openId === message._id) setOpenId(null)
      toast.success('Message deleted')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Messages"
        description={unread ? `${unread} unread of ${messages.length}` : `${messages.length} messages from the contact form`}
        actions={
          <button className="adm-btn" onClick={reload}>
            Refresh
          </button>
        }
      />

      <div className={`adm-inbox ${open ? 'has-open' : ''}`}>
        <Card className="adm-inbox__list">
          <div className="adm-toolbar">
            <div className="adm-search">
              <Icon name="search" size={16} />
              <input placeholder="Search messages" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search messages" />
            </div>
            <select className="adm-input adm-input--auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter messages">
              <option value="all">All</option>
              <option value="new">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {visible.length === 0 ? (
            <EmptyState icon="mail" title={messages.length ? 'No matching messages' : 'No messages yet'} />
          ) : (
            <ul className="adm-messages">
              {visible.map((m) => (
                <li key={m._id}>
                  <button className={`adm-message-row ${m._id === openId ? 'is-open' : ''} ${m.status === 'new' ? 'is-unread' : ''}`} onClick={() => setOpenId(m._id)}>
                    <span className="adm-message-row__top">
                      <strong>{m.name}</strong>
                      <span className="adm-muted adm-small">{formatDate(m.createdAt)}</span>
                    </span>
                    <span className="adm-muted adm-small">{m.email}</span>
                    <span className="adm-message-row__preview">{m.message}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {open && (
          <Card className="adm-inbox__detail">
            <div className="adm-message">
              <header className="adm-message__head">
                <button className="adm-icon-btn adm-inbox__back" onClick={() => setOpenId(null)} aria-label="Back to list">
                  <Icon name="up" className="adm-rot-l" />
                </button>
                <div>
                  <h2>{open.name}</h2>
                  <a className="adm-link" href={`mailto:${open.email}`}>
                    {open.email}
                  </a>
                  <p className="adm-muted adm-small">{formatDate(open.createdAt, true)}</p>
                </div>
                <Badge tone={STATUS_TONE[open.status]}>{STATUS_LABEL[open.status]}</Badge>
              </header>
              <p className="adm-message__body">{open.message}</p>
              <div className="adm-message__actions">
                <a
                  className="adm-btn adm-btn--primary"
                  href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your message')}`}
                  onClick={() => open.status !== 'replied' && setStatus(open, 'replied', true)}
                >
                  <Icon name="mail" size={16} /> Reply by email
                </a>
                {open.status === 'new' ? (
                  <button className="adm-btn" onClick={() => setStatus(open, 'read')}>
                    Mark as read
                  </button>
                ) : (
                  <button className="adm-btn" onClick={() => setStatus(open, 'new')}>
                    Mark as unread
                  </button>
                )}
                {open.status !== 'replied' && (
                  <button className="adm-btn" onClick={() => setStatus(open, 'replied')}>
                    Mark as replied
                  </button>
                )}
                <button className="adm-btn adm-btn--ghost-danger" onClick={() => remove(open)}>
                  <Icon name="trash" size={16} /> Delete
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
