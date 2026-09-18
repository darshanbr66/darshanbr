import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

function Word({ children, range, progress, last }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <span className="shl-word-wrap">
      <motion.span style={{ opacity }} className="shl-word">
        {children}
      </motion.span>
      {!last && ' '}
    </span>
  )
}

// Words fade from dim to full brightness as the section scrolls through view.
export default function ScrollHighlightText({ text, className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.25'],
  })
  const words = text.split(' ')

  return (
    <p ref={ref} className={`shl-text ${className}`}>
      {words.map((w, i) => {
        const start = i / words.length
        const end = (i + 1) / words.length
        return (
          <Word key={i} range={[start, end]} progress={scrollYProgress} last={i === words.length - 1}>
            {w}
          </Word>
        )
      })}
    </p>
  )
}
