import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './loader.css'

export default function Loader() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + Math.ceil(Math.random() * 18)
      })
    }, 130)
    const finish = setTimeout(() => setDone(true), 2000)
    return () => {
      clearInterval(interval)
      clearTimeout(finish)
    }
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="loader"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="loader__inner">
            <span className="loader__name mono">DARSHAN B R</span>
            <span className="loader__percent mono">{Math.min(progress, 100)}%</span>
          </div>
          <div className="loader__bar">
            <div className="loader__bar-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
