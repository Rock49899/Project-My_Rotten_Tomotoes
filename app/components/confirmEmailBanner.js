'use client'
import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function ConfirmEmailBanner() {
  const { data: session } = useSession()
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  // Ne rien afficher si :
  // - Pas connecté
  // - Déjà confirmé
  // - Connecté via Google (déjà confirmé automatiquement)
  if (!session || session.user.isConfirmed || session.user.provider === 'GOOGLE') {
    return null
  }

  const resendEmail = async () => {
    setSending(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setMessage('✅ Email renvoyé ! Vérifiez votre boîte de réception.')
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (err) {
      setMessage('❌ Erreur lors de l\'envoi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <p className="font-semibold text-yellow-800">
              Confirmez votre adresse email
            </p>
            <p className="text-sm text-yellow-700">
              Pour laisser des avis et ajouter des films à vos favoris, veuillez confirmer votre email.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {message && (
            <span className="text-sm text-yellow-800">{message}</span>
          )}
          <button
            onClick={resendEmail}
            disabled={sending}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {sending ? 'Envoi...' : 'Renvoyer l\'email'}
          </button>
        </div>
      </div>
    </div>
  )
}