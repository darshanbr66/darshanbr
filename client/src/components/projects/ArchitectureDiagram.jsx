import { motion } from 'framer-motion'
import './architecture-diagram.css'

export default function ArchitectureDiagram({ layers }) {
  return (
    <div className="arch">
      <div className="arch__line-track">
        <motion.div
          className="arch__line-fill"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {layers.map((layer, i) => (
        <motion.div
          key={layer}
          className="arch__node"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="arch__dot" />
          <div className="arch__card mono">{layer}</div>
        </motion.div>
      ))}
    </div>
  )
}
