import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AuthProvider from './context/AuthProvider'
import FeedbackProvider from './context/FeedbackProvider'
import { useAuth } from './context/AdminContext'
import AdminLayout from './components/AdminLayout'
import { Spinner } from './components/ui'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
import ExperiencePage from './pages/ExperiencePage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectEditorPage from './pages/ProjectEditorPage'
import MediaPage from './pages/MediaPage'
import ResumePage from './pages/ResumePage'
import MessagesPage from './pages/MessagesPage'
import SocialLinksPage from './pages/SocialLinksPage'
import SettingsPage from './pages/SettingsPage'
import './admin.css'

function RequireAuth({ children }) {
  const { session, checking } = useAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (checking) return <Spinner label="Checking session…" />
  return children
}

export default function AdminApp() {
  useEffect(() => {
    const previous = document.title
    document.title = 'Admin — Portfolio CMS'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, nofollow'
    document.head.appendChild(robots)
    return () => {
      document.title = previous
      robots.remove()
    }
  }, [])

  return (
    <div className="adm">
      <FeedbackProvider>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<ProjectEditorPage />} />
              <Route path="projects/:id" element={<ProjectEditorPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="social" element={<SocialLinksPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </FeedbackProvider>
    </div>
  )
}
