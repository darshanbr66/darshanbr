import { useCallback, useMemo, useState } from 'react'

// Tracks an editable copy of a record plus whether it differs from the saved one.
export default function useFormState(initial) {
  const [saved, setSaved] = useState(initial)
  const [values, setValues] = useState(initial)

  const set = useCallback((field) => (value) => setValues((v) => ({ ...v, [field]: value })), [])
  const reset = useCallback(() => setValues(saved), [saved])
  const load = useCallback((next) => {
    setSaved(next)
    setValues(next)
  }, [])

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(saved), [values, saved])

  return { values, setValues, set, reset, load, dirty }
}
