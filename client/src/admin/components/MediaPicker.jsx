import { useRef, useState } from 'react'
import { adminApi } from '../services/adminApi'
import { resolveMediaUrl } from '../../services/api'
import useAdminData from '../hooks/useAdminData'
import useUpload from '../hooks/useUpload'
import { Modal, Spinner, ErrorState, EmptyState } from './ui'
import Icon from './Icon'

const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml'

// Library of previously uploaded images, with upload. Calls onSelect(urls).
export function MediaLibraryModal({ onClose, onSelect, multiple = false }) {
  const { data, loading, error, reload } = useAdminData(adminApi.media.list)
  const [selected, setSelected] = useState([])
  const { upload, uploading } = useUpload()
  const inputRef = useRef(null)
  const images = (data || []).filter((f) => f.contentType.startsWith('image/'))

  const toggle = (url) => {
    if (!multiple) return setSelected([url])
    setSelected((s) => (s.includes(url) ? s.filter((u) => u !== url) : [...s, url]))
  }

  const handleFiles = async (files) => {
    const stored = await upload(files)
    if (!stored.length) return
    await reload()
    setSelected((s) => (multiple ? [...s, ...stored.map((f) => f.url)] : [stored[0].url]))
  }

  return (
    <Modal
      title="Media library"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            multiple={multiple}
            hidden
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button className="adm-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Icon name="upload" size={16} /> {uploading ? 'Uploading…' : 'Upload new'}
          </button>
          <span className="adm-spacer" />
          <button className="adm-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="adm-btn adm-btn--primary"
            disabled={!selected.length}
            onClick={() => {
              onSelect(selected)
              onClose()
            }}
          >
            {multiple && selected.length > 1 ? `Use ${selected.length} images` : 'Use image'}
          </button>
        </>
      }
    >
      {loading && !data ? (
        <Spinner />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : images.length === 0 ? (
        <EmptyState icon="image" title="No images yet" description="Upload an image to get started." />
      ) : (
        <div className="adm-media-grid adm-media-grid--picker">
          {images.map((file) => (
            <button
              key={file.id}
              type="button"
              className={`adm-media-tile ${selected.includes(file.url) ? 'is-selected' : ''}`}
              onClick={() => toggle(file.url)}
              aria-pressed={selected.includes(file.url)}
            >
              <img src={resolveMediaUrl(file.url)} alt={file.filename} loading="lazy" />
              <span className="adm-media-tile__name">{file.filename}</span>
              {selected.includes(file.url) && (
                <span className="adm-media-tile__check">
                  <Icon name="check" size={14} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

// Single image (project main image, profile photo).
export function ImageField({ label, hint, value, onChange }) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const { upload, uploading } = useUpload()
  const inputRef = useRef(null)

  return (
    <div className="adm-field">
      <span className="adm-field__label">{label}</span>
      <div className="adm-image-field">
        <div className="adm-image-field__preview">
          {value ? (
            <img src={resolveMediaUrl(value)} alt="" />
          ) : (
            <span className="adm-muted">
              <Icon name="image" size={22} />
              No image
            </span>
          )}
        </div>
        <div className="adm-image-field__actions">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            hidden
            onChange={async (e) => {
              const [stored] = await upload(e.target.files)
              e.target.value = ''
              if (stored) onChange(stored.url)
            }}
          />
          <button type="button" className="adm-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Icon name="upload" size={16} /> {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          <button type="button" className="adm-btn" onClick={() => setLibraryOpen(true)}>
            <Icon name="image" size={16} /> Choose from library
          </button>
          {value && (
            <button type="button" className="adm-btn adm-btn--ghost-danger" onClick={() => onChange('')}>
              Remove
            </button>
          )}
          {hint && <p className="adm-field__hint">{hint}</p>}
        </div>
      </div>
      {libraryOpen && <MediaLibraryModal onClose={() => setLibraryOpen(false)} onSelect={([url]) => onChange(url)} />}
    </div>
  )
}

// Ordered gallery with upload, reorder, remove and "set as main image".
export function GalleryField({ label, hint, value = [], onChange, onSetMain }) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const { upload, uploading } = useUpload()
  const inputRef = useRef(null)

  const move = (index, dir) => {
    const next = [...value]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const addUrls = (urls) => onChange([...value, ...urls.filter((u) => !value.includes(u))])

  return (
    <div className="adm-field">
      <span className="adm-field__label">{label}</span>
      {hint && <p className="adm-field__hint adm-field__hint--top">{hint}</p>}
      <div className="adm-media-grid">
        {value.map((url, i) => (
          <div key={url} className="adm-media-tile adm-media-tile--static">
            <img src={resolveMediaUrl(url)} alt={`Gallery image ${i + 1}`} loading="lazy" />
            <div className="adm-media-tile__toolbar">
              <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move left">
                <Icon name="up" size={14} className="adm-rot-l" />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="Move right"
              >
                <Icon name="down" size={14} className="adm-rot-l" />
              </button>
              {onSetMain && (
                <button type="button" className="adm-icon-btn" onClick={() => onSetMain(url)} aria-label="Use as main image" title="Use as main image">
                  <Icon name="star" size={14} />
                </button>
              )}
              <button
                type="button"
                className="adm-icon-btn adm-icon-btn--danger"
                onClick={() => onChange(value.filter((u) => u !== url))}
                aria-label="Remove from gallery"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="adm-media-add">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            multiple
            hidden
            onChange={async (e) => {
              const stored = await upload(e.target.files)
              e.target.value = ''
              addUrls(stored.map((f) => f.url))
            }}
          />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Icon name="upload" /> {uploading ? 'Uploading…' : 'Upload images'}
          </button>
          <button type="button" onClick={() => setLibraryOpen(true)}>
            <Icon name="image" /> From library
          </button>
        </div>
      </div>
      {libraryOpen && <MediaLibraryModal multiple onClose={() => setLibraryOpen(false)} onSelect={addUrls} />}
    </div>
  )
}
