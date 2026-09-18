import { useCallback, useMemo, useState } from 'react'
import { CursorContext } from '../../context/CursorContext'
import CustomCursor from './CustomCursor'

function isCoarsePointer() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(pointer: coarse)').matches
}

export default function CursorProvider({ children }) {
  const [variant, setVariantState] = useState('default')
  const [label, setLabelState] = useState('')
  const [coarse] = useState(isCoarsePointer)

  const setVariant = useCallback((v) => setVariantState(v || 'default'), [])
  const setLabel = useCallback((l) => setLabelState(l || ''), [])

  const value = useMemo(() => ({ setVariant, setLabel }), [setVariant, setLabel])

  return (
    <CursorContext.Provider value={value}>
      {!coarse && <CustomCursor variant={variant} label={label} />}
      {children}
    </CursorContext.Provider>
  )
}
