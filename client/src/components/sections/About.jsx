import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import ScrollHighlightText from '../animations/ScrollHighlightText'
import { profile, philosophy } from '../../data/profile'
import './about.css'

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <SectionHeading eyebrow={1} title="About" />

        <ScrollHighlightText
          className="about__statement"
          text="I don't just write code. I build experiences — full-stack applications engineered with React, Node.js, Express and MongoDB, shaped by attention to structure, performance and detail."
        />

        <div className="about__grid">
          <div className="about__meta">
            <p className="about__meta-item">
              <span className="mono">LOCATION</span>
              {profile.location}
            </p>
            <p className="about__meta-item">
              <span className="mono">EXPERIENCE</span>
              {profile.yearsExperience}+ Years
            </p>
            <p className="about__meta-item">
              <span className="mono">FOCUS</span>
              {profile.specialization}
            </p>
          </div>

          <div className="about__philosophy">
            {philosophy.map((item, i) => (
              <motion.div
                key={item.title}
                className="about__philosophy-item"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="about__philosophy-index mono">0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
