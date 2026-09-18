import { useEffect, useRef } from 'react'
import './cursor.css'

const DOT_EASE = 0.35
const RING_EASE = 0.14

export default function CustomCursor({ variant, label }) {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const rootRef = useRef(null)
  const pos = useRef({ x: -100, y: -100 })
  const dotPos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const raf = useRef(null)
  const visible = useRef(false)

  useEffect(() => {
    document.documentElement.classList.add('has-custom-cursor')

    const handleMove = (e) => {
      pos.current.x = e.clientX
      pos.current.y = e.clientY
      if (!visible.current) {
        visible.current = true
        rootRef.current?.classList.add('is-visible')
        dotPos.current = { ...pos.current }
        ringPos.current = { ...pos.current }
      }
    }

    const handleLeave = () => {
      visible.current = false
      rootRef.current?.classList.remove('is-visible')
    }

    const handleDown = () => rootRef.current?.classList.add('is-down')
    const handleUp = () => rootRef.current?.classList.remove('is-down')

    window.addEventListener('mousemove', handleMove, { passive: true })
    document.addEventListener('mouseleave', handleLeave)
    window.addEventListener('mousedown', handleDown)
    window.addEventListener('mouseup', handleUp)

    const tick = () => {
      dotPos.current.x += (pos.current.x - dotPos.current.x) * DOT_EASE
      dotPos.current.y += (pos.current.y - dotPos.current.y) * DOT_EASE
      ringPos.current.x += (pos.current.x - ringPos.current.x) * RING_EASE
      ringPos.current.y += (pos.current.y - ringPos.current.y) * RING_EASE

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      window.removeEventListener('mousedown', handleDown)
      window.removeEventListener('mouseup', handleUp)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div ref={rootRef} className="cursor-root" data-variant={variant}>
      <div ref={ringRef} className="cursor-ring">
        {label && <span className="cursor-label">{label}</span>}
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
