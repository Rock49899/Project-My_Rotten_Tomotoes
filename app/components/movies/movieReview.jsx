"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MovieReviews({ movieId, reviews, userReview }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      return;
    }

    setDeletingId(reviewId);
    try {
      const response = await fetch(`/api/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Une erreur est survenue");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6">
        Avis des spectateurs
        <span className="text-gray-400 text-lg ml-2">({reviews.length})</span>
      </h2>

      {reviews.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">💭</div>
          <p className="text-gray-400">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isUserReview = session?.user?.id === review.userId;

            return (
              <div
                key={review.id}
                className={`bg-gray-800 border rounded-lg p-6 ${
                  isUserReview
                    ? "border-red-600"
                    : "border-gray-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
                      {(review.user.username || review.user.email)[0].toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {review.user.username || "Utilisateur"}
                        </p>
                        {isUserReview && (
                          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                            Vous
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg font-bold">
                    ⭐ {review.rating}/5
                  </div>
                </div>

                {/* Commentaire */}
                {review.comment && (
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {review.comment}
                  </p>
                )}

                {/* Actions (uniquement pour l'auteur) */}
                {isUserReview && (
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingId === review.id}
                      className="text-sm text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      {deletingId === review.id
                        ? "Suppression..."
                        : "Supprimer"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}