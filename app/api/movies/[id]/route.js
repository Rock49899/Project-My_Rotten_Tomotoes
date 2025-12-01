import prisma from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/authMiddleware";

export async function GET(request, { params }) {
  const p = await params;
  const id = p.id;
  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie)
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    return new Response(JSON.stringify(movie), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}

export async function PUT(request, { params }) {
  // update (admin only)
  const { error } = await requireAdmin();
  if (error) return error;
  const p = await params;
  const id = p.id;
  const body = await request.json();
  const data = {};
  if (body.tmdbId !== undefined) data.tmdbId = body.tmdbId;
  if (body.title !== undefined) data.title = body.title;
  if (body.overview !== undefined) data.overview = body.overview;
  if (body.releaseDate !== undefined)
    data.releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
  if (body.runtime !== undefined) data.runtime = body.runtime;
  if (body.genres !== undefined) data.genres = body.genres;
  if (body.posterPath !== undefined) data.posterPath = body.posterPath;
  if (body.director !== undefined) data.director = body.director;
  if (body.productionCompanies !== undefined)
    data.productionCompanies = body.productionCompanies;
  if (body.producers !== undefined) data.producers = body.producers;
  if (body.cast !== undefined) data.cast = body.cast;
  if (body.imdbId !== undefined) data.imdbId = body.imdbId;

  try {
    const movie = await prisma.movie.update({ where: { id }, data });
    return new Response(JSON.stringify(movie), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const p = await params;
  const id = p.id;
  try {
    await prisma.movie.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
