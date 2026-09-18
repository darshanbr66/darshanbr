import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CursorTarget from '../components/ui/CursorTarget'
import ArchitectureDiagram from '../components/projects/ArchitectureDiagram'
import MagneticButton from '../components/ui/MagneticButton'
import useFetchWithFallback from '../hooks/useFetchWithFallback'
import { api } from '../services/api'
import { projects, getProjectBySlug } from '../data/projects'
import './project-detail.css'

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const fallback = getProjectBySlug(slug)

  const { data: project } = useFetchWithFallback(() => api.getProject(slug), fallback)

  useEffect(() => {
    if (!fallback && !project) {
      const timer = setTimeout(() => navigate('/', { replace: true }), 50)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [fallback, project, navigate])

  if (!project) return null

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <motion.main
      className="project-detail"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="project-detail__hero">
        <div className="container">
          <CursorTarget variant="link" label="BACK">
            <Link to="/" className="project-detail__back mono">
              ← Back
            </Link>
          </CursorTarget>

          <span className="project-detail__number mono">{project.number}</span>
          <h1>{project.title}</h1>
          <p className="project-detail__category mono">
            {project.category} — {project.year}
          </p>
        </div>
      </header>

      <div className="project-detail__visual container">
        <div className="project-detail__visual-surface">
          <div className="project-detail__grid" />
        </div>
      </div>

      <section className="container project-detail__body">
        <div className="project-detail__col">
          <h2>Overview</h2>
          <p>{project.description}</p>

          <h2>Problem</h2>
          <p>{project.problem}</p>

          <h2>Solution</h2>
          <p>{project.solution}</p>

          <h2>Key Features</h2>
          <ul className="project-detail__list">
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <aside className="project-detail__aside">
          <div className="project-detail__meta-card">
            <h3 className="mono">TECHNOLOGIES</h3>
            <div className="project-detail__tech">
              {project.technologies.map((t) => (
                <span key={t} className="mono">
                  {t}
                </span>
              ))}
            </div>

            {(project.liveUrl || project.githubUrl) && (
              <div className="project-detail__links">
                {project.liveUrl && (
                  <MagneticButton href={project.liveUrl} variant="primary" cursorLabel="VISIT">
                    Live Site
                  </MagneticButton>
                )}
                {project.githubUrl && (
                  <MagneticButton href={project.githubUrl} variant="ghost" cursorLabel="CODE">
                    Source
                  </MagneticButton>
                )}
              </div>
            )}
          </div>

          <div className="project-detail__meta-card">
            <h3 className="mono">ARCHITECTURE</h3>
            <ArchitectureDiagram layers={project.architecture} />
          </div>
        </aside>
      </section>

      <footer className="project-detail__next">
        <div className="container">
          <span className="mono">NEXT PROJECT</span>
          <CursorTarget variant="explore" label="VIEW">
            <Link to={`/work/${next.slug}`} className="project-detail__next-link">
              {next.title} →
            </Link>
          </CursorTarget>
        </div>
      </footer>
    </motion.main>
  )
}
