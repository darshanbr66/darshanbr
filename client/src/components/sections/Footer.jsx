import { Link, useLocation, useNavigate } from 'react-router-dom'
import CursorTarget from '../ui/CursorTarget'
import MagneticButton from '../ui/MagneticButton'
import RevealText from '../animations/RevealText'
import { useSiteData } from '../../context/SiteDataContext'
import { resumeFileUrl } from '../../services/api'
import './footer.css'

function FooterCta({ cta }) {
  const navigate = useNavigate()
  const lines = cta.heading.split('\n').filter(Boolean)
  const goToContact = () => navigate('/#contact')

  return (
    <div className="container footer__cta">
      <span className="footer__cta-eyebrow mono">{cta.eyebrow}</span>
      <h2 className="footer__cta-heading">
        {lines.map((line, i) => (
          <RevealText
            key={`${i}-${line}`}
            text={line}
            className={`footer__cta-line ${i === lines.length - 1 && lines.length > 1 ? 'footer__cta-line--accent' : ''}`}
            stagger={0.06}
          />
        ))}
      </h2>
      <MagneticButton onClick={goToContact} variant="primary" cursorLabel="GO">
        {cta.buttonLabel}
      </MagneticButton>
    </div>
  )
}

export default function Footer() {
  const { profile, resume, content } = useSiteData()
  const { pathname } = useLocation()
  const cta = content.footer
  // The home page already ends with the contact section, so the closing
  // call-to-action is only shown on the other pages (project case studies).
  const showCta = pathname !== '/' && cta?.heading

  return (
    <footer className="footer">
      {showCta && <FooterCta cta={cta} />}
      <div className="container footer__inner">
        <div>
          <p className="footer__name">{profile.name}</p>
          <p className="footer__role mono">{profile.headline || profile.title || profile.role}</p>
        </div>

        <div className="footer__social">
          {profile.socialLinks.map((link) => {
            const isMail = link.url.startsWith('mailto:')
            return (
              <CursorTarget key={link.id} variant="link" label={isMail ? 'EMAIL' : 'OPEN'}>
                <a href={link.url} target={isMail ? undefined : '_blank'} rel={isMail ? undefined : 'noreferrer'}>
                  {link.label}
                </a>
              </CursorTarget>
            )
          })}
          {resume && (
            <CursorTarget variant="link" label="OPEN">
              <a href={resumeFileUrl} target="_blank" rel="noreferrer">
                Resume
              </a>
            </CursorTarget>
          )}
        </div>

        {profile.availability && (
          <div className="footer__status">
            <span className="footer__dot" />
            <span className="mono">{profile.availability.toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="container footer__bottom mono">
        <span>
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </span>
        <Link to="/admin/login" className="footer__admin" aria-label="Admin login">
          Admin
        </Link>
      </div>
    </footer>
  )
}
