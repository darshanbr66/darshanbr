import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import ScrollHighlightText from '../animations/ScrollHighlightText'
import { useSiteData } from '../../context/SiteDataContext'
import './about.css'

export default function About() {
  const { profile, content, experience } = useSiteData()
  const about = content.about
  const statement = about.introduction || profile.description
  const current = experience.find((job) => job.current)

  const meta = [
    { label: 'LOCATION', value: profile.location },
    { label: 'CURRENTLY', value: current && `${current.role} at ${current.company}` },
    { label: 'FOCUS', value: about.focus || profile.title },
    { label: 'STATUS', value: profile.availability },
  ].filter((m) => m.value)

  // Written copy first, then the "how I work" principles — one numbered list.
  const entries = [
    ...[
      { title: 'Summary', text: about.summary },
      { title: 'Background', text: about.background },
      { title: 'More about me', text: about.additional },
    ].filter((e) => e.text),
    ...(about.principles || []).filter((p) => p.title || p.text),
  ]

  return (
    <section className="about" id="about">
      <div className="container">
        <SectionHeading eyebrow={1} title={about.heading} />

        {statement && <ScrollHighlightText key={statement} className="about__statement" text={statement} />}

        <div className={`about__grid ${entries.length ? '' : 'about__grid--meta-only'}`}>
          <div className="about__meta">
            {meta.map((m) => (
              <p key={m.label} className="about__meta-item">
                <span className="mono">{m.label}</span>
                {m.value}
              </p>
            ))}
          </div>

          {entries.length > 0 && (
            <div className="about__philosophy">
              {entries.map((item, i) => (
                <motion.div
                  key={`${i}-${item.title}`}
                  className="about__philosophy-item"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="about__philosophy-index mono">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    {item.title && <h3>{item.title}</h3>}
                    {item.text && <p className="about__text">{item.text}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
