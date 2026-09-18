import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CursorTarget from '../components/ui/CursorTarget'

export default function NotFoundPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        textAlign: 'center',
      }}
    >
      <span className="mono" style={{ color: 'var(--accent-strong)', fontSize: 13, letterSpacing: '0.1em' }}>
        404
      </span>
      <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)' }}>Page not found.</h1>
      <CursorTarget variant="link" label="HOME">
        <Link to="/" className="mono" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-strong)' }}>
          Back to home
        </Link>
      </CursorTarget>
    </motion.main>
  )
}
