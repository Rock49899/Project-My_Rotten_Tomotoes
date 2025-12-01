"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Heart, LayoutDashboard } from "lucide-react";

export default function UserButton() {
//   const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
    );
  }

//   if (!session) {
//     return null;
//   }

  const firstLetter = session.user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
      >
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-semibold ring-2 ring-gray-800 hover:ring-red-600 transition-all">
          {firstLetter}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-800 bg-linear-to-r from-gray-900 to-gray-800">
            <p className="text-sm text-gray-400 mb-1">Connecté en tant que</p>
            <p className="font-medium text-white truncate">{session.user.email}</p>
            {session.user.role === "ADMIN" && (
              <span className="inline-block mt-2 px-2 py-1 bg-red-600/20 border border-red-600/50 text-red-400 text-xs rounded-full">
                👑 Administrateur
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {session.user.role === "ADMIN" && (
              <a
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Admin
              </a>
            )}
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              Mon profil
            </a>
            <a
              href="/favorites"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4 h-4" />
              Mes favoris
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Paramètres
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-800 py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}