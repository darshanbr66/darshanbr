import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import CursorProvider from './components/cursor/CursorProvider'
import SmoothScroll from './components/animations/SmoothScroll'
import Navigation from './components/navigation/Navigation'
import Footer from './components/sections/Footer'
import Loader from './components/ui/Loader'
import SiteDataProvider from './context/SiteDataProvider'
import HomePage from './pages/HomePage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function PublicSite() {
  const location = useLocation()
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('dbr-visited'))

  useEffect(() => {
    if (!loading) return undefined
    const timer = setTimeout(() => {
      setLoading(false)
      sessionStorage.setItem('dbr-visited', '1')
    }, 2200)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SiteDataProvider>
      <CursorProvider>
        {loading && <Loader />}
        <SmoothScroll>
          <div className="grain" aria-hidden="true" />
          <Navigation />
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/work/:slug" element={<ProjectDetailPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </SmoothScroll>
      </CursorProvider>
    </SiteDataProvider>
  )
}
