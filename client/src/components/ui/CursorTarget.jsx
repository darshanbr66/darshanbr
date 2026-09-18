import { cloneElement } from 'react'
import { useCursor } from '../../context/CursorContext'

export default function CursorTarget({ variant = 'link', label = '', children }) {
  const { setVariant, setLabel } = useCursor()

  const handleEnter = () => {
    setVariant(variant)
    setLabel(label)
  }
  const handleLeave = () => {
    setVariant('default')
    setLabel('')
  }

  return cloneElement(children, {
    onMouseEnter: (e) => {
      handleEnter()
      children.props.onMouseEnter?.(e)
    },
    onMouseLeave: (e) => {
      handleLeave()
      children.props.onMouseLeave?.(e)
    },
  })
}
