"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function MoviesFilters({ genres }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenre = searchParams.get("genre") || "all";
  const currentSort = searchParams.get("sortBy") || "popular";

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`/movies?${params.toString()}`);
  };

  const sortOptions = [
    { value: "popular", label: "Populaires" },
    { value: "rating", label: "Mieux notés" },
    { value: "date", label: "Plus récents" },
    { value: "title", label: "Titre (A-Z)" },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtre par genre */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre
          </label>
          <select
            value={currentGenre}
            onChange={(e) => handleFilterChange("genre", e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
          >
            <option value="all">Tous les genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tri */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Trier par
          </label>
          <select
            value={currentSort}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton reset */}
        {(currentGenre !== "all" || currentSort !== "popular") && (
          <div className="flex items-end">
            <button
              onClick={() => router.push("/movies")}
              className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}