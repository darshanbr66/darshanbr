import { useEffect, useState } from 'react'

// Attempts a live API call; if it fails (backend not running, network error),
// falls back to local static data so the experience never shows a blank state.
export default function useFetchWithFallback(fetcher, fallbackData) {
  const [data, setData] = useState(fallbackData)
  const [source, setSource] = useState('fallback')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetcher()
      .then((res) => {
        if (cancelled) return
        setData(res)
        setSource('live')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setSource('fallback')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { data, source, error }
}
