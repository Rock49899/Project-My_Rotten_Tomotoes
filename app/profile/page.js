"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(true);
  const [favActionLoading, setFavActionLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    fetchUserData();
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchUserData = async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch(`/api/users/me`, { credentials: "same-origin" });
      const data = await res.json();

      if (res.ok) {
        setFormData({
          username: data.data.username || "",
          email: data.data.email || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Erreur fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    setFavLoading(true);
    try {
      const res = await fetch("/api/favorites", { credentials: "same-origin" });
      const data = await res.json();
      if (res.ok) setFavorites(data.data || []);
    } catch (err) {
      console.error("Erreur fetch favorites:", err);
    } finally {
      setFavLoading(false);
    }
  };

  const removeFavorite = async (movieId) => {
    if (favActionLoading) return;
    setFavActionLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId }),
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((m) => m.id !== movieId));
      } else {
        const d = await res.json();
        alert(d.message || "Erreur");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    } finally {
      setFavActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }
    }

    setSaving(true);
    try {
      const dataToSend = { username: formData.username, email: formData.email };
      if (formData.newPassword) dataToSend.password = formData.newPassword;

      const res = await fetch(`/api/users/me`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Profil modifié avec succès !");
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading)
    return <div className="text-center py-8">Chargement...</div>;
  if (!session) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Mon Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-gray-900 text-white rounded-lg p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
              {(session.user?.username ||
                session.user?.name ||
                session.user?.email ||
                "?")[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold">
                {session.user?.username || session.user?.name}
              </div>
              <div className="text-sm text-gray-300">{session.user?.email}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div>
              <div className="text-xs text-gray-400">Rôle</div>
              <div className="mt-1 inline-block px-3 py-1 bg-white text-black rounded">
                {session.user.role}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-400">Membre depuis</div>
              <div className="mt-1">
                {new Date(
                  session.user.createdAt ||
                    session.user?.createdAt ||
                    Date.now()
                ).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              Retour
            </button>
            <button
              onClick={fetchFavorites}
              className="flex-1 bg-white text-black py-2 rounded"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        {/* Main form & favorites */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 text-black">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">
                Informations générales
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Nom d&apos;utilisateur
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mt-4">
                  Changer le mot de passe
                </h3>
                <p className="text-sm text-black">
                  Laissez vide si vous ne souhaitez pas modifier votre mot de
                  passe
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-black">
            <h2 className="text-xl font-semibold mb-4">Mes favoris</h2>

            {favLoading ? (
              <div>Chargement...</div>
            ) : favorites.length === 0 ? (
              <div className="text-gray-600">
                Vous n&apos;avez pas encore de favoris.
              </div>
            ) : (
              <ul className="space-y-3">
                {favorites.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="font-medium">{m.title}</div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/movies/${m.id}`}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => removeFavorite(m.id)}
                        disabled={favActionLoading}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Retirer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
