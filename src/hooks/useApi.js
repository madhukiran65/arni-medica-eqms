import { useState, useEffect, useCallback } from 'react'

export function useApi(apiCall, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall(...args)
      const result = response.data?.results ?? response.data
      setData(result)
      return result
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'An error occurred'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  }, [execute, immediate])

  return { data, loading, error, execute, setData }
}

export function usePaginatedApi(apiCall, deps = []) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, search, ...filters }
      const response = await apiCall(params)
      setData(response.data?.results ?? response.data ?? [])
      setTotalCount(response.data?.count ?? 0)
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search, JSON.stringify(filters), ...deps])

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, page, setPage, totalCount, search, setSearch, filters, setFilters, refresh: execute }
}
