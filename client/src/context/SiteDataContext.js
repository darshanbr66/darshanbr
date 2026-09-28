import { createContext, useContext } from 'react'

export const SiteDataContext = createContext(null)

export function useSiteData() {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used inside <SiteDataProvider>')
  return ctx
}
