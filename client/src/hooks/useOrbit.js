import { useCallback, useEffect, useRef } from 'react'

// Drives a set of chip elements around a circular path using rAF,
// so labels stay upright (position-only transform, no rotation composition).
export default function useOrbit(items, radius, speedDegPerSec, direction = 1) {
  const elements = useRef(new Map())

  const register = useCallback(
    (index) => (el) => {
      if (el) elements.current.set(index, el)
      else elements.current.delete(index)
    },
    []
  )

  useEffect(() => {
    let raf
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()

    const tick = (now) => {
      const elapsed = prefersReduced ? 0 : (now - start) / 1000
      elements.current.forEach((el, i) => {
        const baseAngle = (360 / items.length) * i
        const angle = baseAngle + direction * speedDegPerSec * elapsed
        const rad = (angle * Math.PI) / 180
        const x = Math.cos(rad) * radius
        const y = Math.sin(rad) * radius
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [items, radius, speedDegPerSec, direction])

  return register
}
