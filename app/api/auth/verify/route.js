import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
        return NextResponse.json({ error: "Token manquant" }, { status: 400 });
        }

        // Vérifier si le token correspond à un utilisateur
        const user = await prisma.user.findFirst({
        where: { verificationToken: token },
        });

        if (!user) {
        return NextResponse.json({ error: "Token invalide" }, { status: 400 });
        }

        // Vérifier la validité du token
        if (user.tokenExpiry && user.tokenExpiry < new Date()) {
        return NextResponse.json({ error: "Token expiré" }, { status: 400 });
        }

        // Activer le compte
        await prisma.user.update({
        where: { id: user.id },
        data: {
            isConfirmed: true,
            verificationToken: null,
            tokenExpiry: null,
        },
        });

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verified`, { status: 200 });
    } catch (err) {
        console.error("Erreur lors de la vérification:", err);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
