import { useCallback, useEffect, useRef, useState } from 'react'

// Loads data from the API and tracks loading/error state.
//   const { data, loading, error, reload, setData } = useApi(() => getVendors(), [])
// Pass the values the request depends on as the second argument, e.g. [id].
// reload() refreshes the data quietly (no loading flash) and returns a promise.
export default function useApi(fetcher, deps = []) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState({ key: null, data: null, error: '' })
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let active = true
    fetcherRef.current()
      .then((data) => active && setState({ key, data, error: '' }))
      .catch((err) => active && setState((s) => ({ key, data: s.data, error: err.message })))
    return () => {
      active = false
    }
  }, [key])

  const reload = useCallback(async () => {
    try {
      const data = await fetcherRef.current()
      setState({ key, data, error: '' })
      return data
    } catch (err) {
      setState((s) => ({ ...s, key, error: err.message }))
      return undefined
    }
  }, [key])

  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })),
    [],
  )

  const loading = state.key !== key
  return { data: loading ? null : state.data, loading, error: loading ? '' : state.error, reload, setData }
}
