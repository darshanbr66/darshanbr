import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { fallbackContent, fallbackProfile } from '../data/fallback'
import { snapshot } from '../data/snapshot'
import { SiteDataContext } from './SiteDataContext'

const CACHE_KEY = 'dbr-site-v1'

// Last successful API payload, so repeat visits render the latest content
// immediately. Storage can be unavailable (private mode), hence the guards.
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    return cached?.profile ? cached : null
  } catch {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    // storage full or blocked — the snapshot still covers the next visit
  }
}

function mergeContent(content) {
  const merged = { ...fallbackContent }
  for (const key of Object.keys(content || {})) {
    const value = content[key]
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const clean = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== '' && v != null))
      merged[key] = { ...fallbackContent[key], ...clean }
    }
  }
  return merged
}

// Loads all public content in one request, once per page load. Until it
// arrives (or if it fails) the site renders cached / snapshot real content,
// so every section and animation is present from the first frame.
export default function SiteDataProvider({ children }) {
  const [state, setState] = useState(() => ({ status: 'loading', data: readCache() || snapshot, error: null }))

  const load = useCallback((signal) => {
    return api
      .getSite(signal)
      .then((data) => {
        writeCache(data)
        setState({ status: 'ready', data, error: null })
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState((s) => ({ ...s, status: 'error', error }))
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const value = useMemo(() => {
    const data = state.data
    const profile = { ...fallbackProfile, ...(data?.profile || {}) }
    const socialLinks = profile.socialLinks?.length ? profile.socialLinks : fallbackProfile.socialLinks
    const findLink = (id) => socialLinks.find((l) => l.id === id)?.url || ''

    return {
      status: state.status,
      error: state.error,
      reload: () => {
        setState((s) => ({ ...s, status: 'loading', error: null }))
        return load()
      },
      profile: {
        ...profile,
        socialLinks,
        github: findLink('github'),
        linkedin: findLink('linkedin'),
      },
      content: mergeContent(data?.content),
      projects: data?.projects || [],
      skills: data?.skills || [],
      experience: data?.experience || [],
      // Only offered once the API has confirmed the file is reachable.
      resume: state.status === 'ready' ? data?.resume || null : null,
    }
  }, [state, load])

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}
