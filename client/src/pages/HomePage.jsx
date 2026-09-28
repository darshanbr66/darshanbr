import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/sections/Hero'
import About from '../components/sections/About'
import Experience from '../components/sections/Experience'
import Skills from '../components/sections/Skills'
import Projects from '../components/sections/Projects'
import Contact from '../components/sections/Contact'
import { useSiteData } from '../context/SiteDataContext'
import useDocumentMeta from '../hooks/useDocumentMeta'

export default function HomePage() {
  const { profile, status } = useSiteData()
  const { hash } = useLocation()

  useDocumentMeta({
    title: [profile.name, profile.headline || profile.title].filter(Boolean).join(' — '),
    description: profile.description,
  })

  // Supports links such as /#work once the dynamic sections have rendered.
  useEffect(() => {
    if (!hash || status === 'loading') return undefined
    const timer = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120)
    return () => clearTimeout(timer)
  }, [hash, status])

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
    </motion.main>
  )
}
