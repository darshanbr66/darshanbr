import { useId, useState } from 'react'
import Icon from './Icon'

export function Field({ label, hint, error, children, htmlFor, className = '' }) {
  return (
    <div className={`adm-field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label className="adm-field__label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? <p className="adm-field__error">{error}</p> : hint && <p className="adm-field__hint">{hint}</p>}
    </div>
  )
}

export function TextInput({ label, hint, error, value, onChange, className, ...props }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <input id={id} className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...props} />
    </Field>
  )
}

export function TextArea({ label, hint, error, value, onChange, rows = 4, className, ...props }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id} className={className}>
      <textarea
        id={id}
        className="adm-input adm-textarea"
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </Field>
  )
}

export function SelectField({ label, hint, value, onChange, options, className }) {
  const id = useId()
  return (
    <Field label={label} hint={hint} htmlFor={id} className={className}>
      <select id={id} className="adm-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle__track" aria-hidden="true" />
      <span className="adm-toggle__text">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

// Free-form tags (technologies etc.): Enter or comma adds, Backspace removes.
export function TagInput({ label, hint, value = [], onChange, placeholder = 'Type and press Enter', suggestions = [] }) {
  const id = useId()
  const [draft, setDraft] = useState('')

  const add = (raw) => {
    const items = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase()))
    if (items.length) onChange([...value, ...items])
    setDraft('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <div className="adm-tags">
        {value.map((tag) => (
          <span key={tag} className="adm-tag">
            {tag}
            <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          list={suggestions.length ? `${id}-list` : undefined}
          value={draft}
          placeholder={value.length ? '' : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => draft && add(draft)}
        />
        {suggestions.length > 0 && (
          <datalist id={`${id}-list`}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
    </Field>
  )
}

// Ordered list of text lines (features, responsibilities, architecture layers).
export function ListEditor({ label, hint, value = [], onChange, placeholder = 'Add an item', multiline = false }) {
  const [draft, setDraft] = useState('')

  const update = (index, text) => onChange(value.map((v, i) => (i === index ? text : v)))
  const remove = (index) => onChange(value.filter((_, i) => i !== index))
  const move = (index, dir) => {
    const next = [...value]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  const add = () => {
    if (!draft.trim()) return
    onChange([...value, draft.trim()])
    setDraft('')
  }

  const Input = multiline ? 'textarea' : 'input'

  return (
    <Field label={label} hint={hint}>
      <div className="adm-list">
        {value.map((item, i) => (
          <div key={i} className="adm-list__row">
            <span className="adm-list__index">{i + 1}</span>
            <Input
              className="adm-input"
              value={item}
              rows={multiline ? 2 : undefined}
              onChange={(e) => update(i, e.target.value)}
              aria-label={`${label} item ${i + 1}`}
            />
            <div className="adm-list__actions">
              <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <Icon name="up" size={14} />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() => move(i, 1)}
                disabled={i === value.length - 1}
                aria-label="Move down"
              >
                <Icon name="down" size={14} />
              </button>
              <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(i)} aria-label="Remove">
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        ))}
        <div className="adm-list__row adm-list__row--new">
          <span className="adm-list__index">+</span>
          <input
            className="adm-input"
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
          />
          <button type="button" className="adm-btn adm-btn--sm" onClick={add} disabled={!draft.trim()}>
            Add
          </button>
        </div>
      </div>
    </Field>
  )
}
