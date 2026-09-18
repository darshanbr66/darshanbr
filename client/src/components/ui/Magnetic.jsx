import useMagnetic from '../../hooks/useMagnetic'

export default function Magnetic({ as: Tag = 'div', strength = 0.35, className = '', children, ...props }) {
  const ref = useMagnetic(strength)
  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  )
}
