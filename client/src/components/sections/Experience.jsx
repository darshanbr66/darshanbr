import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import { useSiteData } from '../../context/SiteDataContext'
import './experience.css'

function formatPeriod(job) {
  const end = job.current ? 'Present' : job.endDate
  return [job.startDate, end].filter(Boolean).join(' — ')
}

export default function Experience() {
  const { experience, content } = useSiteData()
  const section = content.experience

  return (
    <section className="experience" id="experience">
      <div className="container">
        <SectionHeading eyebrow={2} title={section.heading} />
        {section.description && <p className="section-lede">{section.description}</p>}

        {experience.length > 0 && (
          <div className="experience__timeline">
            <div className="experience__line" />
            {experience.map((job) => (
              <motion.div
                key={job._id}
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
                        {[job.company, job.location].filter(Boolean).join(' — ')}
                      </p>
                    </div>
                    <span className="experience__period mono">
                      {formatPeriod(job)}
                      {job.current && <span className="experience__badge">CURRENT</span>}
                    </span>
                  </div>

                  {job.description && <p className="experience__summary">{job.description}</p>}

                  {job.responsibilities?.length > 0 && (
                    <ul className="experience__responsibilities">
                      {job.responsibilities.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}

                  {job.technologies?.length > 0 && (
                    <div className="experience__stack">
                      {job.technologies.map((s) => (
                        <span key={s} className="mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
