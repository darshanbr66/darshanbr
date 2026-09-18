import { createContext, useContext } from 'react'

export const CursorContext = createContext(null)

export function useCursor() {
  const ctx = useContext(CursorContext)
  if (!ctx) return { setVariant: () => {}, setLabel: () => {} }
  return ctx
}
