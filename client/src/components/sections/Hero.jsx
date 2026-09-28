import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import RevealText from '../animations/RevealText'
import MagneticButton from '../ui/MagneticButton'
import { useSiteData } from '../../context/SiteDataContext'
import { resumeFileUrl } from '../../services/api'
import './hero.css'

const HeroScene = lazy(() => import('../three/HeroScene'))

export default function Hero() {
  const { profile, content, resume } = useSiteData()
  const hero = content.hero
  const scrollToWork = () => document.querySelector('#work')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToContact = () => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })

  const eyebrow = [profile.role, profile.headline || profile.title].filter(Boolean).join(' — ')

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
          {eyebrow.toUpperCase()}
        </motion.p>

        <h1 className="hero__title">
          <span className="sr-only">{profile.name} — </span>
          <RevealText text={hero.titleLine1} as="span" className="hero__line" stagger={0.05} />
          {hero.titleLine2 && (
            <RevealText text={hero.titleLine2} as="span" className="hero__line hero__line--accent" stagger={0.05} />
          )}
        </h1>

        {profile.description && (
          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {profile.description}
          </motion.p>
        )}

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagneticButton onClick={scrollToWork} variant="primary" cursorLabel="VIEW">
            {hero.exploreWorkLabel}
          </MagneticButton>
          <MagneticButton onClick={scrollToContact} variant="ghost" cursorLabel="GO">
            {hero.contactLabel}
          </MagneticButton>
          {resume && (
            <MagneticButton href={resumeFileUrl} variant="ghost" cursorLabel="OPEN">
              Resume
            </MagneticButton>
          )}
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span>{hero.scrollLabel.toUpperCase()}</span>
        <span className="hero__scroll-line" />
      </motion.div>
    </section>
  )
}
