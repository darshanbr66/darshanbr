import { useRef, useState } from 'react'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import { PageHeader, Card, Spinner, ErrorState, EmptyState, Badge } from '../components/ui'
import { formatBytes, formatDate } from '../utils/format'
import Icon from '../components/Icon'
import { resolveMediaUrl, resumeFileUrl } from '../../services/api'

export default function ResumePage() {
  const toast = useToast()
  const confirm = useConfirm()
  const { data: resumes, loading, error, reload } = useAdminData(adminApi.resume.list)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  if (loading && !resumes) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const active = resumes.find((r) => r.status === 'active')
  const history = resumes.filter((r) => r.status !== 'active')

  const handleUpload = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') return toast.error('Please choose a PDF file')
    setUploading(true)
    try {
      await adminApi.resume.upload(file)
      toast.success('Resume uploaded — the site now serves the new file')
      reload()
    } catch (err) {
      toast.error(err)
    } finally {
      setUploading(false)
    }
  }

  const activate = async (resume) => {
    try {
      await adminApi.resume.activate(resume.id)
      toast.success(`${resume.filename} is now the active resume`)
      reload()
    } catch (err) {
      toast.error(err)
    }
  }

  const remove = async (resume) => {
    const ok = await confirm({ title: `Delete ${resume.filename}?`, message: 'This older version will be permanently removed.' })
    if (!ok) return
    try {
      await adminApi.resume.remove(resume.id)
      toast.success('Resume version deleted')
      reload()
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader title="Resume" description="The Resume buttons on the public site always open the active file." />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => {
          handleUpload(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      <div className="adm-stack">
        <Card title="Current resume">
          {active ? (
            <div className="adm-resume">
              <span className="adm-resume__icon">
                <Icon name="file" size={26} />
              </span>
              <div className="adm-resume__info">
                <strong>{active.filename}</strong>
                <span className="adm-muted adm-small">
                  {formatBytes(active.size)} · Uploaded {formatDate(active.uploadedAt, true)}
                </span>
                <span className="adm-muted adm-small">
                  Public link: <code>{resumeFileUrl}</code>
                </span>
              </div>
              <div className="adm-resume__actions">
                <a className="adm-btn" href={resumeFileUrl} target="_blank" rel="noreferrer">
                  <Icon name="eye" size={16} /> View
                </a>
                <a className="adm-btn" href={`${resumeFileUrl}?download=1`}>
                  <Icon name="download" size={16} /> Download
                </a>
                <button className="adm-btn adm-btn--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  <Icon name="upload" size={16} /> {uploading ? 'Uploading…' : 'Replace'}
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="file"
              title="No resume uploaded"
              description="Upload a PDF to enable the Resume buttons on your site."
              action={
                <button className="adm-btn adm-btn--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : 'Upload PDF'}
                </button>
              }
            />
          )}
        </Card>

        {history.length > 0 && (
          <Card title="Previous versions" description="Kept so you can roll back.">
            <ul className="adm-rows">
              {history.map((r) => (
                <li key={r.id}>
                  <div>
                    <strong>{r.filename}</strong>
                    <span className="adm-muted adm-small">
                      {formatBytes(r.size)} · {formatDate(r.uploadedAt, true)}
                    </span>
                  </div>
                  <div className="adm-rows__actions">
                    <Badge>Archived</Badge>
                    <a className="adm-icon-btn" href={resolveMediaUrl(r.url)} target="_blank" rel="noreferrer" aria-label="View">
                      <Icon name="eye" size={16} />
                    </a>
                    <button className="adm-btn adm-btn--sm" onClick={() => activate(r)}>
                      Make active
                    </button>
                    <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(r)} aria-label="Delete">
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  )
}
