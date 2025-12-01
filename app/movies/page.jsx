"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MovieCard from "../components/movies/movieCard";
import { getImageUrl } from "../../lib/tmdb";

export default function MoviesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialYear = searchParams.get("year") || "";
  const initialGenre = searchParams.get("genre") || "";
  const initialProducer = searchParams.get("producer") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [year, setYear] = useState(initialYear);
  const [genre, setGenre] = useState(initialGenre);
  const [producer, setProducer] = useState(initialProducer);

  const [movies, setMovies] = useState([]);
  const [options, setOptions] = useState({
    genres: [],
    producers: [],
    years: [],
  });
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (year) params.set("year", year);
    if (genre) params.set("genre", genre);
    if (producer) params.set("producer", producer);
    return params.toString();
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const qs = buildQuery();
      const res = await fetch(`/api/movies?${qs}`, { cache: "no-store" });
      const raw = res.ok ? await res.json() : [];
      const formatted = (raw || []).map((m) => ({
        ...m,
        posterPath:
          getImageUrl(m.posterPath, "w500") ||
          (m.posterPath && String(m.posterPath)) ||
          null,
      }));
      setMovies(formatted);
    } catch (err) {
      console.error("Erreur fetch movies:", err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const res = await fetch(`/api/movies?meta=true`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOptions({
        genres: data.genres || [],
        producers: data.producers || [],
        years: data.years || [],
      });
    } catch (err) {
      console.error("Erreur fetch options:", err);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchMovies();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const qs = buildQuery();
      const path = qs ? `/movies?${qs}` : `/movies`;
      router.replace(path);
      fetchMovies();
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, year, genre, producer]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Découvrez des films
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Explorez notre collection de films et partagez vos avis
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un film, un réalisateur..."
                  className="w-full px-6 py-4 pr-32 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-colors"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="clear"
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

                <button
                  type="button"
                  onClick={fetchMovies}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors font-medium"
                >
                  Rechercher
                </button>
              </div>

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

              <div className="flex flex-wrap gap-4 justify-center mt-10">
                <div className="bg-black text-white px-3 py-2 rounded-md flex flex-col items-start">
                  <label className="text-xs text-gray-300 mb-1">Année</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="px-2 py-1 h-9 rounded w-44 bg-transparent text-white border border-gray-700"
                  >
                    <option value="" className="text-black">
                      Toutes
                    </option>
                    {options.years.map((y) => (
                      <option key={y} value={y} className="text-black">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-black text-white px-3 py-2 rounded-md flex flex-col items-start">
                  <label className="text-xs text-gray-300 mb-1">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="px-2 py-1 h-9 rounded w-44 bg-transparent text-white border border-gray-700"
                  >
                    <option value="" className="text-black">
                      Tous
                    </option>
                    {options.genres.map((g) => (
                      <option key={g} value={g} className="text-black">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-black text-white px-3 py-2 rounded-md flex flex-col items-start">
                  <label className="text-xs text-gray-300 mb-1">
                    Producteur
                  </label>
                  <select
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="px-2 py-1 h-9 rounded w-44 bg-transparent text-white border border-gray-700"
                  >
                    <option value="" className="text-black">
                      Tous
                    </option>
                    {options.producers.map((p) => (
                      <option key={p} value={p} className="text-black">
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-900 px-6 py-12 -mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {movies.length} films disponibles
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id || movie.tmdbId} movie={movie} />
              ))}
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              Aucun film trouvé. Essayez plus tard ou vérifiez la source des
              données.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
