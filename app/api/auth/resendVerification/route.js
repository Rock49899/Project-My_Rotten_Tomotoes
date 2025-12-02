import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import prisma from "../../../../lib/prisma"
import crypto from "crypto"
import { sendVerificationEmail } from "../../../../lib/mailer"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si déjà confirmé
    if (session.user.isConfirmed) {
      return NextResponse.json({ error: "Email déjà confirmé" }, { status: 400 })
    }

    // Générer un nouveau token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Mettre à jour l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        verificationToken,
        tokenExpiry,
      },
    })

    // Envoyer l'email
    await sendVerificationEmail(session.user.email, verificationToken)

    console.log(" Lien de vérification:", `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verificationToken}`)

    return NextResponse.json({ message: "Email de vérification renvoyé" }, { status: 200 })
  } catch (err) {
    console.error("Erreur resend verification:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}