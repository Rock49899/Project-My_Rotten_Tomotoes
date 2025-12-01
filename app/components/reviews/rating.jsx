"use client"

import { useState } from "react"

export default function RatingForm({ movieId }) {
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    movieId,
                    rating,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message)

            setMessage("Note envoyée !!!")
        } catch (err) {
            setMessage(err.message || "Erreur...")
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                    >
                        <svg
                            className={`w-10 h-10 ${star <= (hoveredRating || rating)
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
                    {rating > 0 ? `${rating}/5` : "Pas encore noté"}
                </span>
            </div>

            <button
                type="submit"
                disabled={loading || !rating}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
                {loading ? "Envoi..." : "Publier ma note"}
            </button>
            {message && <p>{message}</p>}
        </form>
    )
}
