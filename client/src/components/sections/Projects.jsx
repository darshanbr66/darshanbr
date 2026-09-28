import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import CursorTarget from '../ui/CursorTarget'
import ProjectArt from '../projects/ProjectArt'
import { useSiteData } from '../../context/SiteDataContext'
import { resolveMediaUrl } from '../../services/api'
import { projectNumber } from '../../utils/projects'
import './projects.css'

const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Cover image (or generative art) with a pointer-driven 3D tilt. The tilt is
// written straight to CSS variables so hovering never re-renders React.
function ProjectVisual({ project, index, onOpen }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const ref = useRef(null)
  const src = resolveMediaUrl(project.image)
  const showImage = src && !failed

  const handleMove = (e) => {
    if (!canHover()) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const py = ((e.clientY - rect.top) / rect.height) * 2 - 1
    el.style.setProperty('--px', px.toFixed(3))
    el.style.setProperty('--py', py.toFixed(3))
  }
  const handleLeave = () => {
    ref.current?.style.setProperty('--px', 0)
    ref.current?.style.setProperty('--py', 0)
  }

  return (
    <CursorTarget variant="view" label="VIEW">
      <div
        ref={ref}
        className="project-panel__visual"
        data-index={index % 4}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onOpen}
      >
        {!showImage || !loaded ? <ProjectArt project={project} index={index} /> : null}
        {showImage && (
          <img
            className={`project-panel__image ${loaded ? 'is-loaded' : ''}`}
            src={src}
            alt={`${project.title} preview`}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        <div className="project-panel__grid" />
        <span className="project-panel__number mono">{projectNumber(index)}</span>
        <span className="project-panel__glare" aria-hidden="true" />
      </div>
    </CursorTarget>
  )
}

function ProjectPanel({ project, index, total }) {
  const navigate = useNavigate()
  const open = () => navigate(`/work/${project.slug}`)
  const summary = project.shortDescription || project.description
  const meta = [project.category, project.year].filter(Boolean).join(' — ')

  return (
    <article className="project-panel" aria-label={`${project.title} (${index + 1} of ${total})`}>
      <div className="project-panel__inner">
        <ProjectVisual project={project} index={index} onOpen={open} />

        <div className="project-panel__info">
          <span className="project-panel__counter mono">
            {projectNumber(index)} <span>/ {projectNumber(total - 1)}</span>
          </span>
          {meta && <span className="project-panel__category mono">{meta}</span>}
          <h3 className="project-panel__title">{project.title}</h3>
          {summary && <p className="project-panel__desc">{summary}</p>}
          {project.technologies?.length > 0 && (
            <div className="project-panel__tech">
              {project.technologies.slice(0, 6).map((t) => (
                <span key={t} className="mono">
                  {t}
                </span>
              ))}
              {project.technologies.length > 6 && (
                <span className="mono project-panel__tech-more">+{project.technologies.length - 6}</span>
              )}
            </div>
          )}
          <div className="project-panel__actions">
            <CursorTarget variant="explore" label="EXPLORE">
              <button className="project-panel__cta" onClick={open}>
                Explore Project <span aria-hidden="true">→</span>
              </button>
            </CursorTarget>
            {project.liveUrl && (
              <CursorTarget variant="link" label="VISIT">
                <a className="project-panel__link mono" href={project.liveUrl} target="_blank" rel="noreferrer">
                  Live ↗
                </a>
              </CursorTarget>
            )}
            {project.githubUrl && (
              <CursorTarget variant="link" label="CODE">
                <a className="project-panel__link mono" href={project.githubUrl} target="_blank" rel="noreferrer">
                  Code ↗
                </a>
              </CursorTarget>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ProgressTick({ index, activeIndex }) {
  const opacity = useTransform(activeIndex, (v) => (v === index ? 1 : 0.35))
  const scaleX = useTransform(activeIndex, (v) => (v === index ? 1.6 : 1))
  return <motion.span style={{ opacity, scaleX }} />
}

export default function Projects() {
  const { projects, content } = useSiteData()
  const section = content.projects
  const sectionRef = useRef(null)
  const count = Math.max(projects.length, 1)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(count - 1) * 100}%`])
  const activeIndex = useTransform(scrollYProgress, (v) => Math.round(v * (count - 1)))

  return (
    <section className="projects" id="work" ref={sectionRef} style={{ height: `${count * 100}vh` }}>
      <div className="projects__sticky">
        <div className="container projects__heading">
          <SectionHeading eyebrow={4} title={section.heading} />
          {section.description && <p className="projects__lede">{section.description}</p>}
        </div>
        <motion.div className="projects__track" style={{ x }}>
          {projects.map((project, i) => (
            <ProjectPanel key={project._id || project.slug} project={project} index={i} total={projects.length} />
          ))}
        </motion.div>
        {projects.length > 1 && (
          <div className="projects__progress" aria-hidden="true">
            {projects.map((p, i) => (
              <ProgressTick key={p._id || i} index={i} activeIndex={activeIndex} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
