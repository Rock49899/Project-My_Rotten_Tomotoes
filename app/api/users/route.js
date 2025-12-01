import prisma from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/authMiddleware";
import bcrypt from "bcryptjs";

// GET /api/users - Afficher tous les utilisateurs (ADMIN ONLY)
export const GET = async () => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isConfirmed: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET users:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

// POST /api/users - Créer un utilisateur (ADMIN ONLY)
export const POST = async (request) => {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    const { email, password, username, role } = await request.json();

    // Validation
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Champs requis : email, password, username" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // Vérifier si le username existe déjà
    const existingUsername = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { message: "Ce nom d'utilisateur est déjà pris" },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        role: role || "USER",
        provider: "LOCAL",
        isConfirmed: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur POST user:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
