import useMagnetic from '../../hooks/useMagnetic'
import CursorTarget from './CursorTarget'
import './button.css'

export default function MagneticButton({
  children,
  onClick,
  href,
  variant = 'primary',
  cursorLabel = '',
  type = 'button',
}) {
  const ref = useMagnetic(0.3)
  const Tag = href ? 'a' : 'button'

  const content = (
    <Tag
      ref={ref}
      href={href}
      onClick={onClick}
      type={href ? undefined : type}
      className={`mbtn mbtn--${variant}`}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
    >
      <span className="mbtn__label">{children}</span>
    </Tag>
  )

  return (
    <CursorTarget variant="link" label={cursorLabel}>
      {content}
    </CursorTarget>
  )
}
