"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import FavoriteButton from "../favoriteButton";

export default function MovieActions({ movieId }) {
  const { data: session } = useSession();
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("")
  const [ratingLoading, setRatingLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false);
  // const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // édition inline
  const [editingId, setEditingId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!session) {
      alert("Veuillez vous connecter pour laisser un avis");
      return;
    }  

    // if (userRating === 0) {
    //   alert("Veuillez donner une note");  
    //   return;
    // }

    const newReview = {
      id: Date.now().toString(),
      userId: session.user.id,
      username: session.user.username || session.user.email,
      rating: userRating,
      comment: comment,
      createdAt: new Date(),
    };

    setReviews([newReview, ...reviews]);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId,
        comment,
        rating: 0,
      }),  
    })      


    const data = await res.json()
    if (!res.ok) throw new Error(data.message)

    setMessage("Commentaire envoyé !")
    setComment("")
    setComment("");
    setUserRating(0);
    setShowReviewForm(false);
  };

  // Calculer les stats
  // Only consider ratings > 0 for average
  const ratedReviews = reviews.filter(r => Number(r.rating) > 0);

  const averageRating = ratedReviews.length > 0
    ? (ratedReviews.reduce((acc, r) => acc + Number(r.rating), 0) / ratedReviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = ratedReviews.filter(r => Number(r.rating) === star).length;
    return {
      star,
      count,
      percentage: ratedReviews.length > 0 ? (count / ratedReviews.length) * 100 : 0,
    };
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?movieId=${movieId}`, { signal: controller.signal });
        if (!response.ok) {
          console.error("Erreur API reviews:", response.status, await response.text());
          return;
        }

        const json = await response.json();
        const oldReviewsFromDB = json.reviews ?? json;

        const formatted = [];
        for (const oldReview of oldReviewsFromDB) {
          formatted.push({
            id: String(oldReview.id ?? Date.now()),
            userId: String(oldReview.user?.id ?? 0),
            username: oldReview.user?.username ?? oldReview.username ?? "Utilisateur",
            rating: oldReview.rating ?? 0,
            comment: oldReview.comment ?? "",
            createdAt: oldReview.createdAt ?? new Date().toISOString(),
          });
        }

        setReviews(formatted.length > 0 ? formatted : []);

      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Erreur pendant la recuperation des notes :", err);
      }
    };

    if (movieId) fetchReviews();
    return () => controller.abort();
  }, [movieId]);

  // DELETE /api/reviews : Supprimer un avis 
  const handleDeleteReview = async (id) => {
    if (!session) {
      alert("Connexion requise");
      return;
    }
    if (!confirm("Supprimer cet avis ? Cette action est irréversible !!!")) return;

    setReviews((prev) => prev.filter((r) => String(r.id) !== String(id)));

    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        console.warn("Suppression serveur échouée :", await res.text());
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
    }
  };

  // edit comment
  const startEdit = (id, currentComment = "") => {
    setEditingId(id);
    setEditedComment(currentComment ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedComment("");
  };

  const saveEdit = async (id) => {
    if (!session) {
      alert("Connexion requise");
      return;
    }

    setReviews((prev) => prev.map(r => String(r.id) === String(id) ? { ...r, comment: editedComment } : r));
    setEditingId(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, comment: editedComment }),
      });
      if (!res.ok) {
        console.warn("Échec mise à jour serveur :", await res.text());
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
    }
  };
  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (!session) {
      alert("Veuillez vous connecter pour laisser une note")
      return
    }
    if (!userRating) {
      alert('Veuillez sélectionner une note')
      return
    }

    setRatingLoading(true)
    setMessage("")

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, rating: userRating })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erreur')

      const newReview = {
        id: String(data.review?.id ?? Date.now()),
        userId: session.user.id,
        username: session.user.username || session.user.email,
        rating: userRating,
        comment: '',
        createdAt: new Date().toISOString()
      }

      setReviews(prev => [newReview, ...prev])
      setMessage('Note envoyée !')
      setUserRating(0)
    } catch (err) {
      console.error('Erreur POST rating:', err)
      setMessage(err.message || 'Erreur lors de l\'envoi')
    } finally {
      setRatingLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Actions rapides */}
      <div className="flex flex-wrap gap-4">
        {session ? (
          <>
            <FavoriteButton movieId={movieId} className="px-6 py-3" />

            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Laisser un avis
            </button>
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-300 mb-3">
              Connectez-vous pour noter ce film et l&apos;ajouter à vos favoris
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        )}
      </div>

      {/* Formulaire d'avis */}
      {showReviewForm && session && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Votre avis</h3>

          <label className="block text-sm font-medium text-gray-300 mb-2">
            Votre note
          </label>
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    className={`w-10 h-10 ${star <= (hoveredRating || userRating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-600"
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
              <span className="ml-3 text-gray-400 self-center">
                {userRating > 0 ? `${userRating}/5` : "Pas encore noté"}
              </span>
            </div>

            <button
              type="submit"
              disabled={ratingLoading || !userRating}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              {ratingLoading ? "Envoi..." : "Publier ma note"}
            </button>
            {message && <p className="text-sm text-green-400 mt-2">{message}</p>}
          </form>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Notation par étoiles */}
            <div>

              {/* <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${star <= (hoveredRating || userRating)
                        ? "text-yellow-500 fill-current"
                        : "text-gray-600"
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
                <span className="ml-3 text-gray-400 self-center">
                  {userRating > 0 ? `${userRating}/5` : "Pas encore noté"}
                </span>
              </div> */}
            </div>

            {/* Commentaire */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                Votre commentaire (optionnel)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={1000}
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                placeholder="Partagez votre avis sur ce film..."
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Publier mon avis
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setUserRating(0);
                  setComment("");
                }}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistiques des notes */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Notes et avis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Note moyenne */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white mb-2">{averageRating}</div>
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(averageRating) ? "text-yellow-500 fill-current" : "text-gray-600"
                    }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-400">{reviews.length} avis | {ratedReviews.length} notes</p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-8">{star} ★</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">Avis des utilisateurs</h3>

        {reviews.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <p className="text-gray-400">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{review.username}</h4>
                  <p className="text-sm text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {Number(review.rating) > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white font-semibold">{review.rating}/5</span>
                    </div>
                  )}

                  {/* Bouton supprimer visible seulement pour l'auteur */}
                  {session && String(session.user?.id) === String(review.userId) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-xs text-red-400 hover:text-red-200 bg-red-900/20 hover:bg-red-900/30 px-2 py-1 rounded"
                      aria-label="Supprimer l'avis"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-300 leading-relaxed">{review.comment}</p>
              )}

              {/* Édition */}
              {session && String(session.user?.id) === String(review.userId) && editingId !== review.id && (
                <button
                  onClick={() => startEdit(review.id, review.comment)}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  Modifier
                </button>
              )}

              {editingId === review.id && (
                <div className="mt-4">
                  <textarea
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => saveEdit(review.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}