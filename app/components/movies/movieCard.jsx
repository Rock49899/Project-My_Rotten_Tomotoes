"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function MovieCard({ movie }) {
  const {
    id,
    title,
    posterPath,
    releaseDate,
    genres = [],
    ratingsAverage,
    ratingsCount,
    runtime,
  } = movie || {};

  // Formater la date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

  // Formater la durée proprement
  const hours = runtime ? Math.floor(runtime / 60) : 0;
  const minutes = runtime ? runtime % 60 : 0;
  let duration = "N/A";
  if (runtime) {
    if (hours > 0 && minutes > 0) duration = `${hours}h ${minutes}m`;
    else if (hours > 0) duration = `${hours}h`;
    else duration = `${minutes}m`;
  }

  // Calculer la couleur du rating
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-yellow-500";
    if (rating >= 2.5) return "text-orange-500";
    return "text-red-500";
  };

  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/movies/${id}`}>
      <div className="group bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-600 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
          {posterPath && !imgError ? (
            <>
              <Image
                src={String(posterPath)}
                alt={title}
                fill
                onError={() => setImgError(true)}
                unoptimized={true}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              {/* <div className="absolute left-2 bottom-2 bg-black/60 text-xs text-gray-200 px-2 py-1 rounded max-w-[85%] truncate">
                {String(posterPath)}
              </div> */}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-20 h-20 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
              {posterPath && (
                <div className="text-xs text-gray-400 mt-2">{String(posterPath).slice(0, 60)}</div>
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>

          {ratingsAverage && (
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className={`text-sm font-bold ${getRatingColor(ratingsAverage)}`}>
                {ratingsAverage.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col grow">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
            <span>{year}</span>
            <span>•</span>
            <span>{duration}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {genres.slice(0, 3).map((genre, index) => (
              <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {genre}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {ratingsCount || 0} avis
              </span>
              <span className="text-red-500 font-medium group-hover:underline">Voir plus →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}