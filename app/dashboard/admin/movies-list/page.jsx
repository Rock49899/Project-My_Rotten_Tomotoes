import prisma from "../../../../lib/prisma";
import { requireAdminPage } from "../../../../lib/authMiddleware";
import MoviesListClient from "../../../components/admin/MoviesListClient";

export default async function Page() {
  // restreindre l'accès aux administrateurs
  await requireAdminPage();

  const movies = await prisma.movie.findMany({
    orderBy: { createdAt: "desc" },
  });

  const moviesData = JSON.parse(JSON.stringify(movies || []));

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Liste des films</h1>
        <a
          href="/dashboard/admin/tmdb-search"
          className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Ajouter un nouveau film
        </a>
      </div>

      <MoviesListClient initialMovies={moviesData} />
    </main>
  );
}
