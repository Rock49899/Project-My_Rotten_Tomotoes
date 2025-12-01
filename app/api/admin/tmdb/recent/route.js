import { getPopularMovies } from "../../../../../lib/tmdb";
import { requireAdmin } from "../../../../../lib/auth";

export async function GET(request) {
  await requireAdmin(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  try {
    const data = await getPopularMovies(page);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
