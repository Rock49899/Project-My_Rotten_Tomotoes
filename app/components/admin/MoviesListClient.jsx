"use client"

import { useState } from "react"
import Image from "next/image"

export default function MoviesListClient({ initialMovies = [] }) {
  const [movies, setMovies] = useState(initialMovies)
  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  function toggleExpand(id) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }))
  }

  function openEdit(movie) {
    setEditing({ ...movie })
  }

  function closeEdit() {
    setEditing(null)
  }

  async function handleSave() {
    if (!editing || !editing.id) return
    setSaving(true)
    try {
      const body = {
        title: editing.title,
        overview: editing.overview,
        releaseDate: editing.releaseDate,
        runtime: editing.runtime,
        genres: Array.isArray(editing.genres) ? editing.genres : (editing.genres || "").split(",").map(s => s.trim()).filter(Boolean),
        posterPath: editing.posterPath,
        director: editing.director,
      }
      const res = await fetch(`/api/movies/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error("Failed to save")
      const updated = await res.json()
      setMovies((m) => m.map(x => x.id === updated.id ? updated : x))
      closeEdit()
    } catch (err) {
      alert("Erreur lors de la sauvegarde: " + String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const ok = confirm("Confirmer la suppression du film ? Cette action est irréversible.")
    if (!ok) return
    try {
      const res = await fetch(`/api/movies/${id}`, { method: "DELETE", credentials: 'same-origin' })
      if (res.status === 204) {
        setMovies((m) => m.filter(x => x.id !== id))
      } else {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.error || "Suppression échouée")
      }
    } catch (err) {
      alert("Erreur lors de la suppression: " + String(err))
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700 font-bold text-red-500">Liste des films</div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-4 text-gray-400">Titre</th>
              <th className="p-4 text-gray-400">Année</th>
              <th className="p-4 text-gray-400">Durée</th>
              <th className="p-4 text-gray-400">Genres</th>
              <th className="p-4 text-gray-400">Note</th>
              <th className="p-4 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => {
              const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "-"
              const hours = movie.runtime ? Math.floor(movie.runtime / 60) : 0
              const minutes = movie.runtime ? (movie.runtime % 60) : 0
              const duration = movie.runtime ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`) : "-"
              return (
                <>
                  <tr key={movie.id} className="border-t border-gray-700">
                    <td className="p-4 text-white">{movie.title || "(sans titre)"}</td>
                    <td className="p-4 text-gray-300">{year}</td>
                    <td className="p-4 text-gray-300">{duration}</td>
                    <td className="p-4 text-gray-300">{(movie.genres || []).slice(0,3).join(", ")}</td>
                    <td className="p-4 text-gray-300">{movie.ratingsAverage ? movie.ratingsAverage.toFixed(1) : "-"}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpand(movie.id)}
                          className="text-sm text-gray-300 hover:underline"
                        >
                          {expanded[movie.id] ? 'Replier' : 'Déplier'}
                        </button>
                        <button
                          onClick={() => openEdit(movie)}
                          className="text-red-500 hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id)}
                          className="text-gray-300 hover:text-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded[movie.id] ? (
                    <tr key={movie.id + "-details"} className="border-t border-gray-800 bg-gray-900">
                      <td colSpan={6} className="p-4 text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="col-span-1">
                            <div className="relative w-full h-64 bg-gray-800 rounded overflow-hidden">
                              {movie.posterPath ? (
                                <img src={movie.posterPath} alt={movie.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400">No image</div>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-2">
                            <div className="mb-2"><strong>Réalisateur:</strong> {movie.director || '-'}</div>
                            <div className="mb-2"><strong>TMDB ID:</strong> {movie.tmdbId || '-'}</div>
                            <div className="mb-2"><strong>Production:</strong> {(movie.productionCompanies || []).join(', ') || '-'}</div>
                            <div className="mb-2"><strong>Cast:</strong> {(movie.cast || []).slice(0,8).join(', ') || '-'}</div>
                            <div className="mt-3 text-gray-200 leading-relaxed">{movie.overview || 'Aucun synopsis'}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeEdit} />
          <div className="relative bg-gray-900 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-auto p-6 border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Modifier le film</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300">Titre</label>
                <input className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.title || ''} onChange={(e)=>setEditing({...editing, title: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Synopsis</label>
                <textarea rows={4} className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.overview || ''} onChange={(e)=>setEditing({...editing, overview: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300">Date de sortie</label>
                  <input type="date" className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.releaseDate ? editing.releaseDate.split('T')[0] : ''} onChange={(e)=>setEditing({...editing, releaseDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Durée (minutes)</label>
                  <input type="number" className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.runtime || ''} onChange={(e)=>setEditing({...editing, runtime: e.target.value ? Number(e.target.value) : null})} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300">Genres </label>
                <input className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={Array.isArray(editing.genres) ? editing.genres.join(', ') : (editing.genres || '')} onChange={(e)=>setEditing({...editing, genres: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Poster URL</label>
                <input className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.posterPath || ''} onChange={(e)=>setEditing({...editing, posterPath: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm text-gray-300">Réalisateur</label>
                <input className="mt-1 w-full bg-gray-800 text-white p-2 rounded" value={editing.director || ''} onChange={(e)=>setEditing({...editing, director: e.target.value})} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="px-4 py-2 bg-gray-700 rounded" onClick={closeEdit} disabled={saving}>Annuler</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={handleSave} disabled={saving}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
            </div>

          </div>
        </div>
      ) : null}

    </div>
  )
}
