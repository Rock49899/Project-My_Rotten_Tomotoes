"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MoviesHero() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        
        if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
        } else {
        params.delete("search");
        }
        
        router.push(`/movies?${params.toString()}`);
    };

    const clearSearch = () => {
        setSearchQuery("");
        const params = new URLSearchParams(searchParams);
        params.delete("search");
        router.push(`/movies?${params.toString()}`);
    };

    return (
        <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Découvrez des films
            </h1>
            <p className="text-gray-300 text-lg mb-8">
                Explorez notre collection de films et partagez vos avis
            </p>

            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un film, un réalisateur..."
                    className="w-full px-6 py-4 pr-32 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                />

                {/* Bouton clear */}
                {searchQuery && (
                    <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    </button>
                )}

                {/* Bouton de recherche */}
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
                >
                    Rechercher
                </button>
                </div>

                {/* Icône de recherche */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                </div>
            </form>
            </div>
        </div>
        </div>
    );
}