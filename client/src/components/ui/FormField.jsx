import { useState } from 'react'
import './form-field.css'

export default function FormField({ label, name, type = 'text', value, onChange, textarea, error }) {
  const [focused, setFocused] = useState(false)
  const Tag = textarea ? 'textarea' : 'input'
  const active = focused || Boolean(value)

  return (
    <div className={`field ${active ? 'is-active' : ''} ${error ? 'has-error' : ''}`}>
      <Tag
        id={name}
        name={name}
        type={textarea ? undefined : type}
        value={value}
        rows={textarea ? 5 : undefined}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <label htmlFor={name}>{label}</label>
      <span className="field__line" />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}
