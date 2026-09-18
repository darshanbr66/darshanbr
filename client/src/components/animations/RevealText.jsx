import { motion } from 'framer-motion'

const container = {
  hidden: {},
  visible: (stagger = 0.04) => ({
    transition: { staggerChildren: stagger },
  }),
}

const word = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

// Splits text into words and reveals them upward, masked, on scroll into view.
export default function RevealText({ text, as: Tag = 'span', className = '', stagger = 0.04, once = true }) {
  const words = text.split(' ')
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        style={{ display: 'inline' }}
        variants={container}
        custom={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount: 0.6 }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}
          >
            <motion.span style={{ display: 'inline-block' }} variants={word}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}
