import Link from "next/link";
import Image from "next/image";
import prisma from "../../../lib/prisma";

export default async function Hero() {
  const featuredMovie = {
    title: "The death of the wolf",
    year: "2017",
    category: "HOLLYWOOD",
    language: "ENGLISH",
    description: "Wrath of the Titans is a 2012 3D epic action adventure fantasy film that is a sequel to the 2010 film Clash of the Titans. The film stars Sam Worthington, Rosamund Pike, Bill Nighy, Édgar Ramírez, Toby Kebbell, Danny Huston, Ralph Fiennes, and Liam Neeson, with Jonathan Liebesman directing a screenplay by Dan Mazeau and David Leslie Johnson.",
    posterUrl: "/images/featured-poster.jpg",
    backdropUrl: "/images/featured-backdrop.jpg"
  };

  // récupérer les réalisateurs récents côté serveur
  const directorsRaw = await prisma.movie.findMany({
    where: { director: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { director: true },
    take: 50,
  })

  const directors = Array.from(new Set((directorsRaw || []).map(d => (d.director || '').trim()).filter(Boolean))).slice(0, 6)
  const producers = directors.map((name) => ({ name, role: 'Director' }))


  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image avec overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url('https://img.freepik.com/premium-photo/action-shot-with-black-woman-bike-riding-away-from-fire-explosion-dynamic-scene-action-movie-blockbuster-style_116953-10267.jpg')`,
          }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-20 h-100 mt-18 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Informations du film */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-300">{featuredMovie.category}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300">{featuredMovie.language}</span>
              </div>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                {featuredMovie.title}
                <span className="text-red-600">.</span>
              </h1>

              {/* Description */}
              <p className="text-gray-300 text-md leading-relaxed max-w-2xl">
                {featuredMovie.description}
              </p>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-4">
                <Link
                  href="/movies"
                  className="group flex items-center gap-2 px-8 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition-all transform hover:scale-105 hover-glow-red"
                >
                See more
                </Link>
              
              </div>
            </div>

            {/* Poster du film */}
            {/* <div className="hidden lg:flex justify-end">
              <div className="relative w-80 h-[450px] rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-10" />
                <Image
                  src="https://m.media-amazon.com/images/S/pv-target-images/026854f0d3457cc63b81ca6657018c1aacafdebebb21ebb34eec4338a8432e6a.jpg"
                  alt={featuredMovie.title}
                  fill 
                  className="object-cover" unoptimized
                />
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Section Producers en bas */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-linear-to-t from-black via-black/95 to-transparent pt-5 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-white font-semibold mb-6">Réalisateurs</h3>
          
          <div className="flex items-center justify-between">
            {/* Liste des producteurs */}
            <div className="flex gap-8 overflow-x-auto pb-4 flex-1">
              {producers.length === 0 ? (
                <div className="text-gray-400">Aucun réalisateur récent</div>
              ) : producers.map((producer, index) => (
                <div key={index} className="flex items-center gap-3 shrink-0 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold ring-2 ring-gray-800 group-hover:ring-red-600 transition-all">
                    {producer.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-xs text-red-500 font-medium uppercase">{producer.role}</p>
                    <p className="text-white font-medium group-hover:text-red-500 transition-colors">
                      {producer.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}