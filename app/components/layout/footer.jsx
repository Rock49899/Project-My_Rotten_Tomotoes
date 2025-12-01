import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-white">
                Tomato<span className="text-red-500">Reviews</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              La plateforme ultime pour découvrir, noter et commenter les meilleurs films. 
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@tomatoreviews.com"
                className="p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-red-500 transition-colors">
                  Tous les films
                </Link>
              </li>
              <li>
                <Link href="/movies?filter=popular" className="text-gray-400 hover:text-red-500 transition-colors">
                  Films populaires
                </Link>
              </li>
              <li>
                <Link href="/movies?filter=top-rated" className="text-gray-400 hover:text-red-500 transition-colors">
                  Mieux notés
                </Link>
              </li>
              <li>
                <Link href="/movies?filter=recent" className="text-gray-400 hover:text-red-500 transition-colors">
                  Sorties récentes
                </Link>
              </li>
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-white font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-red-500 transition-colors">
                  Notre équipe
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-red-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-red-500 transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-red-500 transition-colors">
                  Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TomatoReviews. All right reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Propulsé par{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}