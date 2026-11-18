import { useEffect, useState } from 'react'
import CursorTarget from './CursorTarget'
import './back-to-top.css'

// Distance (px) scrolled before the button appears.
const SHOW_AFTER = 400

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = null
    const update = () => {
      frame = null
      setVisible(window.scrollY > SHOW_AFTER)
    }
    // Lenis drives the native scroll position, so plain scroll events stay in sync.
    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <CursorTarget variant="link">
      <button
        type="button"
        className={`back-to-top${visible ? ' is-visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path
            d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </CursorTarget>
  )
}
