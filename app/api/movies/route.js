import prisma from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/authMiddleware";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // If meta=true, return distinct options for filters
    if (params.get("meta") === "true") {
      const raw = await prisma.movie.findMany({
        select: { genres: true, producers: true, releaseDate: true },
      });
      const genresSet = new Set();
      const producersSet = new Set();
      const yearsSet = new Set();

      raw.forEach((m) => {
        (m.genres || []).forEach((g) => genresSet.add(g));
        (m.producers || []).forEach((p) => producersSet.add(p));
        if (m.releaseDate) {
          try {
            const y = new Date(m.releaseDate).getFullYear();
            yearsSet.add(String(y));
          } catch (e) {}
        }
      });

      return new Response(
        JSON.stringify({
          genres: Array.from(genresSet).sort(),
          producers: Array.from(producersSet).sort(),
          years: Array.from(yearsSet).sort((a, b) => b - a),
        }),
        { status: 200 }
      );
    }

    // Build filters
    const where = {};
    const search = params.get("search");
    const year = params.get("year");
    const genre = params.get("genre");
    const producer = params.get("producer");

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { overview: { contains: search, mode: "insensitive" } },
      ];
    }

    if (genre) {
      where.genres = { has: genre };
    }

    if (producer) {
      where.producers = { has: producer };
    }

    if (year) {
      const y = Number(year);
      if (!Number.isNaN(y)) {
        const start = new Date(`${y}-01-01T00:00:00.000Z`);
        const end = new Date(`${y}-12-31T23:59:59.999Z`);
        where.releaseDate = { gte: start, lte: end };
      }
    }

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(movies), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}

export async function POST(request) {
  // enregistrement d'un film (admin uniquement)
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await request.json();
  const data = {
    title: body.title,
    overview: body.overview || "",
    releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
    runtime: body.runtime || null,
    genres: body.genres || [],
    posterPath: body.posterPath || null,
    director: body.director || null,
    productionCompanies: body.productionCompanies || [],
    tmdbId: body.tmdbId || null,
    imdbId: body.imdbId || null,
    producers: body.producers || [],
    cast: body.cast || [],
  };
  try {
    // si le tmdbId fourni, ne pas encore enregistrer le mm film
    if (data.tmdbId) {
      const existing = await prisma.movie.findUnique({
        where: { tmdbId: data.tmdbId },
      });
      if (existing)
        return new Response(
          JSON.stringify({ movie: existing, warning: "exists" }),
          { status: 200 }
        );
    }
    const movie = await prisma.movie.create({ data });
    return new Response(JSON.stringify(movie), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
