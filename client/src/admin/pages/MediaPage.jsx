import { useRef, useState } from 'react'
import { adminApi } from '../services/adminApi'
import useAdminData from '../hooks/useAdminData'
import { useConfirm, useToast } from '../context/AdminContext'
import useUpload from '../hooks/useUpload'
import { PageHeader, Card, Spinner, ErrorState, EmptyState, Badge } from '../components/ui'
import { formatBytes, formatDate } from '../utils/format'
import Icon from '../components/Icon'
import { resolveMediaUrl } from '../../services/api'

const FILTERS = [
  { value: 'all', label: 'All files' },
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
]

export default function MediaPage() {
  const toast = useToast()
  const confirm = useConfirm()
  const { data: files, setData, loading, error, reload } = useAdminData(adminApi.media.list)
  const { upload, uploading } = useUpload()
  const [filter, setFilter] = useState('all')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  if (loading && !files) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const isImage = (f) => f.contentType.startsWith('image/')
  const visible = files.filter((f) => filter === 'all' || (filter === 'image' ? isImage(f) : !isImage(f)))

  const handleFiles = async (list) => {
    const stored = await upload(list)
    if (stored.length) reload()
  }

  const copyUrl = async (file) => {
    try {
      await navigator.clipboard.writeText(resolveMediaUrl(file.url))
      toast.success('URL copied')
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  const remove = async (file) => {
    const ok = await confirm({
      title: `Delete "${file.filename}"?`,
      message: 'Projects or the profile using this image will lose it. This cannot be undone.',
    })
    if (!ok) return
    try {
      await adminApi.media.remove(file.id)
      setData((list) => list.filter((f) => f.id !== file.id))
      toast.success('File deleted')
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Media"
        description="Images and documents stored in MongoDB (GridFS). Images are resized and converted to WebP on upload."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml,application/pdf"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <button className="adm-btn adm-btn--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <Icon name="upload" size={16} /> {uploading ? 'Uploading…' : 'Upload files'}
            </button>
          </>
        }
      />

      <Card>
        <div className="adm-toolbar">
          <div className="adm-segmented" role="tablist">
            {FILTERS.map((f) => (
              <button key={f.value} role="tab" aria-selected={filter === f.value} className={filter === f.value ? 'is-active' : ''} onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="adm-muted adm-small">{visible.length} files</span>
        </div>

        <div
          className={`adm-dropzone ${dragging ? 'is-dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          {visible.length === 0 ? (
            <EmptyState icon="image" title="No files here yet" description="Drop images or PDFs here, or use Upload files." />
          ) : (
            <div className="adm-media-grid adm-media-grid--library">
              {visible.map((file) => (
                <div key={file.id} className="adm-media-card">
                  <a className="adm-media-card__preview" href={resolveMediaUrl(file.url)} target="_blank" rel="noreferrer">
                    {isImage(file) ? (
                      <img src={resolveMediaUrl(file.url)} alt={file.filename} loading="lazy" />
                    ) : (
                      <span className="adm-media-card__doc">
                        <Icon name="file" size={28} />
                        {file.filename.split('.').pop()?.toUpperCase()}
                      </span>
                    )}
                  </a>
                  <div className="adm-media-card__info">
                    <strong className="adm-truncate" title={file.filename}>
                      {file.filename}
                    </strong>
                    <span className="adm-muted adm-small">
                      {formatBytes(file.size)}
                      {file.width ? ` · ${file.width}×${file.height}` : ''} · {formatDate(file.uploadedAt)}
                    </span>
                    {file.isActiveResume && <Badge tone="accent">Active resume</Badge>}
                  </div>
                  <div className="adm-media-card__actions">
                    <button className="adm-icon-btn" onClick={() => copyUrl(file)} aria-label="Copy URL" title="Copy URL">
                      <Icon name="copy" size={16} />
                    </button>
                    <a className="adm-icon-btn" href={`${resolveMediaUrl(file.url)}?download=1`} aria-label="Download" title="Download">
                      <Icon name="download" size={16} />
                    </a>
                    <button
                      className="adm-icon-btn adm-icon-btn--danger"
                      onClick={() => remove(file)}
                      disabled={file.isActiveResume}
                      aria-label="Delete"
                      title={file.isActiveResume ? 'Replace the resume before deleting' : 'Delete'}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </>
  )
}
