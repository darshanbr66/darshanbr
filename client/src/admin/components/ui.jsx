import { useEffect } from 'react'
import Icon from './Icon'

export function PageHeader({ title, description, actions }) {
  return (
    <header className="adm-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p className="adm-muted">{description}</p>}
      </div>
      {actions && <div className="adm-page-header__actions">{actions}</div>}
    </header>
  )
}

export function Card({ title, description, actions, children, className = '' }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <header className="adm-card__header">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p className="adm-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="adm-state" role="status">
      <span className="adm-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="adm-state adm-state--error" role="alert">
      <p>{error?.message || 'Something went wrong while loading this page.'}</p>
      {onRetry && (
        <button className="adm-btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon = 'folder', title, description, action }) {
  return (
    <div className="adm-empty">
      <span className="adm-empty__icon">
        <Icon name={icon} size={22} />
      </span>
      <h3>{title}</h3>
      {description && <p className="adm-muted">{description}</p>}
      {action}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`adm-badge adm-badge--${tone}`}>{children}</span>
}

export function SaveBar({ dirty, saving, onSave, onReset, label = 'Save changes' }) {
  return (
    <div className={`adm-savebar ${dirty ? 'is-dirty' : ''}`}>
      <span className="adm-muted">{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
      <div className="adm-savebar__actions">
        {onReset && (
          <button type="button" className="adm-btn" onClick={onReset} disabled={!dirty || saving}>
            Discard
          </button>
        )}
        <button type="submit" className="adm-btn adm-btn--primary" onClick={onSave} disabled={!dirty || saving}>
          {saving ? 'Saving…' : label}
        </button>
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="adm-modal-backdrop" onMouseDown={onClose}>
      <div
        className={`adm-modal adm-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="adm-modal__header">
          <h2>{title}</h2>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <div className="adm-modal__body">{children}</div>
        {footer && <footer className="adm-modal__actions">{footer}</footer>}
      </div>
    </div>
  )
}

export function ReorderButtons({ index, count, onMove, disabled }) {
  return (
    <div className="adm-reorder">
      <button
        type="button"
        className="adm-icon-btn"
        onClick={() => onMove(index, -1)}
        disabled={disabled || index === 0}
        aria-label="Move up"
        title="Move up"
      >
        <Icon name="up" size={14} />
      </button>
      <button
        type="button"
        className="adm-icon-btn"
        onClick={() => onMove(index, 1)}
        disabled={disabled || index === count - 1}
        aria-label="Move down"
        title="Move down"
      >
        <Icon name="down" size={14} />
      </button>
    </div>
  )
}
