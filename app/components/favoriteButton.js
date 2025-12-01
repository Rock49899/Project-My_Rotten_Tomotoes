'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FavoriteButton({ movieId, className = '' }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)

  // Vérifier si le film est dans les favoris au chargement
  useEffect(() => {
    if (session) {
      checkIfFavorite()
    }
  }, [session, movieId])

  const checkIfFavorite = async () => {
    try {
      const res = await fetch('/api/favorites', { credentials: 'same-origin' })
      const data = await res.json()
      
      if (res.ok) {
        const isFav = data.data.some(movie => movie.id === movieId)
        setIsFavorite(isFav)
      }
    } catch (err) {
      console.error('Erreur check favorite:', err)
    }
  }

  const toggleFavorite = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      if (isFavorite) {
        // Retirer des favoris
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId }),
        })

        if (res.ok) {
          setIsFavorite(false)
        } else {
          const data = await res.json()
          alert(data.message)
        }
      } else {
        // Ajouter aux favoris
        const res = await fetch('/api/favorites', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId }),
        })

        if (res.ok) {
          setIsFavorite(true)
        } else {
          const data = await res.json()
          alert(data.message)
        }
      }
    } catch (err) {
      console.error('Erreur toggle favorite:', err)
      alert('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
        isFavorite
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
      <span className="text-sm font-medium">
        {loading
          ? 'Chargement...'
          : isFavorite
          ? 'Retirer des favoris'
          : 'Ajouter aux favoris'}
      </span>
    </button>
  )
}