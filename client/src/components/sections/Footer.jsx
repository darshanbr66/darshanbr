import CursorTarget from '../ui/CursorTarget'
import { profile } from '../../data/profile'
import './footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__name">{profile.name}</p>
          <p className="footer__role mono">{profile.role}</p>
        </div>

        <div className="footer__social">
          <CursorTarget variant="link" label="OPEN">
            <a href={profile.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </CursorTarget>
          <CursorTarget variant="link" label="OPEN">
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </CursorTarget>
          <CursorTarget variant="link" label="EMAIL">
            <a href={`mailto:${profile.email}`}>Email</a>
          </CursorTarget>
        </div>

        <div className="footer__status">
          <span className="footer__dot" />
          <span className="mono">{profile.availability.toUpperCase()}</span>
        </div>
      </div>
      <div className="container footer__bottom mono">
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </div>
    </footer>
  )
}
