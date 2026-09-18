import { motion } from 'framer-motion'
import './section-heading.css'

export default function SectionHeading({ eyebrow, title, align = 'left' }) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <motion.span
        className="section-heading__eyebrow mono"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {String(eyebrow).padStart(2, '0')}
      </motion.span>
      <motion.h2
        className="section-heading__title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {title}
      </motion.h2>
    </div>
  )
}
