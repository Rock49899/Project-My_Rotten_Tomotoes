import prisma from "../../../lib/prisma";
import {
  getImageUrl,
  getMovieDetails,
  getMovieCredits,
} from "../../../lib/tmdb";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MovieActions from "../../components/movies/movieActions";
import MoviePoster from "../../components/movies/moviePoster";
export default async function MovieDetailPage({ params }) {
  const { id } = await params;
  const movieId = Array.isArray(id) ? id[0] : id;

  if (!movieId) notFound();

  let movieRaw = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movieRaw) {
    movieRaw = await prisma.movie.findUnique({ where: { tmdbId: movieId } });
  }

  let movie = null;

  if (movieRaw) {
    movie = {
      ...movieRaw,
      posterPath:
        getImageUrl(movieRaw.posterPath, "w780") ||
        (movieRaw.posterPath && String(movieRaw.posterPath)) ||
        null,
    };
    if (movieRaw.tmdbId) {
      try {
        const details = await getMovieDetails(movieRaw.tmdbId);
        movie.fallbackPoster = getImageUrl(details.poster_path, "w780") || null;
      } catch (e) {
        movie.fallbackPoster = null;
      }
    }
  } else {
    try {
      const details = await getMovieDetails(movieId);
      const credits = await getMovieCredits(movieId).catch(() => null);
      let reviews = await fetch(`/api/reviews/${movieId}`)
      reviews = await reviews.json()
      movie = {
        id: null,
        title: details.title,
        overview: details.overview,
        releaseDate: details.release_date || null,
        runtime: details.runtime || null,
        genres: (details.genres || []).map((g) => g.name),
        posterPath: getImageUrl(details.poster_path, "w780") || null,
        director:
          credits?.crew?.find((c) => c.job === "Director")?.name || null,
        cast: (credits?.cast || []).slice(0, 8).map((c) => c.name),
        productionCompanies: (details.production_companies || []).map((p) => p.name),
        ratingsAverage: details.vote_average ? Number((details.vote_average / 2).toFixed(1)) : null,
        ratingsCount: reviews.length || 0,
        tmdbId: String(details.id),
      };
    } catch (err) {
      notFound();
    }
  }

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : "";
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  let duration = "";
  if (movie.runtime) {
    if (hours > 0 && minutes > 0) duration = `${hours}h ${minutes}m`;
    else if (hours > 0) duration = `${hours}h`;
    else duration = `${minutes}m`;
  }
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section avec backdrop */}
      <div className="relative">
        {/* Backdrop flou */}
        <div className="absolute inset-0 overflow-hidden">
          {(movie.posterPath || movie.fallbackPoster) && (
            <div className="absolute inset-0">
              <Image
                src={movie.posterPath || movie.fallbackPoster}
                alt=""
                fill
                className="object-cover opacity-20 blur-2xl"
                priority
              />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-gray-900/50 via-gray-900/80 to-gray-900" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href="/movies"
                  className="hover:text-white transition-colors"
                >
                  Films
                </Link>
              </li>
              <li>/</li>
              <li className="text-white">{movie.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div>
                <MoviePoster
                  posterPath={movie.posterPath || movie.fallbackPoster}
                  title={movie.title}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

            <div className="lg:col-span-2">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                <span className="text-lg">{year}</span>
                <span>•</span>
                <span>{duration}</span>
                <span>•</span>
                {movie.ratingsAverage ? (
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-yellow-500">
                      {movie.ratingsAverage.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({movie.ratingsCount} avis)
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre, index) => (
                  <span
                    key={index}
                    className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Synopsis
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {movie.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Réalisateur</h3>
                  <p className="text-white font-medium">{movie.director}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Production</h3>
                  <p className="text-white font-medium"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {movie.id ? <MovieActions movieId={movie.id} /> : null}
      </div>
    </div>
  );
}
