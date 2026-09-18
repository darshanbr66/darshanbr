import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import useOrbit from '../../hooks/useOrbit'
import { skillCategories, skillDescriptions } from '../../data/skills'
import './skills.css'

const RING_CONFIG = [
  { radius: 130, speed: 5 },
  { radius: 220, speed: 3.4 },
  { radius: 305, speed: 2.2 },
]

function OrbitRing({ radius, speed, direction, items, active, setActive }) {
  const register = useOrbit(items, radius, speed, direction)

  return (
    <div className="skills__ring" style={{ width: radius * 2, height: radius * 2 }}>
      {items.map((skill, i) => (
        <button
          key={skill}
          ref={register(i)}
          className={`skills__chip mono ${active === skill ? 'is-active' : ''}`}
          onClick={() => setActive(active === skill ? null : skill)}
        >
          {skill}
        </button>
      ))}
    </div>
  )
}

export default function Skills() {
  const [active, setActive] = useState(null)

  const allSkills = useMemo(() => skillCategories.flatMap((c) => c.skills), [])

  const rings = useMemo(() => {
    const grouped = [[], [], []]
    allSkills.forEach((skill, i) => grouped[i % 3].push(skill))
    return grouped
  }, [allSkills])

  return (
    <section className="skills" id="skills">
      <div className="container">
        <SectionHeading eyebrow={3} title="Technology" />

        <div className="skills__orbit-wrap">
          <div className="skills__orbit">
            <div className="skills__core">
              <span className="mono">FULL-STACK</span>
            </div>

            {rings.map((ring, i) => (
              <OrbitRing
                key={i}
                items={ring}
                radius={RING_CONFIG[i].radius}
                speed={RING_CONFIG[i].speed}
                direction={i % 2 === 0 ? 1 : -1}
                active={active}
                setActive={setActive}
              />
            ))}
          </div>
        </div>

        <div className="skills__detail">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3>{active}</h3>
                <p>{skillDescriptions[active]}</p>
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
      </div>
    </section>
  )
}
