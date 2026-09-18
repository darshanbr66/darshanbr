import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import CursorTarget from '../ui/CursorTarget'
import useFetchWithFallback from '../../hooks/useFetchWithFallback'
import { api } from '../../services/api'
import { projects as projectsFallback } from '../../data/projects'
import './projects.css'

function ProjectPanel({ project, index }) {
  const navigate = useNavigate()

  return (
    <article className="project-panel">
      <div className="project-panel__visual" data-index={index % 4}>
        <span className="project-panel__number mono">{project.number}</span>
        <div className="project-panel__grid" />
      </div>

      <div className="project-panel__info">
        <span className="project-panel__category mono">
          {project.category} — {project.year}
        </span>
        <h3 className="project-panel__title">{project.title}</h3>
        <p className="project-panel__desc">{project.description}</p>
        <div className="project-panel__tech">
          {project.technologies.map((t) => (
            <span key={t} className="mono">
              {t}
            </span>
          ))}
        </div>
        <CursorTarget variant="explore" label="EXPLORE">
          <button className="project-panel__cta" onClick={() => navigate(`/work/${project.slug}`)}>
            Explore Project <span aria-hidden="true">→</span>
          </button>
        </CursorTarget>
      </div>
    </article>
  )
}

export default function Projects() {
  const { data: projects } = useFetchWithFallback(api.getProjects, projectsFallback)
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, [0, 1], ['0%', `-${(projects.length - 1) * 100}%`])

  return (
    <section
      className="projects"
      id="work"
      ref={sectionRef}
      style={{ height: `${projects.length * 100}vh` }}
    >
      <div className="projects__sticky">
        <div className="container projects__heading">
          <SectionHeading eyebrow={4} title="Selected Work" />
        </div>
        <motion.div className="projects__track" style={{ x }}>
          {projects.map((project, i) => (
            <ProjectPanel key={project.slug} project={project} index={i} />
          ))}
        </motion.div>
        <div className="projects__progress">
          {projects.map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
