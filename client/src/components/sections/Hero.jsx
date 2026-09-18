import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import RevealText from '../animations/RevealText'
import MagneticButton from '../ui/MagneticButton'
import { profile } from '../../data/profile'
import './hero.css'

const HeroScene = lazy(() => import('../three/HeroScene'))

export default function Hero() {
  const scrollToWork = () => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="hero" id="hero">
      <div className="hero__scene">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="hero__vignette" />

      <div className="container hero__content">
        <motion.p
          className="hero__eyebrow mono"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {profile.role.toUpperCase()} — {profile.specialization.toUpperCase()}
        </motion.p>

        <h1 className="hero__title">
          <RevealText text="I BUILD DIGITAL" as="span" className="hero__line" stagger={0.05} />
          <RevealText text="EXPERIENCES." as="span" className="hero__line hero__line--accent" stagger={0.05} />
        </h1>

        <motion.p
          className="hero__sub"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Full-stack developer specializing in React, Node.js, Express and MongoDB —
          {' '}{profile.yearsExperience}+ years building modern, scalable web applications.
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagneticButton onClick={scrollToWork} variant="primary" cursorLabel="VIEW">
            Explore My Work
          </MagneticButton>
          <MagneticButton onClick={scrollToContact} variant="ghost" cursorLabel="GO">
            Let's Connect
          </MagneticButton>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span>SCROLL TO EXPLORE</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}
