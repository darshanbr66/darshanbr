import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth, useConfirm } from '../context/AdminContext'
import Icon from './Icon'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/profile', label: 'Profile', icon: 'user' },
  { to: '/admin/about', label: 'About', icon: 'about' },
  { to: '/admin/skills', label: 'Skills', icon: 'skills' },
  { to: '/admin/experience', label: 'Experience', icon: 'briefcase' },
  { to: '/admin/projects', label: 'Projects', icon: 'folder' },
  { to: '/admin/media', label: 'Media', icon: 'image' },
  { to: '/admin/resume', label: 'Resume', icon: 'file' },
  { to: '/admin/messages', label: 'Messages', icon: 'mail' },
  { to: '/admin/social', label: 'Social Links', icon: 'link' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

export default function AdminLayout() {
  const { session, logout } = useAuth()
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    const ok = await confirm({ title: 'Log out?', message: 'You will need to sign in again to manage content.', confirmLabel: 'Log out', danger: false })
    if (ok) logout()
  }

  return (
    <div className={`adm-shell ${open ? 'is-nav-open' : ''}`}>
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <span className="adm-logo">D</span>
          <div>
            <strong>Portfolio CMS</strong>
            <small>{session?.email}</small>
          </div>
        </div>

        <nav className="adm-nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="adm-nav__link" onClick={() => setOpen(false)}>
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <a className="adm-nav__link" href="/" target="_blank" rel="noreferrer">
            <Icon name="globe" />
            View site
          </a>
          <button className="adm-nav__link" onClick={handleLogout}>
            <Icon name="logout" />
            Logout
          </button>
        </div>
      </aside>

      <div className="adm-sidebar-scrim" onClick={() => setOpen(false)} aria-hidden="true" />

      <div className="adm-main">
        <header className="adm-topbar">
          <button className="adm-icon-btn adm-topbar__menu" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
            <Icon name="menu" />
          </button>
          <span className="adm-topbar__title">Portfolio CMS</span>
        </header>
        <main className="adm-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
