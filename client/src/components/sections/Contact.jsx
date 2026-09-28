import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import FormField from '../ui/FormField'
import MagneticButton from '../ui/MagneticButton'
import CursorTarget from '../ui/CursorTarget'
import { useSiteData } from '../../context/SiteDataContext'
import { api } from '../../services/api'
import './contact.css'

const EMPTY = { name: '', email: '', message: '', website: '' }

export default function Contact() {
  const { profile, content } = useSiteData()
  const section = content.contact
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState('')

  const links = profile.socialLinks.filter((l) => !l.url.startsWith('mailto:'))

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (status !== 'sending') setStatus('idle')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Please enter a valid email'
    if (!form.message.trim()) next.message = 'Please enter a message'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending' || !validate()) return
    setStatus('sending')
    try {
      await api.sendContact(form)
      setStatus('sent')
      setForm(EMPTY)
    } catch (err) {
      setErrorMessage(err.status === 429 || err.status === 400 ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="container">
        <SectionHeading eyebrow={5} title={section.heading} />

        <div className="contact__grid">
          <div className="contact__info">
            <p className="contact__lede">
              {section.description ||
                "Have a project in mind, or an opportunity worth discussing? I'd like to hear about it."}
            </p>

            <div className="contact__links">
              {profile.email && (
                <CursorTarget variant="link" label="EMAIL">
                  <a href={`mailto:${profile.email}`} className="contact__link">
                    {profile.email}
                  </a>
                </CursorTarget>
              )}
              {links.map((link) => (
                <CursorTarget key={link.id} variant="link" label="OPEN">
                  <a href={link.url} target="_blank" rel="noreferrer" className="contact__link">
                    {link.label}
                  </a>
                </CursorTarget>
              ))}
            </div>

            {profile.location && <p className="contact__location mono">{profile.location}</p>}
          </div>

          <motion.form
            className="contact__form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <FormField label="Your Name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
            <FormField label="Your Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
            <FormField label="Message" name="message" textarea value={form.message} onChange={handleChange} error={errors.message} />
            {/* Honeypot for bots — hidden from people and assistive tech. */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="contact__hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="contact__submit-row">
              <MagneticButton type="submit" variant="primary" cursorLabel="SEND">
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </MagneticButton>
              <span className="contact__status-slot" role="status" aria-live="polite">
                {status === 'sent' && <span className="contact__status is-ok">Message sent — thank you.</span>}
                {status === 'error' && <span className="contact__status is-error">{errorMessage}</span>}
              </span>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
