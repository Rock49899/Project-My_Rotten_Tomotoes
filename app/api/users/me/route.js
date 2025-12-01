import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/authMiddleware";
import bcrypt from "bcryptjs";

export const GET = async () => {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const email = session.user?.email;
    if (!email) {
      return NextResponse.json(
        { message: "Email manquant dans la session" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isConfirmed: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        reviews: {
          include: {
            movie: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!user)
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (err) {
    console.error("Erreur GET /api/users/me:", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};

export const PUT = async (request) => {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const email = session.user?.email;
    if (!email)
      return NextResponse.json(
        { message: "Email manquant dans la session" },
        { status: 400 }
      );

    const currentUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!currentUser)
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );

    const { username, email: newEmail, role, password } = await request.json();

    const updateData = {};

    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: { username, NOT: { id: currentUser.id } },
      });
      if (existingUsername)
        return NextResponse.json(
          { message: "Ce nom d'utilisateur est déjà pris" },
          { status: 409 }
        );
      updateData.username = username;
    }

    if (newEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: newEmail.toLowerCase(), NOT: { id: currentUser.id } },
      });
      if (existingEmail)
        return NextResponse.json(
          { message: "Cet email est déjà utilisé" },
          { status: 409 }
        );
      updateData.email = newEmail.toLowerCase();
    }

    if (password) {
      if (password.length < 8)
        return NextResponse.json(
          { message: "Le mot de passe doit contenir au moins 8 caractères" },
          { status: 400 }
        );
      updateData.password = await bcrypt.hash(password, 12);
    }

    // admin seul poeut modifier le rôle
    if (role) {
      if (session.user.role !== "ADMIN")
        return NextResponse.json(
          { message: "Vous ne pouvez pas modifier le rôle" },
          { status: 403 }
        );
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
      select: { id: true, username: true, email: true, role: true },
    });

    return NextResponse.json(
      { message: "Profil modifié avec succès", user },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erreur PUT /api/users/me:", err);
    if (err.code === "P2025")
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
};
