import { useEffect, useRef } from 'react'

export default function useMagnetic(strength = 0.4) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf = null
    let target = { x: 0, y: 0 }
    let current = { x: 0, y: 0 }

    const animate = () => {
      current.x += (target.x - current.x) * 0.2
      current.y += (target.y - current.y) * 0.2
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`
      raf = requestAnimationFrame(animate)
    }

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      target = { x: relX * strength, y: relY * strength }
    }

    const handleLeave = () => {
      target = { x: 0, y: 0 }
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    raf = requestAnimationFrame(animate)

    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(raf)
    }
  }, [strength])

  return ref
}
