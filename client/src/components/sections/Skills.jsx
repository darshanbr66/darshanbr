import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import useOrbit from '../../hooks/useOrbit'
import { useSiteData } from '../../context/SiteDataContext'
import { resolveMediaUrl } from '../../services/api'
import './skills.css'

const RING_CONFIG = [
  { radius: 130, speed: 5 },
  { radius: 220, speed: 3.4 },
  { radius: 305, speed: 2.2 },
]

function SkillIcon({ icon }) {
  if (!icon) return null
  if (/^(https?:|\/)/.test(icon)) {
    return <img className="skills__chip-icon" src={resolveMediaUrl(icon)} alt="" loading="lazy" />
  }
  return (
    <span className="skills__chip-icon" aria-hidden="true">
      {icon}
    </span>
  )
}

function OrbitRing({ radius, speed, direction, items, active, setActive }) {
  const register = useOrbit(items, radius, speed, direction)

  return (
    <div className="skills__ring" style={{ width: radius * 2, height: radius * 2 }}>
      {items.map((skill, i) => (
        <button
          key={skill._id}
          ref={register(i)}
          className={`skills__chip mono ${active?._id === skill._id ? 'is-active' : ''} ${skill.featured ? 'is-featured' : ''}`}
          onClick={() => setActive(active?._id === skill._id ? null : skill)}
        >
          <SkillIcon icon={skill.icon} />
          {skill.name}
        </button>
      ))}
    </div>
  )
}

export default function Skills() {
  const { skills, content } = useSiteData()
  const [active, setActive] = useState(null)
  const section = content.skills

  // Featured skills sit on the inner ring; the rest are spread round-robin.
  const rings = useMemo(() => {
    const sorted = [...skills].sort((a, b) => Number(b.featured) - Number(a.featured))
    const grouped = [[], [], []]
    sorted.forEach((skill, i) => grouped[i % 3].push(skill))
    return grouped
  }, [skills])

  return (
    <section className="skills" id="skills">
      <div className="container">
        <SectionHeading eyebrow={3} title={section.heading} />
        {section.description && <p className="section-lede">{section.description}</p>}

        {skills.length > 0 && (
          <>
            <div className="skills__orbit-wrap">
              <div className="skills__orbit">
                <div className="skills__core">
                  <span className="mono">FULL-STACK</span>
                </div>

                {rings.map((ring, i) =>
                  ring.length ? (
                    <OrbitRing
                      key={i}
                      items={ring}
                      radius={RING_CONFIG[i].radius}
                      speed={RING_CONFIG[i].speed}
                      direction={i % 2 === 0 ? 1 : -1}
                      active={active}
                      setActive={setActive}
                    />
                  ) : null
                )}
              </div>
            </div>

            <div className="skills__detail" aria-live="polite">
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div
                    key={active._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {active.category && <span className="skills__detail-category mono">{active.category}</span>}
                    <h3>{active.name}</h3>
                    {active.description && <p>{active.description}</p>}
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="skills__hint"
                  >
                    Select a technology to learn more.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
