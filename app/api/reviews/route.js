import { requireAuth } from "../../../lib/authMiddleware";
import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";

// GET /api/reviews?movieId=xxx - Récupérer les reviews d'un film
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const movieId = searchParams.get("movieId");

    if (!movieId) {
      return NextResponse.json(
        { message: "movieId is missing" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { movieId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET reviews:", error);
    return NextResponse.json({ message: error }, { status: 500 })
  }
}

// POST /api/reviews - Créer un avis (EMAIL CONFIRMÉ REQUIS)
export async function POST(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { movieId, rating = 0, comment = "" } = await request.json();

    // Validation
    if (!movieId) {
      return NextResponse.json(
        { message: "Film et note requis" },
        { status: 400 }
      );
    }

    if (rating < 0 || rating > 5) {
      return NextResponse.json(
        { message: "La note doit être entre 0 et 5" },
        { status: 400 }
      );
    }

    // Chercher un avis existant du user en session sur ce film
    const existing = await prisma.review.findFirst({
      where: {
        movieId,
        userId: session.user.id,
      },
    })

    if (existing && existing.rating > 0) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating,
          comment,
        },
      })

      return NextResponse.json({ message: "Avis mis à jour", review: updated }, { status: 200 })
    }

    const review = await prisma.review.create({
      data: {
        movieId,
        userId: session.user.id,
        rating,
        comment,
      },
    });

    return NextResponse.json(
      { message: "Avis ajouté", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST review:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE /api/reviews
export async function DELETE(request) {
  const { session, error } = await requireAuth()
  if (error) return error

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "review id is missing" }, { status: 400 })
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
    })

    if (!existingReview) {
      return NextResponse.json({ message: "Avis non trouvé" }, { status: 404 })
    }

    if (String(existingReview.userId) !== String(session.user.id)) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 })
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Avis supprimé avec succès" }, { status: 200 })
  } catch (error) {
    console.error("Erreur DELETE review:", error)
    return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
  }
}


// PATCH /api/reviews - Update un avis
export async function PATCH(request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id, comment, rating } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "review id is missing" }, { status: 400 });
    }

    if (rating !== undefined && (Number(rating) < 0 || Number(rating) > 5)) {
      return NextResponse.json({ message: "La note doit être entre 0 et 5" }, { status: 400 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json({ message: "Avis non trouvé" }, { status: 404 });
    }

    if (String(existingReview.userId) !== String(session.user.id)) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const dataToUpdate = {};
    if (comment !== undefined) dataToUpdate.comment = String(comment).slice(0, 1000);
    if (rating !== undefined) dataToUpdate.rating = Number(rating);

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ message: "Avis mis à jour", review: updated }, { status: 200 });
  } catch (err) {
    console.error("Erreur PATCH review:", err);
    return NextResponse.json({ message: err?.message || "Server error" }, { status: 500 });
  }
}
