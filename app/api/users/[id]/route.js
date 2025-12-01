import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin, checkOwnership } from "../../../../lib/authMiddleware";
import bcrypt from "bcryptjs";

// GET /api/users/[id] - Récupérer un utilisateur
// Permission : Le user lui-même OU un admin
export const GET = async (request, { params }) => {
  const p = await params;
  const id = p.id;
  const { session, isAdmin, error } = await checkOwnership(id);
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isConfirmed: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        // Inclure les reviews pour :
        // - Le user qui regarde son propre profil
        // - Les admins qui regardent n'importe quel profil
        reviews: {
          include: {
            movie: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET user:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

// PUT /api/users/[id] - Modifier un utilisateur
// Permission : Le user lui-même OU un admin
export const PUT = async (request, { params }) => {
  const p = await params;
  const id = p.id;
  const { session, isAdmin, error } = await checkOwnership(id);
  if (error) return error;

  try {
    const { username, email, role, password } = await request.json();

    const updateData = {};

    // Champs modifiables par tout le monde (sur son propre compte)
    if (username) {
      // Vérifier si le username est déjà pris
      const existingUsername = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id }, // Exclure l'utilisateur actuel
        },
      });

      if (existingUsername) {
        return NextResponse.json(
          { message: "Ce nom d'utilisateur est déjà pris" },
          { status: 409 }
        );
      }

      updateData.username = username;
    }

    if (email) {
      // Vérifier si l'email est déjà pris
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { message: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { message: "Le mot de passe doit contenir au moins 8 caractères" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Le rôle : SEULEMENT les admins peuvent le modifier !
    if (role) {
      if (!isAdmin) {
        return NextResponse.json(
          { message: "Vous ne pouvez pas modifier le rôle" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    // Effectuer la mise à jour
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Profil modifié avec succès", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur PUT user:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

// DELETE /api/users/[id] - Supprimer un utilisateur (ADMIN ONLY)
export const DELETE = async (request, { params }) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const p = await params;
    const id = p.id;

    // Empêcher un admin de se supprimer lui-même
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur DELETE user:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
