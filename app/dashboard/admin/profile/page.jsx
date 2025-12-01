"use client";
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

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    fetchUserData();
  }, [session, status]);

  const fetchUserData = async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`/api/users/${session.user.id}`, {
        credentials: "same-origin",
      });
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation du nouveau mot de passe
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
      const dataToSend = {
        username: formData.username,
        email: formData.email,
      };

      // Ajouter le nouveau password seulement s'il est rempli
      if (formData.newPassword) {
        dataToSend.password = formData.newPassword;
      }

      const res = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profil modifié avec succès !");
        // Réinitialiser les champs de mot de passe
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // mettre à jour session user display name si présent
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-white">Mon Profil</h1>

      <div className="bg-black rounded-lg shadow p-6 border border-red-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Informations générales
            </h2>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-red-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-red-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-white mb-1">
                Rôle
              </label>
              <div className="px-3 py-2 bg-gray-800 rounded-md text-white">
                {session.user.role}
              </div>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Changer le mot de passe
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Laissez vide si vous ne souhaitez pas modifier votre mot de passe
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-red-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-3 py-2 border border-red-600 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600"
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-700 text-white p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-700 text-white p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-60"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex-1 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
