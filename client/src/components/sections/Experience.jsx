import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import useFetchWithFallback from '../../hooks/useFetchWithFallback'
import { api } from '../../services/api'
import { experience as experienceFallback } from '../../data/experience'
import './experience.css'

export default function Experience() {
  const { data: experience } = useFetchWithFallback(api.getExperience, experienceFallback)

  return (
    <section className="experience" id="experience">
      <div className="container">
        <SectionHeading eyebrow={2} title="Experience" />

        <div className="experience__timeline">
          <div className="experience__line" />
          {experience.map((job, i) => (
            <motion.div
              key={job.id || i}
              className="experience__item"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="experience__node" />
              <div className="experience__card">
                <div className="experience__card-head">
                  <div>
                    <h3>{job.role}</h3>
                    <p className="experience__company">
                      {job.company} — {job.location}
                    </p>
                  </div>
                  <span className="experience__period mono">
                    {job.period}
                    {job.current && <span className="experience__badge">CURRENT</span>}
                  </span>
                </div>

                <p className="experience__summary">{job.summary}</p>

                <ul className="experience__responsibilities">
                  {job.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>

                <div className="experience__stack">
                  {job.stack.map((s) => (
                    <span key={s} className="mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
