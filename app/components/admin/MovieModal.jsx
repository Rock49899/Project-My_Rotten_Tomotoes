"use client"
import { useEffect, useState } from 'react'

export default function MovieModal({ id, onClose }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(`/api/admin/tmdb/details/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || 'admin'}` } })
      .then(r => r.json())
      .then(d => { if (mounted) setData(d) })
      .catch(e => setMessage(String(e)))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [id])

  if (!id) return null

  const handleAdd = async () => {
    if (!data?.details) return
    setAdding(true)
    setMessage(null)
    const details = data.details
    const credits = data.credits || { crew: [], cast: [] }
    const director = credits.crew?.find(c => c.job === 'Director')?.name || null
    const producers = (credits.crew || []).filter(c => c.job === 'Producer').map(p => p.name)
    const cast = (credits.cast || []).slice(0, 5).map(c => c.name)
    const payload = {
      tmdbId: String(details.id),
      title: details.title || details.original_title,
      overview: details.overview || '',
      releaseDate: details.release_date || null,
      runtime: details.runtime || null,
      genres: (details.genres || []).map(g => g.name),
      posterPath: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      director,
      productionCompanies: (details.production_companies || []).map(p => p.name),
      producers,
      cast,
      imdbId: details.imdb_id || null
    }

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token') || 'admin'}`
        },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || res.statusText)
      }
      setMessage('Film ajouté en base avec succès.')
    } catch (err) {
      setMessage(String(err))
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-white w-[90%] md:w-3/4 lg:w-1/2 p-4 rounded text-black">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">Prévisualisation du film</h2>
          <button className="text-gray-600" onClick={onClose}>Fermer</button>
        </div>
        {loading ? (
          <div className="py-6">Chargement...</div>
        ) : data?.error ? (
          <div className="py-6 text-red-600">Erreur: {String(data.error)}</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <img src={data.details.poster_path ? `https://image.tmdb.org/t/p/w300${data.details.poster_path}` : '/favicon.ico'} alt="poster" className="w-full rounded" />
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold">{data.details.title}</h3>
              <p className="text-sm text-gray-600">{data.details.release_date} • {data.details.runtime} min</p>
              <p className="mt-2">{data.details.overview}</p>
              <p className="mt-2"><strong>Réalisateur:</strong> {creditsName(data)}</p>
              <p className="mt-1"><strong>Acteurs (top):</strong> {(data.credits?.cast || []).slice(0,5).map(c => c.name).join(', ')}</p>
              <p className="mt-1"><strong>Producteurs:</strong> {(data.credits?.crew || []).filter(c => c.job === 'Producer').map(p => p.name).join(', ')}</p>
              <div className="mt-4 flex items-center gap-3">
                <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleAdd} disabled={adding}>{adding ? 'Ajout...' : 'Ajouter en base'}</button>
                <button className="px-4 py-2 border rounded" onClick={onClose}>Annuler</button>
              </div>
              {message && <div className="mt-3 text-sm text-blue-700">{message}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function creditsName(data) {
  const credits = data?.credits || { crew: [] }
  return credits.crew?.find(c => c.job === 'Director')?.name || '—'
}
