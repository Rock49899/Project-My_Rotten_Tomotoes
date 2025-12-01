"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-900">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold text-white">
                Tomato <span className="text-red-500">Reviews</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/movies"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Films
              </Link>
              <Link
                href="/movies"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Populaires
              </Link>
              <Link
                href="/movies"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Mieux notés
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="text-red-400 hover:text-red-300 transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}

              {session?.user?.role === "USER" && (
                <Link
                  href="/profile"
                  className="text-red-400 hover:text-red-300 transition-colors font-medium"
                >
                  Mon profile
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {session ? (
                <>
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                      {((session.user?.username || session.user?.name || session.user?.email) || "?")[0]?.toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{session.user?.username || session.user?.name || session.user?.email}</span>
                  </Link>

                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-4 py-2 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                  S&apos;inscrire
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-900">
              <div className="flex flex-col gap-4">
                <Link
                  href="/movies"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Films
                </Link>
                <Link
                  href="/movies?filter=popular"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Populaires
                </Link>
                <Link
                  href="/movies?filter=top-rated"
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mieux notés
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard"
                    className="text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )} 
                {session?.user?.role === "USER" && (
                <Link
                  href="/profile"
                  className="text-red-400 hover:text-red-300 transition-colors font-medium"
                >
                  Mon profile
                </Link>
              )}
                <div className="pt-4 border-t border-gray-900 flex flex-col gap-2">
                  {session ? (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Déconnexion
                    </button>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-center py-2 text-gray-300 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        href="/register"
                        className="text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                      S&apos;inscrire
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-80 flex flex-col gap-4">
            <p>Voulez-vous vraiment vous déconnecter ?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-700 cursor-pointer rounded hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded cursor-pointer hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
