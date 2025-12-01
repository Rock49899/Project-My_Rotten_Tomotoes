// middleware.js (à la racine du projet)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Routes admin - vérifier le rôle ADMIN
    if (path.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Routes nécessitant une connexion (mais pas forcément email confirmé)
    const protectedPaths = ["/favorites", "/profile"];
    if (protectedPaths.some(route => path.startsWith(route))) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Si connecté mais pas confirmé, on laisse passer
      // La bannière ConfirmEmailBanner s'affichera
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Pages publiques - pas besoin d'authentification
        const publicPaths = [
          "/",
          "/login",
          "/register",
          "/movies",
          "/verify",
        ];

        const isPublic = publicPaths.some(publicPath => 
          path === publicPath || path.startsWith(publicPath + "/")
        );

        if (isPublic) {
          return true;
        }

        // Routes API publiques
        if (
          path.startsWith("/api/auth") ||
          path.startsWith("/api/movies")
        ) {
          return true;
        }

        // Toutes les autres routes nécessitent une authentification
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};