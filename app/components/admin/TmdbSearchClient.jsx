"use client"
import { useEffect, useState, useRef, useCallback } from 'react'
import MovieModal from './MovieModal'

export default function TmdbSearchClient() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const controllerRef = useRef(null)

  const fetchPage = useCallback(async (q, p = 1, append = false) => {
    setLoading(true)
    if (controllerRef.current) controllerRef.current.abort()
    controllerRef.current = new AbortController()
    try {
      let res
      if (!q) {
        // no query: load popular movies
        res = await fetch(`/api/admin/tmdb/recent?page=${p}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || 'admin'}` },
          signal: controllerRef.current.signal
        })
      } else {
        res = await fetch(`/api/admin/tmdb/search?q=${encodeURIComponent(q)}&page=${p}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || 'admin'}` },
          signal: controllerRef.current.signal
        })
      }
      const data = await res.json()
      if (append) setResults(prev => [...prev, ...(data.results || [])])
      else setResults(data.results || [])
      setTotalPages(data.total_pages || 1)
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchPage(query, 1, false) }, 300)
    return () => clearTimeout(t)
  }, [query, fetchPage])

  useEffect(() => {
    if (page === 1) return
    fetchPage(query, page, true)
  }, [page, query, fetchPage])

  return (
    <div>
      <div className="mb-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Rechercher un film sur TMDB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map(item => (
          <div key={item.id} className="border rounded p-2 flex">
            <img src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : '/favicon.ico'} alt="poster" className="w-20 h-28 object-cover mr-3 rounded" />
            <div className="flex-1">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.release_date}</p>
              <p className="text-sm mt-2">{item.overview?.slice(0, 120)}{item.overview && item.overview.length > 120 ? '…' : ''}</p>
              <div className="mt-2">
                <button className="text-sm text-blue-600" onClick={() => setSelectedId(item.id)}>Voir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        {loading ? (
          <div>Chargement...</div>
        ) : (
          page < totalPages && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setPage(p => p + 1)}>Charger plus</button>
          )
        )}
      </div>

      {selectedId && <MovieModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
