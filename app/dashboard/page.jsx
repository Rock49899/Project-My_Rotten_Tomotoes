import { getCurrentUser, requireAdmin } from "../../lib/authMiddleware";
import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
export default async function AdminDashboard() {
  // Vérifier les droits admin
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/");
  }

  const user = await getCurrentUser();

  // Récupérer les statistiques
  const totalUsers = await prisma.user.count();
  const totalMovies = await prisma.movie.count();
  const totalReviews = await prisma.review.count();
  const pendingUsers = await prisma.user.count({
    where: { isConfirmed: false },
  });

  // Récupérer les derniers utilisateurs
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isConfirmed: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-500">Dashboard Admin</h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold">
            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Utilisateurs totaux</p>
            <h2 className="text-3xl font-bold text-red-500 mt-2">
              {totalUsers}
            </h2>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Films</p>
            <h2 className="text-3xl font-bold text-blue-500 mt-2">
              {totalMovies}
            </h2>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Avis</p>
            <h2 className="text-3xl font-bold text-green-500 mt-2">
              {totalReviews}
            </h2>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">Comptes non confirmés</p>
            <h2 className="text-3xl font-bold text-yellow-500 mt-2">
              {pendingUsers}
            </h2>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 font-bold text-red-500">
            Derniers utilisateurs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-4 text-gray-400">Nom</th>
                  <th className="p-4 text-gray-400">Email</th>
                  <th className="p-4 text-gray-400">Rôle</th>
                  <th className="p-4 text-gray-400">Statut</th>
                  <th className="p-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-700">
                    <td className="p-4 text-white">
                      {user.username || "Non défini"}
                    </td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-red-900 text-red-300"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          user.isConfirmed
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {user.isConfirmed ? "Actif" : "En attente"}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/admin/users/${user.id}`}
                        className="text-red-500 hover:underline"
                      >
                        Modifier
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {user.username || user.email}
            </h3>
            <p className="text-gray-400">Administrateur</p>
            <a
              href="/profile"
              className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Modifier Profil
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-10 text-center text-sm text-gray-500">
        © 2025 Tomato Reviews. Tous droits réservés.
      </footer>
    </div>
  );
}
