import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../../../../lib/mailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, username } = body;

    // Validation simple
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error: "Le mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Vérifier si le username existe
    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: { username },
      });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Nom d'utilisateur déjà pris" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        provider: "LOCAL",
        isConfirmed: false,
        role: "USER",
        verificationToken,
        tokenExpiry,
      },
    });

    // ENVOI DU MAIL DE VERIFICATION
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (mailError) {
      console.error("Erreur envoi email:", mailError);
    }

    console.log(
      " Lien de vérification:",
      `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`
    );

    return NextResponse.json(
      {
        message: "Compte créé avec succès. Vérifiez votre email.",
        user: { id: user.id, email: user.email, username: user.username },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur inscription:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
