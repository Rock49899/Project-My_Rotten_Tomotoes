"use client";

import { useState } from "react";
import Image from "next/image";

export default function MoviePoster({ posterPath, title, className, sizes }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
      {posterPath && !imgError ? (
        <>
          <Image
            src={String(posterPath)}
            alt={title}
            fill
            onError={() => setImgError(true)}
            unoptimized={true}
            className={className || "object-cover group-hover:scale-105 transition-transform duration-300"}
            sizes={sizes || "(max-width: 768px) 100vw, 33vw"}
          />
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
    </div>
  );
}
