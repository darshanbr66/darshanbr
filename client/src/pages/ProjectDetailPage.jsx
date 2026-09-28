import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CursorTarget from '../components/ui/CursorTarget'
import ArchitectureDiagram from '../components/projects/ArchitectureDiagram'
import ProjectArt from '../components/projects/ProjectArt'
import MagneticButton from '../components/ui/MagneticButton'
import { projectNumber } from '../utils/projects'
import { useSiteData } from '../context/SiteDataContext'
import useDocumentMeta from '../hooks/useDocumentMeta'
import { api, resolveMediaUrl } from '../services/api'
import './project-detail.css'

const pageMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
}

function DetailState({ title, children }) {
  return (
    <motion.main className="project-detail project-detail--state" {...pageMotion}>
      <div className="container">
        <CursorTarget variant="link" label="BACK">
          <Link to="/#work" className="project-detail__back mono">
            ← Back
          </Link>
        </CursorTarget>
        <h1>{title}</h1>
        {children && <p className="project-detail__state-text">{children}</p>}
      </div>
    </motion.main>
  )
}

function Block({ title, children }) {
  if (!children) return null
  return (
    <>
      <h2>{title}</h2>
      <p>{children}</p>
    </>
  )
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { projects, profile, status } = useSiteData()
  const fromList = projects.find((p) => p.slug === slug)
  const [remote, setRemote] = useState({ project: null, error: null })

  // The site payload already contains every published project; only hit the
  // project endpoint directly if that payload failed to load.
  useEffect(() => {
    if (status !== 'error') return undefined
    const controller = new AbortController()
    api
      .getProject(slug, controller.signal)
      .then((project) => setRemote({ project, error: null }))
      .catch((error) => error.name !== 'AbortError' && setRemote({ project: null, error }))
    return () => controller.abort()
  }, [slug, status])

  const project = fromList || remote.project
  const index = Math.max(0, projects.findIndex((p) => p.slug === slug))

  useDocumentMeta({
    title: project ? `${project.title} — ${profile.name}` : undefined,
    description: project?.shortDescription || project?.description || undefined,
  })

  if (!project) {
    if (status === 'loading' || (status === 'error' && !remote.error)) {
      return <DetailState title="Loading project…" />
    }
    if (remote.error && remote.error.status !== 404) {
      return <DetailState title="Couldn't load this project.">Please check your connection and try again.</DetailState>
    }
    return <DetailState title="Project not found.">It may have been moved or unpublished.</DetailState>
  }

  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null
  const image = resolveMediaUrl(project.image)
  const overview = project.description || project.shortDescription
  const meta = [project.category, project.year].filter(Boolean).join(' — ')
  const hasCaseStudy = overview || project.problem || project.solution || project.features?.length || project.role || project.details
  const facts = [
    { label: 'CATEGORY', value: project.category },
    { label: 'YEAR', value: project.year },
    { label: 'STACK', value: project.technologies?.slice(0, 3).join(' · ') },
    { label: 'STATUS', value: project.liveUrl ? 'Live' : '' },
  ].filter((f) => f.value)

  return (
    <motion.main className="project-detail" {...pageMotion}>
      <header className="project-detail__hero">
        <div className="container">
          <CursorTarget variant="link" label="BACK">
            <Link to="/#work" className="project-detail__back mono">
              ← Back
            </Link>
          </CursorTarget>

          <span className="project-detail__number mono">{projectNumber(index)}</span>
          <h1>{project.title}</h1>
          {meta && <p className="project-detail__category mono">{meta}</p>}
        </div>
      </header>

      <div className="project-detail__visual container">
        <motion.div
          className="project-detail__visual-surface"
          initial={{ clipPath: 'inset(12% 8% 12% 8% round 24px)', opacity: 0.4 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0% round 24px)', opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {image ? (
            <img className="project-detail__image" src={image} alt={`${project.title} screenshot`} decoding="async" />
          ) : (
            <>
              <ProjectArt project={project} index={index} />
              <div className="project-detail__grid" />
            </>
          )}
        </motion.div>
      </div>

      {facts.length > 0 && (
        <div className="container">
          <dl className="project-detail__facts">
            {facts.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      )}

      <section className="container project-detail__body">
        <div className="project-detail__col">
          {hasCaseStudy ? (
            <>
              <Block title="Overview">{overview}</Block>
              <Block title="Problem">{project.problem}</Block>
              <Block title="Solution">{project.solution}</Block>
              {project.features?.length > 0 && (
                <>
                  <h2>Key Features</h2>
                  <ul className="project-detail__list">
                    {project.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
              <Block title="My Role">{project.role}</Block>
              <Block title="Additional Details">{project.details}</Block>
            </>
          ) : (
            <>
              <h2>Case Study</h2>
              <p className="project-detail__state-text">A detailed write-up for this project is in progress.</p>
            </>
          )}
        </div>

        <aside className="project-detail__aside">
          {(project.technologies?.length > 0 || project.liveUrl || project.githubUrl) && (
            <div className="project-detail__meta-card">
              {project.technologies?.length > 0 && (
                <>
                  <h3 className="mono">TECHNOLOGIES</h3>
                  <div className="project-detail__tech">
                    {project.technologies.map((t) => (
                      <span key={t} className="mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}

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
          )}

          {project.architecture?.length > 0 && (
            <div className="project-detail__meta-card">
              <h3 className="mono">ARCHITECTURE</h3>
              <ArchitectureDiagram layers={project.architecture} />
            </div>
          )}
        </aside>
      </section>

      {project.gallery?.length > 0 && (
        <section className="container project-detail__gallery" aria-label="Project gallery">
          <h2>Gallery</h2>
          <div className="project-detail__gallery-grid">
            {project.gallery.map((url, i) => (
              <CursorTarget key={url} variant="explore" label="OPEN">
                <a
                  href={resolveMediaUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="project-detail__gallery-item"
                >
                  <img src={resolveMediaUrl(url)} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" decoding="async" />
                </a>
              </CursorTarget>
            ))}
          </div>
        </section>
      )}

      {next && (
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
      )}
    </motion.main>
  )
}
