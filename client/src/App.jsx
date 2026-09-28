import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicSite from './PublicSite'

// The admin CMS is a separate bundle, loaded only when /admin is visited.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="admin-boot" />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  )
}

export default App
