import { useEffect } from 'react'

function setMeta(selector, attr, value) {
  if (!value) return
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

// Keeps the document title and description/OG tags in sync with live content.
export default function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [title, description])
}
