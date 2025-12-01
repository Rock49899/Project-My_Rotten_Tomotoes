import Link from "next/link";
import Hero from "./components/layout/hero";
import { Film, Star, Users, TrendingUp, Play, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import prisma from "../lib/prisma";
import { getImageUrl } from "../lib/tmdb";

export default async function HomePage() {
  // récupérer les 6 derniers films ajoutés en base
  const raw = await prisma.movie.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })

  const trendingMovies = (raw || []).map((m) => {
    const year = m.releaseDate ? new Date(m.releaseDate).getFullYear() : ''
    const hours = m.runtime ? Math.floor(m.runtime / 60) : 0
    const minutes = m.runtime ? m.runtime % 60 : 0
    const duration = m.runtime ? (hours > 0 ? `${hours}h ${minutes}mins` : `${minutes}mins`) : ''
    const genre = (m.genres && m.genres.length) ? m.genres[0] : ''
    const rating = m.ratingsAverage ? (m.ratingsAverage * 2).toFixed(1) : ''
    const image = getImageUrl(m.posterPath, 'w500') || 'https://via.placeholder.com/400x600?text=No+Image'

    return {
      id: m.id,
      title: m.title,
      year,
      duration,
      genre,
      rating,
      image,
    }
  })

  return (
    <div className="bg-black">
      <Hero />

      <section className="py-20 bg-black">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-20">

          <div className="flex items-end justify-between mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-red-500" />
                <span className="text-red-500 font-bold text-sm uppercase tracking-wider">Trending Now</span>
              </div>
              <h2 className="text-xl md:text-md font-black text-white">
                Films Tendances
              </h2>
              <div className="h-1 w-20 bg-red-600 rounded-full" />
            </div>
            
            <Link 
              href="/movies" 
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl border border-white/10 hover:border-red-500/50 transition-all group"
            >
              <span className="text-white font-medium">Voir tout</span>
              <ChevronRight className="w-5 h-5 text-red-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {trendingMovies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.id}`}
                className="group"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/10 group-hover:border-red-500/50 transition-all duration-300">
                    <div className="relative h-80 overflow-hidden">
                      <Image
                        src={movie.image}
                        alt={movie.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                      
                      <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-yellow-500/20">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-white font-bold text-sm">{movie.rating}</span>
                      </div>
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-2xl">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                          <span>{movie.year}</span>
                          <span className="w-1 h-1 bg-gray-500 rounded-full" />
                          <span>{movie.duration}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-1 bg-red-600/20 text-red-400 rounded border border-red-500/30 text-xs font-medium">
                          {movie.genre}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Pourquoi Tomato Reviews ?
            </h2>
            <p className="text-md text-gray-400 max-w-2xl mx-auto">
              Rejoignez une communauté passionnée de cinéphiles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Film className="w-12 h-12 text-red-500" />}
              title="Base de données complète"
              description="Accédez à des milliers de films avec toutes les informations"
            />
            <FeatureCard
              icon={<Star className="w-12 h-12 text-red-500" />}
              title="Notez et commentez"
              description="Partagez votre avis sur vos films préférés"
            />
            <FeatureCard
              icon={<Users className="w-12 h-12 text-red-500" />}
              title="Communauté active"
              description="Échangez avec d'autres passionnés de cinéma"
            />
            <FeatureCard
              icon={<TrendingUp className="w-12 h-12 text-red-500" />}
              title="Tendances actuelles"
              description="Suivez les films les plus populaires"
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-black border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="10K+" label="Films disponibles" />
            <StatCard number="50K+" label="Utilisateurs actifs" />
            <StatCard number="100K+" label="Reviews publiées" />
            <StatCard number="4.8/5" label="Note moyenne" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-red-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300 h-full">
        <div className="mb-6 transition-transform group-hover:scale-110 duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div>
      <div className="text-5xl font-black text-red-500 mb-2">
        {number}
      </div>
      <div className="text-gray-400 font-medium">{label}</div>
    </div>
  );
}