import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { requireAuth } from "../../../lib/authMiddleware";

//  récupérer les favoris de l'utilisateur connecté
export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const email = session.user?.email?.toLowerCase();
    if (!email)
      return NextResponse.json(
        { message: "Utilisateur sans email" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { email },
      select: { favorites: true },
    });

    if (!user)
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );

    if (!user.favorites || user.favorites.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const movies = await prisma.movie.findMany({
      where: { id: { in: user.favorites } },
      select: { id: true, title: true },
    });

    return NextResponse.json({ data: movies }, { status: 200 });
  } catch (err) {
    console.error("GET /api/favorites error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// ajout film aux favoris
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { movieId } = await request.json();
    if (!movieId)
      return NextResponse.json({ message: "movieId requis" }, { status: 400 });

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true },
    });
    if (!movie)
      return NextResponse.json({ message: "Film non trouvé" }, { status: 404 });

    const email = session.user?.email?.toLowerCase();
    if (!email)
      return NextResponse.json(
        { message: "Utilisateur sans email" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { email },
      select: { favorites: true },
    });
    if (!user)
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );

    if (user.favorites && user.favorites.includes(movieId)) {
      return NextResponse.json({ message: "Déjà en favoris" }, { status: 200 });
    }

    await prisma.user.update({
      where: { email },
      data: { favorites: { push: movieId } },
    });

    return NextResponse.json({ message: "Favori ajouté" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/favorites error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// retirer un film des favoris
export async function DELETE(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { movieId } = await request.json();
    if (!movieId)
      return NextResponse.json({ message: "movieId requis" }, { status: 400 });

    const email = session.user?.email?.toLowerCase();
    if (!email)
      return NextResponse.json(
        { message: "Utilisateur sans email" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, favorites: true },
    });
    if (!user || !user.favorites || !user.favorites.includes(movieId)) {
      return NextResponse.json(
        { message: "Ce film n'est pas dans vos favoris" },
        { status: 404 }
      );
    }

    const updated = user.favorites.filter((id) => id !== movieId);
    await prisma.user.update({
      where: { email },
      data: { favorites: updated },
    });

    return NextResponse.json({ message: "Favori retiré" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/favorites error:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
