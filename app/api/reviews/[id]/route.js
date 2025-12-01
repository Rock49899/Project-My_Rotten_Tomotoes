import { requireAuth } from "../../../../lib/authMiddleware"
import prisma from "../../../../lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request, { params }) {
  try {
    const movieId = params

    if (!movieId) {
      return NextResponse.json({ message: "movieId is missing" }, { status: 400 })
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
    })

    return NextResponse.json({ reviews }, { status: 200 })
  } catch (error) {
    console.error("Erreur GET reviews:", error)
    return NextResponse.json({ message: error?.message || "Server error" }, { status: 500 })
  }
}
